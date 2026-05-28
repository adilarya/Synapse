# Synapse Team Build Roles

**Project:** Synapse  
**Tagline:** Shared memory for agents across models.  
**Goal:** Build a minimal working demo where an OpenAI/ChatGPT agent and a Claude agent share project memory through XTrace.

This file splits the project into three parallel roles so the team can work quickly without stepping on each other.

---

## Overall Product

Synapse lets multiple AI agents from different model providers share one memory layer.

In the demo:

1. Adil tells the OpenAI agent the project plan.
2. The OpenAI agent stores that context in XTrace.
3. Eshwar asks the Claude agent what Adil decided.
4. Claude retrieves the memory from XTrace and answers correctly.
5. Eshwar adds a new update through Claude.
6. Adil asks the OpenAI agent what Eshwar finished.
7. OpenAI retrieves Claude's update from XTrace and answers correctly.

The goal is to prove **cross-model shared memory**.

---

## Shared Architecture

```txt
User Message
   ↓
Agent Route: OpenAI or Claude
   ↓
Search XTrace for relevant project memories
   ↓
Inject retrieved memories into model prompt
   ↓
Model generates response
   ↓
Ingest user + assistant conversation into XTrace
   ↓
Frontend updates shared memory dashboard
```

Core loop:

```txt
Search Memory → Respond With Context → Store New Memory
```

---

## Shared File Structure

```txt
/app
  /api
    /chat
      /openai/route.ts
      /claude/route.ts
    /memories/route.ts
  page.tsx

/components
  ChatPanel.tsx
  MemoryPanel.tsx

/lib
  openaiAgent.ts
  claudeAgent.ts
  xtrace.ts
  memoryFallback.ts
  types.ts

.env.example
README.md
TEAM_ROLES.md
```

---

## Shared Environment Variables

```bash
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
XTRACE_API_KEY=
XTRACE_ORG_ID=
XTRACE_BASE_URL=https://api.mem.xtrace.ai
```

If XTrace credentials are missing or the API path needs adjustment, the app should use the in-memory fallback so the demo still works.

---

# Role 1: Adil Arya

## Responsibility

Adil owns:

- OpenAI/ChatGPT agent route
- OpenAI model wrapper
- Prompting logic for retrieved memories
- Demo script
- Pitch/story explanation

## Files to Own

```txt
/lib/openaiAgent.ts
/app/api/chat/openai/route.ts
README.md
```

Adil may also help with:

```txt
/lib/types.ts
```

---

## Claude Code Prompt for Adil

```text
You are working on the Synapse hackathon project.

Your role is Adil Arya. You own the OpenAI/ChatGPT-side agent and the pitch/demo script.

Project concept:
Synapse is shared memory for agents across models. It lets one teammate use an OpenAI/ChatGPT agent and another teammate use a Claude agent while both share project memory through XTrace.

Your tasks:
1. Implement /lib/openaiAgent.ts.
2. Implement /app/api/chat/openai/route.ts.
3. Make the OpenAI route search shared memory before answering.
4. Inject retrieved memories into the OpenAI prompt.
5. Call the OpenAI SDK.
6. Ingest the user + assistant turn into XTrace after response.
7. Return JSON with:
   - assistantMessage
   - retrievedMemories
   - sourceAgent: "openai"
8. Add or improve the README demo script and pitch section.

Expected behavior:
When the user asks the OpenAI panel, "What did Eshwar finish and what is left?", the OpenAI agent should search shared memory and answer using Claude-side memories if they exist.

Use this system prompt style:

"You are Adil's OpenAI agent for the Synapse hackathon project.
Synapse is a shared memory layer for agents across model providers.
Use the following shared project memories when helpful:
{memories}

Answer clearly and concisely. If a memory came from another agent, mention that naturally."

Environment variable:
OPENAI_API_KEY

Relevant helper functions expected from /lib/xtrace.ts:
- searchMemories(query: string, sourceAgent?: string)
- ingestConversation(args)

Fallback:
If XTrace is unavailable, use the memoryFallback helper.

Keep code simple. This is a 1-hour MVP, not production software.
```

---

## Adil Checklist

