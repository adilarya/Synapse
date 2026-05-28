"use client";

import type { MemoryItem } from "@/lib/types";

// TODO(doniv):
//   - Fetch GET /api/memories on mount and whenever `refreshKey` changes.
//   - Render each MemoryItem as a card: content, sourceAgent badge, createdAt, metadata.
//   - Badge colors: openai=green, claude=violet, shared=neutral.

export type MemoryPanelProps = {
  refreshKey?: number;
};

export default function MemoryPanel(_props: MemoryPanelProps) {
  const _example: MemoryItem = {
    id: "",
    content: "",
    sourceAgent: "shared",
    createdAt: "",
  };
  void _example;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
      <h2 className="text-sm font-medium text-neutral-300">Shared XTrace Memory</h2>
      <p className="mt-2 text-sm text-neutral-500">MemoryPanel stub — implement me.</p>
    </div>
  );
}
