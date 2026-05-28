import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ChatMessage, MemoryItem } from "@/lib/types";

const MODEL = "gemini-2.5-flash";

let _client: GoogleGenerativeAI | null = null;
function client(): GoogleGenerativeAI {
  if (_client) return _client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  _client = new GoogleGenerativeAI(apiKey);
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
  const model = client().getGenerativeModel({
    model: MODEL,
    systemInstruction: buildSystemPrompt(memories),
  });

  const chat = model.startChat({
    history: history
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
  });

  const result = await chat.sendMessage(message);
  return result.response.text().trim();
}
