# Devpost submission — copy/paste pack

Everything below is ready to paste into the Devpost form fields. Files to upload are in this `submission/` folder.

---

## 1. Project name
```
Receipts
```

## 2. Elevator pitch / tagline (≤200 chars)
```
Paste any product. One AI agent reads its real pages and writes a competitive teardown where every claim links to its source — and openly flags what it couldn't verify. No source, no claim.
```

## 3. Built with (comma-separated tags)
```
next.js, react, typescript, tailwind-css, framer-motion, groq, llama-3.3-70b, gpt-oss-120b, jina, server-sent-events, vercel, pendo, novus
```

## 4. "Try it out" links
- **Live app:** https://receipts-murex.vercel.app
- **Source code:** https://github.com/elangovanvp/Receipts

## 5. Thumbnail image (3:2, upload this)
`submission/receipts-thumbnail.png`  (1200×800)

## 6. Video demo link
Paste your YouTube/Loom URL here after recording (see `VIDEO_PROMPT.md`). Keep it under 3:00.

## 7. Image gallery (upload 3–5; screenshot the live app)
Recommended shots, in order:
1. `submission/receipts-thumbnail.png` (or the hero of the live site)
2. A finished teardown showing the **source/Exhibit chips** on each claim
3. The **"Couldn't verify"** block
4. The live **"gathering evidence"** loading state (the WEB_SEARCH / FETCH log)
5. Your **Novus dashboard** (Conversations + Tools-used + Models-used)

Also available: `receipts-logo-lockup.png`, `receipts-icon-512.png`.

---

## 8. About the project (paste into the story box — Markdown)

## Inspiration
Product managers have quietly stopped trusting AI for competitive analysis, and they say so plainly. One on r/ProductManagement called AI teardowns "confabulated fairy tales… certainty we don't really have." Another fed ChatGPT the actual release notes and *still* got hallucinations, then "went back to reading them all myself." The tool that promised to save time had turned them into its fact-checker. We wanted to build the opposite: an AI teardown you can trust, because it proves every word.

## What it does
Paste any product — a competitor, a hot startup, your own. In under a minute, one AI agent reads the product's real homepage, pricing page, changelog, and third-party reviews, then writes a sharp six-facet teardown — **Positioning, ICP, Pricing, Recent moves, Strengths, Weaknesses** — where **every claim links to the exact source page it came from**. Anything it can't back with a source isn't asserted; it goes into a visible **"Couldn't verify"** block. One rule governs everything: **no source, no claim.** No login, no account, free to use.

## How we built it
- **Next.js 16 (App Router) on Vercel**, with one streaming API route over Server-Sent Events.
- A **single server-side agent** using a deliberately model-agnostic *text protocol*: the model replies one line at a time — `SEARCH: <query>` or `FETCH: <url>` — and the server runs the tool and streams results back. This sidesteps the native tool-call mis-formatting that open models hit on Groq.
- **Two free models on Groq**: Llama 3.3 70B gathers the evidence; GPT-OSS 120B writes the teardown.
- **Jina** (free, keyless) for web search and clean page reading.
- A cinematic **"gathering evidence" loading state** that streams the agent's *real* tool calls live, so you watch it read actual pages.
- **Novus / Pendo Agent Analytics** instruments every session — tool calls, models used, and goal completion.
- A "detective dossier" design system: receipt-stamp **Exhibit** chips, a wax-seal mark, and an amber highlighter that lands only on corroborated claims.
- **100% free AI stack, no credit card.**

## Challenges we ran into
- **Making the model admit uncertainty.** LLMs would rather sound confident than say "I couldn't verify this." Enforcing *no source, no claim* took explicit prompt design and a hard rule that routes unsourced findings into the "Couldn't verify" block.
- **Reliable fetching.** JS-heavy and fetch-blocking sites make output target-dependent; we fall back to search snippets, lower the confidence badge, and still cite — never fabricate.
- **Speed.** 45 seconds feels fine; 90 feels broken. We trimmed round-trips and streamed progress so the wait reads as work being done.
- **Polish under pressure.** We caught and removed a smooth-scroll library that was capping page height and hiding the bottom of long teardowns — fixed before submission.

## Accomplishments that we're proud of
- A product whose entire thesis is **honesty**, that holds itself to the same bar — no fabricated metrics in our own pitch.
- The **"Couldn't verify"** block: the rare AI demo that brags about what it *won't* say.
- A coherent, hand-crafted design system that feels intentional, not template-generated.
- Genuinely **free and instant** — accessible to the solo and early-stage PMs that $15k–$30k/yr competitive-intelligence tools ignore.

## What we learned
The future of useful AI isn't more confident output — it's more **honest, grounded, citable** output. Showing the gap is more valuable than filling it. And motion can be substance: making the agent's real searches and fetches visible *is* the product's core claim, made tangible.

## What's next for Receipts
Tracked competitors with diffs over time, scheduled re-runs, deeper third-party sourcing, and team sharing — every extension keeps the same rule: **no source, no claim.**
