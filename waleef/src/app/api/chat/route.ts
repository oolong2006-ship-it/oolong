import { NextResponse } from "next/server";
import {
  detectUserState,
  generateWaleefReply,
  replyToOption,
  isSilentInput,
} from "@/lib/waleefEngine";
import { SILENT_MODE } from "@/lib/responses";
import type { MessageMetadata, WaleefReply } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// POST /api/chat
//   Body: { message?, optionId?, metadata }
//   Returns: { reply, state? }
//
// Single integration seam: swap the engine internals here + in
// lib/waleefEngine.ts to connect a real model (OpenAI/Claude).
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
    persona: body.metadata?.persona,
    turnCount: body.metadata?.turnCount ?? 0,
  };

  // Tapped option (chips / inline options / silent options).
  if (body.optionId && !body.message) {
    const reply = replyToOption(body.optionId, metadata.language);
    return NextResponse.json({ reply });
  }

  const message = body.message ?? "";

  // Silent mode: empty or emoji-only input.
  if (isSilentInput(message)) {
    const sm = SILENT_MODE[metadata.language];
    const reply: WaleefReply = { text: sm.text, options: sm.options, mode: "listening" };
    return NextResponse.json({ reply });
  }

  const state = detectUserState(message);
  const reply = generateWaleefReply(state, message, metadata);

  // Small human-feeling pause.
  await new Promise((r) => setTimeout(r, 250));

  return NextResponse.json({ reply, state });
}
