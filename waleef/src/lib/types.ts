// ─────────────────────────────────────────────────────────────
// Core domain types for Waleef / وليف
// ─────────────────────────────────────────────────────────────

export type Language = "ar" | "en";

/** How the user prefers Waleef to communicate (onboarding). */
export type ContactPreference = "text" | "voice_later" | "browse" | "let_waleef";

/** Emotional read of the user's message. */
export type Mood =
  | "neutral"
  | "sad"
  | "anxious"
  | "angry"
  | "overwhelmed"
  | "tired"
  | "numb"
  | "lonely"
  | "ashamed"
  | "hopeful"
  | "crisis";

/** How time-sensitive / serious the message is. */
export type Urgency = "low" | "medium" | "high" | "crisis";

/** The voice Waleef should answer in. */
export type Tone = "gentle" | "warm" | "grounding" | "brief" | "urgent";

/** Internal support categories. Not all are exposed in the UI. */
export type CategoryId =
  | "overthinking"
  | "anxiety"
  | "burnout"
  | "social_anxiety"
  | "addiction"
  | "identity"
  | "body_image"
  | "chronic_illness"
  | "elderly"
  | "family"
  | "financial"
  | "spiritual"
  | "trauma"
  | "crisis"
  | "general";

/** A gentle next step Waleef can take. */
export type SuggestedAction =
  | "listen"
  | "validate"
  | "ground"
  | "quick_relief"
  | "offer_options"
  | "suggest_referral"
  | "crisis_support";

/** Specialist categories for gentle professional referral. */
export type ReferralCategory =
  | "psychologist"
  | "psychiatrist"
  | "addiction_specialist"
  | "family_counselor"
  | "career_coach"
  | "crisis_support";

export interface UserState {
  mood: Mood;
  urgency: Urgency;
  category: CategoryId;
  tone: Tone;
  suggestedAction: SuggestedAction;
  /** True when the user signalled they are in a rush / want it short. */
  quickRelief: boolean;
  /** True when explicit self-harm / immediate danger language is detected. */
  isCrisis: boolean;
}

/** A tappable option Waleef offers (2–3 max in a reply). */
export interface ReplyOption {
  id: string;
  label: string;
}

export interface WaleefReply {
  /** The warm, short message body. */
  text: string;
  /** 0–3 gentle options to offer the user. */
  options?: ReplyOption[];
  /** Show the crisis-support modal/banner. */
  showCrisis?: boolean;
  /** Offer a gentle professional referral. */
  showReferral?: boolean;
  referralCategory?: ReferralCategory;
  /** This reply is part of Quick Relief Mode. */
  quickRelief?: boolean;
  /** The category Waleef read, for light analytics / theming. */
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

/** Metadata passed to the detection engine. */
export interface MessageMetadata {
  language: Language;
  /** Seconds since the user's previous message (if any). */
  secondsSinceLast?: number;
  contactPreference?: ContactPreference;
  /** Number of user turns so far in the session. */
  turnCount?: number;
}
