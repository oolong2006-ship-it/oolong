"use client";

import { useApp, type Tab } from "@/context/AppContext";
import { STRINGS } from "@/lib/i18n";
import ChatInterface from "./ChatInterface";
import DailyCheckIn from "./DailyCheckIn";
import JournalEditor from "./JournalEditor";
import ProgressSummary from "./ProgressSummary";
import SupportPaths from "./SupportPaths";
import ReferralCenter from "./ReferralCenter";
import SettingsPanel from "./SettingsPanel";

const NAV: { id: Tab; icon: string; key: keyof typeof STRINGS.ar }[] = [
  { id: "chat", icon: "🌿", key: "navChat" },
  { id: "checkin", icon: "🫶", key: "navCheckin" },
  { id: "journal", icon: "📖", key: "navJournal" },
  { id: "progress", icon: "🧭", key: "navProgress" },
  { id: "support", icon: "🤍", key: "navSupport" },
];

export default function AppShell() {
  const { language, tab, setTab, isGuest, toggleLanguage } = useApp();
  const t = STRINGS[language];

  return (
    <div className="flex h-dvh flex-col bg-gradient-to-b from-cream-50 to-cream-100">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-sand-200/70 bg-cream-50/80 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-sage-100">
            <span className="h-3.5 w-3.5 rounded-full bg-sage-300" />
          </span>
          <div className="leading-tight">
            <p className="font-arabic text-lg font-bold text-sage-400">{t.appName}</p>
            {isGuest && <p className="text-[11px] text-ink-faint">{t.guestBadge}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleLanguage}
            className="rounded-full border border-sand-300/70 bg-cream-50/80 px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-sand-100"
          >
            {t.toEnglish}
          </button>
          <button
            type="button"
            onClick={() => setTab("settings")}
            aria-label={t.settingsTitle}
            className={`grid h-9 w-9 place-items-center rounded-full text-lg transition-colors ${
              tab === "settings" ? "bg-sage-100" : "hover:bg-sand-100"
            }`}
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Active tab */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {tab === "chat" && <ChatInterface />}
          {tab === "checkin" && <DailyCheckIn />}
          {tab === "journal" && <JournalEditor />}
          {tab === "progress" && <ProgressSummary />}
          {tab === "support" && <SupportPaths />}
          {tab === "referrals" && <ReferralCenter />}
          {tab === "settings" && <SettingsPanel />}
        </div>
      </main>

      {/* Bottom nav */}
      <BottomNav active={tab} onSelect={setTab} labels={t} />
    </div>
  );
}

function BottomNav({
  active,
  onSelect,
  labels,
}: {
  active: Tab;
  onSelect: (t: Tab) => void;
  labels: (typeof STRINGS)["ar"];
}) {
  return (
    <nav className="border-t border-sand-200/70 bg-cream-50/95 px-2 py-1.5 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {NAV.map((item) => {
          const on = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] transition-colors ${
                on ? "text-sage-400" : "text-ink-faint hover:text-ink-soft"
              }`}
            >
              <span className={`text-lg transition-transform ${on ? "scale-110" : ""}`}>
                {item.icon}
              </span>
              <span className={on ? "font-semibold" : ""}>
                {labels[item.key] as string}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
