"use client";

import type { ChatMessage } from "@/lib/types";

interface MessageBubbleProps {
  message: ChatMessage;
  onOption?: (optionId: string, label: string) => void;
  onCrisis?: () => void;
  onReferral?: () => void;
  crisisLabel: string;
  referralLabel: string;
}

/** A single chat bubble (user or Waleef), with optional inline actions. */
export default function MessageBubble({
  message,
  onOption,
  onCrisis,
  onReferral,
  crisisLabel,
  referralLabel,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex w-full animate-fade-up flex-col ${
        isUser ? "items-end" : "items-start"
      }`}
    >
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
          isUser
            ? "rounded-br-md bg-sage-300 text-cream-50 rtl:rounded-bl-md rtl:rounded-br-2xl"
            : "rounded-bl-md bg-cream-50 text-ink border border-sand-200 rtl:rounded-br-md rtl:rounded-bl-2xl"
        }`}
      >
        {message.text}
      </div>

      {/* Inline gentle options (2–3) */}
      {!isUser && message.options && message.options.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {message.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onOption?.(opt.id, opt.label)}
              className="rounded-full border border-sage-200 bg-sage-50/70 px-4 py-1.5 text-sm text-sage-400 transition-colors hover:bg-sage-100"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Crisis call-to-action */}
      {!isUser && message.showCrisis && (
        <button
          type="button"
          onClick={onCrisis}
          className="mt-2.5 rounded-full bg-gold-200 px-5 py-2 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-gold-300 hover:text-cream-50"
        >
          {crisisLabel}
        </button>
      )}

      {/* Gentle referral call-to-action */}
      {!isUser && message.showReferral && (
        <button
          type="button"
          onClick={onReferral}
          className="mt-2.5 rounded-full border border-sage-300 px-5 py-2 text-sm font-medium text-sage-400 transition-colors hover:bg-sage-50"
        >
          {referralLabel}
        </button>
      )}
    </div>
  );
}
