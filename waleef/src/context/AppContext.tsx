"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ContactPreference, Language, Persona } from "@/lib/types";

export type Stage = "welcome" | "onboarding" | "app";
export type Tab =
  | "chat"
  | "checkin"
  | "journal"
  | "progress"
  | "support"
  | "referrals"
  | "settings";

interface AppState {
  language: Language;
  setLanguage: (l: Language) => void;
  toggleLanguage: () => void;

  stage: Stage;
  setStage: (s: Stage) => void;

  tab: Tab;
  setTab: (t: Tab) => void;

  persona: Persona | null;
  setPersona: (p: Persona) => void;

  contactPreference: ContactPreference | null;
  setContactPreference: (p: ContactPreference) => void;

  isGuest: boolean;
  setIsGuest: (v: boolean) => void;

  /** A pending message to seed into the chat (from support paths). */
  pendingSeed: string | null;
  setPendingSeed: (s: string | null) => void;

  goToChatWith: (seed: string) => void;
}

const AppContext = createContext<AppState | null>(null);
const LANG_KEY = "waleef.lang";

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar");
  const [stage, setStage] = useState<Stage>("welcome");
  const [tab, setTab] = useState<Tab>("chat");
  const [persona, setPersona] = useState<Persona | null>(null);
  const [contactPreference, setContactPreference] =
    useState<ContactPreference | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [pendingSeed, setPendingSeed] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LANG_KEY) as Language | null;
      if (saved === "ar" || saved === "en") setLanguageState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.lang = language;
    html.dir = language === "ar" ? "rtl" : "ltr";
    try {
      window.localStorage.setItem(LANG_KEY, language);
    } catch {
      /* ignore */
    }
  }, [language]);

  const setLanguage = (l: Language) => setLanguageState(l);
  const toggleLanguage = () =>
    setLanguageState((p) => (p === "ar" ? "en" : "ar"));

  const goToChatWith = (seed: string) => {
    setPendingSeed(seed);
    setTab("chat");
  };

  const value = useMemo<AppState>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      stage,
      setStage,
      tab,
      setTab,
      persona,
      setPersona,
      contactPreference,
      setContactPreference,
      isGuest,
      setIsGuest,
      pendingSeed,
      setPendingSeed,
      goToChatWith,
    }),
    [language, stage, tab, persona, contactPreference, isGuest, pendingSeed],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
