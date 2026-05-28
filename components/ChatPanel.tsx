"use client";

import { useState } from "react";
import type { ChatMessage } from "@/lib/types";

export type ChatPanelProps = {
  agent: "openai" | "claude";
  title: string;
  placeholder?: string;
  onMessageSent?: () => void;
};

export default function ChatPanel({ agent, title, placeholder, onMessageSent }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    const messageToSend = input;
    setInput("");

    try {
      const response = await fetch(`/api/chat/${agent}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend }),
      });

      const data = await response.json();
      const assistantMessage: ChatMessage = { role: "assistant", content: data.assistantMessage };
      setMessages((prev) => [...prev, assistantMessage]);
      onMessageSent?.();
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = { role: "assistant", content: "Error: Failed to get response." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
      <h2 className="text-lg font-semibold text-neutral-100">{title}</h2>
      
      <div className="mt-4 flex-1 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-neutral-500">{placeholder || "Start a conversation..."}</p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`rounded-lg p-3 ${
                msg.role === "user"
                  ? "bg-neutral-800 text-neutral-100"
                  : "bg-neutral-800/50 text-neutral-200"
              }`}
            >
              <span className="text-xs font-medium text-neutral-400 uppercase">
                {msg.role}
              </span>
              <p className="mt-1 text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))
        )}
        {loading && (
          <div className="rounded-lg bg-neutral-800/50 p-3">
            <span className="text-xs font-medium text-neutral-400 uppercase">assistant</span>
            <p className="mt-1 text-sm text-neutral-500">Thinking...</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={loading}
          className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-neutral-600 focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-neutral-100 hover:bg-neutral-600 disabled:opacity-50 disabled:hover:bg-neutral-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
