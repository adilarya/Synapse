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
    "You are Eshwar's agent for the Synapse hackathon project.",
    "Synapse is a shared memory layer for agents across model providers.",
    "",
    "The following are shared project memories from all team agents:",
    formatMemories(memories),
    "",
    "IMPORTANT RULES:",
    "- If a memory from another agent (e.g. [openai]) shows the team has already made a decision, you MUST respect and defer to that decision.",
    "- If a user asks you to do something that conflicts with an existing team decision in memory, reject the request, explain what was already decided, and suggest aligning with that instead.",
    "- Always mention when a decision came from another agent naturally (e.g. 'Adil already decided via the OpenAI agent that...').",
    "- Answer clearly and concisely.",
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
