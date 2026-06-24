"use client";

import { useApp } from "@/context/AppContext";
import { REFERRALS } from "@/lib/i18n";
import { saveReferral } from "@/lib/store";
import type { ReferralCategory } from "@/lib/types";

interface ReferralCardProps {
  type: ReferralCategory;
  connectLabel: string;
}

/** A single specialist card. Gentle wording, never "you need treatment". */
export default function ReferralCard({ type, connectLabel }: ReferralCardProps) {
  const { language } = useApp();
  const info = REFERRALS[type];
  const title = language === "ar" ? info.titleAr : info.titleEn;
  const desc = language === "ar" ? info.descAr : info.descEn;

  return (
    <div className="rounded-2xl border border-sand-200 bg-cream-50 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sage-100 text-xl">
          {info.emoji}
        </span>
        <div className="flex-1">
          <h3 className="font-semibold text-ink">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{desc}</p>
        </div>
      </div>
      <a
        href="https://www.moh.gov.sa/en/Pages/Default.aspx"
        target="_blank"
        rel="noreferrer"
        onClick={() => void saveReferral(type)}
        className="mt-4 block w-full rounded-2xl border border-sage-300 px-5 py-2.5 text-center text-sm font-medium text-sage-400 transition-colors hover:bg-sage-50"
      >
        {connectLabel}
      </a>
    </div>
  );
}
