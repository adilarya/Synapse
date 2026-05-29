# Setup

## Requirements
- Node.js 18+
- npm

## Install

```bash
npm install
```

This installs all dependencies including:
- `next`, `react`, `react-dom` — framework
- `openai` — GPT-4o mini (Adil's agent + conflict detector)
- `@google/generative-ai` — Gemini 2.5 Flash (Eshwar's agent)
- `@anthropic-ai/sdk` — included but unused (swap in if needed)

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the keys:

```bash
cp .env.example .env.local
```

```
OPENAI_API_KEY=        # required — Adil's agent + conflict detector
GEMINI_API_KEY=        # required — Eshwar's agent
XTRACE_API_KEY=        # optional — falls back to in-memory store
XTRACE_ORG_ID=         # optional — falls back to in-memory store
XTRACE_BASE_URL=https://api.production.xtrace.ai
```

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
