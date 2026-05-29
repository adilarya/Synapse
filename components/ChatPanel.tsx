"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "@/lib/types";

export type ChatPanelProps = {
  agent: "openai" | "claude";
  user: string;
  filename: string;
  placeholder?: string;
  onMessageSent?: () => void;
};

const AGENT = {
  openai: {
    accent:   "#4ade80",
    accentDim:"#166534",
    accentBg: "#052e16",
    model:    "GPT-4o mini",
    tabColor: "#4ade80",
  },
  claude: {
    accent:   "#a78bfa",
    accentDim:"#5b21b6",
    accentBg: "#1e1040",
    model:    "Gemini 2.5 Flash",
    tabColor: "#a78bfa",
  },
};

export default function ChatPanel({ agent, user, filename, placeholder, onMessageSent }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const c = AGENT[agent];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setMessages(p => [...p, { role: "user", content: text }]);
    setLoading(true);
    setInput("");

    try {
      const res  = await fetch(`/api/chat/${agent}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages(p => [...p, {
        role: "assistant",
        content: data.assistantMessage ?? data.error ?? "No response.",
      }]);
      onMessageSent?.();
    } catch {
      setMessages(p => [...p, { role: "assistant", content: "Error: failed to reach agent." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // auto-grow textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const lineNum = (n: number) => (
    <span className="select-none text-right pr-4 shrink-0 w-8"
      style={{ color: "#3e3e5e", fontSize: 11, lineHeight: "1.6", fontFamily: "ui-monospace, monospace" }}>
      {n}
    </span>
  );

  return (
    <div className="flex h-full flex-col" style={{ background: "#12111e" }}>

      {/* ── Editor Tab Bar ── */}
      <div className="flex items-end shrink-0"
        style={{ background: "#0e0d1a", borderBottom: "1px solid #1e1d30" }}>
        {/* active tab */}
        <div className="flex items-center gap-2 px-4 py-2 relative"
          style={{
            background: "#12111e",
            borderRight: "1px solid #1e1d30",
            borderTop: `2px solid ${c.tabColor}`,
          }}>
          {/* file icon */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 1h5l3 3v7H2V1z" stroke={c.accent} strokeWidth="1" fill={c.accentBg} />
            <path d="M7 1v3h3" stroke={c.accent} strokeWidth="1" />
          </svg>
          <span style={{ color: "#cdd6f4", fontSize: 12 }}>{filename}</span>
          <span style={{ color: "#45475a", fontSize: 11 }} className="ml-1">×</span>
        </div>
        {/* user pill */}
        <div className="ml-auto flex items-center gap-1.5 px-3 pb-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.accent }} />
          <span style={{ color: "#45475a", fontSize: 11 }}>{user}</span>
        </div>
      </div>

      {/* ── Editor Body ── */}
      <div className="flex-1 overflow-y-auto py-3" style={{ background: "#12111e" }}>
        {messages.length === 0 && (
          <div className="flex">
            {lineNum(1)}
            <span style={{ color: "#3e3e5e", fontSize: 12, fontFamily: "ui-monospace, monospace" }}>
              {/* placeholder as a comment */}
              <span style={{ color: "#45475a" }}>{"// "}</span>
              <span style={{ color: "#313244" }}>{placeholder}</span>
            </span>
          </div>
        )}

        {messages.map((msg, idx) => {
          const lineBase = idx * 3 + 1;
          return (
            <div key={idx} className="mb-3">
              {msg.role === "user" ? (
                /* User message — looks like a typed prompt */
                <div className="flex items-start">
                  {lineNum(lineBase)}
                  <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 13 }}>
                    <span style={{ color: "#45475a" }}>&gt; </span>
                    <span style={{ color: "#cdd6f4" }}>{msg.content}</span>
                  </div>
                </div>
              ) : (
                /* AI response — Cursor inline suggestion block */
                <div className="flex items-stretch mt-1">
                  {lineNum(lineBase + 1)}
                  <div className="flex-1 mr-4 rounded-md overflow-hidden"
                    style={{
                      borderLeft: `3px solid ${c.accent}`,
                      background: `linear-gradient(135deg, ${c.accentBg}cc 0%, #12111e 100%)`,
                      border: `1px solid ${c.accentDim}66`,
                      borderLeftWidth: 3,
                      borderLeftColor: c.accent,
                      boxShadow: `0 0 20px ${c.accentBg}88`,
                    }}>
                    {/* suggestion header */}
                    <div className="flex items-center gap-2 px-3 py-1.5"
                      style={{ borderBottom: `1px solid ${c.accentDim}44` }}>
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path d="M5.5 1l1 3h3l-2.5 1.8.9 3L5.5 7l-2.4 1.8.9-3L1.5 4h3z"
                          fill={c.accent} opacity="0.9" />
                      </svg>
                      <span style={{ color: c.accent, fontSize: 11, fontWeight: 600 }}>{c.model}</span>
                      <span style={{ color: "#45475a", fontSize: 10, marginLeft: "auto" }}>suggestion</span>
                    </div>
                    {/* content */}
                    <p className="px-3 py-2 whitespace-pre-wrap leading-relaxed"
                      style={{ color: "#cdd6f4", fontSize: 13, fontFamily: "ui-monospace, monospace" }}>
                      {msg.content}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Loading state */}
        {loading && (
          <div className="flex items-stretch mt-1">
            {lineNum(messages.length * 3 + 2)}
            <div className="flex-1 mr-4 rounded-md"
              style={{
                borderLeft: `3px solid ${c.accent}`,
                background: `${c.accentBg}66`,
                border: `1px solid ${c.accentDim}44`,
                borderLeftWidth: 3,
                borderLeftColor: c.accent,
              }}>
              <div className="flex items-center gap-2 px-3 py-2">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M5.5 1l1 3h3l-2.5 1.8.9 3L5.5 7l-2.4 1.8.9-3L1.5 4h3z"
                    fill={c.accent} opacity="0.9" />
                </svg>
                <span style={{ color: c.accent, fontSize: 11, fontWeight: 600 }}>{c.model}</span>
                <span style={{ color: "#45475a", fontSize: 11 }}>generating</span>
                <div className="flex gap-1 ml-1">
                  {[0,1,2].map(i => (
                    <span key={i} className="inline-block h-1 w-1 rounded-full animate-bounce"
                      style={{ background: c.accent, opacity: 0.7, animationDelay: `${i*0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Cursor-style Chat Input ── */}
      <div className="shrink-0 px-3 py-2"
        style={{ background: "#0e0d1a", borderTop: "1px solid #1e1d30" }}>
        <div className="flex items-end gap-2 rounded-lg px-3 py-2"
          style={{
            background: "#1a1928",
            border: `1px solid ${loading ? c.accentDim : "#2a2940"}`,
            boxShadow: loading ? `0 0 0 1px ${c.accentDim}` : "none",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}>
          {/* @ icon */}
          <span style={{ color: "#45475a", fontSize: 13, paddingBottom: 2, flexShrink: 0 }}>@</span>
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            disabled={loading}
            className="flex-1 resize-none bg-transparent outline-none disabled:opacity-40"
            style={{
              color: "#cdd6f4",
              fontSize: 13,
              fontFamily: "ui-monospace, monospace",
              lineHeight: 1.6,
              caretColor: c.accent,
              maxHeight: 120,
            }}
          />
          {/* Send arrow */}
          <button onClick={handleSend} disabled={loading || !input.trim()}
            className="shrink-0 rounded-md flex items-center justify-center disabled:opacity-30"
            style={{
              background: input.trim() && !loading ? c.accent : "transparent",
              border: `1px solid ${input.trim() && !loading ? c.accent : "#2a2940"}`,
              width: 28, height: 28,
              transition: "background 0.15s",
            }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 11L11 2M11 2H5M11 2v6"
                stroke={input.trim() && !loading ? "#000" : "#45475a"}
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        {/* Status bar */}
        <div className="flex items-center gap-3 mt-1.5 px-1">
          <span className="h-1.5 w-1.5 rounded-full"
            style={{ background: loading ? c.accent : "#45475a",
              boxShadow: loading ? `0 0 6px ${c.accent}` : "none",
              transition: "all 0.3s" }} />
          <span style={{ color: "#45475a", fontSize: 10, fontFamily: "ui-monospace, monospace" }}>
            {loading ? `${c.model} · generating...` : `${c.model} · ready`}
          </span>
          <span style={{ color: "#2a2940", fontSize: 10, marginLeft: "auto", fontFamily: "ui-monospace, monospace" }}>
            ↵ send · shift+↵ newline
          </span>
        </div>
      </div>

    </div>
  );
}
