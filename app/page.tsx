"use client";

import { useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import MemoryPanel from "@/components/MemoryPanel";

export default function Page() {
  const [memoryRefreshKey, setMemoryRefreshKey] = useState(0);

  const handleMessageSent = () => {
    setMemoryRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex h-screen flex-col bg-neutral-950 overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center gap-3 border-b border-neutral-800 bg-neutral-900 px-6 py-3 shrink-0">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <div className="ml-2">
          <span className="text-sm font-semibold text-neutral-100">Synapse</span>
          <span className="ml-2 text-xs text-neutral-500">Shared memory for agents across models</span>
        </div>
      </header>

      {/* IDE split panes */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left pane — Adil */}
        <div className="flex w-1/2 flex-col border-r border-neutral-800">
          <div className="flex items-center gap-2 border-b border-neutral-800 bg-neutral-900 px-4 py-2 shrink-0">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            <span className="text-xs font-medium text-neutral-400">adil</span>
            <span className="mx-1 text-neutral-700">/</span>
            <span className="text-xs text-neutral-300">openai-agent</span>
            <span className="ml-auto rounded bg-green-900/40 px-2 py-0.5 text-xs text-green-400">GPT-4o mini</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatPanel
              agent="openai"
              title="Adil's ChatGPT Agent"
              placeholder="We are building Synapse. I am Adil and I will handle the OpenAI agent and pitch..."
              onMessageSent={handleMessageSent}
            />
          </div>
        </div>

        {/* Right pane — Eshwar */}
        <div className="flex w-1/2 flex-col">
          <div className="flex items-center gap-2 border-b border-neutral-800 bg-neutral-900 px-4 py-2 shrink-0">
            <span className="h-2 w-2 rounded-full bg-violet-400" />
            <span className="text-xs font-medium text-neutral-400">eshwar</span>
            <span className="mx-1 text-neutral-700">/</span>
            <span className="text-xs text-neutral-300">gemini-agent</span>
            <span className="ml-auto rounded bg-violet-900/40 px-2 py-0.5 text-xs text-violet-400">Gemini 2.5 Flash</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatPanel
              agent="claude"
              title="Eshwar's Gemini Agent"
              placeholder="What has Adil already decided for the project?"
              onMessageSent={handleMessageSent}
            />
          </div>
        </div>
      </div>

      {/* Bottom memory panel */}
      <div className="shrink-0 border-t border-neutral-800 bg-neutral-900">
        <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-blue-400" />
          <span className="text-xs font-medium text-neutral-400">xtrace</span>
          <span className="mx-1 text-neutral-700">/</span>
          <span className="text-xs text-neutral-300">shared-memory</span>
        </div>
        <div className="max-h-48 overflow-y-auto">
          <MemoryPanel refreshKey={memoryRefreshKey} />
        </div>
      </div>
    </div>
  );
}
