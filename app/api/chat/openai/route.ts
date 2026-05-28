import { NextResponse } from "next/server";
import type { MemoryItem } from "@/lib/types";

// TODO(adil):
//   1. Parse { message, history? } from req.json().
//   2. Call searchMemories(message) from @/lib/xtrace.
//   3. Build the system prompt with retrieved memories injected.
//   4. Call openaiAgent.run({ message, history, memories }).
//   5. await ingestConversation({ userMessage, assistantMessage, sourceAgent: "openai" }).
//   6. Return { assistantMessage, retrievedMemories, sourceAgent: "openai" }.

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}) as { message?: string });
  const message: string = body?.message ?? "";

  const retrievedMemories: MemoryItem[] = [];
  const assistantMessage = `[openai stub] received: ${message}`;

  return NextResponse.json({
    assistantMessage,
    retrievedMemories,
    sourceAgent: "openai" as const,
  });
}
