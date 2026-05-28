import OpenAI from "openai";
import type { MemoryItem } from "@/lib/types";

export type ConflictResult =
  | { hasConflict: false }
  | { hasConflict: true; reason: string; existingWork: string };

let _client: OpenAI | null = null;
function client(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  _client = new OpenAI({ apiKey });
  return _client;
}

const SYSTEM_PROMPT = `You are a conflict detection system for a collaborative AI-assisted coding team.

Multiple developers are using different AI agents (OpenAI, Gemini, etc.) to work on the same project. Each agent stores decisions and work-in-progress into a shared memory layer. When a developer sends a new prompt to their agent, you analyze whether it conflicts with or duplicates existing work from another agent's memory.

Your job:
- Detect if the new task DUPLICATES work already in progress by another agent
- Detect if the new task CONTRADICTS or OVERWRITES a decision already made by another agent
- Detect if the new task implements the SAME feature or component in a different way

Respond ONLY with valid JSON in this exact shape:
{
  "hasConflict": true | false,
  "reason": "short explanation of what conflicts and why (empty string if no conflict)",
  "existingWork": "quote the specific memory entry that conflicts (empty string if no conflict)"
}

Be strict. If in doubt and there is meaningful overlap, flag it. The goal is to prevent two developers from unknowingly building the same thing.`;

export async function detectConflict(
  newMessage: string,
  memories: MemoryItem[],
): Promise<ConflictResult> {
  if (memories.length === 0) return { hasConflict: false };

  const memorySummary = memories
    .map((m, i) => `${i + 1}. [${m.sourceAgent}] ${m.content}`)
    .join("\n");

  const userPrompt = `Existing shared memory from the team:\n${memorySummary}\n\nNew prompt from a developer:\n"${newMessage}"\n\nDoes this new prompt conflict with or duplicate any existing work in memory?`;

  try {
    const completion = await client().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as {
      hasConflict?: boolean;
      reason?: string;
      existingWork?: string;
    };

    if (parsed.hasConflict) {
      return {
        hasConflict: true,
        reason: parsed.reason ?? "Conflict detected with existing work.",
        existingWork: parsed.existingWork ?? "",
      };
    }
    return { hasConflict: false };
  } catch {
    // If conflict detection fails, don't block the agent — just let it through.
    return { hasConflict: false };
  }
}
