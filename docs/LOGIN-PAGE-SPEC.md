# LOGIN PAGE SPEC — custom animated background (2026-10-12)

> Branch `plan-devin-mashup`. Planning deliverable; no implementation. The login page is the
> **one surface where a designed element is allowed** (MASHUP-PLAN M9): the background. The
> form itself copies Cursor settings geometry; the account model is `facts/account-login.md`
> (local email + password, scrypt, 7-day sessions; Google OAuth deferred).
>
> Evidence: Cursor S01/S-ACCOUNT input geometry (28px inputs, 6px radius, 13px/18px text,
> 0 8px padding), Cursor tokens (MASHUP-PLAN §0), Devin login page contract (3.10.31 api
> dossier §5.3: `redirect`, `login_hint`, error banner, signup link — shape only), existing
> login markup in `cursor-product-login/src/auth/login.html` (DESIGN, UNVERIFIED layout).

## 0. Decisions

| # | Decision | Basis |
|---|---|---|
| L1 | Full-bleed page, no app shell. Centered card `min(360px, 100vw − 96px)`, 32px padding, 12px radius, elevated background token, 1px `--border-secondary`. | existing login.css; Cursor radii |
| L2 | Form = `Email`, `Password`, primary `Sign in`; first-run variant `Create account`. Inputs are Cursor's 28px/6px settings inputs; button is C-BUTTON primary. Error line `role=alert` in `--text-red`. | S-ACCOUNT pins; account-login.md |
| L3 | Query params honoured: `redirect` (post-login path, default `/`), `login_hint` (prefill email). | Devin login §5.3 shape |
| L4 | Background: one of three options in §2, chosen by the owner; all share the budget in §1. Default recommendation: **Option A (drifting gradient mesh)**. | this doc |
| L5 | `prefers-reduced-motion: reduce` → static first frame; no JS animation loop starts. Page must be fully usable with the background removed. | RESTART §4 "no half-working motion" |
| L6 | Background is a single owned component `LoginBackdrop.tsx` + `login-backdrop.css`; the form never depends on it. | shadcn ownership doctrine |

## 1. Shared performance budget (applies to every option)

| Constraint | Value | Why |
|---|---|---|
| Main-thread JS per frame | 0 ms steady state for A and B (pure CSS); ≤ 2 ms for C | login must not jank the password manager autofill |
| GPU layers | ≤ 3 composited layers, each `will-change: transform` or `opacity` only | no layout/paint per frame |
| Animated properties | `transform`, `opacity`, `filter: blur()` on a pre-blurred layer only | compositor-only |
| Frame rate | 60 fps on an M1 Air at 1512×982; degrade by lowering `--motion-scale`, never by dropping frames | measured in CU pass |
| Period | ≥ 20 s loops, eased; nothing repeats visibly within a form fill | "not gimmicky" |
| Contrast | card and text contrast ≥ 4.5:1 on any frame; background luminance range clamped to ±8% | WCAG AA |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` → `animation: none`, canvas not mounted | L5 |
| Battery | `document.hidden` → pause (CSS pauses automatically; C stops its rAF) | laptop users |
| Size | ≤ 4 KB CSS + ≤ 3 KB JS gzipped; no library | one owned file each |
| Theme | reads the same `--bg-page`, `--bg-accent-primary`, `--text-accent-primary` tokens as the app; light and dark variants | MASHUP-PLAN §0 |

## 2. The three options (pick one; A recommended)

### Option A — Drifting gradient mesh (pure CSS, recommended)

Three large radial-gradient blobs in the accent hue family, pre-blurred, each on its own
composited layer, drifting on 28 s / 36 s / 44 s `transform` loops so the composition never
visibly repeats. Reads as "lit from behind", not as motion.

```css
.backdrop { position: fixed; inset: 0; overflow: hidden; background: rgb(var(--bg-page)); }
.blob { position: absolute; width: 60vmax; height: 60vmax; border-radius: 50%;
        filter: blur(80px); opacity: .45; will-change: transform;
        background: radial-gradient(closest-side, rgb(var(--bg-accent-primary) / .55), transparent 70%); }
.blob:nth-child(1) { top: -20vmax; left: -10vmax; animation: driftA 28s ease-in-out infinite alternate; }
.blob:nth-child(2) { bottom: -25vmax; right: -15vmax; opacity: .35;
        background: radial-gradient(closest-side, rgb(var(--text-purple) / .45), transparent 70%);
        animation: driftB 36s ease-in-out infinite alternate; }
.blob:nth-child(3) { top: 30%; left: 40%; width: 40vmax; height: 40vmax; opacity: .25;
        animation: driftC 44s ease-in-out infinite alternate; }
