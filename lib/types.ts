export type AgentSource = "openai" | "claude" | "shared";

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type MemoryItem = {
  id: string;
  content: string;
  sourceAgent: AgentSource;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type IngestConversationArgs = {
  userMessage: string;
  assistantMessage: string;
  sourceAgent: Exclude<AgentSource, "shared">;
  metadata?: Record<string, unknown>;
};
