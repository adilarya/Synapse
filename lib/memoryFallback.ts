import type { IngestConversationArgs, MemoryItem } from "@/lib/types";

// In-memory shared store. Process-local — fine for a single-server demo, not for prod.
// Survives across requests within one `next dev` / `next start` process.

const store: MemoryItem[] = [];

function makeId(): string {
  return `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function searchMemories(query: string): Promise<MemoryItem[]> {
  // TODO(eshwar): swap naive substring match for something better if time permits.
  const q = query.trim().toLowerCase();
  if (!q) return store.slice(-10).reverse();
  return store
    .filter((m) => m.content.toLowerCase().includes(q))
    .slice(-10)
    .reverse();
}

export async function ingestConversation(args: IngestConversationArgs): Promise<void> {
  const createdAt = new Date().toISOString();
  store.push({
    id: makeId(),
    content: `User: ${args.userMessage}`,
    sourceAgent: args.sourceAgent,
    createdAt,
    metadata: { ...args.metadata, turn: "user" },
  });
  store.push({
    id: makeId(),
    content: `Assistant (${args.sourceAgent}): ${args.assistantMessage}`,
    sourceAgent: args.sourceAgent,
    createdAt,
    metadata: { ...args.metadata, turn: "assistant" },
  });
}

export async function getRecentMemories(): Promise<MemoryItem[]> {
  return store.slice(-20).reverse();
}
