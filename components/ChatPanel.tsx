"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "@/lib/types";

export type ChatPanelProps = {
  agent: "openai" | "claude";
  placeholder?: string;
  onMessageSent?: () => void;
};

const AGENT_COLOR = {
  openai: { text: "#34c759", dim: "#1a5c30aa", name: "gpt-4o-mini" },
  claude: { text: "#a78bfa", dim: "#4c389988", name: "gemini-2.5-flash" },
};

export default function ChatPanel({ agent, placeholder, onMessageSent }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const colors = AGENT_COLOR[agent];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    const text = input;
    setInput("");

    try {
      const res = await fetch(`/api/chat/${agent}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.assistantMessage ?? data.error ?? "No response." },
      ]);
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
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex h-full flex-col" style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace" }}>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {messages.length === 0 && (
          <p className="text-xs mt-2" style={{ color: "#444" }}>{placeholder ?? "Send a message to start."}</p>
        )}

        {messages.map((msg, idx) => (
          <div key={idx}>
            {msg.role === "user" ? (
              <div className="flex items-start gap-2">
                <span className="text-xs mt-0.5 font-bold shrink-0" style={{ color: "#555" }}>you</span>
                <p className="text-sm leading-relaxed" style={{ color: "#ccc" }}>{msg.content}</p>
              </div>
            ) : (
              <div
                className="rounded-lg p-3"
                style={{
                  background: `linear-gradient(135deg, ${colors.dim}33, ${colors.dim}11)`,
                  border: `1px solid ${colors.dim}`,
                  boxShadow: `0 0 16px ${colors.dim}55`,
                }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: colors.text, boxShadow: `0 0 4px ${colors.text}` }}
                  />
                  <span className="text-xs font-bold" style={{ color: colors.text }}>{colors.name}</span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#e0e0e0" }}>
                  {msg.content}
                </p>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div
            className="rounded-lg p-3"
            style={{
              background: `linear-gradient(135deg, ${colors.dim}22, transparent)`,
              border: `1px solid ${colors.dim}`,
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: colors.text }} />
              <span className="text-xs font-bold" style={{ color: colors.text }}>{colors.name}</span>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full animate-bounce"
                  style={{ background: colors.text, opacity: 0.7, animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Aqua input bar */}
      <div
        className="flex gap-2 px-4 py-3 shrink-0"
        style={{
          background: "linear-gradient(180deg, #1a1828 0%, #131220 100%)",
          borderTop: "1px solid #ffffff0f",
          boxShadow: "inset 0 1px 0 #ffffff08",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={loading}
          className="flex-1 rounded-md px-3 py-2 text-sm outline-none disabled:opacity-40"
          style={{
            background: "#0d0c1a",
            border: "1px solid #2a2545",
            color: "#e0e0e0",
            boxShadow: "inset 0 1px 4px #00000066, 0 0 0 0px #6c63ff",
            caretColor: colors.text,
          }}
          onFocus={(e) => (e.target.style.boxShadow = `inset 0 1px 4px #00000066, 0 0 0 2px ${colors.dim}`)}
          onBlur={(e) => (e.target.style.boxShadow = "inset 0 1px 4px #00000066")}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="aqua-btn rounded-md px-4 py-2 text-xs font-bold text-white"
          style={{ letterSpacing: "0.03em" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
