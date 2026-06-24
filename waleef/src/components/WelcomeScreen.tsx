"use client";

import { useApp } from "@/context/AppContext";
import { STRINGS } from "@/lib/i18n";
import LanguageToggle from "./LanguageToggle";

export default function WelcomeScreen() {
  const { language, setScreen } = useApp();
  const t = STRINGS[language];

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-cream-50 via-cream-100 to-sand-100 px-6 py-10">
      {/* soft decorative glow */}
      <div className="pointer-events-none absolute -top-24 start-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sage-100/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 end-0 h-64 w-64 rounded-full bg-gold-100/30 blur-3xl" />

      <header className="z-10 flex w-full max-w-md items-center justify-end">
        <LanguageToggle />
      </header>

      <main className="z-10 flex flex-1 flex-col items-center justify-center text-center">
        {/* Breathing emblem instead of a clinical logo */}
        <div className="mb-8 grid place-items-center">
          <span className="relative grid h-28 w-28 place-items-center rounded-full bg-sage-100/60">
            <span className="absolute h-20 w-20 animate-breathe rounded-full bg-sage-200/70" />
            <span className="relative h-12 w-12 rounded-full bg-sage-300/90 shadow-soft" />
          </span>
        </div>

        <h1 className="font-arabic text-6xl font-bold tracking-tight text-sage-400">
          {t.appName}
        </h1>
        <p className="mt-5 max-w-xs text-lg leading-relaxed text-ink-soft">
          {t.tagline}
        </p>
      </main>

      <footer className="z-10 mb-4 w-full max-w-md animate-fade-up">
        <button
          type="button"
          onClick={() => setScreen("onboarding")}
          className="w-full rounded-2xl bg-sage-400 px-6 py-4 text-lg font-semibold text-cream-50 shadow-soft transition-transform active:scale-[0.98] hover:bg-sage-500"
        >
          {t.start}
        </button>
        <p className="mt-4 text-center text-sm text-ink-faint">{t.noRegister}</p>
      </footer>
    </div>
  );
}
