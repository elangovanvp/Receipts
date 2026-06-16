"use client";

import { useState } from "react";
import { Button } from "./primitives";
import { EXAMPLE_TARGETS } from "@/lib/sample";

export function TeardownInput({
  onRun,
  busy,
  autoFocus,
}: {
  onRun: (target: string) => void;
  busy?: boolean;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState("");

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const t = value.trim();
    if (t && !busy) onRun(t);
  };

  return (
    <div className="w-full">
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 t-micro text-ink-faint">
            ↳
          </span>
          <input
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={autoFocus}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Paste a product name or URL…"
            aria-label="Product name or URL to tear down"
            disabled={busy}
            className="w-full h-12 rounded-[10px] border border-border-strong bg-paper pl-9 pr-4 t-body text-ink placeholder:text-ink-faint focus:border-amber transition-colors"
          />
        </div>
        <Button type="submit" disabled={busy} className="px-6 shrink-0">
          {busy ? "Gathering evidence…" : "Tear it down"}
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="t-micro text-ink-faint">OR TRY:</span>
        {EXAMPLE_TARGETS.map((t) => (
          <button
            key={t}
            type="button"
            disabled={busy}
            onClick={() => onRun(t)}
            className="t-micro rounded-full border border-border px-3 py-1 text-ink-muted hover:border-amber hover:text-amber-ink transition-colors disabled:opacity-50"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