- [ ] OpenAI route compiles
- [ ] OpenAI agent accepts a user message
- [ ] OpenAI route searches memory before responding
- [ ] OpenAI route ingests conversation after response
- [ ] OpenAI response can use Claude-side memories
- [ ] README includes clean pitch and demo script

---

# Role 2: Eshwar Rajasekar

## Responsibility

Eshwar owns:

- Claude agent route
- Anthropic model wrapper
- XTrace integration
- Shared memory search/ingest functions
- In-memory fallback if XTrace fails

## Files to Own

```txt
/lib/claudeAgent.ts
/app/api/chat/claude/route.ts
/lib/xtrace.ts
/lib/memoryFallback.ts
/lib/types.ts
```

---

## Claude Code Prompt for Eshwar

```text
You are working on the Synapse hackathon project.

Your role is Eshwar Rajasekar. You own the Claude-side agent, backend memory integration, XTrace wrapper, and fallback memory store.

Project concept:
Synapse is shared memory for agents across models. It lets one teammate use an OpenAI/ChatGPT agent and another teammate use a Claude agent while both share project memory through XTrace.

Your tasks:
1. Implement /lib/types.ts with shared types:
   - ChatMessage
   - MemoryItem
   - AgentSource = "openai" | "claude" | "shared"
   - IngestConversationArgs
2. Implement /lib/memoryFallback.ts as an in-memory shared memory store.
3. Implement /lib/xtrace.ts with:
   - searchMemories(query: string, filters?: object)
   - ingestConversation(args: IngestConversationArgs)
   - getRecentMemories()
4. In /lib/xtrace.ts, use real XTrace fetch calls when:
   - XTRACE_API_KEY exists
   - XTRACE_ORG_ID exists
5. If XTrace fails or credentials are missing, automatically use memoryFallback.
6. Add clear TODO comments where the exact XTrace endpoint path may need adjustment.
7. Implement /lib/claudeAgent.ts using the Anthropic SDK.
8. Implement /app/api/chat/claude/route.ts.

Shared metadata:
{
  "user_id": "team_adil_eshwar_doniv",
  "conv_id": "synapse_demo",
  "metadata": {
    "project": "synapse",
    "source_agent": "claude"
  }
}

Claude system prompt style:

"You are Eshwar's Claude agent for the Synapse hackathon project.
Synapse is a shared memory layer for agents across model providers.
Use the following shared project memories when helpful:
{memories}

Answer clearly and concisely. If a memory came from another agent, mention that naturally."

Expected behavior:
If Adil stores project decisions through the OpenAI route, the Claude route should retrieve them and answer questions about them.

Environment variables:
ANTHROPIC_API_KEY
XTRACE_API_KEY
XTRACE_ORG_ID
XTRACE_BASE_URL

Keep the wrapper flexible:
- Do not let XTrace uncertainty break the app.
- Add TODO comments for exact endpoint paths.
- Make sure fallback memory makes the demo possible.
- Keep code simple and readable.
```

---

## Eshwar Checklist

- [ ] `types.ts` exists and is shared across app
- [ ] `xtrace.ts` has search, ingest, and recent memory functions
- [ ] Fallback memory works without XTrace credentials
- [ ] Claude route compiles
- [ ] Claude route searches memory before responding
- [ ] Claude route ingests conversation after response
- [ ] Claude can answer using OpenAI-side memories

---

# Role 3: Doniv Vinod

## Responsibility

Doniv owns:

- Split-screen frontend UI
- Chat panels
- Shared memory dashboard
- Loading states
- Visual polish for demo

## Files to Own

```txt
/app/page.tsx
/components/ChatPanel.tsx
/components/MemoryPanel.tsx
```

Doniv may also help with:

```txt
README.md
```

---

## Claude Code Prompt for Doniv

