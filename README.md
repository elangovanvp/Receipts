# Receipts — Competitive teardowns that show their sources

**Paste any product. Get a sharp competitive teardown in under a minute where every claim links to its real source — and the agent shows you what it couldn't verify instead of making it up.**

Live demo: _[paste your Vercel URL here after deploy]_

---

## The problem

Every AI competitive-analysis tool confabulates. Paste "analyze Linear vs Jira" and you get confident bullet points with no citations, no dates, and no way to know what's real. Product managers caught sharing hallucinated teardowns in Slack have stopped trusting AI for this workflow entirely.

## What Receipts does differently

One agent. Three moves:

1. **Searches** the web for the product's homepage, pricing, changelog, and third-party reviews
2. **Fetches** the real pages — no summarization from training data
3. **Writes** a six-facet teardown (positioning, ICP, pricing, recent moves, strengths, weaknesses) where **every claim has a citation chip linking to the exact source page**

Anything the agent couldn't source goes into a visible **"Couldn't verify"** block — not fabricated, not silently dropped. Epistemic honesty is the product.

## Features

- No login, no account — open to any visitor
- Six-facet teardown in ~45 seconds
- Every claim stamped with a source link
- "Couldn't verify" block for unsourced items
- Share via direct link or export as Markdown
- 100% free AI stack — no credit card required

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | Tailwind v4 + Framer Motion 12 |
| LLM (research) | Groq API + Llama 3.3 70B |
| LLM (synthesis) | Groq API + GPT-OSS 120B |
| Search + fetch | Jina (free, keyless) |
| Instrumentation | Novus / Pendo Agent Analytics |
| Deploy | Vercel |

## Run locally

```bash
git clone https://github.com/elangovanvp/Receipts.git
cd Receipts
npm install

# Copy env template
cp .env.example .env.local
# Add your free Groq key from console.groq.com/keys
# GROQ_API_KEY=gsk_...

npm run dev
# → http://localhost:3000
```

Without a `GROQ_API_KEY`, the app serves a bundled sample teardown of Linear so you can still see the full UI.

## Deploy to Vercel

1. Fork this repo
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add env var: `GROQ_API_KEY` = your key from [console.groq.com/keys](https://console.groq.com/keys)
4. Deploy → live in ~90 seconds

## Hackathon

Built for **World Product Day 2026 — "Everyone Ships Now"** hackathon by Mind the Product × Pendo.

Submission date: June 20, 2026
