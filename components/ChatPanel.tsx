"use client";

import type { ChatMessage } from "@/lib/types";

// TODO(doniv):
//   - Local state: messages: ChatMessage[], input: string, loading: boolean.
//   - On send: POST to /api/chat/{agent}, append user + assistant messages, then onMessageSent?.().
//   - Show a loading indicator while waiting.
//   - Style with Tailwind: card with border, rounded, scrollable message list, input + send button.

export type ChatPanelProps = {
  agent: "openai" | "claude";
  title: string;
  placeholder?: string;
  onMessageSent?: () => void;
};

export default function ChatPanel(_props: ChatPanelProps) {
  const _example: ChatMessage = { role: "user", content: "" };
  void _example;

  return (
    <div className="flex h-full flex-col rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
      <p className="text-sm text-neutral-500">ChatPanel stub — implement me.</p>
    </div>
  );
}
