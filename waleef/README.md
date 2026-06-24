# وليف — Waleef (V1)

> هلا… أنا وليف
> **إنسان يسمعك… مو بس يرد عليك**
> _A human who hears you… not just replies to you._

**Waleef (وليف)** is a Saudi, human-centered AI companion for psychological,
emotional, social, and life support. It is **not** a medical app, **not** a
therapy replacement, and **not** a chatbot — it's a warm digital companion that
listens, understands, reflects, and gently guides toward better emotional,
mental, social, and life balance.

This is a **working V1 prototype** for real user testing, built with **Next.js
14 (App Router) + TypeScript + Tailwind CSS**, a mock AI brain that's easy to
swap for a real model, and **optional Supabase** persistence.

---

## ✨ Identity

- **Arabic-first** (default RTL), English supported with one-tap toggle.
- Warm · human · safe · calm · Saudi · emotionally intelligent.
- Not clinical, not robotic, not judgmental, no preaching, no pressure.
- **Safety-first:** Waleef never raises suicide/self-harm on its own. The crisis
  flow only triggers when the **user** explicitly says so.

---

## 🗺️ Pages

| Page | Component | Notes |
|---|---|---|
| Welcome | `WelcomeScreen` | "هلا… أنا وليف", `ابدأ معي` · `أدخل كزائر` · English |
| Onboarding | `OnboardingFlow` | "كيف تحب أكون معك؟" → contact preference → language. No medical questions, Guest Mode. |
| Chat | `ChatInterface` | Open input, quick chips, warm replies, silent/crying/quick-relief, crisis + referral. |
| Daily Check-in | `DailyCheckIn` | "كيف قلبك اليوم؟" → saved to store. |
| Journal | `JournalEditor` | Free writing + "خل وليف يساعدني أفهم اللي كتبته" (mock analysis). |
| Progress | `ProgressSummary` | "رحلتك مع وليف" — warm, non-clinical stats. |
| Support Paths | `SupportPaths` | Gentle grouped "spaces" that seed a chat. |
| Referral Center | `ReferralCenter` / `ReferralCard` | Specialists, gentle wording. |
| Settings | `SettingsPanel` | Language, persona, clear local data, about. |
| Crisis | `CrisisSupportModal` | Warm, direct, calm. Saudi resources. |

Navigation is a calm bottom-nav (`AppShell`) across Chat · Today · Journal ·
Journey · Spaces, with Settings in the top bar.

Shared UI components: `MessageBubble`, `QuickChips`, `SilentModePrompt`,
`SupportPathCard`, `ReferralModal`, `LanguageToggle`.

---

## 🧠 Brain engine — `src/lib/waleefEngine.ts`

```ts
detectUserState(input: string): UserState
// → { emotion, category, urgency: "green"|"yellow"|"orange"|"red",
//     mode: "listening"|"reflection"|"quick_relief"|"guided"|"referral"|"crisis",
//     confidence }

generateWaleefReply(state, input, metadata): WaleefReply
replyToOption(optionId, lang): WaleefReply
analyzeJournal(text, lang): JournalInsight
```

**Reply rules:** validation first · one gentle question max · 2–3 options · no
diagnosis · no lectures · no shame. Crisis takes absolute priority; Quick Relief
when the user is rushed.

**Categories** (`src/lib/categories.ts`): emotions · overthinking · anxiety ·
burnout · loneliness · self_confidence · relationships · family · work_money ·
addictions · body_image · identity · spiritual_values · health · crisis ·
unknown. Each ships **AR + EN example responses** in `src/lib/responses.ts`.

**Modes:**
- **Silent** — empty or emoji-only (💔 😭) → "وصلتني… أنا هنا." + soft options.
- **Crying** — "أبكي" / 😭 → "خذ وقتك… مو لازم تقول شيء الآن. أنا هنا." (no questions).
- **Quick Relief** — "بسرعة / اختصر / أبي حل سريع / ما عندي وقت".
- **Crisis** — explicit self-harm intent only → `CrisisSupportModal` + resources.

> ⚠️ Crisis phone numbers in `src/lib/crisis.ts` are placeholders/commonly-cited
> Saudi numbers. **Verify and localize before any real launch.**

---

## 🗄️ Data — Supabase (optional) + local fallback

`src/lib/store.ts` is the data layer. It **always works on localStorage** so the
prototype runs with zero setup. When Supabase env vars are present, writes are
also mirrored to Supabase.

- Schema: `supabase/schema.sql` (tables: `users`, `chat_messages`,
  `daily_checkins`, `journal_entries`, `referrals`).
- Client: `src/lib/supabaseClient.ts` (lazy, guarded by `isSupabaseConfigured()`).
- Env: copy `.env.example` → `.env.local`.

---

## 🚀 Getting started

Requires **Node 18.17+** (Node 20/22 recommended).

```bash
cd waleef
npm install

npm run dev          # http://localhost:3000
npm run build        # production build
npm run typecheck    # tsc --noEmit
```

### Enable Supabase (optional)
1. Create a Supabase project, run `supabase/schema.sql` in the SQL editor.
2. Copy `.env.example` → `.env.local` and fill:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Restart `npm run dev`.

### Try the brain directly
```bash
curl -s localhost:3000/api/chat \
  -H 'content-type: application/json' \
  -d '{"message":"أفكر كثير","metadata":{"language":"ar"}}'
```

---

## 🔌 Connecting a real model (OpenAI / Claude)

The mock engine is isolated. To go live:
1. Replace the internals of `detectUserState` / `generateWaleefReply` in
   `src/lib/waleefEngine.ts`.
2. Keep `crisis.ts` as a **deterministic guardrail** that runs **before** the
   model — never let the model bypass crisis handling.
3. `src/app/api/chat/route.ts` is the single integration seam.

System-prompt the model with Waleef's rules: Saudi Arabic by default, validation
first, one gentle question, 2–3 options, no diagnosis, never raise self-harm
unprompted.

---

## 🎨 Design
Mobile-first, RTL Arabic, calm palette (soft green / sand beige / white / olive /
muted gold), rounded cards, generous spacing, no hospital feeling, Tajawal
typography, `prefers-reduced-motion` honored.

---

## 📝 Disclaimer
Waleef is **not** a medical device and does **not** diagnose or treat. It offers
emotional companionship and can gently point to professional help. Add real auth,
tighten Supabase RLS, and verify crisis resources before production.

---

## 🚢 Deployment
See `DEPLOY.md` — Vercel (recommended) via dashboard or GitHub Actions.
