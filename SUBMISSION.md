# Hackathon Submission — Receipts

## What I built

**Receipts** — competitive teardowns that show their sources.

Paste any product. In under a minute, one AI agent reads its real homepage, pricing, and changelog — then writes a sharp six-facet teardown where **every claim links to the exact source page**. Anything it couldn't verify goes into a visible "Couldn't verify" block — not fabricated, not silently dropped.

Live URL: _[your Vercel URL]_
GitHub: https://github.com/elangovanvp/Receipts
Demo video: _[your Loom/YouTube URL]_

---

## The problem I'm solving

Product managers have stopped trusting AI for competitive intelligence. The reason is simple: every AI tool confabulates. You paste "analyze Figma" and get confident bullet points with no citations, no dates, and no way to know if any of it is real. One product manager on Reddit put it perfectly: *"AI competitive analysis is just AI making things up in bullet points."*

The existing paid tools (Crayon, Klue, Kompyte) solve this by continuously indexing competitors — but they cost $15k–$30k/year and don't work for early-stage PMs who just need a quick check on a new competitor.

---

## Who it's for

**Primary:** Early-stage and solo product managers who need quick competitive context before a meeting, pitch, or decision — and can't afford $20k/year for a Crayon seat.

**Secondary:** Founders doing a pre-build market check. Investors doing quick diligence. Anyone who's been burned by an AI that made things up.

---

## How it works

One agent, three moves:

1. **SEARCH** — queries Jina for the product's homepage, pricing page, changelog, and a third-party review/complaints page
2. **FETCH** — reads the actual pages (not cached summaries) via Jina Reader
3. **WRITE** — synthesizes a six-facet teardown: Positioning, ICP, Pricing, Recent Moves, Strengths, Weaknesses

The agent is instructed: *no source, no claim.* If it can't find a source, the item goes to "Couldn't verify" — shown openly, not fabricated.

---

## Tools and stack

- **Next.js 16 + Vercel** — framework and deploy
- **Groq API + Llama 3.3 70B** — research phase (free, no credit card)
- **Groq API + GPT-OSS 120B** — synthesis phase (free, no credit card)
- **Jina** — web search and page fetch (free, keyless)
- **Framer Motion** — UI animations (word-by-word claim reveal, 3D dossier card, scroll parallax)
- **Novus / Pendo Agent Analytics** — every teardown tracked as a conversation with tool calls

The entire AI stack is free and requires no credit card — a deliberate constraint that makes it genuinely accessible.

---

## Novus integration

Every teardown session emits two events to Pendo's Agent Analytics:

- `prompt` event when a target is submitted (captures: target, surface)
- `agent_response` event on completion (captures: tool calls by type, models used, claim count, unverified count, status)

The goal event `teardown_shared_or_exported` fires from the ShareBar whenever a user copies the link, exports Markdown, or shares.

This maps directly to what Novus's dashboard shows best: a tool-heavy agent (3-7 tool calls per session) with two distinct models and a measurable goal event.

---

## What I learned

**The hard thing wasn't the AI.** Getting LLMs to output structured, cited teardowns is solvable with the right prompt design (TEXT protocol, no native tool-calling, strict emit schema). The hard thing was *epistemic honesty as a product feature* — most LLMs fight you on admitting uncertainty, and you have to be explicit that showing gaps is better than filling them with plausible-sounding guesses.

**Speed matters more than coverage.** 45 seconds is acceptable. 90 seconds feels like failure. This shaped every decision: fewer round-trips, tighter prompts, streaming so the user sees progress.

**Motion is trust.** The cinematic "gathering evidence" loading state — showing each WEB_SEARCH and FETCH call in real time — isn't decoration. It's the product's core claim made visible: *I am reading real pages right now.* Hiding that process would undermine the whole point.

---

## Video demo script (2 min)

_[Record in Loom — share publicly or unlisted]_

**0:00–0:20** — Problem: "AI competitive teardowns are confabulation machines. Here's what Receipts does instead."

**0:20–0:45** — Demo: Type "Raycast" in the intake, hit Run. Watch the live tool log (WEB_SEARCH → FETCH entries appearing in real time).

**0:45–1:20** — Result: Walk through one facet — hover a source chip to show it links to the real page. Point to the "Couldn't verify" block. "These are the things it couldn't back up. It's showing you the gap, not inventing an answer."

**1:20–1:50** — Novus: Open the Agent Analytics dashboard. "Every teardown session shows up here with its tool calls, models used, and whether the user shared the result."

**1:50–2:00** — CTA: "Free, no login. Paste any competitor and get receipts."
