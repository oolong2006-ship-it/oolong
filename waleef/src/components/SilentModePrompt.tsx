"use client";

import { useApp } from "@/context/AppContext";
import { STRINGS } from "@/lib/i18n";

interface SilentModePromptProps {
  onAction: (action: "calm" | "browse" | "soothe") => void;
}

/**
 * Shown when the user goes quiet for a while. Calm, low-pressure,
 * never demanding — presence is enough.
 */
export default function SilentModePrompt({ onAction }: SilentModePromptProps) {
  const { language } = useApp();
  const t = STRINGS[language];

  const actions: { id: "calm" | "browse" | "soothe"; label: string }[] = [
    { id: "calm", label: t.silentCalm },
    { id: "browse", label: t.silentBrowse },
    { id: "soothe", label: t.silentSoothe },
  ];

  return (
    <div className="animate-fade-up rounded-2xl border border-sage-100 bg-sage-50/60 p-5 text-center">
      <p className="text-base leading-relaxed text-ink-soft">{t.silentPrompt}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {actions.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onAction(a.id)}
            className="rounded-full bg-cream-50 px-4 py-2 text-sm font-medium text-sage-400 shadow-sm transition-colors hover:bg-sage-100"
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
