# DESIGN-SYSTEM.md — Receipts

The implemented system. Tokens live in `src/app/globals.css` (`@theme`), motion helpers in `src/lib/motion.ts`, utility in `src/lib/utils.ts`. Tailwind v4 (CSS-first).

## 1. Color tokens → Tailwind classes
| token | hex / value | Tailwind |
|---|---|---|
| paper | `#F5F3EC` | `bg-paper` |
| paper-2 | `#EFEDE4` | `bg-paper-2` |
| paper-sunk | `#E7E4D8` | `bg-paper-sunk` |
| ink | `#1A1916` | `text-ink` `bg-ink` |
| ink-muted | `#57544C` | `text-ink-muted` |
| ink-faint | `#8A877C` | `text-ink-faint` |
| amber | `#E0A300` | `text-amber` `bg-amber` (decorative only) |
| amber-ink | `#6B4E00` | `text-amber-ink` (amber-colored text) |
| amber-hi | `rgba(224,163,0,.32)` | highlighter fill |
| redact | `#14130F` | `bg-redact` |
| verified | `#2F7A4D` | `text-verified` |
| error | `#B0341F` | `text-error` |
| rule / border / border-strong | ink @ 12/18/32% | `border-rule` etc. |

**Rule:** pure `amber` never on body text (fails contrast) — use it for the highlighter underlay, icon strokes, and focus rings; use `amber-ink` for amber *text*.

## 2. Typography → utility classes
Fonts via `next/font`: `--font-fraunces` (display serif), `--font-geist-sans` (UI/body), `--font-geist-mono` (chips). Helper classes defined in globals: `.t-display .t-h1 .t-h2 .t-h3 .t-h4 .t-body-lg .t-body .t-small .t-chip .t-micro`. Chips/eyebrows always `uppercase`.

## 3. Spacing / radius / shadow
Spacing: Tailwind default 4px scale; section gaps use `py-32` (128px) / hero `py-48` (192px). Radius: `--radius-sm 6px` `--radius 10px` `--radius-lg 16px` `--radius-stamp 4px`. Shadow: `--shadow-card 0 1px 2px rgba(26,25,22,.06)` · `--shadow-lift 0 8px 30px rgba(26,25,22,.10)`. Container measure: `max-w-[46rem]` for reading, `max-w-[72rem]` for layout.

## 4. Motion tokens (`src/lib/motion.ts`)
```
EASE.expo  = [0.16, 1, 0.3, 1]
EASE.quart = [0.25, 1, 0.5, 1]
EASE.stamp = [0.34, 1.56, 0.64, 1]
DUR = { hover:.15, swipe:.38, stamp:.42, cv:.5, reveal:.6 }
```
Variants exported: `reveal`, `revealStagger`, `stampIn`, `couldntVerify`. All read `useReducedMotion()` and degrade to opacity-only.

## 5. Component inventory (hand-built, award-quality)
- `CursorSeal` — the signature cursor-reactive hero object (P1).
- `ClaimLine` — a verified claim with highlighter swipe (P4) + `SourceChip`.
- `SourceChip` — stamped mono citation chip (P3, P5) → opens `SourcePopover`.
- `SourcePopover` — footnote-on-hover citation card (P6, Radix, keyboard-safe).
- `CouldntVerify` — quiet redaction block (P7).
- `TeardownInput` — single input + one-click example chips.
- `TeardownView` — streaming claims grouped by facet (EXHIBIT A…F) (P2, P8).
- `ShareBar` — prominent copy/export/share = the Novus goal action.
- Primitives: `Button`, `Eyebrow`, `Rule`, `Reveal` (scroll-reveal wrapper).

## 6. Signature interactions (the only places motion gets loud)
1. **CursorSeal** — alive, pointer-reactive, graceful idle.
2. **Highlighter swipe** — verified claims get "marked" after they land.
3. **Stamp press-in** — source chips press in like evidence tags.
Everything else: calm, fast, ink-on-paper. The **Couldn't-verify block is quieter than its surroundings on purpose.**

## 7. Accessibility & performance contract
GPU transforms only (`transform`/`opacity`) · `prefers-reduced-motion` honored everywhere · full keyboard nav + visible amber focus ring · semantic HTML · WCAG AA contrast · genuinely excellent mobile (hero seal scales/simplifies) · fast LCP (system renders instantly; agent streams after).
