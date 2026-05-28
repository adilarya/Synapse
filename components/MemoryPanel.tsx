"use client";

import { useEffect, useState } from "react";
import type { MemoryItem } from "@/lib/types";

export type MemoryPanelProps = {
  refreshKey?: number;
};

export default function MemoryPanel({ refreshKey }: MemoryPanelProps) {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemories = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/memories");
        const data = await response.json();
        setMemories(data.memories ?? []);
      } catch {
        setMemories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMemories();
  }, [refreshKey]);

  const badgeStyle = (source: string) => {
    if (source === "openai") return "bg-green-900/40 text-green-400 border-green-800";
    if (source === "claude") return "bg-violet-900/40 text-violet-400 border-violet-800";
    return "bg-neutral-800 text-neutral-400 border-neutral-700";
  };

  const badgeLabel = (source: string) => {
    if (source === "claude") return "gemini";
    return source;
  };

  const formatTime = (ts: string) => {
    try { return new Date(ts).toLocaleTimeString(); } catch { return ""; }
  };

  return (
    <div className="px-4 py-3 font-mono text-xs">
      {loading ? (
        <span className="text-neutral-600">loading memories...</span>
      ) : memories.length === 0 ? (
        <span className="text-neutral-600">no memories yet — start chatting to build shared context.</span>
      ) : (
        <div className="flex flex-wrap gap-3">
          {memories.map((m) => (
            <div key={m.id} className="flex items-start gap-2 rounded border border-neutral-800 bg-neutral-800/40 px-3 py-2 max-w-sm">
              <span className={`shrink-0 rounded border px-1.5 py-0.5 text-xs font-semibold uppercase ${badgeStyle(m.sourceAgent)}`}>
                {badgeLabel(m.sourceAgent)}
              </span>
              <div>
                <p className="text-neutral-300 leading-relaxed">{m.content}</p>
                {m.createdAt && <p className="mt-0.5 text-neutral-600">{formatTime(m.createdAt)}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
