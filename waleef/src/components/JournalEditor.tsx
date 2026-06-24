"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { STRINGS } from "@/lib/i18n";
import { analyzeJournal } from "@/lib/waleefEngine";
import { getJournals, saveJournal } from "@/lib/store";
import type { JournalEntry, JournalInsight } from "@/lib/types";

export default function JournalEditor() {
  const { language } = useApp();
  const t = STRINGS[language];
  const [content, setContent] = useState("");
  const [insight, setInsight] = useState<JournalInsight | null>(null);
  const [savedNote, setSavedNote] = useState(false);
  const [past, setPast] = useState<JournalEntry[]>(() => getJournals());

  const analyze = () => {
    if (!content.trim()) return;
    setInsight(analyzeJournal(content, language));
  };

  const save = async () => {
    if (!content.trim()) return;
    const emotion = insight?.emotion ?? analyzeJournal(content, language).emotion;
    await saveJournal(content.trim(), emotion);
    setSavedNote(true);
    setPast(getJournals());
    setContent("");
    setInsight(null);
    setTimeout(() => setSavedNote(false), 2200);
  };

  return (
    <div className="mx-auto max-w-md px-6 py-8">
      <h2 className="font-arabic text-2xl font-bold text-ink">{t.journalTitle}</h2>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
        placeholder={t.journalPlaceholder}
        className="mt-5 w-full resize-none rounded-2xl border border-sand-200 bg-cream-50 px-4 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-faint focus:border-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-100"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={analyze}
          disabled={!content.trim()}
          className="flex-1 rounded-2xl border border-sage-300 px-4 py-2.5 text-sm font-medium text-sage-400 transition-colors enabled:hover:bg-sage-50 disabled:opacity-40"
        >
          {t.journalAnalyze}
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!content.trim()}
          className="rounded-2xl bg-sage-400 px-6 py-2.5 text-sm font-semibold text-cream-50 shadow-sm transition-colors enabled:hover:bg-sage-500 disabled:opacity-40"
        >
          {t.journalSave}
        </button>
      </div>

      {savedNote && (
        <p className="mt-3 animate-fade-in text-center text-sm text-sage-400">
          {t.journalSaved}
        </p>
      )}

      {insight && (
        <div className="mt-5 animate-fade-up space-y-3 rounded-2xl border border-sage-100 bg-sage-50/60 p-5">
          <Row label={t.journalEmotion} value={insight.emotionLabel} />
          <Row label={t.journalNeed} value={insight.need} />
          <div>
            <p className="text-xs font-semibold text-sage-400">{t.journalReflection}</p>
            <p className="mt-1 leading-relaxed text-ink-soft">{insight.reflection}</p>
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-ink-faint">{t.journalPast}</h3>
          <div className="mt-3 space-y-2">
            {past.slice(0, 8).map((e) => (
              <div
                key={e.id}
                className="rounded-2xl border border-sand-200 bg-cream-50 p-4"
              >
                <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                  {e.content}
                </p>
                <p className="mt-2 text-[11px] text-ink-faint">
                  {new Date(e.createdAt).toLocaleDateString(
                    language === "ar" ? "ar-SA" : "en-US",
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-xs font-semibold text-sage-400">{label}</span>
      <span className="text-end text-ink">{value}</span>
    </div>
  );
}
