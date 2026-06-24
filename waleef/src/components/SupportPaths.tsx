"use client";

import { useApp } from "@/context/AppContext";
import { STRINGS } from "@/lib/i18n";
import { SUPPORT_AREAS } from "@/lib/categories";

/** Warm grouped "spaces" — each opens a gentle chat with a seed message. */
export default function SupportPaths() {
  const { language, goToChatWith } = useApp();
  const t = STRINGS[language];

  return (
    <div className="mx-auto max-w-md px-6 py-8">
      <h2 className="font-arabic text-2xl font-bold text-ink">{t.supportTitle}</h2>
      <p className="mt-2 text-ink-faint">{t.supportSubtitle}</p>

      <div className="mt-6 space-y-3">
        {SUPPORT_AREAS.map((area, i) => (
          <button
            key={area.id}
            type="button"
            onClick={() => goToChatWith(language === "ar" ? area.seedAr : area.seedEn)}
            style={{ animationDelay: `${i * 40}ms` }}
            className="group flex w-full animate-fade-up items-start gap-3 rounded-2xl border border-sand-200 bg-cream-50 p-4 text-start shadow-sm transition-all hover:border-sage-200 hover:bg-sage-50/50"
          >
            <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-gold-200 transition-colors group-hover:bg-sage-300" />
            <span className="flex-1">
              <span className="block font-semibold text-ink">
                {language === "ar" ? area.titleAr : area.titleEn}
              </span>
              <span className="mt-0.5 block text-sm leading-relaxed text-ink-soft">
                {language === "ar" ? area.descAr : area.descEn}
              </span>
            </span>
            <span className="text-ink-faint transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
              {language === "ar" ? "‹" : "›"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
