"use client";

import { useState } from "react";
import Image from "next/image";
import ChatPanel from "@/components/ChatPanel";
import MemoryPanel from "@/components/MemoryPanel";

export default function Page() {
  const [memoryRefreshKey, setMemoryRefreshKey] = useState(0);
  const handleMessageSent = () => setMemoryRefreshKey((k) => k + 1);

  return (
    <div className="flex h-screen flex-col overflow-hidden" style={{ background: "#13121f" }}>

      {/* ── Brushed-metal header ── */}
      <header className="metal-bar flex items-center gap-4 px-5 py-3 shrink-0">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5">
          <span className="dot-red inline-block h-3 w-3 rounded-full" />
          <span className="dot-yellow inline-block h-3 w-3 rounded-full" />
          <span className="dot-green inline-block h-3 w-3 rounded-full" />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 ml-3">
          <Image
            src="/synapse_logo.svg"
            alt="Synapse"
            width={160}
            height={74}
            priority
            style={{ filter: "drop-shadow(0 0 8px #6c63ff66)" }}
          />
        </div>

        {/* Spacer + tag */}
        <div className="ml-auto flex items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold tracking-widest uppercase"
            style={{
              background: "linear-gradient(135deg, #6c63ff22, #6c63ff44)",
              border: "1px solid #6c63ff66",
              color: "#a78bfa",
              boxShadow: "0 0 12px #6c63ff33",
            }}
          >
            Shared Memory Layer
          </span>
        </div>
      </header>

      {/* ── Split panes ── */}
      <div className="flex flex-1 overflow-hidden" style={{ gap: "1px", background: "#6c63ff22" }}>

        {/* Left — OpenAI / Adil */}
        <div className="flex flex-col w-1/2 overflow-hidden" style={{ background: "#13121f" }}>
          <div className="window-titlebar flex items-center gap-2 px-4 py-2 shrink-0">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: "radial-gradient(circle at 35% 35%, #80ffb0, #34c759)", boxShadow: "0 0 6px #34c75988" }}
            />
            <span className="text-xs font-semibold ml-1" style={{ color: "#34c759" }}>adil</span>
            <span className="text-xs" style={{ color: "#444" }}>/</span>
            <span className="text-xs" style={{ color: "#aaa" }}>openai-agent</span>
            <span
              className="ml-auto rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ background: "#0a2e1a", color: "#34c759", border: "1px solid #1a5c30" }}
            >
              GPT-4o mini
            </span>
          </div>
          <div className="flex-1 overflow-hidden window-body pinstripe">
            <ChatPanel
              agent="openai"
              placeholder="We are building Synapse. I am Adil and I will handle the OpenAI agent and pitch..."
              onMessageSent={handleMessageSent}
            />
          </div>
        </div>

        {/* Right — Gemini / Eshwar */}
        <div className="flex flex-col w-1/2 overflow-hidden" style={{ background: "#13121f" }}>
          <div className="window-titlebar flex items-center gap-2 px-4 py-2 shrink-0">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: "radial-gradient(circle at 35% 35%, #c4b5fd, #7c3aed)", boxShadow: "0 0 6px #7c3aed88" }}
            />
            <span className="text-xs font-semibold ml-1" style={{ color: "#a78bfa" }}>eshwar</span>
            <span className="text-xs" style={{ color: "#444" }}>/</span>
            <span className="text-xs" style={{ color: "#aaa" }}>gemini-agent</span>
            <span
              className="ml-auto rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ background: "#1e1040", color: "#a78bfa", border: "1px solid #4c3899" }}
            >
              Gemini 2.5 Flash
            </span>
          </div>
          <div className="flex-1 overflow-hidden window-body pinstripe">
            <ChatPanel
              agent="claude"
              placeholder="What has Adil already decided for the project?"
              onMessageSent={handleMessageSent}
            />
          </div>
        </div>
      </div>

      {/* ── Shared memory strip ── */}
      <div
        className="shrink-0"
        style={{
          background: "linear-gradient(180deg, #1e1c35 0%, #161428 100%)",
          borderTop: "1px solid #6c63ff44",
          boxShadow: "0 -4px 20px #6c63ff22",
        }}
      >
        <div
          className="flex items-center gap-2 px-4 py-2"
          style={{ borderBottom: "1px solid #ffffff0a" }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <circle cx="5" cy="5" r="4" fill="none" stroke="#6c63ff" strokeWidth="1.5" opacity="0.7" />
            <circle cx="5" cy="5" r="2" fill="#6c63ff" opacity="0.5" />
          </svg>
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#6c63ff", opacity: 0.9 }}>
            XTrace Shared Memory
          </span>
        </div>
        <div className="max-h-44 overflow-y-auto">
          <MemoryPanel refreshKey={memoryRefreshKey} />
        </div>
      </div>
    </div>
  );
}
