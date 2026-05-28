"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "@/lib/types";

export type ChatPanelProps = {
  agent: "openai" | "claude";
  title: string;
  placeholder?: string;
  onMessageSent?: () => void;
};

export default function ChatPanel({ agent, placeholder, onMessageSent }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.assistantMessage ?? data.error ?? "No response.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
      onMessageSent?.();
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: failed to reach agent." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col bg-neutral-950 font-mono text-sm">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.length === 0 && (
          <p className="text-neutral-600 text-xs mt-2">{placeholder ?? "Send a message to start."}</p>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className="space-y-0.5">
            <div className={`text-xs font-semibold ${msg.role === "user" ? "text-neutral-500" : agent === "openai" ? "text-green-400" : "text-violet-400"}`}>
              {msg.role === "user" ? "you" : agent === "openai" ? "gpt-4o-mini" : "gemini-2.5-flash"}
            </div>
            <p className="text-neutral-200 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
          </div>
        ))}
        {loading && (
          <div className="space-y-0.5">
            <div className={`text-xs font-semibold ${agent === "openai" ? "text-green-400" : "text-violet-400"}`}>
              {agent === "openai" ? "gpt-4o-mini" : "gemini-2.5-flash"}
            </div>
            <p className="text-neutral-500 animate-pulse">thinking...</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-neutral-800 px-4 py-3 flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={loading}
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:border-neutral-500 focus:outline-none disabled:opacity-40"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className={`rounded px-4 py-2 text-xs font-semibold disabled:opacity-30 ${agent === "openai" ? "bg-green-900/50 text-green-300 hover:bg-green-900" : "bg-violet-900/50 text-violet-300 hover:bg-violet-900"}`}
        >
          Send
        </button>
      </div>
    </div>
  );
}
