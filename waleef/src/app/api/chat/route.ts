import { NextResponse } from "next/server";
import {
  detectUserState,
  generateWaleefReply,
  replyToOption,
} from "@/lib/waleefEngine";
import type { MessageMetadata, WaleefReply } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// POST /api/chat
//
// Body:
//   { message?: string, optionId?: string, metadata: MessageMetadata }
//
// Returns: { reply: WaleefReply, state? }
//
// This wraps the mock Waleef engine. Swapping in a real model later
// means changing only this route + lib/waleefEngine.ts.
// ─────────────────────────────────────────────────────────────

interface ChatRequest {
  message?: string;
  optionId?: string;
  metadata?: Partial<MessageMetadata>;
}

export async function POST(request: Request) {
  let body: ChatRequest;
  try {
    body = (await request.json()) as ChatRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const metadata: MessageMetadata = {
    language: body.metadata?.language === "en" ? "en" : "ar",
    secondsSinceLast: body.metadata?.secondsSinceLast,
    contactPreference: body.metadata?.contactPreference,
    turnCount: body.metadata?.turnCount ?? 0,
  };

  // Tapped option path (chips / inline options).
  if (body.optionId && !body.message) {
    const reply = replyToOption(body.optionId, metadata.language);
    return NextResponse.json({ reply });
  }

  const message = (body.message ?? "").trim();
  if (!message) {
    const reply: WaleefReply = {
      text:
        metadata.language === "ar"
          ? "أنا هنا… اكتب أي شيء، حتى لو كلمة."
          : "I'm here… write anything, even one word.",
    };
    return NextResponse.json({ reply });
  }

  const state = detectUserState(message, metadata);
  const reply = generateWaleefReply(state, message, metadata);

  // Simulate a brief, human-feeling pause (kept small for UX).
  await new Promise((r) => setTimeout(r, 250));

  return NextResponse.json({ reply, state });
}
