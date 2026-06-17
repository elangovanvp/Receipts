"use client";

import { motion } from "framer-motion";
import type { Teardown } from "@/lib/types";
import { revealStagger } from "@/lib/motion";
import { CountUp, Eyebrow, Reveal } from "./primitives";
import { ClaimLine } from "./ClaimLine";
import { CouldntVerify } from "./CouldntVerify";
import { domainOf } from "@/lib/utils";

export function TeardownView({
  teardown,
  showShare,
}: {
  teardown: Teardown;
  showShare?: React.ReactNode;
}) {
  const claimCount = teardown.facets.reduce((n, f) => n + f.claims.length, 0);

  return (
    <article className="w-full">
      {/* Case-file header */}
      <Reveal as="header" className="mb-10">
        <Eyebrow>
          Case file · <CountUp value={claimCount} /> claims ·{" "}
          <CountUp value={teardown.unverified.length} /> unverified
        </Eyebrow>
        <h2 className="t-h1 mt-3 text-ink">
          The teardown:{" "}
          <span className="italic text-amber-ink">{teardown.target}</span>
        </h2>
        {teardown.tagline && (
          <p className="t-body-lg text-ink-muted mt-4 max-w-[58ch]">
            {teardown.tagline}
          </p>
        )}
        {teardown.canonicalUrl && (
          <a
            href={teardown.canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 t-micro text-ink-faint hover:text-amber-ink transition-colors"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber" />
            {domainOf(teardown.canonicalUrl)} ↗
          </a>
        )}
        {showShare && <div className="mt-7">{showShare}</div>}
      </Reveal>

      {/* Exhibits */}
      <div className="space-y-12">
        {teardown.facets.map((facet) => (
          <Reveal as="section" key={facet.key}>
            <Eyebrow exhibit={facet.exhibit} className="mb-3">
              {facet.label}
            </Eyebrow>
            <motion.ul
              variants={revealStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="border-t border-rule"
            >
              {facet.claims.map((claim, i) => (
                <ClaimLine key={claim.id} claim={claim} index={i} />
              ))}
            </motion.ul>
          </Reveal>
        ))}
      </div>

      {/* The honesty moment */}
      <div className="mt-12">
        <CouldntVerify items={teardown.unverified} />
      </div>
    </article>
  );
}
