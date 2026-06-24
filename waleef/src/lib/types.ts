// ─────────────────────────────────────────────────────────────
// Core domain types for Waleef / وليف — V1
// ─────────────────────────────────────────────────────────────

export type Language = "ar" | "en";

/** How the user wants Waleef to be with them (onboarding persona). */
export type Persona = "listen" | "organize" | "calm" | "silent" | "let_waleef";

/** Preferred communication channel (onboarding). */
export type ContactPreference = "text" | "voice_later" | "browse";

/** Traffic-light urgency used by the brain engine. */
export type Urgency = "green" | "yellow" | "orange" | "red";

/** Conversational mode the engine selects. */
export type Mode =
  | "listening"
  | "reflection"
  | "quick_relief"
  | "guided"
  | "referral"
  | "crisis";

/** Engine support categories. */
export type CategoryId =
  | "emotions"
  | "overthinking"
  | "anxiety"
  | "burnout"
  | "loneliness"
  | "self_confidence"
  | "relationships"
  | "family"
  | "work_money"
  | "addictions"
  | "body_image"
  | "identity"
  | "spiritual_values"
  | "health"
  | "crisis"
  | "unknown";

/** Specialist categories for gentle professional referral. */
export type ReferralCategory =
  | "psychologist"
  | "psychiatrist"
  | "family_counselor"
  | "addiction_specialist"
  | "career_coach"
  | "crisis_support";

/**
 * The structured read of a user message produced by detectUserState.
 * Shape matches the V1 spec.
 */
export interface UserState {
  emotion: string;
  category: CategoryId;
  urgency: Urgency;
  mode: Mode;
  confidence: number; // 0..1
}

/** A tappable option Waleef offers (2–3 max in a reply). */
export interface ReplyOption {
  id: string;
  label: string;
}

export interface WaleefReply {
  text: string;
  options?: ReplyOption[];
  showCrisis?: boolean;
  showReferral?: boolean;
  referralCategory?: ReferralCategory;
  mode?: Mode;
  category?: CategoryId;
}

export type ChatRole = "user" | "waleef";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  options?: ReplyOption[];
  showCrisis?: boolean;
  showReferral?: boolean;
  referralCategory?: ReferralCategory;
  createdAt: number;
}

export interface MessageMetadata {
  language: Language;
  secondsSinceLast?: number;
  contactPreference?: ContactPreference;
  persona?: Persona;
  turnCount?: number;
}

// ─────────────────────────────────────────────────────────────
// Persistence models (Supabase tables / local fallback)
// ─────────────────────────────────────────────────────────────

export type CheckinMood =
  | "calm"
  | "tired"
  | "anxious"
  | "sad"
  | "scattered"
  | "grateful"
  | "unknown";

export interface DailyCheckin {
  id: string;
  userId: string;
  mood: CheckinMood;
  note?: string;
  createdAt: number;
}

export interface JournalEntry {
  id: string;
  userId: string;
  content: string;
  detectedEmotion?: string;
  createdAt: number;
}

export interface ReferralRecord {
  id: string;
  userId: string;
  type: ReferralCategory;
  status: "suggested" | "viewed" | "contacted";
  createdAt: number;
}

/** Light, warm analysis returned for a journal entry. */
export interface JournalInsight {
  emotion: string;
  emotionLabel: string;
  need: string;
  reflection: string;
}
