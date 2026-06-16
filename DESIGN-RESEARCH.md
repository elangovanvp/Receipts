# DESIGN-RESEARCH.md — Receipts / "The Dossier"

Award-quality UI/UX research, grounded in current (2025–2026) best-in-class work. The through-line: **award quality comes from restraint + one live object.** Spend the entire motion budget on exactly three signature moments; everything else is calm ink-on-paper.

## Patterns we will use

| # | Pattern | Source principle | How we implement it |
|---|---|---|---|
| **P1** | **Calm + one live object** | MetaMask cursor-reactive fox — one object reacts to the pointer, everything else holds still | A cursor-reactive **wax seal / "VERIFIED" stamp** in the hero. Normalize pointer to `[-1,1]`, lerp look-vector toward target each frame (lookRate 0.3, y-bias +0.085), sine idle drift. CSS 3D transforms (no WebGL needed). [github.com/MetaMask/logo](https://github.com/MetaMask/logo) |
| **P2** | **Prove-it-with-real-UI hero** | Linear/Vercel/Stripe show the artifact, not an illustration | Hero shows a **live teardown** — input → real claims streaming in with real source chips snapping into place. No stock art, ever. |
| **P3** | **Mono technical label** | Vercel/Geist: mono-uppercase reserved strictly for technical labels | Source chips, section eyebrows ("EXHIBIT A"), metadata = Geist Mono, uppercase, tracked +0.06em, 12–13px. |
| **P4** | **Highlighter swipe** | editorial highlight | Verified claims get an amber underlay swiping in L→R: pseudo-element `scaleX(0→1)`, origin left, behind text at ~32% alpha. Signature delight #2. |
| **P5** | **Receipt-stamp press-in** | physical rubber-stamp | Source chip presses in: `scale 1.4→1, rotate -6→-4deg, opacity 0→1, blur 3→0`, back-out overshoot. Signature delight #3. |
| **P6** | **Footnote-on-hover citation** | premium editorial footnotes / MediaWiki reference tooltips | Inline source marker → Radix Popover card (title, mono domain, "view source"). Keyboard-focusable, tap-friendly. |
| **P7** | **"Couldn't verify" redaction reveal** | classified-document redaction | Redaction-black bar; **deliberately quiet** — fade + small rise only, no overshoot. The quietness is what makes it read as honest. |
| **P8** | **Editorial rhythm: hairline rules + asymmetric whitespace** | Stripe/Linear hierarchy of space | 1px ink-low-alpha rules between sections; within-group 8–24px vs between-section 128px; serif drop-cap / mono "EXHIBIT N" eyebrows. |

## Type scale (modular, ~1.25 tightening to 1.2 up top)
Display **Fraunces** (editorial serif, optical sizing) · UI/body **Geist Sans** · chips/labels **Geist Mono**. Signature detail: **negative tracking on display** (-0.025 to -0.03em), generous body line-height (1.6–1.65) for evidence reading.

| token | px | line-height | tracking | weight | use |
|---|---|---|---|---|---|
| display | 72 | 1.02 | -0.03em | 380 | hero h1 (serif) |
| h1 | 56 | 1.05 | -0.025em | 400 | page title |
| h2 | 40 | 1.10 | -0.02em | 400 | section |
| h3 | 28 | 1.20 | -0.015em | 500 | sub-section |
| h4 | 22 | 1.30 | -0.01em | 500 | card title |
| body-lg | 19 | 1.60 | 0 | 400 | lead |
| body | 16 | 1.65 | 0 | 400 | default |
| small | 14 | 1.55 | 0 | 400 | caption |
| chip | 13 | 1.40 | +0.06em | 500 | UPPERCASE mono source chips |
| micro | 12 | 1.40 | +0.08em | 500 | UPPERCASE fine labels |

## Color tokens (Dossier palette, WCAG-AA aware)
Warm paper + warm near-black ink + one amber highlighter accent + true redaction black. Pure amber is **decorative only** (highlight fill, strokes, focus ring) — amber *text* uses `--amber-ink`. All text tokens clear 4.5:1 on paper.

```
paper #F5F3EC · paper-2 #EFEDE4 · paper-sunk #E7E4D8
ink #1A1916 · ink-muted #57544C · ink-faint #8A877C
amber #E0A300 · amber-ink #6B4E00 · amber-hi rgba(224,163,0,.32) · amber-hi-2 rgba(224,163,0,.16)
redact #14130F · redact-label #A8A49A
rule rgba(26,25,22,.12) · border rgba(26,25,22,.18) · border-strong rgba(26,25,22,.32)
verified #2F7A4D · error #B0341F
```

## Spacing scale (4px base, 8px grid; big editorial jumps up top)
`4 8 12 16 24 32 48 64 96 128 192`. Within-group 8–24 · between-group 48–64 · between-section 128. Reading measure 62–68ch (~46rem container).

## Motion principles (premium = restrained, decelerating)
House curves: `--ease-out-expo cubic-bezier(.16,1,.3,1)` (signature reveals) · `--ease-out-quart cubic-bezier(.25,1,.5,1)` (hovers) · `--ease-stamp cubic-bezier(.34,1.56,.64,1)` (stamp only — the system's ONLY overshoot).

| moment | spec |
|---|---|
| scroll reveal | `y 16→0, opacity 0→1`, 600ms expo-out, stagger 80ms, trigger ~15% in, once |
| cursor hero | RAF lerp, lookRate 0.3, y-bias +0.085, idle sine periods 3/2/3s |
| stamp press-in | `scale 1.4→1, rotate -6→-4, opacity 0→1, blur 3→0`, 420ms ease-stamp |
| highlighter swipe | `scaleX 0→1` origin-left, 380ms quart-out, +120ms after line fades |
| couldn't-verify | `y 8→0, opacity 0→1`, 500ms expo-out, NO scale; label fades +150ms last |
| card hover | `translateY(-2px)` + border-strong + faint shadow, 180ms quart-out |
| button hover | bg shift + 1px inset, 150ms — no bounce |

**prefers-reduced-motion:** disable hero RAF (render static), highlighter & stamp → instant final state, scroll reveals → opacity-only (no translate). Gate Framer variants on `useReducedMotion()`.

## Sources inspected
MetaMask logo math [github.com/MetaMask/logo] · Stripe tokens [designmd.cc/benchmarks/stripe] · Vercel/Geist [seedflip.co/blog/vercel-design-system] · Anthropic palette [mobbin.com/colors/brand/claude] · Linear [blog.logrocket.com/ux-design/linear-design] · easings [easings.net, MDN cubic-bezier] · editorial footnotes [MediaWiki Reference Tooltips] · stamp CSS [codepen marlafsan].
*Third-party token extractions are grounded starting values to tune in-browser, not the companies' published specs.*
