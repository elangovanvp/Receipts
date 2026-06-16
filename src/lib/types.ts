export type Confidence = "high" | "medium";

export interface Source {
  title: string;
  url: string;
  /** Optional exact quote pulled from the page — the literal "receipt". */
  quote?: string;
}

export interface Claim {
  id: string;
  /** Sharp, specific, one-sentence claim. */
  text: string;
  source: Source;
  confidence: Confidence;
}

export interface Facet {
  /** stable key: positioning | icp | pricing | recent | strengths | weaknesses */
  key: string;
  /** Human label, e.g. "Positioning" */
  label: string;
  /** "A".."F" — the case-file exhibit marker */
  exhibit: string;
  claims: Claim[];
}

export interface Unverified {
  /** What the agent looked for but could NOT back with a source. */
  text: string;
  /** Why it couldn't be verified (optional). */
  reason?: string;
}

export interface Teardown {
  target: string;
  canonicalUrl?: string;
  /** One-line, sharp read of the product. */
  tagline?: string;
  facets: Facet[];
  unverified: Unverified[];
  generatedAt?: string;
}

/** Server-Sent-Event payloads streamed from /api/teardown. */
export type StreamEvent =
  | { type: "status"; tool: "web_search" | "fetch_url"; label: string }
  | { type: "meta"; target: string; canonicalUrl?: string; tagline?: string }
  | { type: "claim"; facet: Omit<Facet, "claims">; claim: Claim }
  | { type: "unverified"; item: Unverified }
  | { type: "done"; teardown: Teardown }
  | { type: "error"; message: string };
