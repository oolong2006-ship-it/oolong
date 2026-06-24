"use client";

import type {
  DailyCheckin,
  JournalEntry,
  ReferralRecord,
  CheckinMood,
  ReferralCategory,
} from "./types";
import { getSupabase, isSupabaseConfigured } from "./supabaseClient";

// ─────────────────────────────────────────────────────────────
// Data layer.
//
// Primary, always-working path: localStorage (keyed by a guest id).
// When Supabase is configured, writes are mirrored to Supabase too.
// This keeps the prototype runnable with zero setup while being ready
// for real persistence/auth.
// ─────────────────────────────────────────────────────────────

const GUEST_KEY = "waleef.guestId";
const CHECKINS_KEY = "waleef.checkins";
const JOURNAL_KEY = "waleef.journal";
const REFERRALS_KEY = "waleef.referrals";

function uid(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getUserId(): string {
  if (typeof window === "undefined") return "guest";
  let id = window.localStorage.getItem(GUEST_KEY);
  if (!id) {
    id = `guest_${uid()}`;
    window.localStorage.setItem(GUEST_KEY, id);
  }
  return id;
}

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "[]") as T[];
  } catch {
    return [];
  }
}

function write<T>(key: string, rows: T[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(rows));
}

// Mirror a write to Supabase when configured. Best-effort, non-blocking.
async function mirror(table: string, row: Record<string, unknown>): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const sb = await getSupabase();
    await sb?.from(table).insert(row);
  } catch {
    /* local storage already holds the source of truth in the prototype */
  }
}

// ── Daily check-ins ──────────────────────────────────────────
export async function saveCheckin(mood: CheckinMood, note?: string): Promise<DailyCheckin> {
  const entry: DailyCheckin = {
    id: uid(),
    userId: getUserId(),
    mood,
    note,
    createdAt: Date.now(),
  };
  const rows = read<DailyCheckin>(CHECKINS_KEY);
  rows.push(entry);
  write(CHECKINS_KEY, rows);
  void mirror("daily_checkins", {
    user_id: entry.userId,
    mood: entry.mood,
    note: entry.note ?? null,
  });
  return entry;
}

export function getCheckins(): DailyCheckin[] {
  return read<DailyCheckin>(CHECKINS_KEY).sort((a, b) => b.createdAt - a.createdAt);
}

// ── Journal ──────────────────────────────────────────────────
export async function saveJournal(content: string, detectedEmotion?: string): Promise<JournalEntry> {
  const entry: JournalEntry = {
    id: uid(),
    userId: getUserId(),
    content,
    detectedEmotion,
    createdAt: Date.now(),
  };
  const rows = read<JournalEntry>(JOURNAL_KEY);
  rows.push(entry);
  write(JOURNAL_KEY, rows);
  void mirror("journal_entries", {
    user_id: entry.userId,
    content: entry.content,
    detected_emotion: entry.detectedEmotion ?? null,
  });
  return entry;
}

export function getJournals(): JournalEntry[] {
  return read<JournalEntry>(JOURNAL_KEY).sort((a, b) => b.createdAt - a.createdAt);
}

// ── Referrals ────────────────────────────────────────────────
export async function saveReferral(type: ReferralCategory): Promise<ReferralRecord> {
  const entry: ReferralRecord = {
    id: uid(),
    userId: getUserId(),
    type,
    status: "suggested",
    createdAt: Date.now(),
  };
  const rows = read<ReferralRecord>(REFERRALS_KEY);
  rows.push(entry);
  write(REFERRALS_KEY, rows);
  void mirror("referrals", { user_id: entry.userId, type: entry.type, status: entry.status });
  return entry;
}

// ── Progress summary ─────────────────────────────────────────
export interface ProgressSummaryData {
  checkinCount: number;
  journalCount: number;
  mostCommonMood: CheckinMood | null;
  trend: CheckinMood[]; // most recent first, up to 7
}

export function getProgress(): ProgressSummaryData {
  const checkins = getCheckins();
  const journals = getJournals();
  const counts = new Map<CheckinMood, number>();
  for (const c of checkins) counts.set(c.mood, (counts.get(c.mood) ?? 0) + 1);
  let mostCommonMood: CheckinMood | null = null;
  let max = 0;
  for (const [mood, n] of counts) if (n > max) ((max = n), (mostCommonMood = mood));
  return {
    checkinCount: checkins.length,
    journalCount: journals.length,
    mostCommonMood,
    trend: checkins.slice(0, 7).map((c) => c.mood),
  };
}
