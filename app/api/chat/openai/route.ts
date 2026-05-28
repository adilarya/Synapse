import { NextResponse } from "next/server";
import * as openaiAgent from "@/lib/openaiAgent";
import { ingestConversation, searchMemories } from "@/lib/xtrace";
import type { ChatMessage, MemoryItem } from "@/lib/types";

export const runtime = "nodejs";

type RequestBody = {
  message?: string;
  history?: ChatMessage[];
};

export async function POST(req: Request) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }
  const history = Array.isArray(body.history) ? body.history : [];

  let retrievedMemories: MemoryItem[] = [];
  try {
    retrievedMemories = await searchMemories(message);
  } catch {
    retrievedMemories = [];
  }

  let assistantMessage: string;
  try {
    assistantMessage = await openaiAgent.run({ message, history, memories: retrievedMemories });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: `openai call failed: ${detail}` }, { status: 500 });
  }

  try {
    await ingestConversation({
      userMessage: message,
      assistantMessage,
      sourceAgent: "openai",
      metadata: { project: "synapse" },
    });
  } catch {
    // Don't fail the response if ingest fails — memory dashboard will just be stale.
  }

  return NextResponse.json({
    assistantMessage,
    retrievedMemories,
    sourceAgent: "openai" as const,
  });
}
