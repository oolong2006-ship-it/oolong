"use client";

import { useApp } from "@/context/AppContext";
import { getCategory } from "@/lib/categories";
import type { CategoryId } from "@/lib/types";

interface SupportPathCardProps {
  categoryId: CategoryId;
  onOpen: (categoryId: CategoryId) => void;
}

/**
 * A single rounded "support path" card. We expose only a small number
 * of these so the user never feels routed through a clinical menu.
 */
export default function SupportPathCard({ categoryId, onOpen }: SupportPathCardProps) {
  const { language } = useApp();
  const cat = getCategory(categoryId);
  if (!cat) return null;

  const label = language === "ar" ? cat.labelAr : cat.labelEn;

  return (
    <button
      type="button"
      onClick={() => onOpen(categoryId)}
      className="group flex w-full items-center gap-3 rounded-2xl border border-sand-200 bg-cream-50 px-4 py-3 text-start shadow-sm transition-all hover:border-sage-200 hover:bg-sage-50/50"
    >
      <span className="h-2.5 w-2.5 rounded-full bg-gold-200 transition-colors group-hover:bg-sage-300" />
      <span className="flex-1 text-ink">{label}</span>
      <span className="text-ink-faint transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
        {language === "ar" ? "‹" : "›"}
      </span>
    </button>
  );
}
