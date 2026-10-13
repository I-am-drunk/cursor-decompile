# LOGIN PAGE V2 — rebuilt around the raycast.com load animation (2026-10-13)

> Branch `design-login`. Spec is law before code (GOAL-SYSTEM §1). Supersedes
> `docs/LOGIN-PAGE-SPEC.md` (plan-devin-mashup) options A/B/C: the background is now the
> raycast.com load animation, replicated exactly and re-engineered to be instant. The form is
> unchanged from the baseline: Cursor settings geometry, copied not designed.
>
> Inputs: `docs/interactions/raycast-animation.md` + `docs/RAYCAST-ANIMATION.md` +
> `reference/raycast/proof.html` (Astra, branch ref-raycast-animation); raycast.com live;
> `docs/ATSU-UI-PRINCIPLES.md` (ref-atsu); baseline spec above.
>
> Pass log: P1 skeleton · P2 · P3 · P4 · P5 (each pass simpler than the last).

## 0. Decisions

| # | Decision | Status | Basis |
|---|---|---|---|
| V1 | Background = raycast.com cube/glass WebGL scene, framework-free, first frame ≤ 100 ms | DESIGN | VISION-BRIEF "today" |
| V2 | Form geometry = baseline §3 verbatim (card 360, inputs 28/6, label 13) | EXTRACTED | LOGIN-PAGE-SPEC L1/L2 |
| V3 | Scrim between scene and card guarantees ≥ 4.5:1 on every frame | DESIGN | WCAG AA |
| V4 | Two-tone: dark = source palette; light = TBD (no extracted palette) | GAP | raycast-animation.md "Theme" |
| V5 | Reduced motion = static settled frame (t = ∞ pose), no WebGL loop | DESIGN | baseline L5 |
| V6 | Form never depends on the scene; scene failure = flat page color | DESIGN | baseline L6 |

## 1. Open questions (answer before P3)

- OQ1 Light-theme palette: derive from source by inverting background only, or author?
- OQ2 Does the source animation ever settle, or is it a 200 s loop then freeze?
- OQ3 Pointer parallax on the login page: keep (source) or drop (form focus)?
- OQ4 Instant-load target: what is the gzipped size of the extracted shaders?
