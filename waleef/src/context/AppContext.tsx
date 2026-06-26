"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ContactPreference, Language } from "@/lib/types";

export type Screen = "welcome" | "onboarding" | "chat";

interface AppState {
  language: Language;
  setLanguage: (l: Language) => void;
  toggleLanguage: () => void;
  screen: Screen;
  setScreen: (s: Screen) => void;
  contactPreference: ContactPreference | null;
  setContactPreference: (p: ContactPreference) => void;
  isGuest: boolean;
  setIsGuest: (v: boolean) => void;
}

const AppContext = createContext<AppState | null>(null);

const LANG_KEY = "waleef.lang";

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar");
  const [screen, setScreen] = useState<Screen>("welcome");
  const [contactPreference, setContactPreference] =
    useState<ContactPreference | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  // Restore saved language preference (simple mock persistence).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LANG_KEY) as Language | null;
      if (saved === "ar" || saved === "en") setLanguageState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  // Keep <html> dir/lang in sync for RTL support.
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
    setLanguageState((prev) => (prev === "ar" ? "en" : "ar"));

  const value = useMemo<AppState>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      screen,
      setScreen,
      contactPreference,
      setContactPreference,
      isGuest,
      setIsGuest,
    }),
    [language, screen, contactPreference, isGuest],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
