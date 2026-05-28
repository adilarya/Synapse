import type { ChatMessage, MemoryItem } from "@/lib/types";

// TODO(eshwar):
//   - Construct an Anthropic client with process.env.ANTHROPIC_API_KEY.
//   - Build a system prompt that injects `memories` (see README — "Eshwar's Claude agent...").
//   - Call messages.create({ model: "claude-sonnet-4-6", system, messages: [...] }).
//   - Return the assistant text.

export type ClaudeRunArgs = {
  message: string;
  history?: ChatMessage[];
  memories: MemoryItem[];
};

export async function run(_args: ClaudeRunArgs): Promise<string> {
  throw new Error("claudeAgent.run not implemented — see TODO in lib/claudeAgent.ts");
}
