"use client";

import { useApp } from "@/context/AppContext";

interface SilentModePromptProps {
  onAction: (action: "calm" | "browse" | "soothe") => void;
}

const COPY = {
  ar: {
    prompt: "خذ وقتك… وجودك هنا يكفي كبداية.",
    calm: "أحتاج لحظة هدوء",
    browse: "خلني أتصفح",
    soothe: "اسمعني شيء يريحني",
  },
  en: {
    prompt: "Take your time… your presence here is enough as a start.",
    calm: "I need a quiet moment",
    browse: "Let me browse",
    soothe: "Tell me something soothing",
  },
};

/** Shown when the user goes quiet. Calm, low-pressure — presence is enough. */
export default function SilentModePrompt({ onAction }: SilentModePromptProps) {
  const { language } = useApp();
  const c = COPY[language];

  const actions: { id: "calm" | "browse" | "soothe"; label: string }[] = [
    { id: "calm", label: c.calm },
    { id: "browse", label: c.browse },
    { id: "soothe", label: c.soothe },
  ];

  return (
    <div className="animate-fade-up rounded-2xl border border-sage-100 bg-sage-50/60 p-5 text-center">
      <p className="text-base leading-relaxed text-ink-soft">{c.prompt}</p>
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
