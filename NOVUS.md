# NOVUS.md — instrumenting Receipts

Novus is **mandatory** for the hackathon (project is ineligible without it). It captures the agent's conversations, tool calls, and goal completion. This doc is the complete wiring guide.

## What Novus will show for Receipts

Receipts is a single AI agent that makes many visible **tool calls** (`web_search`, `fetch_url`) per run — exactly the shape Novus's agent dashboard renders best:
- **Conversations** — each teardown as a prompt → agent-response thread.
- **Tools used** — `WEB_SEARCH` / `FETCH` call counts (our agent is tool-heavy → looks genuinely agentic).
- **Models used** — `llama-3.3-70b-versatile` (research) + `openai/gpt-oss-120b` (synthesis), both free on Groq.
- **AI quality** — issue / rage / **unsupported-request** rate (our "Couldn't verify" honesty maps here).
- **Goal completion** — the `teardown_shared_or_exported` event + a funnel.

## What is already wired in code (zero further changes needed)

`src/lib/run.ts` fires two Novus events on every teardown:

```ts
// 1. Conversation turn starts
trackAgent("prompt", { target, surface: "teardown" })

// 2. Conversation turn ends (on done OR error)
trackAgent("agent_response", {
  target,
  status: "completed" | "unsupported",
  toolsUsed: { web_search: N, fetch_url: N },
  toolCalls: N,           // total tool calls this turn
  claims: N,              // claims in the teardown
  unverified: N,          // items in "Couldn't verify"
  agentModelsUsed: ["llama-3.3-70b-versatile", "openai/gpt-oss-120b"],
})
```

`src/lib/track.ts` fires the goal event whenever a user shares/copies/exports:

```ts
window.pendo?.track?.("teardown_shared_or_exported", { action, target })
```

All calls are safe no-ops until `window.pendo` exists — merging the Novus install PR is the only step that unlocks live data. **No further code changes required from you.**

`onToolCall` in `run.ts` also feeds the `CaseFileGathering` cinematic loading UI in real-time, showing each `WEB_SEARCH` and `FETCH` entry as it fires.

---

## Step 1 — Connect the GitHub repo in Novus (auto-instrument)

1. Push this repo to GitHub (see DEPLOY section below).
2. Go to **novus.pendo.io** → sign in (free open beta).
3. "Connect a repository" → select your `receipts` GitHub repo.
4. Novus reads the code, builds its product map, opens an **install PR** in GitHub.
5. **Merge that PR.** It adds the Pendo Web SDK (`window.pendo`) to your app. That single merge is what makes `trackAgent` calls actually fire.

---

## Step 2 — Agent Analytics (the agent dashboard)

Do these **in order**. The Full Conversations toggle is permanent — set it now.

1. In Pendo → **Product → Agent Analytics → + Add an agent**.
2. Name: `Receipts Agent`. Fill role/users/purpose; pick this app.
3. **Enable "Full Conversations"** — permanent toggle, turn it on before any sessions.
4. Copy the **Agent ID** (looks like `agent_xxxxxxxx`).
5. In a Claude Code terminal (interactive `claude` session, not here):
   ```
   /plugin marketplace add pendo-io/claude-pendo-plugin
   /setup-agent-analytics agent_xxxxxxxx
   ```

---

## Step 3 — Goal funnel in Pendo

Build this funnel in Pendo's Funnel report:

```
landed → submitted_target → teardown_rendered → teardown_shared_or_exported
```

The `teardown_shared_or_exported` event fires from ShareBar on share / copy-link / export-markdown. This is the conversion the hackathon cares about.

---

## Step 4 — Seed real sessions (critical timing)

Novus processes data in **hourly batches (~15 min lag)**. You need ≥ 20–30 real sessions to show a meaningful dashboard. Do this **at least 1 hour before judging**.

**Fastest way:** share `/t/Raycast`, `/t/Linear`, `/t/Notion`, `/t/Figma` on LinkedIn or X. Each click auto-runs a teardown = one real session with tool calls.

**Free tier cap:** 500 prompts/month. Seed 25–30 sessions; leave 400+ for judges.

**Screenshot for submission:** the **Conversations** tab with one transcript open (tools + models visible), or the **AI engagement** dashboard (four trend lines).

---

## DEPLOY (public URL, no login — hard requirement)

### Option A — GitHub import (recommended, 5 min)

```bash
# In C:\Users\Elangovan\receipts
git remote add origin https://github.com/<your-username>/receipts.git
git branch -M main
git push -u origin main
```

Then at vercel.com:
1. Add New → Project → Import `receipts`.
2. Framework: Next.js (auto-detected, no config needed).
3. **Environment Variables → Production:** `GROQ_API_KEY` = your key from console.groq.com. (Jina is free + keyless — nothing else needed.)
4. **Deploy** → ~90 seconds → `https://<project>.vercel.app`.
5. Confirm in incognito: run "Raycast" → teardown appears, ShareBar appears.

### Option B — Vercel CLI

```bash
cd C:\Users\Elangovan\receipts
npx vercel login
npx vercel env add GROQ_API_KEY production
npx vercel --prod
```

### Optional: Gemini free tier (backup LLM)

If Groq is down, add in Vercel env vars:
```
LLM_BASE_URL = https://generativelanguage.googleapis.com/v1beta/openai
LLM_MODEL    = gemini-2.5-flash
LLM_API_KEY  = <free key from aistudio.google.com/apikey>
```
No code change needed — the route reads these at runtime.

---

## Summary: code vs. clicks

| Item | Status |
|---|---|
| `trackAgent("prompt", …)` | ✅ already in code |
| `trackAgent("agent_response", { toolsUsed, models, … })` | ✅ already in code |
| `track("teardown_shared_or_exported", …)` | ✅ already in code |
| `onToolCall` callback (feeds CaseFileGathering UI) | ✅ already in code |
| Pendo Web SDK (`window.pendo`) | **YOU: merge Novus install PR** |
| Agent Analytics setup + Full Conversations | **YOU: click in Pendo UI** |
| `/setup-agent-analytics <AGENT_ID>` | **YOU: run in `claude` terminal** |
| ≥ 20–30 real sessions ≥ 1hr before judging | **YOU: share live URL** |
