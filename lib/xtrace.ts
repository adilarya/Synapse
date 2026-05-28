import type { IngestConversationArgs, MemoryItem } from "@/lib/types";
import * as fallback from "@/lib/memoryFallback";

// TODO(eshwar):
//   - When XTRACE_API_KEY and XTRACE_ORG_ID are set, hit the real API:
//       POST {XTRACE_BASE_URL}/v1/memories/search   (TODO: confirm path)
//       POST {XTRACE_BASE_URL}/v1/memories/ingest   (TODO: confirm path)
//       GET  {XTRACE_BASE_URL}/v1/memories/recent   (TODO: confirm path)
//   - Send `Authorization: Bearer ${XTRACE_API_KEY}` and `X-Org-Id: ${XTRACE_ORG_ID}`.
//   - On any error or missing creds, transparently fall back to memoryFallback so the demo still works.
//   - Shared metadata to send with ingest:
//       { user_id: "team_adil_eshwar_doniv", conv_id: "synapse_demo",
//         metadata: { project: "synapse", source_agent: <"openai"|"claude"> } }

function hasCreds(): boolean {
  return Boolean(process.env.XTRACE_API_KEY && process.env.XTRACE_ORG_ID);
}

export async function searchMemories(
  query: string,
  _filters?: Record<string, unknown>,
): Promise<MemoryItem[]> {
  if (!hasCreds()) return fallback.searchMemories(query);
  // TODO: replace with real XTrace search; fall back on error.
  return fallback.searchMemories(query);
}

export async function ingestConversation(args: IngestConversationArgs): Promise<void> {
  if (!hasCreds()) return fallback.ingestConversation(args);
  // TODO: replace with real XTrace ingest; fall back on error.
  return fallback.ingestConversation(args);
}

export async function getRecentMemories(): Promise<MemoryItem[]> {
  if (!hasCreds()) return fallback.getRecentMemories();
  // TODO: replace with real XTrace recent; fall back on error.
  return fallback.getRecentMemories();
}
