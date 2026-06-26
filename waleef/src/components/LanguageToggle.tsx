"use client";

import { useApp } from "@/context/AppContext";

/** Small, calm Arabic/English toggle. */
export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { language, toggleLanguage } = useApp();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
      className={`rounded-full border border-sand-300/70 bg-cream-50/80 px-4 py-1.5 text-sm font-medium text-ink-soft shadow-sm backdrop-blur transition-colors hover:bg-sand-100 ${className}`}
    >
      {language === "ar" ? "English" : "العربية"}
    </button>
  );
}
