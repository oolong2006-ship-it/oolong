"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const AMOUNT = 1999;
const VAT_RATE = 0.15;
const VAT_AMOUNT = AMOUNT * VAT_RATE; // 299.85
const TOTAL = AMOUNT + VAT_AMOUNT;   // 2298.85

function formatSAR(value: number) {
  return value.toLocaleString("ar-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function PaymentPage() {
  const router = useRouter();
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!consent) {
      setError("يجب الموافقة على الشروط قبل إتمام الدفع.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: AMOUNT,
          currency: "SAR",
          description: "تقرير جاهزية الفرنشايز",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? "حدث خطأ أثناء إنشاء طلب الدفع. حاول مجدداً.");
        return;
      }

      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        setError("لم يتم استلام رابط الدفع. يرجى المحاولة مجدداً.");
      }
    } catch {
      setError("تعذّر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <h2 className="text-lg font-bold text-[var(--color-foreground)] border-b border-[var(--color-border)] pb-3">
            ملخص الطلب
          </h2>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-[var(--color-foreground)]">تقرير جاهزية الفرنشايز</p>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">
                تحليل شامل لجاهزية منشأتك للتوسع عبر الامتياز التجاري
              </p>
            </div>
            <span className="font-bold text-[var(--color-primary)] whitespace-nowrap">
              {formatSAR(AMOUNT)}
            </span>
          </div>

          <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
            <div className="flex justify-between text-sm text-[var(--color-muted)]">
              <span>السعر قبل الضريبة</span>
              <span dir="ltr">{formatSAR(AMOUNT)}</span>
            </div>
            <div className="flex justify-between text-sm text-[var(--color-muted)]">
              <span>ضريبة القيمة المضافة (15%)</span>
              <span dir="ltr">{formatSAR(VAT_AMOUNT)}</span>
            </div>
            <div className="flex justify-between font-bold text-[var(--color-foreground)] text-base pt-2 border-t border-[var(--color-border)]">
              <span>الإجمالي شامل الضريبة</span>
              <span dir="ltr" className="text-[var(--color-primary)]">{formatSAR(TOTAL)}</span>
            </div>
          </div>
        </div>

        {/* Payment Card */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
            <h2 className="text-lg font-bold text-[var(--color-foreground)]">معلومات الدفع</h2>

            {/* Payment Provider Note */}
            <div className="rounded-lg bg-[var(--color-accent)] border border-[var(--color-primary)]/20 px-4 py-3">
              <p className="text-sm text-[var(--color-primary)] font-medium">
                سيتم توجيهك إلى بوابة الدفع الآمنة لإتمام العملية
              </p>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                نستخدم بوابات دفع معتمدة لحماية بياناتك المالية
              </p>
            </div>

            {/* Payment Provider Logos (placeholders) */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-[var(--color-muted)]">وسائل الدفع المتاحة</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center rounded-md border border-[var(--color-border)] bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-600 tracking-wide">
                  Moyasar
                </span>
                <span className="inline-flex items-center rounded-md border border-[var(--color-border)] bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-600 tracking-wide">
                  Tap
                </span>
                <span className="inline-flex items-center rounded-md border border-[var(--color-border)] bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-600 tracking-wide">
                  HyperPay
                </span>
                <span className="inline-flex items-center rounded-md border border-[var(--color-border)] bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-500">
                  VISA / Mastercard
                </span>
                <span className="inline-flex items-center rounded-md border border-[var(--color-border)] bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-500">
                  مدى
                </span>
              </div>
            </div>

            {/* Security Note */}
            <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-[var(--color-success)] shrink-0"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>دفع آمن ومشفر بتقنية SSL 256-bit</span>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Consent */}
            <div className="flex items-start gap-2">
              <input
                id="consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
              />
              <label htmlFor="consent" className="text-sm text-[var(--color-foreground)] cursor-pointer leading-relaxed">
                أوافق على إرسال بياناتي للمعالجة والحصول على التقرير وفقاً لسياسة الخصوصية
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-3.5 text-base font-bold text-white hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "جارٍ المعالجة..." : `أكمل الدفع الآن — ${formatSAR(TOTAL)}`}
            </button>

            {/* Legal Disclaimer */}
            <p className="text-xs text-[var(--color-muted)] leading-relaxed border-t border-[var(--color-border)] pt-4">
              <strong>إخلاء مسؤولية:</strong> التقرير المُقدَّم له طابع استشاري فقط ولا يُعدّ ضماناً قانونياً أو مالياً.
              تُقدَّم نتائجه بناءً على البيانات المُدخلة وتحليلات الذكاء الاصطناعي، وتقع مسؤولية اتخاذ القرارات التجارية
              النهائية على عاتق العميل.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
