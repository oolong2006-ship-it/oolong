# وليف — Waleef

> إنسان يسمعك… مو بس يرد عليك.
> _A human who hears you… not just replies to you._

**Waleef (وليف)** is a Saudi, human-centered AI companion for psychological,
emotional, social, and life support. It is designed to feel like a warm human
companion — not a medical chatbot. Waleef listens, understands, adapts to the
user's language and tone, and gently guides. It **does not diagnose** and can
softly suggest professional help when needed.

This repository contains a **production-quality MVP** built with **Next.js 14
(App Router) + TypeScript + Tailwind CSS**, with a mock AI engine that is easy
to swap for a real model.

---

## ✨ Core identity

- **Arabic-first**, with full English support and a one-tap language toggle.
- **RTL** layout for Arabic, **LTR** for English.
- Warm, calm, respectful, emotionally intelligent — **not clinical, not
  judgmental, not preachy**.
- The user can **write, stay silent, choose a feeling, or ask anything**.
- Waleef avoids overwhelming the user (validation first, **one gentle question
  max**, 2–3 simple options).
- **Safety-first:** Waleef never raises the topic of suicide or self-harm on its
  own. The crisis flow only appears when the **user** explicitly mentions
  immediate danger.

---

## 🗺️ Screens & flows

| Screen | What it does |
|---|---|
| **Welcome** (`WelcomeScreen`) | App name وليف, tagline, language toggle, `ابدأ معي` CTA. |
| **Onboarding** (`OnboardingFlow`) | Gentle "كيف تفضّل أتواصل معك؟" with 4 options. No forced registration — **Guest Mode** by default. |
| **Chat** (`ChatScreen`) | Open text box (`اكتب أي شيء… حتى لو كلمة.`), quick chips, support paths, warm short replies. |
| **Silent Mode** (`SilentModePrompt`) | After idle, shows `خذ وقتك… وجودك هنا يكفي كبداية.` with low-pressure options. |
| **Quick Relief Mode** | Triggered by phrases like `بسرعة`, `اختصر`, `ما عندي وقت`, `حل سريع`. |
| **Professional Referral** (`ReferralModal`) | Gentle suggestion to reach a specialist, never pushed. |
| **Crisis Support** (`CrisisSupportModal`) | Warm, direct, calm flow with Saudi emergency/support numbers. |

---

## 🧠 Response engine — `src/lib/waleefEngine.ts`

Two public functions, exactly per spec:

```ts
detectUserState(message, metadata) → {
  mood, urgency, category, tone, suggestedAction, quickRelief, isCrisis
}

generateWaleefReply(state, message, metadata) → {
  text, options?, showCrisis?, showReferral?, referralCategory?, quickRelief?
}
```

**Reply rules enforced by the engine:**

- ❌ No medical diagnosis, no long lectures.
- ✅ Start with **validation**.
- ✅ Ask **one gentle question max**.
- ✅ Offer **2–3 simple options**.
- ⚡ If the user is rushed → **Quick Relief Mode**.
- 🆘 If explicit self-harm intent is detected → **crisis flow** (takes priority
  over everything else).

A helper `replyToOption(optionId, lang)` resolves tapped chips/options into the
next warm, short message.

### Internal support categories

Many categories are tracked **internally** for accurate listening, but only a
few are surfaced to the user (we never route people through a clinical menu).
Defined in `src/lib/categories.ts`:

Overthinking · Anxiety · Burnout · Social anxiety · Addiction behaviors
(tobacco, alcohol, drugs, phone/social media, pornography) · Identity &
influencer pressure · Body image · Chronic illness & cancer · Elderly &
retirement · Family conflict · Financial/investor stress · Spiritual/value
conflict · Trauma, bullying & abuse · Crisis.

Each category ships with **example Arabic + English responses** in
`src/lib/responses.ts`.

### Safety handling

`src/lib/crisis.ts` holds the conservative crisis detector plus warm,
non-judgmental copy and **Saudi-first** resources (911 / 999, mental-health and
family helplines). The crisis flow:

- Responds warmly and directly, stays calm.
- Encourages immediate emergency contact.
- Asks the user to move away from means of harm.
- Encourages contacting a trusted person now.
- Never shames, argues, or moralizes.

> ⚠️ The phone numbers included are placeholders/commonly-cited Saudi numbers for
> the MVP. **Verify and localize all crisis resources before any real launch.**

---

## 🎨 UI style

- Calm palette: off-white, soft green (sage), sand, muted gold — configured in
  `tailwind.config.ts`.
- Mobile-first, rounded cards, smooth `fade-up` / `breathe` transitions.
- Minimal icons, clear Arabic typography (Tajawal), no clinical look.
- Honors `prefers-reduced-motion`.

---

## 🧩 Project structure

```
waleef/
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts     # POST /api/chat — wraps the engine
│   │   ├── globals.css           # Tailwind + base styles
│   │   ├── layout.tsx            # <html dir="rtl"> + AppProvider
│   │   └── page.tsx              # renders <WaleefApp/>
│   ├── components/
│   │   ├── WaleefApp.tsx         # screen router
│   │   ├── WelcomeScreen.tsx
│   │   ├── OnboardingFlow.tsx
│   │   ├── ChatScreen.tsx
│   │   ├── QuickChips.tsx
│   │   ├── SilentModePrompt.tsx
│   │   ├── SupportPathCard.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── ReferralModal.tsx
│   │   ├── CrisisSupportModal.tsx
│   │   └── LanguageToggle.tsx
│   ├── context/
│   │   └── AppContext.tsx        # language (RTL/LTR), screen, guest state
│   └── lib/
│       ├── waleefEngine.ts       # detectUserState + generateWaleefReply
│       ├── responses.ts          # example AR/EN responses per category
│       ├── categories.ts         # internal categories + keywords
│       ├── crisis.ts             # crisis detection + resources + copy
│       ├── i18n.ts               # UI strings (ar/en), referrals
│       └── types.ts              # shared domain types
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
└── package.json
```

---

## 🚀 Getting started

Requirements: **Node 18.17+** (Node 20/22 recommended).

```bash
cd waleef
npm install

# Development
npm run dev          # http://localhost:3000

# Production
npm run build
npm run start

# Quality
npm run typecheck    # tsc --noEmit
npm run lint         # next lint
```

### Try the API directly

```bash
curl -s localhost:3000/api/chat \
  -H 'content-type: application/json' \
  -d '{"message":"أفكر كثير وعقلي ما يهدأ","metadata":{"language":"ar"}}'
```

---

## 🔌 Swapping in a real model

The mock engine is intentionally isolated. To go live:

1. Replace the body of `detectUserState` / `generateWaleefReply` in
   `src/lib/waleefEngine.ts` with calls to your model (e.g. the Claude API).
2. Keep the **safety layer** (`crisis.ts`) as a deterministic guardrail that
   runs **before** the model — never let the model bypass crisis handling.
3. The API route `src/app/api/chat/route.ts` is the single integration seam.

Keep the tone rules in the system prompt: Saudi Arabic by default, validation
first, one gentle question, 2–3 options, no diagnosis, never raise self-harm
unprompted.

---

## 📝 Notes & disclaimers

- Waleef is **not** a medical device and does **not** provide diagnosis or
  treatment. It is emotional/companionship support that can point to
  professional help.
- This is an MVP: state is in-memory/local. Add real persistence, auth, and
  verified crisis resources before production.
