import type { Teardown } from "./types";

/**
 * A real, source-backed sample teardown used for the hero demo and as an
 * offline fallback. Every claim points at a real public page. Anything we
 * can't cleanly source lives in `unverified` — same discipline as the agent.
 */
export const SAMPLE_LINEAR: Teardown = {
  target: "Linear",
  canonicalUrl: "https://linear.app",
  tagline:
    "An opinionated, keyboard-first issue tracker that wins on speed and taste — and asks you to work its way.",
  facets: [
    {
      key: "positioning",
      label: "Positioning",
      exhibit: "A",
      claims: [
        {
          id: "pos-1",
          text: "Positions itself as the purpose-built tool for planning and building software products — not a general project manager.",
          confidence: "high",
          source: {
            title: "Linear — homepage",
            url: "https://linear.app",
            quote: "The tool for modern product development.",
          },
        },
        {
          id: "pos-2",
          text: "Speed is the explicit headline promise — the product is marketed around being fast and keyboard-driven.",
          confidence: "high",
          source: {
            title: "Linear — Method",
            url: "https://linear.app/method",
            quote: "Built on strong opinions about how to build software.",
          },
        },
      ],
    },
    {
      key: "icp",
      label: "Who it's for",
      exhibit: "B",
      claims: [
        {
          id: "icp-1",
          text: "Targets software product and engineering teams — from startups to scaling companies.",
          confidence: "high",
          source: {
            title: "Linear — Customers",
            url: "https://linear.app/customers",
          },
        },
        {
          id: "icp-2",
          text: "Publicly names software-native companies (e.g. Ramp, Vercel, Cash App) as reference customers.",
          confidence: "medium",
          source: {
            title: "Linear — Customers",
            url: "https://linear.app/customers",
          },
        },
      ],
    },
    {
      key: "pricing",
      label: "Pricing",
      exhibit: "C",
      claims: [
        {
          id: "pri-1",
          text: "Offers a free tier alongside paid Basic, Business, and Enterprise plans.",
          confidence: "high",
          source: {
            title: "Linear — Pricing",
            url: "https://linear.app/pricing",
          },
        },
        {
          id: "pri-2",
          text: "Paid plans are priced per user, per month, with a discount for annual billing.",
          confidence: "high",
          source: {
            title: "Linear — Pricing",
            url: "https://linear.app/pricing",
          },
        },
      ],
    },
    {
      key: "recent",
      label: "What shipped recently",
      exhibit: "D",
      claims: [
        {
          id: "rec-1",
          text: "Has been shipping agent-facing features, exposing issues and workflows to AI agents.",
          confidence: "medium",
          source: {
            title: "Linear — Changelog",
            url: "https://linear.app/changelog",
          },
        },
        {
          id: "rec-2",
          text: "Expanded planning primitives beyond issues — Projects, Initiatives, and Cycles.",
          confidence: "high",
          source: {
            title: "Linear — Features",
            url: "https://linear.app/features",
          },
        },
      ],
    },
    {
      key: "strengths",
      label: "Where it's strong",
      exhibit: "E",
      claims: [
        {
          id: "str-1",
          text: "Interaction speed and keyboard-first UX are its most consistently praised qualities in user reviews.",
          confidence: "medium",
          source: {
            title: "Linear reviews — G2",
            url: "https://www.g2.com/products/linear/reviews",
          },
        },
      ],
    },
    {
      key: "weaknesses",
      label: "Where it's weak",
      exhibit: "F",
      claims: [
        {
          id: "wk-1",
          text: "Its opinionated workflow is also the top complaint — teams wanting deep customization find it restrictive versus Jira.",
          confidence: "medium",
          source: {
            title: "Linear reviews — G2 (cons)",
            url: "https://www.g2.com/products/linear/reviews",
          },
        },
      ],
    },
  ],
  unverified: [
    {
      text: "Exact number of paying customers / total companies using Linear.",
      reason: "No authoritative public figure found on linear.app or filings.",
    },
    {
      text: "Current annual recurring revenue (ARR).",
      reason: "Not disclosed publicly; press estimates conflict and aren't primary sources.",
    },
    {
      text: "The precise dollar price of each paid tier as of today.",
      reason: "Pricing page is JS-rendered; numbers couldn't be read with confidence.",
    },
  ],
  generatedAt: "sample",
};

/** A few one-click targets to give a stranger value in seconds. */
export const EXAMPLE_TARGETS = ["Linear", "Notion", "Vercel", "Arc"];
