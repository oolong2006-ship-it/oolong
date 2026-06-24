"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PERSONA_LABELS, STRINGS } from "@/lib/i18n";
import type { Language, Persona } from "@/lib/types";

const PERSONAS: Persona[] = ["listen", "organize", "calm", "silent", "let_waleef"];

export default function SettingsPanel() {
  const { language, setLanguage, persona, setPersona } = useApp();
  const t = STRINGS[language];
  const [cleared, setCleared] = useState(false);

  const clearData = () => {
    try {
      const keep = window.localStorage.getItem("waleef.lang");
      window.localStorage.clear();
      if (keep) window.localStorage.setItem("waleef.lang", keep);
    } catch {
      /* ignore */
    }
    setCleared(true);
    setTimeout(() => setCleared(false), 2400);
  };

  const langs: { id: Language; label: string }[] = [
    { id: "ar", label: t.langArabic },
    { id: "en", label: t.langEnglish },
  ];

  return (
    <div className="mx-auto max-w-md px-6 py-8">
      <h2 className="font-arabic text-2xl font-bold text-ink">{t.settingsTitle}</h2>

      {/* Language */}
      <section className="mt-6">
        <p className="mb-2 text-sm font-semibold text-ink-faint">{t.settingsLanguage}</p>
        <div className="flex gap-2">
          {langs.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLanguage(l.id)}
              className={`flex-1 rounded-2xl border px-4 py-3 text-center transition-all ${
                language === l.id
                  ? "border-sage-300 bg-sage-50 text-sage-400"
                  : "border-sand-200 bg-cream-50 text-ink-soft hover:border-sage-200"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </section>

      {/* Persona */}
      <section className="mt-6">
        <p className="mb-2 text-sm font-semibold text-ink-faint">{t.settingsPersona}</p>
        <div className="space-y-2">
          {PERSONAS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPersona(p)}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-start transition-all ${
                persona === p
                  ? "border-sage-300 bg-sage-50"
                  : "border-sand-200 bg-cream-50 hover:border-sage-200"
              }`}
            >
              <span className="text-ink">{PERSONA_LABELS[p][language]}</span>
              {persona === p && <span className="text-sage-400">✓</span>}
            </button>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="mt-6 rounded-2xl border border-sand-200 bg-cream-50 p-5">
        <p className="font-semibold text-ink">{t.settingsAbout}</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t.settingsAboutBody}</p>
      </section>

      {/* Clear data */}
      <section className="mt-6">
        <button
          type="button"
          onClick={clearData}
          className="w-full rounded-2xl border border-gold-200 px-6 py-3 text-sm font-medium text-gold-300 transition-colors hover:bg-gold-100/40"
        >
          {t.settingsClearData}
        </button>
        {cleared && (
          <p className="mt-3 animate-fade-in text-center text-sm text-sage-400">
            {t.settingsCleared}
          </p>
        )}
      </section>
    </div>
  );
}
