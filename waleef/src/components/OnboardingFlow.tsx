"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { STRINGS } from "@/lib/i18n";
import type { ContactPreference } from "@/lib/types";
import LanguageToggle from "./LanguageToggle";

export default function OnboardingFlow() {
  const { language, setScreen, setContactPreference, setIsGuest } = useApp();
  const t = STRINGS[language];
  const [selected, setSelected] = useState<ContactPreference | null>(null);

  const options: { id: ContactPreference; label: string; icon: string }[] = [
    { id: "text", label: t.optText, icon: "✍️" },
    { id: "voice_later", label: t.optVoiceLater, icon: "🎙️" },
    { id: "browse", label: t.optBrowse, icon: "🌿" },
    { id: "let_waleef", label: t.optLetWaleef, icon: "🤍" },
  ];

  const proceed = () => {
    if (selected) setContactPreference(selected);
    setIsGuest(true); // Guest mode by default — no forced registration.
    setScreen("chat");
  };

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-cream-50 to-cream-100 px-6 py-8">
      <header className="flex w-full items-center justify-between">
        <button
          type="button"
          onClick={() => setScreen("welcome")}
          className="text-sm text-ink-faint transition-colors hover:text-ink-soft"
        >
          {t.backHome}
        </button>
        <LanguageToggle />
      </header>

      <main className="mx-auto mt-10 flex w-full max-w-md flex-1 flex-col">
        <h2 className="font-arabic text-2xl font-bold text-ink">
          {t.onboardingTitle}
        </h2>
        <p className="mt-2 text-ink-faint">{t.onboardingHint}</p>

        <div className="mt-7 space-y-3">
          {options.map((opt, i) => {
            const active = selected === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelected(opt.id)}
                style={{ animationDelay: `${i * 60}ms` }}
                className={`flex w-full animate-fade-up items-center gap-4 rounded-2xl border px-5 py-4 text-start transition-all ${
                  active
                    ? "border-sage-300 bg-sage-50 shadow-card"
                    : "border-sand-200 bg-cream-50 hover:border-sage-200 hover:bg-sage-50/40"
                }`}
              >
                <span className="text-2xl" aria-hidden>
                  {opt.icon}
                </span>
                <span className="flex-1 text-lg text-ink">{opt.label}</span>
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full border-2 ${
                    active ? "border-sage-400 bg-sage-400" : "border-sand-300"
                  }`}
                >
                  {active && (
                    <span className="h-2 w-2 rounded-full bg-cream-50" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </main>

      <footer className="mx-auto w-full max-w-md space-y-3">
        <button
          type="button"
          onClick={proceed}
          disabled={!selected}
          className="w-full rounded-2xl bg-sage-400 px-6 py-4 text-lg font-semibold text-cream-50 shadow-soft transition-all active:scale-[0.98] enabled:hover:bg-sage-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t.continueLabel}
        </button>
        <button
          type="button"
          onClick={proceed}
          className="w-full rounded-2xl px-6 py-3 text-base font-medium text-ink-soft transition-colors hover:bg-sand-100"
        >
          {t.guestMode}
        </button>
      </footer>
    </div>
  );
}
