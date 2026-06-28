"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = "الاسم الكامل مطلوب.";
    }
    if (!email.trim()) {
      errors.email = "البريد الإلكتروني مطلوب.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "صيغة البريد الإلكتروني غير صحيحة.";
    }
    if (!password) {
      errors.password = "كلمة المرور مطلوبة.";
    } else if (password.length < 8) {
      errors.password = "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.";
    }
    if (!confirmPassword) {
      errors.confirmPassword = "تأكيد كلمة المرور مطلوب.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "كلمتا المرور غير متطابقتين.";
    }
    if (!consent) {
      errors.consent = "يجب الموافقة على الشروط والأحكام للمتابعة.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);

    try {
      const body: Record<string, string> = { name, email, password };
      if (mobile.trim()) body.mobile = mobile.trim();

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? "حدث خطأ أثناء إنشاء الحساب. حاول مجدداً.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("تعذّر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        {/* Logo / Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-accent)] mb-2">
            <span className="text-2xl font-black text-[var(--color-primary)]">F</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">إنشاء حساب جديد</h1>
          <p className="text-sm text-[var(--color-muted)]">ابدأ رحلتك نحو الامتياز التجاري</p>
        </div>

        {/* Global Error */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Full Name */}
          <div className="space-y-1">
            <label htmlFor="name" className="block text-sm font-medium text-[var(--color-foreground)]">
              الاسم الكامل <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="محمد عبدالله"
              className="w-full rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors"
            />
            {fieldErrors.name && (
              <p className="text-xs text-red-600">{fieldErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-[var(--color-foreground)]">
              البريد الإلكتروني <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@domain.com"
              dir="ltr"
              className="w-full rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors"
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          {/* Mobile (optional) */}
          <div className="space-y-1">
            <label htmlFor="mobile" className="block text-sm font-medium text-[var(--color-foreground)]">
              رقم الجوال{" "}
              <span className="text-[var(--color-muted)] font-normal text-xs">(اختياري)</span>
            </label>
            <input
              id="mobile"
              type="tel"
              autoComplete="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="+966 5X XXX XXXX"
              dir="ltr"
              className="w-full rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-[var(--color-foreground)]">
              كلمة المرور <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8 أحرف على الأقل"
              dir="ltr"
              className="w-full rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors"
            />
            {fieldErrors.password && (
              <p className="text-xs text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--color-foreground)]">
              تأكيد كلمة المرور <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="أعد إدخال كلمة المرور"
              dir="ltr"
              className="w-full rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors"
            />
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-red-600">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Consent */}
          <div className="space-y-1">
            <div className="flex items-start gap-2">
              <input
                id="consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
              />
              <label htmlFor="consent" className="text-sm text-[var(--color-foreground)] cursor-pointer leading-relaxed">
                أوافق على{" "}
                <Link href="/terms" className="text-[var(--color-primary)] hover:underline font-medium">
                  شروط الاستخدام
                </Link>{" "}
                و{" "}
                <Link href="/privacy" className="text-[var(--color-primary)] hover:underline font-medium">
                  سياسة الخصوصية
                </Link>
              </label>
            </div>
            {fieldErrors.consent && (
              <p className="text-xs text-red-600 pr-6">{fieldErrors.consent}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-[var(--color-muted)]">
          لديك حساب؟{" "}
          <Link href="/login" className="font-semibold text-[var(--color-primary)] hover:underline">
            سجّل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
