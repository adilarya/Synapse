// TODO(doniv): Build the split-screen UI here.
//   Top: title "Synapse" + subtitle
//   Middle: <ChatPanel agent="openai" /> | <ChatPanel agent="claude" />
//   Bottom: <MemoryPanel />
//   After each send, refresh MemoryPanel by re-fetching GET /api/memories.

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Synapse</h1>
        <p className="mt-2 text-neutral-400">Shared memory for agents across models</p>
      </header>

      <section className="mt-12 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
        <p className="text-sm text-neutral-400">
          Scaffold ready. Doniv: replace this with the split-screen chat + memory dashboard.
        </p>
      </section>
    </main>
  );
}
