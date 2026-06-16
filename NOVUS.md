# NOVUS.md — instrumenting Receipts

Novus is **mandatory** for the hackathon (project is ineligible without it). It captures the agent's conversations, tool calls, and goal completion. This doc is the exact wiring.

## What Novus will show for Receipts
Receipts is a single AI agent that makes many visible **tool calls** (`web_search`, `web_fetch`) per run — exactly the shape Novus's agent dashboard renders best:
- **Conversations** — each teardown as a prompt → agent-response thread.
- **Tools used** — `web_search` / `web_fetch` call counts (our agent is tool-heavy → looks genuinely agentic).
- **Models used** — `claude-opus-4-8`.
- **AI quality** — issue / rage / **unsupported-request** rate (our "Couldn't verify" honesty maps here — gaps are a feature, not a failure).
- **Goal completion** — the `teardown_shared_or_exported` event + a funnel.

## Step 1 — Connect the GitHub repo (auto-instrument)
1. Push this repo to GitHub (see DEPLOY below).
2. In Novus (novus.pendo.io, free open beta), **connect the repo**. Novus reads the code, builds its product map, and opens an install PR. Merge it. Setup is typically < 10 min.

## Step 2 — Agent Analytics (the agent dashboard)
1. Pendo → **Product → Agent Analytics → + Add an agent**. Name: `Receipts Agent`. Fill role/users/purpose; pick this app.
2. **Enable full conversations** (this toggle is **permanent** — set it now). Copy the **Agent ID** (`agent_…`).
3. Add the Pendo Web SDK so `window.pendo` exists, then run the AI skill in Claude Code:
   - `/plugin marketplace add pendo-io/claude-pendo-plugin`
   - install `setup-agent-analytics`
   - `/setup-agent-analytics <AGENT_ID>`
   It injects `window.pendo.trackAgent(...)` on prompt / agent_response / user_reaction. For Receipts, the natural call sites are in `src/lib/run.ts` (on submit → `prompt`; on `done` → `agent_response` with `toolsUsed: ['web_search','web_fetch']`, `agentModelsUsed: ['claude-opus-4-8']`).

## Step 3 — the goal event (already in the code)
`src/lib/track.ts` already fires the conversion the hackathon cares about:
```ts
window.pendo?.track?.("teardown_shared_or_exported", { action, target })
```
This runs whenever a user copies the link, exports Markdown, or shares (see `ShareBar`). In Pendo, build a **funnel**: `landed → submitted_target → teardown_rendered → teardown_shared_or_exported`. That funnel + the unsupported-request trend is the "goal completion" story.

## Step 4 — the screenshot for submission
Capture **either**:
- the **Conversations** tab with one transcript open (tools-used + models-used visible), **or**
- the **AI engagement** dashboard template (the four AI-quality trend lines).
Generate ≥ 20–30 real sessions first (share the link on LinkedIn). **Watch the gotchas:** free tier caps at **500 prompts/month**; data appears on an **hourly batch (~15 min lag)** — generate traffic at least an hour before capturing.

## DEPLOY (public URL, no login)
Repo is a standard Next.js app → Vercel:
1. Push to GitHub.
2. Import the repo at vercel.com (framework auto-detected).
3. Set env var **`ANTHROPIC_API_KEY`** (Production). Without it, only the bundled Linear sample works.
4. Deploy → public URL, no login wall on `/`. Confirm a cold visitor can run a teardown.

> Permalinks (a `/t/{id}` share route backed by Vercel KV/Postgres) are an optional virality add-on — the goal event already fires on share/copy/export without it.
