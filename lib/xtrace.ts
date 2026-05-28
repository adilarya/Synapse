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

type XTraceRecord = {
  id: string;
  memory?: string;
  content?: string;
  created_at?: string;
  metadata?: Record<string, unknown>;
};

function toMemoryItem(r: XTraceRecord): MemoryItem {
  return {
    id: r.id,
    content: r.memory ?? r.content ?? "",
    sourceAgent: (r.metadata?.source_agent as MemoryItem["sourceAgent"]) ?? "shared",
    createdAt: r.created_at ?? new Date().toISOString(),
    metadata: r.metadata,
  };
}

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
    const json = await res.json() as { data?: XTraceRecord[] };
    return (json.data ?? []).map(toMemoryItem);
  } catch {
    return fallback.searchMemories(query);
  }
}

export async function ingestConversation(args: IngestConversationArgs): Promise<void> {
  // Always write to fallback so in-process memory stays in sync.
  await fallback.ingestConversation(args);
  if (!hasCreds()) return;
  try {
    const res = await fetch(`${BASE()}/v1/memories`, {
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
  // Always include in-process fallback (immediately consistent within this session).
  const local = await fallback.getRecentMemories();

  if (!hasCreds()) return local;

  try {
    const res = await fetch(`${BASE()}/v1/memories`, {
      headers: headers(),
    });
    if (!res.ok) throw new Error(`XTrace list ${res.status}`);
    const json = await res.json() as { data?: XTraceRecord[] };
    const remote = (json.data ?? []).map(toMemoryItem);

    // Merge remote (older cross-session memories) with local (current session), dedupe by id.
    const seen = new Set<string>(local.map((m) => m.id));
    const merged = [...local, ...remote.filter((m) => !seen.has(m.id))];
    return merged;
  } catch {
    return local;
  }
}
