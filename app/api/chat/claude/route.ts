import { NextResponse } from "next/server";
import * as claudeAgent from "@/lib/claudeAgent";
import { ingestConversation, searchMemories, getRecentMemories } from "@/lib/xtrace";
import { detectConflict } from "@/lib/conflictDetector";
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
    const [searched, recent] = await Promise.all([
      searchMemories(message),
      getRecentMemories(),
    ]);
    // Merge search results + recent memories, dedupe by id, recent first
    const seen = new Set<string>();
    retrievedMemories = [...recent, ...searched].filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  } catch {
    retrievedMemories = [];
  }

  // Run conflict detection before calling the agent
  const conflict = await detectConflict(message, retrievedMemories);
  if (conflict.hasConflict) {
    const assistantMessage = `⚠️ Conflict detected with existing team work.\n\n${conflict.reason}\n\nExisting work: "${conflict.existingWork}"\n\nPlease align with what's already been decided before proceeding.`;
    await ingestConversation({
      userMessage: message,
      assistantMessage,
      sourceAgent: "claude",
      metadata: { project: "synapse", conflict: true },
    });
    return NextResponse.json({ assistantMessage, retrievedMemories, sourceAgent: "claude" as const });
  }

  let assistantMessage: string;
  try {
    assistantMessage = await claudeAgent.run({ message, history, memories: retrievedMemories });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: `claude call failed: ${detail}` }, { status: 500 });
  }

  try {
    await ingestConversation({
      userMessage: message,
      assistantMessage,
      sourceAgent: "claude",
      metadata: { project: "synapse" },
    });
  } catch {
    // Don't fail the response if ingest fails — memory dashboard will just be stale.
  }

  return NextResponse.json({
    assistantMessage,
    retrievedMemories,
    sourceAgent: "claude" as const,
  });
}
