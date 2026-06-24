"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { STRINGS } from "@/lib/i18n";
import type { ContactPreference, Language, Persona } from "@/lib/types";

type Step = 0 | 1 | 2;

export default function OnboardingFlow() {
  const {
    language,
    setLanguage,
    setStage,
    setPersona,
    setContactPreference,
    setIsGuest,
  } = useApp();
  const t = STRINGS[language];
  const [step, setStep] = useState<Step>(0);
  const [persona, setLocalPersona] = useState<Persona | null>(null);
  const [contact, setLocalContact] = useState<ContactPreference | null>(null);

  const personaOptions: { id: Persona; label: string; icon: string }[] = [
    { id: "listen", label: t.personaListen, icon: "👂" },
    { id: "organize", label: t.personaOrganize, icon: "🧩" },
    { id: "calm", label: t.personaCalm, icon: "🌿" },
    { id: "silent", label: t.personaSilent, icon: "🤍" },
    { id: "let_waleef", label: t.personaLetWaleef, icon: "✨" },
  ];
  const contactOptions: { id: ContactPreference; label: string; icon: string }[] = [
    { id: "text", label: t.optText, icon: "✍️" },
    { id: "voice_later", label: t.optVoiceLater, icon: "🎙️" },
    { id: "browse", label: t.optBrowse, icon: "🌸" },
  ];
  const langOptions: { id: Language; label: string }[] = [
    { id: "ar", label: t.langArabic },
    { id: "en", label: t.langEnglish },
  ];

  const finish = () => {
    if (persona) setPersona(persona);
    if (contact) setContactPreference(contact);
    setIsGuest(true);
    setStage("app");
  };

  const next = () => {
    if (step < 2) setStep((s) => (s + 1) as Step);
    else finish();
  };
  const back = () => {
    if (step > 0) setStep((s) => (s - 1) as Step);
    else setStage("welcome");
  };

  const canContinue =
    (step === 0 && persona) || (step === 1 && contact) || step === 2;

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-cream-50 to-cream-100 px-6 py-8">
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          className="text-sm text-ink-faint transition-colors hover:text-ink-soft"
        >
          {t.back}
        </button>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-sage-400" : "w-1.5 bg-sand-300"
              }`}
            />
          ))}
        </div>
      </header>

      <main className="mx-auto mt-10 flex w-full max-w-md flex-1 flex-col">
        {step === 0 && (
          <Section title={t.onbHowTitle}>
            {personaOptions.map((opt, i) => (
              <OptionRow
                key={opt.id}
                icon={opt.icon}
                label={opt.label}
                active={persona === opt.id}
                delay={i}
                onClick={() => setLocalPersona(opt.id)}
              />
            ))}
          </Section>
        )}

        {step === 1 && (
          <Section title={t.onbContactTitle}>
            {contactOptions.map((opt, i) => (
              <OptionRow
                key={opt.id}
                icon={opt.icon}
                label={opt.label}
                active={contact === opt.id}
                delay={i}
                onClick={() => setLocalContact(opt.id)}
              />
            ))}
          </Section>
        )}

        {step === 2 && (
          <Section title={t.onbLangTitle}>
            {langOptions.map((opt, i) => (
              <OptionRow
                key={opt.id}
                icon={opt.id === "ar" ? "🇸🇦" : "🌍"}
                label={opt.label}
                active={language === opt.id}
                delay={i}
                onClick={() => setLanguage(opt.id)}
              />
            ))}
          </Section>
        )}
      </main>

      <footer className="mx-auto w-full max-w-md">
        <button
          type="button"
          onClick={next}
          disabled={!canContinue}
          className="w-full rounded-2xl bg-sage-400 px-6 py-4 text-lg font-semibold text-cream-50 shadow-soft transition-all active:scale-[0.98] enabled:hover:bg-sage-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t.continueLabel}
        </button>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-arabic text-2xl font-bold text-ink">{title}</h2>
      <div className="mt-7 space-y-3">{children}</div>
    </div>
  );
}

function OptionRow({
  icon,
  label,
  active,
  delay,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  delay: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ animationDelay: `${delay * 60}ms` }}
      className={`flex w-full animate-fade-up items-center gap-4 rounded-2xl border px-5 py-4 text-start transition-all ${
        active
          ? "border-sage-300 bg-sage-50 shadow-card"
          : "border-sand-200 bg-cream-50 hover:border-sage-200 hover:bg-sage-50/40"
      }`}
    >
      <span className="text-2xl" aria-hidden>
        {icon}
      </span>
      <span className="flex-1 text-lg text-ink">{label}</span>
      <span
        className={`grid h-5 w-5 place-items-center rounded-full border-2 ${
          active ? "border-sage-400 bg-sage-400" : "border-sand-300"
        }`}
      >
        {active && <span className="h-2 w-2 rounded-full bg-cream-50" />}
      </span>
    </button>
  );
}
