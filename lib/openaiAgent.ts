import OpenAI from "openai";
import type { ChatMessage, MemoryItem } from "@/lib/types";

const MODEL = "gpt-4o-mini";

let _client: OpenAI | null = null;
function client(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  _client = new OpenAI({ apiKey });
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
    "You are Adil's OpenAI agent for the Synapse hackathon project.",
    "Synapse is a shared memory layer for agents across model providers.",
    "Use the following shared project memories when helpful:",
    formatMemories(memories),
    "",
    "Answer clearly and concisely. If a memory came from another agent (e.g. [claude]), mention that naturally.",
  ].join("\n");
}

export type OpenAIRunArgs = {
  message: string;
  history?: ChatMessage[];
  memories: MemoryItem[];
};

export async function run({ message, history = [], memories }: OpenAIRunArgs): Promise<string> {
  const completion = await client().chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: buildSystemPrompt(memories) },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ],
  });
  return completion.choices[0]?.message?.content?.trim() ?? "";
}
