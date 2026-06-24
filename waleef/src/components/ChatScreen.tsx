"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { CHIP_TO_MESSAGE, STRINGS } from "@/lib/i18n";
import { PUBLIC_CATEGORY_IDS } from "@/lib/categories";
import type {
  CategoryId,
  ChatMessage,
  ReferralCategory,
  WaleefReply,
} from "@/lib/types";
import QuickChips from "./QuickChips";
import SilentModePrompt from "./SilentModePrompt";
import SupportPathCard from "./SupportPathCard";
import MessageBubble from "./MessageBubble";
import ReferralModal from "./ReferralModal";
import CrisisSupportModal from "./CrisisSupportModal";
import LanguageToggle from "./LanguageToggle";

const SILENT_DELAY_MS = 18000; // show silent-mode prompt after ~18s idle

let idCounter = 0;
const newId = () => `m_${Date.now()}_${idCounter++}`;

export default function ChatScreen() {
  const { language, setScreen, contactPreference, isGuest } = useApp();
  const t = STRINGS[language];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showSilent, setShowSilent] = useState(false);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [referral, setReferral] = useState<{ open: boolean; cat: ReferralCategory }>({
    open: false,
    cat: "psychologist",
  });

  const turnCountRef = useRef(0);
  const lastMessageAtRef = useRef<number>(Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);
  const silentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Seed the conversation with Waleef's warm intro.
  useEffect(() => {
    setMessages([
      {
        id: newId(),
        role: "waleef",
        text: t.chatIntro,
        createdAt: Date.now(),
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to newest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing, showSilent]);

  // Silent-mode idle timer.
  const resetSilentTimer = useCallback(() => {
    setShowSilent(false);
    if (silentTimerRef.current) clearTimeout(silentTimerRef.current);
    silentTimerRef.current = setTimeout(() => setShowSilent(true), SILENT_DELAY_MS);
  }, []);

  useEffect(() => {
    resetSilentTimer();
    return () => {
      if (silentTimerRef.current) clearTimeout(silentTimerRef.current);
    };
  }, [resetSilentTimer]);

  const appendWaleef = useCallback((reply: WaleefReply) => {
    setMessages((prev) => [
      ...prev,
      {
        id: newId(),
        role: "waleef",
        text: reply.text,
        options: reply.options,
        showCrisis: reply.showCrisis,
        showReferral: reply.showReferral,
        referralCategory: reply.referralCategory,
        createdAt: Date.now(),
      },
    ]);
    if (reply.showCrisis) setCrisisOpen(true);
  }, []);

  const callEngine = useCallback(
    async (payload: { message?: string; optionId?: string }) => {
      setTyping(true);
      const secondsSinceLast = Math.round(
        (Date.now() - lastMessageAtRef.current) / 1000,
      );
      lastMessageAtRef.current = Date.now();
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            metadata: {
              language,
              secondsSinceLast,
              contactPreference: contactPreference ?? undefined,
              turnCount: turnCountRef.current,
            },
          }),
        });
        const data = (await res.json()) as { reply: WaleefReply };
        appendWaleef(data.reply);
      } catch {
        appendWaleef({
          text:
            language === "ar"
              ? "صار خلل بسيط… بس أنا باقي معك. جرّب ثاني."
              : "A small glitch happened… but I'm still with you. Try again.",
        });
      } finally {
        setTyping(false);
        resetSilentTimer();
      }
    },
    [language, contactPreference, appendWaleef, resetSilentTimer],
  );

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      turnCountRef.current += 1;
      setMessages((prev) => [
        ...prev,
        { id: newId(), role: "user", text: trimmed, createdAt: Date.now() },
      ]);
      setInput("");
      void callEngine({ message: trimmed });
    },
    [callEngine],
  );

  const handleChip = useCallback(
    (chipId: string) => {
      const map = CHIP_TO_MESSAGE[chipId];
      if (map) sendMessage(map[language]);
    },
    [language, sendMessage],
  );

  const handleOption = useCallback(
    (optionId: string, label: string) => {
      turnCountRef.current += 1;
      setMessages((prev) => [
        ...prev,
        { id: newId(), role: "user", text: label, createdAt: Date.now() },
      ]);
      void callEngine({ optionId });
    },
    [callEngine],
  );

  const handleSilentAction = useCallback(
    (action: "calm" | "browse" | "soothe") => {
      setShowSilent(false);
      const optionId =
        action === "calm" ? "calm" : action === "browse" ? "browse" : "rest";
      void callEngine({ optionId });
    },
    [callEngine],
  );

  const handleSupportPath = useCallback(
    (categoryId: CategoryId) => {
      const seed: Record<string, { ar: string; en: string }> = {
        overthinking: { ar: "أفكر كثير", en: "I overthink a lot" },
        anxiety: { ar: "أحس بقلق", en: "I feel anxious" },
        burnout: { ar: "محترق من الشغل", en: "I'm burned out from work" },
      };
      const s = seed[categoryId];
      if (s) sendMessage(s[language]);
    },
    [language, sendMessage],
  );

  const openReferral = (cat: ReferralCategory) =>
    setReferral({ open: true, cat });

  return (
    <div className="flex h-dvh flex-col bg-gradient-to-b from-cream-50 to-cream-100">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-sand-200/70 bg-cream-50/80 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-sage-100">
            <span className="h-3.5 w-3.5 rounded-full bg-sage-300" />
          </span>
          <div className="leading-tight">
            <p className="font-arabic text-lg font-bold text-sage-400">
              {t.appName}
            </p>
            {isGuest && (
              <p className="text-[11px] text-ink-faint">{t.guestBadge}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <button
            type="button"
            onClick={() => setScreen("welcome")}
            className="rounded-full px-3 py-1.5 text-sm text-ink-faint transition-colors hover:bg-sand-100"
          >
            {t.backHome}
          </button>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5">
        <div className="mx-auto flex max-w-md flex-col gap-4">
          {/* A few gentle support paths near the top (not a big menu). */}
          {messages.length <= 1 && (
            <div className="space-y-2">
              {PUBLIC_CATEGORY_IDS.map((id) => (
                <SupportPathCard
                  key={id}
                  categoryId={id}
                  onOpen={handleSupportPath}
                />
              ))}
            </div>
          )}

          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              onOption={handleOption}
              onCrisis={() => setCrisisOpen(true)}
              onReferral={() =>
                openReferral(m.referralCategory ?? "psychologist")
              }
              crisisLabel={t.crisisButton}
              referralLabel={t.referralConnect}
            />
          ))}

          {typing && (
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-sand-200 bg-cream-50 px-4 py-3 text-ink-faint w-fit">
              <span className="text-xs">{t.waleefTyping}</span>
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-dot-pulse rounded-full bg-sage-300" />
                <span className="h-1.5 w-1.5 animate-dot-pulse rounded-full bg-sage-300 [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 animate-dot-pulse rounded-full bg-sage-300 [animation-delay:0.4s]" />
              </span>
            </div>
          )}

          {showSilent && !typing && (
            <SilentModePrompt onAction={handleSilentAction} />
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-sand-200/70 bg-cream-50/90 px-5 pb-5 pt-3 backdrop-blur">
        <div className="mx-auto max-w-md space-y-3">
          {messages.length <= 3 && <QuickChips onPick={handleChip} disabled={typing} />}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              onFocus={resetSilentTimer}
              rows={1}
              placeholder={t.chatPlaceholder}
              className="max-h-32 flex-1 resize-none rounded-2xl border border-sand-200 bg-cream-50 px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint focus:border-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-100"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              aria-label={t.send}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sage-400 text-cream-50 shadow-soft transition-all active:scale-95 enabled:hover:bg-sage-500 disabled:opacity-40"
            >
              <span className="text-lg rtl:-scale-x-100">➤</span>
            </button>
          </form>
        </div>
      </div>

      {/* Modals */}
      <ReferralModal
        open={referral.open}
        category={referral.cat}
        onClose={() => setReferral((r) => ({ ...r, open: false }))}
      />
      <CrisisSupportModal open={crisisOpen} onClose={() => setCrisisOpen(false)} />
    </div>
  );
}
