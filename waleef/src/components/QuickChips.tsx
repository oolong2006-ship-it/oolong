"use client";

import { useApp } from "@/context/AppContext";
import { STRINGS } from "@/lib/i18n";

interface QuickChipsProps {
  onPick: (chipId: string) => void;
  disabled?: boolean;
}

/** Gentle entry-point chips shown above the chat input. */
export default function QuickChips({ onPick, disabled }: QuickChipsProps) {
  const { language } = useApp();
  const t = STRINGS[language];

  return (
    <div className="flex flex-wrap gap-2">
      {t.chips.map((chip, i) => (
        <button
          key={chip.id}
          type="button"
          disabled={disabled}
          onClick={() => onPick(chip.id)}
          style={{ animationDelay: `${i * 50}ms` }}
          className="animate-fade-up rounded-full border border-sand-200 bg-cream-50 px-4 py-2 text-sm text-ink-soft shadow-sm transition-all hover:border-sage-200 hover:bg-sage-50 disabled:opacity-50"
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
