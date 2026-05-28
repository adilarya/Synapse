import type { ChatMessage, MemoryItem } from "@/lib/types";

// TODO(adil):
//   - Construct an OpenAI client with process.env.OPENAI_API_KEY.
//   - Build a system prompt that injects `memories` (see README — "Adil's OpenAI agent...").
//   - Call chat.completions.create({ model: "gpt-4o-mini", messages: [...] }).
//   - Return the assistant text.

export type OpenAIRunArgs = {
  message: string;
  history?: ChatMessage[];
  memories: MemoryItem[];
};

export async function run(_args: OpenAIRunArgs): Promise<string> {
  throw new Error("openaiAgent.run not implemented — see TODO in lib/openaiAgent.ts");
}
