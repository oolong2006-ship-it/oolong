"use client";

import { useApp } from "@/context/AppContext";
import { REFERRAL_ORDER, STRINGS } from "@/lib/i18n";
import ReferralCard from "./ReferralCard";

export default function ReferralCenter() {
  const { language } = useApp();
  const t = STRINGS[language];

  return (
    <div className="mx-auto max-w-md px-6 py-8">
      <h2 className="font-arabic text-2xl font-bold text-ink">{t.referralsTitle}</h2>
      <p className="mt-2 leading-relaxed text-ink-faint">{t.referralsSubtitle}</p>

      <div className="mt-6 space-y-3">
        {REFERRAL_ORDER.map((type, i) => (
          <div key={type} style={{ animationDelay: `${i * 40}ms` }} className="animate-fade-up">
            <ReferralCard type={type} connectLabel={t.referralConnect} />
          </div>
        ))}
      </div>
    </div>
  );
}
