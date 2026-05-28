import type { IngestConversationArgs, MemoryItem } from "@/lib/types";
import * as fallback from "@/lib/memoryFallback";

function hasCreds(): boolean {
  return Boolean(process.env.XTRACE_API_KEY && process.env.XTRACE_ORG_ID);
}

function headers(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.XTRACE_API_KEY}`,
    "X-Org-Id": process.env.XTRACE_ORG_ID!,
  };
}

const BASE = () => process.env.XTRACE_BASE_URL ?? "https://api.mem.xtrace.ai";

export async function searchMemories(
  query: string,
  _filters?: Record<string, unknown>,
): Promise<MemoryItem[]> {
  if (!hasCreds()) return fallback.searchMemories(query);
  try {
    const res = await fetch(`${BASE()}/v1/memories/search`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ query, limit: 10 }),
    });
    if (!res.ok) throw new Error(`XTrace search ${res.status}`);
    const data = await res.json() as { memories?: MemoryItem[] };
    return data.memories ?? [];
  } catch {
    return fallback.searchMemories(query);
  }
}

export async function ingestConversation(args: IngestConversationArgs): Promise<void> {
  // Always write to fallback so in-process memory stays in sync.
  await fallback.ingestConversation(args);
  if (!hasCreds()) return;
  try {
    const res = await fetch(`${BASE()}/v1/memories/ingest`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        user_id: "team_adil_eshwar_doniv",
        conv_id: "synapse_demo",
        messages: [
          { role: "user", content: args.userMessage },
          { role: "assistant", content: args.assistantMessage },
        ],
        metadata: {
          project: "synapse",
          source_agent: args.sourceAgent,
          ...args.metadata,
        },
      }),
    });
    if (!res.ok) throw new Error(`XTrace ingest ${res.status}`);
  } catch {
    // Fallback already written above — silently continue.
  }
}

export async function getRecentMemories(): Promise<MemoryItem[]> {
  if (!hasCreds()) return fallback.getRecentMemories();
  try {
    const res = await fetch(`${BASE()}/v1/memories/recent`, {
      headers: headers(),
    });
    if (!res.ok) throw new Error(`XTrace recent ${res.status}`);
    const data = await res.json() as { memories?: MemoryItem[] };
    return data.memories ?? [];
  } catch {
    return fallback.getRecentMemories();
  }
}
