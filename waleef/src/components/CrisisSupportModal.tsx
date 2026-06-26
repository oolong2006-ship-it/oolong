"use client";

import { useApp } from "@/context/AppContext";
import { CRISIS_COPY, CRISIS_RESOURCES } from "@/lib/crisis";
import { STRINGS } from "@/lib/i18n";

interface CrisisSupportModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Crisis-support flow. Only shown when the USER explicitly mentions
 * immediate danger. Warm, direct, calm — no shaming, no moralizing.
 */
export default function CrisisSupportModal({ open, onClose }: CrisisSupportModalProps) {
  const { language } = useApp();
  const t = STRINGS[language];
  if (!open) return null;

  const c = CRISIS_COPY[language];

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[92dvh] w-full max-w-md animate-fade-up overflow-y-auto rounded-t-3xl bg-cream-50 p-6 shadow-soft sm:rounded-3xl"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-sand-200 sm:hidden" />

        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-100 text-xl">
            🤍
          </span>
          <h3 className="font-arabic text-xl font-bold text-ink">{c.title}</h3>
        </div>

        <p className="leading-relaxed text-ink-soft">{c.intro}</p>

        <ul className="mt-4 space-y-2.5">
          {c.steps.map((step, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-2xl border border-sand-200 bg-cream-100 p-3.5"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sage-300 text-sm font-bold text-cream-50">
                {i + 1}
              </span>
              <span className="text-ink-soft">{step}</span>
            </li>
          ))}
        </ul>

        <p className="mt-4 rounded-2xl bg-sage-50 p-4 text-sm leading-relaxed text-sage-400">
          {c.reassure}
        </p>

        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-ink">{c.resourcesTitle}</p>
          <div className="space-y-2">
            {CRISIS_RESOURCES.map((r) => {
              const name = language === "ar" ? r.nameAr : r.nameEn;
              const note = language === "ar" ? r.noteAr : r.noteEn;
              return (
                <a
                  key={r.contact}
                  href={`tel:${r.contact}`}
                  className="flex items-center justify-between rounded-2xl border border-sage-200 bg-cream-50 px-4 py-3 transition-colors hover:bg-sage-50"
                >
                  <span>
                    <span className="block font-medium text-ink">{name}</span>
                    {note && (
                      <span className="block text-xs text-ink-faint">{note}</span>
                    )}
                  </span>
                  <span className="rounded-full bg-sage-400 px-4 py-1.5 text-sm font-semibold text-cream-50">
                    {r.contact}
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        <p className="mt-5 text-center text-sm leading-relaxed text-ink-soft">
          {c.close}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-2xl px-6 py-3 text-center text-base font-medium text-ink-soft transition-colors hover:bg-sand-100"
        >
          {t.close}
        </button>
      </div>
    </div>
  );
}