@keyframes driftA { to { transform: translate(12vmax, 8vmax) scale(1.08); } }
@keyframes driftB { to { transform: translate(-10vmax, -6vmax) scale(0.94); } }
@keyframes driftC { to { transform: translate(-6vmax, 10vmax); } }
@media (prefers-reduced-motion: reduce) { .blob { animation: none; } }
```

Implementation: `LoginBackdrop.tsx` renders `<div class="backdrop" aria-hidden><div class="blob"/>×3</div>`
before the card. `blur()` is static on a layer that only transforms, so Chromium/WebKit
rasterise it once. Dark theme uses the same tokens at opacity ×0.8. Cost: 3 layers, 0 ms JS.

### Option B — Slow aurora bands (pure CSS, conic gradient + mask)

Two full-width bands of a conic gradient, masked to soft horizontal ribbons, rotating very
slowly (`transform: rotate`) behind a `mix-blend-mode: plus-lighter` layer. Reads as northern
lights at 5% opacity; stronger in dark theme, barely-there in light.

```css
.aurora { position: fixed; inset: -20%; will-change: transform;
          background: conic-gradient(from 180deg at 50% 50%,
            rgb(var(--bg-accent-primary) / .35), rgb(var(--text-purple) / .25),
            rgb(var(--text-green) / .18), rgb(var(--bg-accent-primary) / .35));
          -webkit-mask: linear-gradient(180deg, transparent 20%, #000 40%, #000 60%, transparent 80%);
          mask: linear-gradient(180deg, transparent 20%, #000 40%, #000 60%, transparent 80%);
          filter: blur(60px); opacity: .5; animation: auroraSpin 60s linear infinite; }
.aurora + .aurora { animation-duration: 84s; animation-direction: reverse; opacity: .3; }
@keyframes auroraSpin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .aurora { animation: none; } }
```

Two layers, 0 ms JS. Trade-off vs A: more "designed", slightly higher GPU fill (full-viewport
blur ×2); clamp `opacity` so the luminance budget in §1 holds. Best in dark theme.

### Option C — Constellation drift (canvas, ≤ 2 ms/frame)

~70 points drifting at ≤ 6 px/s with lines between neighbours under 120 px, drawn in the
accent token at 10–18% alpha on a `<canvas>` sized to the viewport at DPR ≤ 2. The only
option with JS; justified only if the owner wants something that reacts to the pointer
(points gently repel within 80 px).

Implementation notes:
- `requestAnimationFrame` loop; integrate positions with `dt` clamped to 50 ms; `ctx.clearRect`
  then one `beginPath` for all lines and one for all points (two draw calls per frame).
- Neighbour search on a 120 px uniform grid, not O(n²).
- Stop the loop on `document.hidden`, on `prefers-reduced-motion`, and after form submit.
- Colour from `getComputedStyle(root).getPropertyValue('--bg-accent-primary')`, re-read on
  theme change; no hard-coded colours.
- Fallback when canvas is unavailable: Option A's static first frame.

## 3. The form (copied, not designed)

| Element | Spec | Source |
|---|---|---|
| Card | `min(360px, 100vw − 96px)`, padding 32px, radius 12px, `--bg-elevated`, 1px `--border-secondary`, shadow `--shadow-L2` | existing login.css + Devin shadow token (3.10.48 css-theme) |
| Heading | product name 20px/28px (S01 title), subheading `Sign in` / `Create account` 13px secondary | S-ACCOUNT pins |
| Fields | `Email` (autocomplete `username`), `Password` (autocomplete `current-password`, min 12); label 13px above, input 28px, radius 6px, padding 0 8px, 13px/18px | S-ACCOUNT input pins; account-login.md |
| Button | full-width primary, C-BUTTON geometry; disabled while submitting | C-BUTTON |
| Error | `role=alert`, `--text-red`, 12px, under the button | Devin manifest-editor error style |
| Links | none in v1 (no reset, no signup after first account; 409 shown as error) | account-login.md |
| Focus | `focus-visible` ring uses `--border-accent-primary`, 2px, offset 3px | existing login.css |

## 4. Comparison and recommendation

| | A Gradient mesh | B Aurora bands | C Constellation |
|---|---|---|---|
| JS | none | none | rAF loop ≤ 2 ms |
| Layers | 3 | 2 | 1 canvas |
| Light theme | good | faint | good |
| Dark theme | good | best | good |
| Gimmick risk | lowest | low | medium (pointer reaction) |
| Reduced motion | static blobs | static ribbon | static dots |

**Recommend A.** It is the quietest, works in both themes from tokens alone, and needs no
script. B if the owner wants dark-first drama; C only if pointer reaction is wanted.

## 5. Acceptance

- CU pass at 1270×764 and 1512×982, light and dark, DPR 2: card contrast ≥ 4.5:1 sampled on
  five frames across one animation period.
- Chrome performance trace over 30 s idle: no main-thread task > 4 ms (A, B); ≤ 2 ms per
  frame (C); compositor-only animation confirmed in the Layers panel.
- `prefers-reduced-motion: reduce` emulation: no `animation` computed on any backdrop element,
  no rAF registered.
- Form geometry pins: input 28px/6px, label 13px, card 360px, radius 12px.
- Password-manager autofill works with the backdrop present (no pointer interception:
  backdrop is `pointer-events: none`, `aria-hidden`).
- Login journey (RESTART §4 critical path) passes with the backdrop removed via feature flag.
