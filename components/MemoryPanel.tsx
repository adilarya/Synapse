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
        setMemories(data.memories || []);
      } catch (error) {
        console.error("Error fetching memories:", error);
        setMemories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMemories();
  }, [refreshKey]);

  const getBadgeColor = (sourceAgent: string) => {
    switch (sourceAgent) {
      case "openai":
        return "bg-green-900/30 text-green-400 border-green-800";
      case "claude":
        return "bg-violet-900/30 text-violet-400 border-violet-800";
      default:
        return "bg-neutral-800 text-neutral-400 border-neutral-700";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
      <h2 className="text-sm font-medium text-neutral-300">Shared XTrace Memory</h2>
      
      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="text-sm text-neutral-500">Loading memories...</p>
        ) : memories.length === 0 ? (
          <p className="text-sm text-neutral-500">No memories yet. Start chatting to build shared context.</p>
        ) : (
          memories.map((memory) => (
            <div
              key={memory.id}
              className="rounded-lg border border-neutral-800 bg-neutral-800/50 p-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`rounded border px-2 py-0.5 text-xs font-medium uppercase ${getBadgeColor(memory.sourceAgent)}`}
                >
                  {memory.sourceAgent}
                </span>
                {memory.createdAt && (
                  <span className="text-xs text-neutral-500">{formatTimestamp(memory.createdAt)}</span>
                )}
              </div>
              <p className="mt-2 text-sm text-neutral-200">{memory.content}</p>
              {memory.metadata && Object.keys(memory.metadata).length > 0 && (
                <div className="mt-2 text-xs text-neutral-500">
                  <pre className="overflow-x-auto">{JSON.stringify(memory.metadata, null, 2)}</pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
