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
    <main className="mx-auto max-w-7xl px-6 py-12">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Synapse</h1>
        <p className="mt-2 text-neutral-400">Shared memory for agents across models</p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:h-[500px]">
        <ChatPanel
          agent="openai"
          title="Adil's ChatGPT Agent"
          placeholder="We are building Synapse. I am Adil and I will handle the OpenAI agent and pitch..."
          onMessageSent={handleMessageSent}
        />
        <ChatPanel
          agent="claude"
          title="Eshwar's Claude Agent"
          placeholder="What has Adil already decided for the project?"
          onMessageSent={handleMessageSent}
        />
      </div>

      <div className="mt-6">
        <MemoryPanel refreshKey={memoryRefreshKey} />
      </div>
    </main>
  );
}
