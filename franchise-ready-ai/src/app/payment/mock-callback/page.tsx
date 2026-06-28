"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Status = "verifying" | "success" | "error";

function MockCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  const [status, setStatus] = useState<Status>("verifying");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function verifyPayment() {
      if (!ref) {
        setErrorMessage("مرجع الدفع غير موجود. يرجى التواصل مع الدعم الفني.");
        setStatus("error");
        return;
      }

      try {
        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: ref }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setErrorMessage(data.error ?? "تعذّر التحقق من الدفع. يرجى التواصل مع الدعم الفني.");
          setStatus("error");
          return;
        }

        setStatus("success");
      } catch {
        setErrorMessage("تعذّر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.");
        setStatus("error");
      }
    }

    verifyPayment();
  }, [ref]);

  if (status === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 text-center space-y-5">
          {/* Spinner */}
          <div className="flex justify-center">
            <div
              className="h-14 w-14 rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)] animate-spin"
              role="status"
              aria-label="جارٍ التحقق"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-foreground)]">
              جارٍ التحقق من الدفع...
            </h1>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              يرجى الانتظار، لا تغلق هذه الصفحة
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 text-center space-y-5">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-green-600"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
              تم الدفع بنجاح! ✓
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              تم إضافة رصيد مشروع واحد إلى حسابك
            </p>
          </div>

          <div className="rounded-lg bg-[var(--color-accent)] border border-[var(--color-primary)]/20 px-4 py-3">
            <p className="text-sm text-[var(--color-primary)] font-medium">
              يمكنك الآن البدء في إنشاء مشروعك وتحليل جاهزيتك للامتياز
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-colors"
          >
            ابدأ مشروعك الآن
          </button>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 text-center space-y-5">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-red-600"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-[var(--color-foreground)]">فشل التحقق من الدفع</h1>
          <p className="text-sm text-red-600">
            {errorMessage ?? "حدث خطأ غير متوقع. يرجى التواصل مع الدعم الفني."}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              hasFetched.current = false;
              setStatus("verifying");
              setErrorMessage(null);
            }}
            className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-colors"
          >
            إعادة المحاولة
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-foreground)] hover:bg-[var(--color-surface)] transition-colors"
          >
            العودة إلى لوحة التحكم
          </button>
        </div>

        <p className="text-xs text-[var(--color-muted)]">
          إذا استمرت المشكلة، يرجى التواصل مع فريق الدعم الفني مع الاحتفاظ برقم المرجع:{" "}
          <span dir="ltr" className="font-mono">{ref ?? "—"}</span>
        </p>
      </div>
    </div>
  );
}

export default function MockCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
          <div className="h-10 w-10 rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)] animate-spin" />
        </div>
      }
    >
      <MockCallbackInner />
    </Suspense>
  );
}
