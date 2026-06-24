"use client";

import { useApp } from "@/context/AppContext";
import { REFERRALS, STRINGS } from "@/lib/i18n";
import type { ReferralCategory } from "@/lib/types";

interface ReferralModalProps {
  open: boolean;
  category: ReferralCategory;
  onClose: () => void;
}

/**
 * Gentle professional-referral sheet. Suggests a specialist softly,
 * never pushes. Crisis support is intentionally also reachable here.
 */
export default function ReferralModal({ open, category, onClose }: ReferralModalProps) {
  const { language } = useApp();
  const t = STRINGS[language];
  if (!open) return null;

  const info = REFERRALS[category];
  const title = language === "ar" ? info.titleAr : info.titleEn;
  const desc = language === "ar" ? info.descAr : info.descEn;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md animate-fade-up rounded-t-3xl bg-cream-50 p-6 shadow-soft sm:rounded-3xl"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-sand-200 sm:hidden" />
        <h3 className="font-arabic text-xl font-bold text-ink">{t.referralTitle}</h3>
        <p className="mt-3 leading-relaxed text-ink-soft">{t.referralBody}</p>

        <div className="mt-5 rounded-2xl border border-sage-100 bg-sage-50/60 p-4">
          <p className="font-semibold text-sage-400">{title}</p>
          <p className="mt-1 text-sm text-ink-soft">{desc}</p>
        </div>

        <div className="mt-6 space-y-2">
          <a
            href="https://www.moh.gov.sa/en/Pages/Default.aspx"
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-2xl bg-sage-400 px-6 py-3.5 text-center text-base font-semibold text-cream-50 shadow-soft transition-colors hover:bg-sage-500"
          >
            {t.referralConnect}
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl px-6 py-3 text-center text-base font-medium text-ink-soft transition-colors hover:bg-sand-100"
          >
            {t.referralClose}
          </button>
        </div>
      </div>
    </div>
  );
}
