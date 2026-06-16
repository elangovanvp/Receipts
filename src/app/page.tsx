import { Landing } from "@/components/Landing";
import { Reveal } from "@/components/primitives";

const STEPS = [
  {
    n: "01",
    title: "Name a product",
    body: "A competitor, a hot startup, or your own. A name or a URL — that's the whole setup.",
  },
  {
    n: "02",
    title: "The agent gathers evidence",
    body: "One agent, two tools: it searches the open web and reads the real pages — homepage, pricing, changelog, reviews.",
  },
  {
    n: "03",
    title: "You get a sourced teardown",
    body: "Every claim carries a receipt you can open. Anything it couldn't back goes to “Couldn't verify” — shown, never invented.",
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      <Landing />

      {/* ---- How it works ---- */}
      <section id="how" className="border-t border-rule scroll-mt-4">
        <div className="mx-auto w-full max-w-[72rem] px-6 py-20 sm:py-28">
          <Reveal>
            <p className="t-chip text-ink-faint">The method</p>
            <h2 className="t-h2 mt-3 text-ink max-w-[20ch]">
              How a teardown gets made.
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-px overflow-hidden rounded-[16px] border border-border sm:grid-cols-3 bg-border">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08} className="bg-paper p-7">
                <span className="t-chip text-amber-ink">{s.n}</span>
                <h3 className="t-h4 mt-4 text-ink">{s.title}</h3>
                <p className="t-body text-ink-muted mt-2.5">{s.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Manifesto / trust moment ---- */}
      <section className="border-t border-rule bg-ink text-paper">
        <div className="mx-auto w-full max-w-[60rem] px-6 py-24 sm:py-32 text-center">
          <Reveal>
            <p className="t-chip text-paper/50">The discipline</p>
            <blockquote className="mt-6">
              <p className="t-h1 text-paper text-balance">
                No source,{" "}
                <span className="italic" style={{ color: "#F1C84B" }}>
                  no claim.
                </span>
              </p>
            </blockquote>
            <p className="t-body-lg text-paper/70 mt-7 max-w-[52ch] mx-auto">
              Most AI competitive analysis hands you confident nonsense. Receipts
              does the opposite: it would rather show you a gap than fill it with
              a guess. The honesty is the product.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="border-t border-rule">
        <div className="mx-auto w-full max-w-[72rem] px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="t-chip text-ink flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber" />
            RECEIPTS
          </span>
          <p className="t-small text-ink-faint max-w-[40ch]">
            Built for World Product Day. One agent, two tools, zero unsourced
            claims.
          </p>
        </div>
      </footer>
    </main>
  );
}
