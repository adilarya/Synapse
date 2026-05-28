"use client";

import { useEffect, useState } from "react";
import type { MemoryItem } from "@/lib/types";

export type MemoryPanelProps = { refreshKey?: number };

const BADGE: Record<string, string> = {
  openai: "badge-openai",
  claude: "badge-gemini",
  shared: "badge-shared",
};
const LABEL: Record<string, string> = {
  openai: "openai",
  claude: "gemini",
  shared: "shared",
};

export default function MemoryPanel({ refreshKey }: MemoryPanelProps) {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/memories")
      .then((r) => r.json())
      .then((d) => setMemories(d.memories ?? []))
      .catch(() => setMemories([]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const fmt = (ts: string) => {
    try { return new Date(ts).toLocaleTimeString(); } catch { return ""; }
  };

  return (
    <div className="px-4 py-3" style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace" }}>
      {loading ? (
        <span className="text-xs" style={{ color: "#444" }}>loading memories...</span>
      ) : memories.length === 0 ? (
        <span className="text-xs" style={{ color: "#444" }}>
          no memories yet — start chatting to build shared context.
        </span>
      ) : (
        <div className="flex flex-wrap gap-2">
          {memories.map((m) => (
            <div
              key={m.id}
              className="flex items-start gap-2 rounded-lg px-3 py-2"
              style={{
                background: "#0d0c1a",
                border: "1px solid #2a2545",
                maxWidth: "380px",
                boxShadow: "0 2px 8px #00000044",
              }}
            >
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold uppercase ${BADGE[m.sourceAgent] ?? BADGE.shared}`}>
                {LABEL[m.sourceAgent] ?? m.sourceAgent}
              </span>
              <div className="min-w-0">
                <p className="text-xs leading-relaxed break-words" style={{ color: "#bbb" }}>{m.content}</p>
                {m.createdAt && (
                  <p className="mt-1 text-xs" style={{ color: "#444" }}>{fmt(m.createdAt)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
