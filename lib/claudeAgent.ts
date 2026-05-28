import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage, MemoryItem } from "@/lib/types";

const MODEL = "claude-sonnet-4-6";

let _client: Anthropic | null = null;
function client(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  _client = new Anthropic({ apiKey });
  return _client;
}

function formatMemories(memories: MemoryItem[]): string {
  if (memories.length === 0) return "(no relevant memories yet)";
  return memories
    .map((m, i) => `${i + 1}. [${m.sourceAgent}] ${m.content}`)
    .join("\n");
}

function buildSystemPrompt(memories: MemoryItem[]): string {
  return [
    "You are Eshwar's Claude agent for the Synapse hackathon project.",
    "Synapse is a shared memory layer for agents across model providers.",
    "Use the following shared project memories when helpful:",
    formatMemories(memories),
    "",
    "Answer clearly and concisely. If a memory came from another agent (e.g. [openai]), mention that naturally.",
  ].join("\n");
}

export type ClaudeRunArgs = {
  message: string;
  history?: ChatMessage[];
  memories: MemoryItem[];
};

export async function run({ message, history = [], memories }: ClaudeRunArgs): Promise<string> {
  const response = await client().messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: buildSystemPrompt(memories),
    messages: [
      ...history
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content: message },
    ],
  });
  const block = response.content[0];
  return block.type === "text" ? block.text.trim() : "";
}
