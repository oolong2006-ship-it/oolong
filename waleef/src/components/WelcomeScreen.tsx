"use client";

import { useApp } from "@/context/AppContext";
import { STRINGS } from "@/lib/i18n";

export default function WelcomeScreen() {
  const { language, setStage, setIsGuest, toggleLanguage } = useApp();
  const t = STRINGS[language];

  const enterGuest = () => {
    setIsGuest(true);
    setStage("app");
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-cream-50 via-cream-100 to-sand-100 px-6 py-10">
      <div className="pointer-events-none absolute -top-24 start-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sage-100/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 end-0 h-64 w-64 rounded-full bg-gold-100/30 blur-3xl" />

      <header className="z-10 flex w-full max-w-md items-center justify-end">
        <button
          type="button"
          onClick={toggleLanguage}
          className="rounded-full border border-sand-300/70 bg-cream-50/80 px-4 py-1.5 text-sm font-medium text-ink-soft shadow-sm backdrop-blur transition-colors hover:bg-sand-100"
        >
          {t.toEnglish}
        </button>
      </header>

      <main className="z-10 flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-8 grid place-items-center">
          <span className="relative grid h-28 w-28 place-items-center rounded-full bg-sage-100/60">
            <span className="absolute h-20 w-20 animate-breathe rounded-full bg-sage-200/70" />
            <span className="relative h-12 w-12 rounded-full bg-sage-300/90 shadow-soft" />
          </span>
        </div>
        <h1 className="font-arabic text-4xl font-bold tracking-tight text-sage-400">
          {t.welcomeHi}
        </h1>
        <p className="mt-4 max-w-xs text-lg leading-relaxed text-ink-soft">
          {t.tagline}
        </p>
      </main>

      <footer className="z-10 mb-4 w-full max-w-md space-y-3 animate-fade-up">
        <button
          type="button"
          onClick={() => setStage("onboarding")}
          className="w-full rounded-2xl bg-sage-400 px-6 py-4 text-lg font-semibold text-cream-50 shadow-soft transition-transform active:scale-[0.98] hover:bg-sage-500"
        >
          {t.startWithMe}
        </button>
        <button
          type="button"
          onClick={enterGuest}
          className="w-full rounded-2xl border border-sand-300 bg-cream-50 px-6 py-3.5 text-base font-medium text-ink-soft transition-colors hover:bg-sand-100"
        >
          {t.enterAsGuest}
        </button>
        <p className="text-center text-sm text-ink-faint">{t.noRegister}</p>
      </footer>
    </div>
  );
}