```text
You are working on the Synapse hackathon project.

Your role is Doniv Vinod. You own the frontend UI, split-screen chat experience, and shared memory dashboard.

Project concept:
Synapse is shared memory for agents across models. It lets one teammate use an OpenAI/ChatGPT agent and another teammate use a Claude agent while both share project memory through XTrace.

Your tasks:
1. Build /components/ChatPanel.tsx.
2. Build /components/MemoryPanel.tsx.
3. Build /app/page.tsx.
4. Create a clean split-screen interface:
   - Left: Adil's ChatGPT Agent
   - Right: Eshwar's Claude Agent
   - Bottom: Shared XTrace Memory
5. Each ChatPanel should:
   - Display chat messages
   - Have an input box
   - Have a send button
   - Show loading state while waiting
   - Call the correct API endpoint
6. The OpenAI panel should call:
   - POST /api/chat/openai
7. The Claude panel should call:
   - POST /api/chat/claude
8. After every message, refresh the memory panel by calling:
   - GET /api/memories
9. The MemoryPanel should display:
   - memory content
   - source agent: OpenAI, Claude, or Shared
   - timestamp if available
   - retrieved/project metadata if available
10. Make the UI clean with Tailwind:
   - cards
   - borders
   - rounded corners
   - good spacing
   - readable typography
   - neutral dark/light design

Suggested layout:

Top:
- Project title: "Synapse"
- Subtitle: "Shared memory for agents across models"

Middle:
Two columns:
- Adil's ChatGPT Agent
- Eshwar's Claude Agent

Bottom:
- Shared XTrace Memory timeline

Demo starter messages can be shown as placeholder examples:

OpenAI panel placeholder:
"We are building Synapse. I am Adil and I will handle the OpenAI agent and pitch..."

Claude panel placeholder:
"What has Adil already decided for the project?"

Keep the UI simple. Prioritize a smooth demo over extra features.
```

---

## Doniv Checklist

- [ ] Split-screen UI is visible
- [ ] OpenAI panel sends messages to `/api/chat/openai`
- [ ] Claude panel sends messages to `/api/chat/claude`
- [ ] Both panels display messages correctly
- [ ] Loading states work
- [ ] Memory panel refreshes after each message
- [ ] UI looks clean enough to demo to judges

---

# Integration Contract

All API routes should return this shape:

```ts
{
  assistantMessage: string;
  retrievedMemories: MemoryItem[];
  sourceAgent: "openai" | "claude";
}
```

The memory endpoint should return:

```ts
{
  memories: MemoryItem[];
}
```

Shared `MemoryItem` type:

```ts
type MemoryItem = {
  id: string;
  content: string;
  sourceAgent: "openai" | "claude" | "shared";
  createdAt: string;
  metadata?: Record<string, unknown>;
};
```

Shared `ChatMessage` type:

```ts
type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};
```

---

# Final Demo Script

## Step 1

In Adil's ChatGPT panel, type:

```txt
We are building Synapse. I am Adil and I will handle the OpenAI agent and pitch. Eshwar is handling the Claude agent and backend. Doniv is handling UI polish. The product lets multiple AI agents share memory through XTrace.
```

Expected:
The OpenAI agent responds. The memory dashboard updates.

---

## Step 2

In Eshwar's Claude panel, type:

```txt
What has Adil already decided for the project?
```

Expected:
Claude says the project is Synapse, explains the XTrace shared memory concept, and lists the team roles.

---

## Step 3

In Eshwar's Claude panel, type:

```txt
I finished the Claude backend route. The remaining task is to polish the shared memory dashboard.
```

Expected:
Claude acknowledges the update. The memory dashboard updates.

---

## Step 4

In Adil's ChatGPT panel, type:

```txt
What did Eshwar finish and what is left?
```

Expected:
ChatGPT says Eshwar finished the Claude backend route and that the shared memory dashboard still needs polish.

---

# Final Pitch

```txt
Synapse is shared memory for agents across models.

Today, AI tools are siloed. One teammate may use ChatGPT, another may use Claude, and project context gets trapped in separate chats.

Synapse connects them through XTrace.

Every agent searches shared memory before responding and writes useful context back after responding. This lets teams collaborate across AI providers without constantly repeating context.

Our demo shows ChatGPT and Claude sharing one project memory through XTrace in real time.
```

---

# Priority Order

If time is running out, build in this order:

1. UI shell with two chat panels
2. In-memory fallback store
3. OpenAI route
4. Claude route
5. Memory panel
6. XTrace integration
7. README polish

A working fallback demo is better than a broken XTrace demo.
