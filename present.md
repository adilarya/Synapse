# Synapse — Presentation Script

## 30 seconds

"Synapse solves a real vibe-coding problem: two developers using different AI tools — one on GPT, one on Gemini — with no shared context.

We fixed that with XTrace. Every agent response gets ingested into XTrace's shared memory. Before the next prompt is answered, we search that memory for relevant context and inject it. There's also a conflict detector — a separate GPT call that reads the new prompt against memory and blocks it if someone's already working on that.

GPT and Gemini. Same memory. No overlap."

---

## 1 minute

"The problem we're solving: two developers vibe-coding with different AI agents have no shared context. GPT doesn't know what Gemini just built, and vice versa. You end up with duplicated work, conflicting decisions, nobody knows the current state of the project.

Synapse connects them through XTrace — a shared memory layer that both agents read from and write to.

Here's the technical flow: when a developer sends a prompt, we first call XTrace Search — semantic search over the team's stored memory — and inject any relevant context into the agent's system prompt. The agent responds with full team awareness. Then we call XTrace Ingest to write that conversation turn back into shared memory so the other agent sees it on their next turn.

On top of that, there's a conflict detector — a dedicated GPT-4o mini call that compares every new prompt against existing memory. If Adil's already building a Postgres database and Eshwar asks Gemini to build a MongoDB one, the conflict detector fires before Gemini ever responds and blocks the overlapping work.

Three XTrace operations: Ingest, Search, and List. One shared memory layer. Two agents. Zero overlap."

---

## XTrace Functions Used

| Function | Endpoint | What It Does |
|---|---|---|
| **Ingest** | `POST /v1/memories` | Writes a user + assistant conversation turn into shared memory after every agent response |
| **Search** | `POST /v1/memories/search` | Semantic search over stored memories — runs before every agent call to pull relevant context |
| **List** | `GET /v1/memories` | Fetches all recent memories — used to refresh the shared memory dashboard in the UI |
