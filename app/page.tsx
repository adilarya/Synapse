"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import ChatPanel from "@/components/ChatPanel";
import MemoryPanel from "@/components/MemoryPanel";

const PANELS = {
  openai: {
    accent: "#34c759", accentBg: "#0a2e1a", accentBorder: "#1a5c30",
    dot: "radial-gradient(circle at 35% 35%, #80ffb0, #34c759)", dotGlow: "#34c75988",
    user: "adil", route: "openai-agent", label: "GPT-4o mini",
    agent: "openai" as const,
    filename: "openai-agent.ts",
    placeholder: "We are building Synapse. I am Adil and I will handle the OpenAI agent and pitch...",
  },
  gemini: {
    accent: "#a78bfa", accentBg: "#1e1040", accentBorder: "#4c3899",
    dot: "radial-gradient(circle at 35% 35%, #c4b5fd, #7c3aed)", dotGlow: "#7c3aed88",
    user: "eshwar", route: "gemini-agent", label: "Gemini 2.5 Flash",
    agent: "claude" as const,
    filename: "gemini-agent.ts",
    placeholder: "What has Adil already decided for the project?",
  },
};

function PanelWrapper({ id, onMessageSent }: { id: "openai" | "gemini"; onMessageSent: () => void }) {
  const p = PANELS[id];
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "#13121f" }}>
      <div className="window-titlebar flex items-center gap-2 px-4 py-2 shrink-0">
        <span className="h-2 w-2 rounded-full"
          style={{ background: p.dot, boxShadow: `0 0 6px ${p.dotGlow}` }} />
        <span className="text-xs font-semibold ml-1" style={{ color: p.accent }}>{p.user}</span>
        <span className="text-xs" style={{ color: "#444" }}>/</span>
        <span className="text-xs" style={{ color: "#aaa" }}>{p.route}</span>
        <span className="ml-auto rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ background: p.accentBg, color: p.accent, border: `1px solid ${p.accentBorder}` }}>
          {p.label}
        </span>
      </div>
      <div className="flex-1 overflow-hidden window-body pinstripe">
        <ChatPanel
          agent={p.agent}
          user={p.user}
          filename={p.filename}
          placeholder={p.placeholder}
          onMessageSent={onMessageSent}
        />
      </div>
    </div>
  );
}

function MemoryStrip({ refreshKey }: { refreshKey: number }) {
  return (
    <div className="shrink-0" style={{
      background: "linear-gradient(180deg, #1e1c35 0%, #161428 100%)",
      borderTop: "1px solid #6c63ff44",
      boxShadow: "0 -4px 20px #6c63ff22",
    }}>
      <div className="flex items-center gap-2 px-4 py-2" style={{ borderBottom: "1px solid #ffffff0a" }}>
        <svg width="10" height="10" viewBox="0 0 10 10">
          <circle cx="5" cy="5" r="4" fill="none" stroke="#6c63ff" strokeWidth="1.5" opacity="0.7" />
          <circle cx="5" cy="5" r="2" fill="#6c63ff" opacity="0.5" />
        </svg>
        <span className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "#6c63ff", opacity: 0.9 }}>XTrace Shared Memory</span>
      </div>
      <div className="max-h-44 overflow-y-auto">
        <MemoryPanel refreshKey={refreshKey} />
      </div>
    </div>
  );
}

function PageInner() {
  const [memoryRefreshKey, setMemoryRefreshKey] = useState(0);
  const handleMessageSent = () => setMemoryRefreshKey((k) => k + 1);
  const params = useSearchParams();
  const agentParam = params.get("agent"); // "openai" | "gemini" | null

  // ── Single-agent view (one tab / one machine) ──
  if (agentParam === "openai" || agentParam === "gemini") {
    const p = PANELS[agentParam];
    return (
      <div className="flex h-screen flex-col overflow-hidden" style={{ background: "#13121f" }}>
        <header className="metal-bar flex items-center gap-4 px-5 py-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="dot-red inline-block h-3 w-3 rounded-full" />
            <span className="dot-yellow inline-block h-3 w-3 rounded-full" />
            <span className="dot-green inline-block h-3 w-3 rounded-full" />
          </div>
          <div className="flex items-center gap-3 ml-3">
            <Image src="/synapse_logo.svg" alt="Synapse" width={160} height={74} priority
              style={{ filter: "drop-shadow(0 0 8px #6c63ff66)" }} />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: p.accentBg, color: p.accent, border: `1px solid ${p.accentBorder}` }}>
              {p.user} · {p.label}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <PanelWrapper id={agentParam} onMessageSent={handleMessageSent} />
        </div>

        <MemoryStrip refreshKey={memoryRefreshKey} />
      </div>
    );
  }

  // ── Side-by-side judge view (default) ──
  return (
    <div className="flex h-screen flex-col overflow-hidden" style={{ background: "#13121f" }}>
      <header className="metal-bar flex items-center gap-4 px-5 py-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="dot-red inline-block h-3 w-3 rounded-full" />
          <span className="dot-yellow inline-block h-3 w-3 rounded-full" />
          <span className="dot-green inline-block h-3 w-3 rounded-full" />
        </div>
        <div className="flex items-center gap-3 ml-3">
          <Image src="/synapse_logo.svg" alt="Synapse" width={160} height={74} priority
            style={{ filter: "drop-shadow(0 0 8px #6c63ff66)" }} />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="rounded-full px-3 py-1 text-xs font-semibold tracking-widest uppercase"
            style={{
              background: "linear-gradient(135deg, #6c63ff22, #6c63ff44)",
              border: "1px solid #6c63ff66",
              color: "#a78bfa",
              boxShadow: "0 0 12px #6c63ff33",
            }}>
            Shared Memory Layer
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ gap: "1px", background: "#6c63ff22" }}>
        <div className="w-1/2 overflow-hidden">
          <PanelWrapper id="openai" onMessageSent={handleMessageSent} />
        </div>
        <div className="w-1/2 overflow-hidden">
          <PanelWrapper id="gemini" onMessageSent={handleMessageSent} />
        </div>
      </div>

      <MemoryStrip refreshKey={memoryRefreshKey} />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <PageInner />
    </Suspense>
  );
}
