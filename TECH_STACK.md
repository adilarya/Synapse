# Synapse — Technical Stack

## What It Does

Synapse is a shared memory layer for AI agents across model providers. Two developers — one using an OpenAI/GPT agent, one using a Gemini agent — collaborate on the same project. Every decision either agent makes is stored in shared memory. When a new prompt comes in, a conflict detection system checks it against existing memory and blocks conflicting work before it starts.

---

## Stack Overview

```
User Prompt
    ↓
Next.js API Route (Node.js)
    ↓
Conflict Detector (OpenAI GPT-4o mini)
    ↓         ↘ conflict found → return warning, skip agent
XTrace Memory Search
    ↓
Agent (OpenAI GPT-4o mini  OR  Gemini 2.5 Flash)
    ↓
XTrace Memory Ingest
    ↓
Response → Frontend
```

---

## Technologies

### Frontend
- **Next.js 15 (App Router)** — split-screen UI served at `localhost:3000`
- **React** — two `ChatPanel` components (one per agent) + `MemoryPanel`
- **Tailwind CSS** — layout and styling
- **Custom CSS** — retro Apple Aqua-era aesthetics (brushed metal, aqua buttons, glossy panels)

### Backend
- **Next.js API Routes** (Node.js runtime)
  - `POST /api/chat/openai` — handles Adil's GPT agent
  - `POST /api/chat/claude` — handles Eshwar's Gemini agent
  - `GET /api/memories` — returns shared memory for the dashboard

### AI Models
| Agent | Model | Used For |
|---|---|---|
| Adil's panel | OpenAI `gpt-4o-mini` | Chat responses |
| Eshwar's panel | Google `gemini-2.5-flash` | Chat responses |
| Conflict detector | OpenAI `gpt-4o-mini` | Conflict analysis (runs on every prompt, both panels) |

---

## XTrace Integration

XTrace is the shared memory layer that persists context across agents and model providers.

### API Base URL
```
https://api.production.xtrace.ai
```

### Authentication
Every request sends:
```
Authorization: Bearer <XTRACE_API_KEY>
X-Org-Id: <XTRACE_ORG_ID>
```

### Endpoints Used

#### 1. Ingest — `POST /v1/memories`
**Input:** A conversation turn (user message + assistant response) with metadata
```json
{
  "user_id": "team_adil_eshwar_doniv",
  "conv_id": "synapse_demo",
  "messages": [
    { "role": "user", "content": "<user prompt>" },
    { "role": "assistant", "content": "<agent response>" }
  ],
  "metadata": {
    "project": "synapse",
    "source_agent": "openai" | "claude"
  }
}
```
**Output:** `202 Accepted` with an async job ID — XTrace processes and indexes the memory in the background.

**When it runs:** After every agent response, on both routes.

#### 2. Search — `POST /v1/memories/search`
**Input:** A query string + limit
```json
{ "query": "<user's message text>", "limit": 10 }
```
**Output:** `{ "data": [ { "id", "memory", "created_at", "metadata" } ] }`

**When it runs:** Before every agent call — retrieved memories are injected into the system prompt so the agent has full team context.

#### 3. List Recent — `GET /v1/memories`
**Input:** Auth headers only

**Output:** `{ "data": [ ... ] }` — all stored memories for the org

**When it runs:** After every message send, to refresh the shared memory dashboard at the bottom of the UI.

---

## Memory Flow (Per Message)

```
1. User sends prompt to either agent panel
2. Fetch: GET /v1/memories (recent) + POST /v1/memories/search (query match)
   → merged, deduped list of MemoryItems
3. Conflict check: OpenAI GPT-4o mini compares new prompt vs existing memories
   → if conflict → return warning immediately, skip agent, store conflict in memory
   → if clear → continue
4. Agent call with memories injected into system prompt
5. Ingest: POST /v1/memories with user + assistant turn
6. Frontend refreshes memory panel via GET /api/memories
```

---

## Fallback

If XTrace credentials are missing or any API call fails, an in-process global store (`lib/memoryFallback.ts`) takes over transparently. This uses a Node.js `global` variable so all route handlers share the same in-memory store within one server process. The demo works end-to-end without XTrace credentials.
