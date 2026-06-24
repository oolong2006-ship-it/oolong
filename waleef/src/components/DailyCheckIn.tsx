"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { STRINGS } from "@/lib/i18n";
import { saveCheckin } from "@/lib/store";
import type { CheckinMood } from "@/lib/types";

export default function DailyCheckIn() {
  const { language } = useApp();
  const t = STRINGS[language];
  const [mood, setMood] = useState<CheckinMood | null>(null);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const submit = async () => {
    if (!mood) return;
    await saveCheckin(mood, note.trim() || undefined);
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center px-6 text-center">
        <span className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-sage-100 text-3xl">
          🤍
        </span>
        <p className="text-lg leading-relaxed text-ink-soft">{t.checkinSaved}</p>
        <button
          type="button"
          onClick={() => {
            setSaved(false);
            setMood(null);
            setNote("");
          }}
          className="mt-6 rounded-2xl border border-sand-300 px-6 py-2.5 text-sm text-ink-soft transition-colors hover:bg-sand-100"
        >
          {t.back}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-8">
      <h2 className="text-center font-arabic text-2xl font-bold text-ink">
        {t.checkinTitle}
      </h2>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {t.checkinMoods.map((m, i) => {
          const active = mood === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMood(m.id)}
              style={{ animationDelay: `${i * 50}ms` }}
              className={`flex animate-fade-up flex-col items-center gap-2 rounded-2xl border px-4 py-5 transition-all ${
                active
                  ? "border-sage-300 bg-sage-50 shadow-card"
                  : "border-sand-200 bg-cream-50 hover:border-sage-200"
              }`}
            >
              <span className="text-3xl" aria-hidden>
                {m.emoji}
              </span>
              <span className="text-ink">{m.label}</span>
            </button>
          );
        })}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        placeholder={t.checkinNotePlaceholder}
        className="mt-5 w-full resize-none rounded-2xl border border-sand-200 bg-cream-50 px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint focus:border-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-100"
      />

      <button
        type="button"
        onClick={submit}
        disabled={!mood}
        className="mt-5 w-full rounded-2xl bg-sage-400 px-6 py-3.5 text-lg font-semibold text-cream-50 shadow-soft transition-all active:scale-[0.98] enabled:hover:bg-sage-500 disabled:opacity-40"
      >
        {t.checkinSave}
      </button>
    </div>
  );
}
