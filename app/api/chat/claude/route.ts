import { NextResponse } from "next/server";
import type { MemoryItem } from "@/lib/types";

// TODO(eshwar):
//   1. Parse { message, history? } from req.json().
//   2. Call searchMemories(message) from @/lib/xtrace.
//   3. Build the system prompt with retrieved memories injected.
//   4. Call claudeAgent.run({ message, history, memories }).
//   5. await ingestConversation({ userMessage, assistantMessage, sourceAgent: "claude" }).
//   6. Return { assistantMessage, retrievedMemories, sourceAgent: "claude" }.

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}) as { message?: string });
  const message: string = body?.message ?? "";

  const retrievedMemories: MemoryItem[] = [];
  const assistantMessage = `[claude stub] received: ${message}`;

  return NextResponse.json({
    assistantMessage,
    retrievedMemories,
    sourceAgent: "claude" as const,
  });
}
