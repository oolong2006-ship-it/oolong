import { db } from "@/lib/db";
import type {
  PaymentInitInput,
  PaymentInitResult,
  PaymentVerifyResult,
} from "@/types";
import type { PaymentStatus } from "@prisma/client";

// ─── Provider Interface ───────────────────────────────────────────────────────

export interface PaymentProvider {
  initiate(input: PaymentInitInput): Promise<PaymentInitResult>;
  verify(providerRef: string): Promise<PaymentVerifyResult>;
  refund(providerRef: string, amount: number): Promise<boolean>;
}

// ─── Mock Payment Provider ───────────────────────────────────────────────────

export class MockPaymentProvider implements PaymentProvider {
  async initiate(input: PaymentInitInput): Promise<PaymentInitResult> {
    const providerRef = `MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const paymentRecord = await db.payment.create({
      data: {
        userId: input.userId,
        amount: input.amount,
        currency: input.currency ?? "SAR",
        vatAmount: input.amount * 0.15,
        totalAmount: input.amount * 1.15,
        status: "pending",
        provider: "mock",
        providerRef,
        description: input.description,
      },
    });

    // In mock mode, the checkout URL points to our own simulate endpoint
    const checkoutUrl = `/api/payments/mock-checkout?ref=${providerRef}&paymentId=${paymentRecord.id}`;

    return {
      paymentId: paymentRecord.id,
      checkoutUrl,
      providerRef,
    };
  }

  async verify(providerRef: string): Promise<PaymentVerifyResult> {
    // Mock: treat all MOCK- refs as completed
    return {
      status: "completed",
      providerRef,
      providerPayload: {
        mock: true,
        verifiedAt: new Date().toISOString(),
      },
    };
  }

  async refund(_providerRef: string, _amount: number): Promise<boolean> {
    return true;
  }
}

// ─── Moyasar Payment Provider (stub for production) ──────────────────────────

export class MoyasarPaymentProvider implements PaymentProvider {
  private apiKey: string;
  private baseUrl = "https://api.moyasar.com/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private get authHeader(): string {
    return `Basic ${Buffer.from(`${this.apiKey}:`).toString("base64")}`;
  }

  async initiate(input: PaymentInitInput): Promise<PaymentInitResult> {
    const amountHalalas = Math.round(input.amount * 1.15 * 100); // including 15% VAT, in halalas

    const response = await fetch(`${this.baseUrl}/payments`, {
      method: "POST",
      headers: {
        Authorization: this.authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountHalalas,
        currency: input.currency ?? "SAR",
        description: input.description ?? "Franchise Ready AI - Project Credit",
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback`,
        source: { type: "creditcard" },
        metadata: { userId: input.userId },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Moyasar payment initiation failed: ${error.message ?? response.statusText}`
      );
    }

    const data = await response.json();

    const paymentRecord = await db.payment.create({
      data: {
        userId: input.userId,
        amount: input.amount,
        currency: input.currency ?? "SAR",
        vatAmount: input.amount * 0.15,
        totalAmount: input.amount * 1.15,
        status: "pending",
        provider: "moyasar",
        providerRef: data.id,
        providerPayload: data,
        description: input.description,
      },
    });

    return {
      paymentId: paymentRecord.id,
      checkoutUrl: data.source?.transaction_url ?? data.url,
      providerRef: data.id,
    };
  }

  async verify(providerRef: string): Promise<PaymentVerifyResult> {
    const response = await fetch(`${this.baseUrl}/payments/${providerRef}`, {
      headers: { Authorization: this.authHeader },
    });

    if (!response.ok) {
      throw new Error(`Moyasar verify failed: ${response.statusText}`);
    }

    const data = await response.json();

    const statusMap: Record<string, PaymentStatus> = {
      paid: "completed",
      failed: "failed",
      refunded: "refunded",
      initiated: "pending",
      authorized: "pending",
    };

    return {
      status: statusMap[data.status] ?? "pending",
      providerRef: data.id,
      providerPayload: data,
    };
  }

  async refund(providerRef: string, amount: number): Promise<boolean> {
    const amountHalalas = Math.round(amount * 100);

    const response = await fetch(
      `${this.baseUrl}/payments/${providerRef}/refund`,
      {
        method: "POST",
        headers: {
          Authorization: this.authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: amountHalalas }),
      }
    );

    return response.ok;
  }
}

// ─── Payment Service Factory ──────────────────────────────────────────────────

function createPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER ?? "mock";

  switch (provider) {
    case "moyasar": {
      const apiKey = process.env.MOYASAR_API_KEY;
      if (!apiKey) throw new Error("MOYASAR_API_KEY is required");
      return new MoyasarPaymentProvider(apiKey);
    }
    case "mock":
    default:
      return new MockPaymentProvider();
  }
}

export const paymentService: PaymentProvider = createPaymentProvider();

// ─── Grant Project Credit ─────────────────────────────────────────────────────

export async function grantProjectCredit(
  paymentId: string
): Promise<{ creditId: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return db.$transaction(async (tx: any) => {
    const payment = await tx.payment.findUnique({ where: { id: paymentId } });

    if (!payment) throw new Error("Payment not found");
    if (payment.status !== "completed") {
      throw new Error("Payment is not completed");
    }
    if (payment.creditGranted) {
      const existingCredit = await tx.projectCredit.findUnique({
        where: { paymentId },
      });
      if (existingCredit) return { creditId: existingCredit.id };
    }

    const credit = await tx.projectCredit.create({
      data: {
        userId: payment.userId,
        paymentId: payment.id,
        used: false,
      },
    });

    await tx.payment.update({
      where: { id: paymentId },
      data: { creditGranted: true },
    });

    return { creditId: credit.id };
  });
}

// ─── Consume Credit ───────────────────────────────────────────────────────────

export async function consumeCredit(
  creditId: string,
  establishmentId: string
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.$transaction(async (tx: any) => {
    const credit = await tx.projectCredit.findUnique({
      where: { id: creditId },
    });

    if (!credit) throw new Error("Credit not found");
    if (credit.used) throw new Error("Credit already used");

    await tx.projectCredit.update({
      where: { id: creditId },
      data: { used: true, usedAt: new Date() },
    });

    await tx.establishment.update({
      where: { id: establishmentId },
      data: { creditId },
    });
  });
}
