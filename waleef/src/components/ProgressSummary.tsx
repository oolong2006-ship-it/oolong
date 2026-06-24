"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { STRINGS } from "@/lib/i18n";
import { getProgress, type ProgressSummaryData } from "@/lib/store";
import type { CheckinMood } from "@/lib/types";

const MOOD_EMOJI: Record<CheckinMood, string> = {
  calm: "🌿",
  tired: "🥱",
  anxious: "🌊",
  sad: "🌧️",
  scattered: "🍃",
  grateful: "🤍",
  unknown: "🫧",
};

export default function ProgressSummary() {
  const { language, setTab } = useApp();
  const t = STRINGS[language];
  const [data, setData] = useState<ProgressSummaryData | null>(null);

  useEffect(() => {
    setData(getProgress());
  }, []);

  if (!data) return null;

  const moodLabel = (m: CheckinMood) =>
    t.checkinMoods.find((x) => x.id === m)?.label ?? m;

  const nextStep =
    data.checkinCount === 0
      ? language === "ar"
        ? "ابدأ بمشاركة نبضك اليوم."
        : "Start by sharing your pulse today."
      : language === "ar"
        ? "خصص دقيقة لنفسك اليوم، ولو بكلمة في دفترك."
        : "Give yourself a minute today, even one line in your journal.";

  if (data.checkinCount === 0 && data.journalCount === 0) {
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center px-6 text-center">
        <span className="mb-4 text-4xl">🌱</span>
        <p className="text-lg leading-relaxed text-ink-soft">{t.progressEmpty}</p>
        <button
          type="button"
          onClick={() => setTab("checkin")}
          className="mt-6 rounded-2xl bg-sage-400 px-6 py-3 text-sm font-semibold text-cream-50 shadow-soft transition-colors hover:bg-sage-500"
        >
          {t.navCheckin}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-8">
      <h2 className="font-arabic text-2xl font-bold text-ink">{t.progressTitle}</h2>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Stat label={t.progressCheckins} value={String(data.checkinCount)} emoji="🫶" />
        <Stat label={t.progressJournals} value={String(data.journalCount)} emoji="📖" />
      </div>

      {data.mostCommonMood && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-sand-200 bg-cream-50 p-4">
          <span className="text-2xl">{MOOD_EMOJI[data.mostCommonMood]}</span>
          <div>
            <p className="text-xs text-ink-faint">{t.progressCommonMood}</p>
            <p className="font-semibold text-ink">{moodLabel(data.mostCommonMood)}</p>
          </div>
        </div>
      )}

      {data.trend.length > 0 && (
        <div className="mt-3 rounded-2xl border border-sand-200 bg-cream-50 p-4">
          <p className="text-xs text-ink-faint">{t.progressTrend}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.trend.map((m, i) => (
              <span
                key={i}
                title={moodLabel(m)}
                className="grid h-9 w-9 place-items-center rounded-full bg-sage-50 text-lg"
              >
                {MOOD_EMOJI[m]}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 rounded-2xl border border-sage-100 bg-sage-50/60 p-4">
        <p className="text-xs font-semibold text-sage-400">{t.progressNextStep}</p>
        <p className="mt-1 leading-relaxed text-ink-soft">{nextStep}</p>
      </div>
    </div>
  );
}

function Stat({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <div className="rounded-2xl border border-sand-200 bg-cream-50 p-4">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-sage-400">{value}</span>
        <span className="text-xl">{emoji}</span>
      </div>
      <p className="mt-1 text-xs leading-snug text-ink-faint">{label}</p>
    </div>
  );
}
