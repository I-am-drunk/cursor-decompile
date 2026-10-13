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
> Pass log: P1 skeleton · P2 facts · P3 decisions · P4 light palette derived, React shape, Astra facts folded in · P5 simplified: two stages not three, one fallback paragraph, no dark-fallback escape hatch, delivery matches the React route.
>
> Status of inputs at P4 (2026-10-13 09:40): `docs/RAYCAST-ANIMATION.md` + interaction doc landed on
> `ref-raycast-animation`; `reference/raycast/proof.html` and `extracted/` **not yet pushed**. §2 corrected
> from Astra's doc where it contradicted my live read (r186 not r123; clear `#07090a`, CSS `#07080a`).

## 0. Decisions

| # | Decision | Status | Basis |
|---|---|---|---|
| V1 | Background = raycast.com cube/glass scene, framework-free WebGL2, first frame ≤ 100 ms | DESIGN | VISION-BRIEF; §5, §8 |
| V2 | Form geometry = baseline §3 verbatim (card 360, inputs 28/6, label 13); no transitions | EXTRACTED | LOGIN-PAGE-SPEC L1/L2 |
| V3 | Scrim = raycast `heroBackground:after` verbatim, tokenised to `--bg-page` | EXTRACTED | §6 |
| V4 | Two-tone = tone A (page: clear colour + scrim) and tone B (field: c1–c3). Both swap with the theme. Light tone B is **derived** from the source colour math (§6), not invented: source has no light palette (Astra theme-check.json). | DESIGN (derived) | §6; owner directive 2026-10-13 |
| V5 | Pointer rotation kept (source); scene is `pointer-events: none` | EXTRACTED | §7 |
| V6 | Reduced motion / no WebGL2 / context error = one settled-pose AVIF per theme, in the canvas's place | DESIGN | §7 |
| V7 | Form never depends on the scene; flag can remove it | DESIGN | baseline L6 |
| V8 | React target: `LoginPage` → `LoginCard` + `RaycastScene`; scene keyed on theme, one effect, one `failed` state | DESIGN | §10; owner directive |

## 1. Resolved questions

- Light palette: in scope (owner directive). Derived by mirroring each stop's OKLab lightness about the page lightness, hue and chroma held (§6). The shader stays verbatim; only the three uniforms change.
- Does the source settle? No. It stops at 200 s and holds the last frame; the cube is settled by ≈ 3 s.
- Pointer: kept. Rotation only; the form owns all clicks.
- Size: source ships ≈ 280 KB gz of JS for this scene; ours ≤ 18 KB gz (S1), ≤ 12 KB (S2).

## 2. The source animation — EXTRACTED facts (raycast.com, 2026-10-13 live)

Pulled live from `www.raycast.com` HTML + chunk `2c5k8hkujs8m5.js` (115 KB raw / 32 KB gz,
plus three.js r186 chunk 943 KB / 247 KB gz; Astra: version is r186, my first read said r123). The scene is a React-Three-Fiber canvas
behind the hero, lazily mounted after hydration. Config literal (RSC payload, verbatim):

| Group | Values |
|---|---|
| scene | clear `rgb(7,9,10)` = `#07090a` (CSS page/fade colour is `#07080a`, one green step different; both kept verbatim); cube at z −9, y 0; glass group z 0, rotation 0.73 rad; camera z 16.54, fov 35, near .01, far 100; dpr 2 |
| cubeShader | speed 0.1, size 0.99; color1 `244,254,255`, color2 `255,122,152`, color3 `184,2,50`, color4 `255,22,42` (color4 unused by shader) |
| cube mesh | `boxGeometry 7×7×7`, starts `scale 0`, `damp3(scale → 1,1,1, smoothTime 1)` per frame |
| cubeInteraction | enabled; rotation x = pointer.x × 0.3, y = −pointer.y × 0.3, angular damp smoothTime 0.5; translationInfluence 0.2 unused |
| glass | 16 cylinders r 0.5 h 15 subdiv 8 (`Instances`), MeshTransmissionMaterial: thickness 1, roughness .35, anisotropicBlur 2.88, ior 1.5, chromaticAberration 3, transmission 1, resolution 1024, samples 6 (5 when viewport < 7.3 world units) |
| distortion | if viewport width > 7.3: `damp(distortion → 15, λ30)`, `damp(temporalDistortion → .025, λ10)`; else both 0 |
| loop | `frameloop: demand` off-screen, `always` on-screen; **stops forever at elapsed > 200 s** (`setFrameloop("never")`) |
| canvas | `linear: true`, `flat: true` (no tone mapping), `preserveDrawingBuffer`; `uResolution` is **CSS pixels** even at DPR 2 and inside the 1024² target (Astra: preserve this mismatch) |
| quality | PerformanceMonitor may lower DPR to 1.5–2 and target to 256–1024² at runtime (live observed 448²/DPR 1.6). We pin 1024²/DPR 2: parity is claimed against that state only |
| postProcessing | disabled (dither shader shipped but off) |

Cube fragment shader (exact, 3 waves summed, R = 3 gamma):

```glsl
t = uTime*uSpeed + 10000.;  xy = (gl_FragCoord.xy/uResolution - .5)*uSize + .5
horizontal = cos(3*x + t)
diagonal   = cos(1*(x*cos(t) + 5*y*sin(t)) + t)
radial     = sin(20*sqrt((.3x-.5+cos t)^2 + (.3y-.5+sin(.5t))^2 + 1) + t)
nv = ((h+d+r)/3 + 1)/2
color = nv<.5 ? mix(c3,c2,2nv) : mix(c2,c1,2(nv-.5));  out = pow(color, 3)
```

Hero CSS overlay (copied verbatim, `heroBackground:after`): bottom fade `#07080a20 → #07080a20 90% → #07080a`, plus 5 %-wide side fades to `#07080a` left and right. Hero text fades in `1 s`, `translateY(20px → 0)`, paragraph staggered `1 s`.

What this means for us: the "load animation" is **two things** — (a) the cube growing from
scale 0 with a critically-damped spring (visible for ≈ 3 s), and (b) the colour field
scrolling at speed 0.1 behind 16 refracting glass rods. (a) is the moment people remember.

Glass rod placement (EXTRACTED `tF`): rod *n* at x = (n+1)·1 − 8 → 16 rods at x ∈ {−7 … 8},
spacing 1 world unit (= 2 × radius), the group tilted 0.73 rad (≈ 42°) about z. Distortion
damps use `E(x)=2^(10x−10)` as the damp's decay function with `maxSpeed .0002`; scale and pointer use the
default `E(x)=1/(1+x+.48x²+.235x³)`. Snap when |current−target| ≤ .001. Frame deltas change the result,
so parity captures must share frame timing (§9). Frame order: transmission pass draws the **previous**
frame's cube state, then the cube updates (Astra W/S/Q); keep that order.

## 3. Page layout (DESIGN, geometry copied)

```
┌─────────────────────────────────────────────────────┐  viewport
│ ░░░░░░ scene: fixed, inset 0, z 0, pointer-events none │
│ ░░░░░░ scrim: fixed, inset 0, z 1 (see §6)             │
│                                                       │
│              ┌──────────────────────┐                 │
│              │  Workspace     20/28 │  card z 2       │
│              │  Sign in       13/18 │  360 wide       │
│              │                      │  32 padding     │
│              │  Email        label  │  12 radius      │
│              │  [            ] 28h  │                 │
│              │  Password     label  │                 │
│              │  [            ] 28h  │                 │
│              │  [   Sign in   ] 28h │                 │
│              │  error line 12/16    │                 │
│              └──────────────────────┘                 │
└─────────────────────────────────────────────────────┘
```

| Element | Value | Source |
|---|---|---|
| Page | `min-height: 100dvh; display: grid; place-items: center; background: var(--bg-page)` | baseline L1 |
| Card | `width: min(360px, 100vw − 96px)`; padding 32; radius 12; `--bg-elevated`; 1px `--border-secondary`; `--shadow-L2` | baseline §3 |
| Card vertical offset | none: dead-centre. raycast's hero text is centred too (padding-driven). | raycast hero CSS |
| Scene | `<canvas>` fixed inset 0, `aria-hidden`, `pointer-events: none`, z-index 0 | baseline L6 |
| Scrim | one `<div>` fixed inset 0, z 1, `pointer-events: none` (§6) | DESIGN |
| Card z | 2; nothing else on the page | — |
| Stack order | scene → scrim → card. The card never blends with the scene. | — |

No logo, no footer, no "Forgot password" (none exists: `facts/account-login.md`), no theme
toggle (follows OS / app setting). Every element earns its pixels (GOAL-SYSTEM §5.2).

## 4. Form states and copy (implementation-complete)

Mode is decided once, from `GET /api/auth/status` → `{configured}`. Until it answers, render
sign-in mode with the button disabled (no spinner: the answer is loopback, ≤ 20 ms).

| Mode | Heading | Sub | Button | Password autocomplete |
|---|---|---|---|---|
| sign-in (`configured: true`) | `Workspace` | `Sign in` | `Sign in` | `current-password` |
| first-run (`configured: false`) | `Workspace` | `Create local account` | `Create account` | `new-password` |

Field copy: labels `Email`, `Password`. No placeholders (Cursor settings inputs have none).
`login_hint` query param prefills Email; focus then lands on Password.

| State | Trigger | Visual | Timing |
|---|---|---|---|
| idle | load | inputs `--border-primary` 1px, text `--text-primary`; button primary enabled | first paint |
| focus | `:focus-visible` on input/button | 2px ring `--border-accent-primary`, offset 3 (baseline) | 0 ms, no transition |
| invalid (client) | submit with empty/short field | browser native validity blocked; instead our error line shows copy below; the first invalid input gets focus; its border `--text-red` | 0 ms |
| loading | submit accepted | button `disabled`, label unchanged (no "Signing in…"), inputs `readonly`; error line cleared | until response |
| error (server) | 4xx | error line text = server `error` string verbatim; button re-enabled; Password cleared and focused | 0 ms |
| success | 2xx | button stays disabled; `location.replace(redirect ?? "/")` | ≤ 1 frame |
| unreachable | fetch rejects | error line `Cannot reach local server.`; button enabled | 0 ms |

Error line: `role=alert aria-live=polite`, 12/16 `--text-red`, margin-top 8, min-height 16 so
the card never changes height. Exact server copy (EXTRACTED `src/auth/store.ts`):

- 400 → `Use a valid email and a password of 12–1024 characters.`
- 401 → `Invalid email or password.`
- 409 → `Local account already exists. Sign in.` (page also flips to sign-in mode)
- 429 → `Too many attempts. Try again in a minute.` (DESIGN: server has no copy; GAP until added)

No transitions on the form at all. The only motion on the page is the scene (§5).

## 5. The scene, rebuilt to be instant (DESIGN, derived from §2)

The raycast original costs ~280 KB gz of JS (three.js + R3F + drei + the chunk) and mounts
after React hydration: first cube pixel lands at ≈ 1.2–1.8 s on a warm cache. Our target is
**first cube pixel ≤ 100 ms after HTML arrives**, which rules out three.js entirely.

What the picture actually is, mathematically:

1. A camera at z 16.54, fov 35, looking at a 7-unit cube at z −9. Pixel-wise that is a
   square ≈ 2 × 9.1 ÷ (25.54 × tan 17.5°) × H/2 ≈ 0.44·H tall, screen-centred, that only
   ever rotates ≤ ±0.3 rad on x/y. The cube's face shader ignores UVs and samples
   `gl_FragCoord`, so the face colour is a **screen-space** field; rotation only moves the
   silhouette.
2. Sixteen vertical glass rods tilted 42° refracting that field (ior 1.5, 6 samples each,
   chromatic aberration 3, anisotropic blur 2.88). This is the expensive part: drei's
   MeshTransmissionMaterial renders the scene to a 1024² target and then samples it 6× per
   rod fragment per frame.

Rebuild plan (two stages; Astra ships S1 first, parity-checked at each stage). Pre-warming is
not a stage: S1 compiles both programs inside the scene's mount effect, nothing earlier.

| Stage | What | Size | JS/frame | Pixel-parity claim |
|---|---|---|---|---|
| S1 | Raw WebGL2, no framework: the extracted shaders verbatim, hand-rolled cube + instanced rods + transmission render target. One ES module `src/login/scene.ts`, imported by `RaycastScene` (§10) and listed in the route's `modulepreload`. | ≤ 18 KB gz | ≤ 1.5 ms (M1) | **exact** (same GLSL, same uniforms, same `damp3`) |
| S2 | Specialise dead branches of the transmission shader (no backside, no env map, no roughness map, flat/linear colour) | ≤ 12 KB gz | ≤ 1.0 ms | exact within 1/255 (branch removal, no maths change) |

Hard rule from `docs/interactions/raycast-animation.md`: any approximation (e.g. a 2D
pre-rendered field, fewer rods, fewer samples) is **labelled and rejected as exact**. S1
is the floor; nothing ships that is not at least S1.

## 6. Scrim, contrast, two-tone (dark/light)

The card is opaque `--bg-elevated`, so text contrast inside it is fixed by tokens and never
depends on the scene. The scrim exists for two reasons only: (1) copy raycast's own edge
treatment, which is what makes the scene read as "lit from behind" rather than a screensaver,
and (2) hold the page edges at the page colour so the card has a calm field around it.

Scrim = raycast `heroBackground:after`, copied verbatim, with its two literal colours
replaced by one token (DESIGN: tokenisation is the only change):

```css
.scrim { position: fixed; inset: 0; z-index: 1; pointer-events: none;
  background:
    linear-gradient(to bottom, rgb(var(--bg-page) / .125) 0%, rgb(var(--bg-page) / .125) 90%, rgb(var(--bg-page)) 100%) bottom right / 100% 100% no-repeat,
    linear-gradient(to left,  rgb(var(--bg-page) / 0) 0%, rgb(var(--bg-page)) 100%) top left  / 5% 100% no-repeat,
    linear-gradient(to right, rgb(var(--bg-page) / 0) 0%, rgb(var(--bg-page)) 100%) top right / 5% 100% no-repeat; }
```

(`#07080a20` = alpha 0x20/255 = .125; `#07080a` = raycast `--grey-900` = our dark `--bg-page`,
which must be set to `7 8 10` on this page. GAP: confirm our dark `--bg-page` value.)

Two tones, both theme-bound (owner directive 2026-10-13):

| Tone | What it is | Dark (EXTRACTED) | Light (DERIVED) |
|---|---|---|---|
| A page | scene clear colour, scrim ends, page behind the card | clear `#07090a`, scrim/page `#07080a` | both = light `--bg-page` (one value; the one-step source split is not reproduced) |
| B field | the three shader uniforms c1 c2 c3 | `244,254,255` · `255,122,152` · `184,2,50` | `75,85,86` · `231,94,130` · `255,175,166` |

How light tone B was derived (and why it is not invented): the shader emits `pow(c/255, 3)`
on a linear canvas, so what the eye sees is the cubed stop. For each stop take the emitted
colour in OKLab, keep hue and chroma, and mirror lightness about the page: `L' = L_dark-page +
L_light-page − L`. Convert back and take the cube root to get the uniform, so the shader stays
verbatim and only three numbers change. Result: the field inverts its tonal order. On dark the
high stop is near-white and the low stop is near-black red; on light the high stop is a cool
near-black (`75,85,86` → emits `6,10,10`) and the low stop a warm bright red (`255,175,166` →
emits `255,83,71`). The middle pink stays mid (`231,94,130` → emits `190,13,34`). The scene
reads as the same picture with the paper and the ink swapped, which is what "two-tone swaps
with mode" means. Derivation script and inputs: page dark `7,9,10`, page light `248,247,245`
(GAP: replace with the measured light `--bg-page` once tokens.css lands; rerun
`docs/verification/login-v2/derive-light.py`, committed with this pass; it prints the table above).

Rule: cube uniforms and clear colour are read **once at mount** from `data-theme` on `<html>`;
a theme change remounts the scene (§10) rather than tweening colours. No tween exists in the
source; none is added.

Contrast rule: card text ≥ 4.5:1 is guaranteed by tokens; outside the card there is no text.
So the only measurable is that the card border remains visible: `--border-secondary` on
`--bg-elevated` against any scene frame ≥ 1.3:1 sampled on 5 frames (Astra, §9).

## 7. Load timeline, motion, reduced motion

Everything the user sees in the first second, in order (DESIGN, budgets in §8):

| t (ms from HTML byte 0) | What | How |
|---|---|---|
| 0 | HTML + CSS + page JS; `scene.ts` in `modulepreload` (≤ 24 KB gz total before first frame) | React route; server-rendered form markup |
| ≤ 16 | First paint: page colour, card, labels, inputs. Card markup is server-rendered; typing works before hydration. | no JS on the critical path for the form |
| ≤ 40 | Scene module parses; WebGL2 context + both programs compile | inside `RaycastScene`'s mount effect (§10) |
| ≤ 100 | First scene frame: clear colour + rods + cube at `scale ≈ 0.02` | `requestAnimationFrame` #1 |
| 100 → ~3000 | Cube grows: `damp3(scale → 1, smoothTime 1)` = source. Visually settled (≥ 0.99) at ≈ 3.0 s | same maths as source, seeded from the first frame's clock |
| 0 → ∞ | Colour field scrolls at speed 0.1 (period of the fastest wave ≈ 63 s). Rods distort to 15 / .025 if viewport > 7.3 world units | source |
| 200 000 | Loop stops (`never`), last frame stays | source. Answers OQ2: it never "settles", it stops. |

Pointer: kept (answers OQ3). Rotation ±0.3 rad on the cube, damp 0.5, from `mousemove` on
`window` only. The scene is `pointer-events: none`, so the form owns every click; the
pointer only *influences* rotation. Touch devices: no `mousemove`, no rotation (source).

`prefers-reduced-motion: reduce`, no WebGL2, or context creation throws: one still image per
theme, `/login/still-{dark,light}.avif`, `<img aria-hidden>` in the scene's place (§10 shows
both branches). The still is the settled pose: scale 1, rotation 0, uTime 0, distortion 0,
rendered by Astra from S1 at 1512×982 DPR 2, ≤ 60 KB each. No CSS animation exists on the
page, so nothing else needs the media query.

`document.hidden` → cancel rAF; resume with the clock paused (source demand-mode behaviour).
Form submit success → cancel rAF (page is being replaced).

## 8. Instant-load budget (hard numbers)

Measured on the login route, cold cache, Chrome 130, M1 Air, loopback server.

| Metric | Target | Source of truth |
|---|---|---|
| Bytes before first scene frame (HTML + CSS + page JS + `scene.ts`) | ≤ 24 KB gz; ≤ 3 requests, all `modulepreload`ed | `curl -sw %{size_download}` with `Accept-Encoding: gzip` |
| Scene module alone | S1 ≤ 18 KB gz, S2 ≤ 12 KB gz | `esbuild --minify \| gzip -9 \| wc -c` |
| Still images `still-{dark,light}.avif` | ≤ 60 KB each, loaded only on the fallback branch | file size |
| First Contentful Paint | ≤ 50 ms after HTML | Performance panel |
| First scene frame | ≤ 100 ms after HTML | `performance.mark` in module, reported in CU run |
| Shader compile (both programs) | ≤ 30 ms | `performance.measure` around `linkProgram` |
| Steady-state JS per frame | ≤ 1.5 ms (S1), ≤ 1.0 ms (S2) | 30 s trace, p95 |
| GPU frame time at 1512×982 DPR 2 | ≤ 6 ms | `EXT_disjoint_timer_query_webgl2` where available, else trace |
| Long tasks during cube growth (0–3 s) | 0 tasks > 50 ms | trace |
| Layout shift | CLS 0 (card is in HTML, fixed size) | Lighthouse |
| Form interactive | at first paint (no JS needed to type) | manual |

How the build meets it: no 3D framework, one dependency-free ES module (`scene.ts`), preloaded; shaders as template literals; geometry generated in ≈ 40 lines (box + 16 cylinders
via `drawArraysInstanced`); one render target for transmission (1024²) sized once; uniforms
updated in place. Anything over budget blocks the PR, not the spec.

## 9. Verification plan (Astra, computer-use, before any PR)

Pixel-parity against raycast.com requires matched state (interaction doc): same viewport,
DPR, elapsed time, pointer history, frame deltas. The test apparatus is URL params on both
sides — raycast's own `?heroDebug` plus our `?t=<s>&pointer=0&dpr=2`. The page parses these into
`RaycastScene`'s `debug` prop (§10) only when the build is non-production; in production the
prop is always undefined. Never visible UI.

| # | Check | Method | Pass |
|---|---|---|---|
| P1 | Field shader parity | render our cube face alone vs source `tP` shader at t ∈ {10000, 10005, 10050}, 1024², same uniforms | max channel diff ≤ 1/255 |
| P2 | Full-frame parity, settled | raycast at 1512×982 DPR 2, scroll 0, pointer parked at (0,0), capture at elapsed 5 s, 10 s, 60 s; ours at same t | SSIM ≥ 0.98 over the hero rect; per-pixel ≤ 2/255 for ≥ 95 % of pixels |
| P3 | Cube growth curve | 60 captures over 0–3 s both sides; measure cube silhouette width | ≤ 2 px at every sample |
| P4 | Pointer | move pointer to 4 corners, hold 1 s each; compare rotation via silhouette | ≤ 2 px |
| P5 | Rods | count 16, spacing 1 unit, tilt 42° measured from screenshot | exact |
| P6 | Scrim | overlay diff of our scrim vs raycast `:after` on a flat grey scene | identical |
| P7 | Light theme | render light tone B (§6) at t = 5 s, 60 s; owner eye check; card border ≥ 1.3:1 on 5 frames; OKLab L of each emitted stop within .02 of the §6 derivation | pass, or return the derivation to Fable with the failing frame (no dark fallback) |
| P8 | Reduced motion | emulate; assert no WebGL context, `<img>` present, 0 rAF | exact |
| P9 | Budget | every row of §8 | all green |
| P10 | Form | click every control; tab order Email → Password → button; all 7 states in §4 with screenshots; autofill works | all |
| P11 | Scene removed | feature flag off: login journey passes unchanged | pass |

Artifacts land in `docs/verification/login-v2/` (captures + `report.json`). Spec PR → S1
PR (scene only, ≤ 500 lines) → form PR → verification PR, per GOAL-SYSTEM §2.

## 10. React component contract (DESIGN; implementation target per owner directive)

The login route is a React page. Two components, no shared state, no context, no store.

| Component | Owns | Does not own |
|---|---|---|
| `LoginPage` | theme read, reduced-motion read, which scene branch renders | form state, anything visual about the scene |
| `LoginCard` | form state (§4), fetches, redirect | the scene, the scrim |
| `RaycastScene` | one `<canvas>`, one WebGL2 context, the rAF loop, pointer listener | theme, layout, any DOM outside its canvas |

Theme is a prop, read by the page from `document.documentElement.dataset.theme` once per
render. The scene is keyed on it, so a theme change unmounts and remounts the scene (§6 rule).

```tsx
// src/login/LoginPage.tsx
export function LoginPage({ configured }: { configured: boolean | null }) {
  const theme = useTheme();                      // 'dark' | 'light', from data-theme
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  return (
    <main className="login">                     // §3 page grid
      {reduced ? <img className="scene" src={`/login/still-${theme}.avif`} alt="" aria-hidden />
               : <RaycastScene key={theme} theme={theme} />}
      <div className="scrim" aria-hidden />      // §6, CSS only
      <LoginCard configured={configured} />      // §4
    </main>
  );
}
```

```tsx
// src/login/RaycastScene.tsx — the only file that touches WebGL
type Props = { theme: 'dark' | 'light'; debug?: { t?: number; pointer?: false; dpr?: number } };
export function RaycastScene({ theme, debug }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);   // the ONLY React state in the scene
  useEffect(() => {
    const canvas = ref.current!;
    let scene: Scene | null = null;
    try { scene = createScene(canvas, PALETTE[theme], debug); }   // §5 S1 module, framework-free
    catch { setFailed(true); return; }
    const onMove = (e: MouseEvent) => scene!.pointer(2*e.clientX/innerWidth-1, 1-2*e.clientY/innerHeight);
    const onVis  = () => (document.hidden ? scene!.pause() : scene!.resume());
    if (debug?.pointer !== false) window.addEventListener('mousemove', onMove);
    document.addEventListener('visibilitychange', onVis);
    scene.start();                                // first frame inside this effect (≤ 100 ms budget, §8)
    return () => { window.removeEventListener('mousemove', onMove);
                   document.removeEventListener('visibilitychange', onVis); scene!.dispose(); };
  }, [theme]);                                    // debug is read once; it never changes at runtime
  if (failed) return <img className="scene" src={`/login/still-${theme}.avif`} alt="" aria-hidden />;
  return <canvas ref={ref} className="scene" aria-hidden />;
}
```

Props, state, effects, exactly:

| Component | Props | State | Effects | Refs |
|---|---|---|---|---|
| `LoginPage` | `configured: boolean \| null` (from `/api/auth/status`, fetched by the route loader, not the page) | none | none | none |
| `LoginCard` | `configured` | `email`, `password`, `status: 'idle'\|'loading'\|'error'\|'unreachable'`, `error: string` (§4) | one: focus Password when `login_hint` is present | form |
| `RaycastScene` | `theme`, `debug?` | `failed: boolean` | one, keyed on `theme`: create → listen → start → cleanup | canvas |

`PALETTE` is a 2-entry constant `{ dark: {clear, c1, c2, c3}, light: {...} }` holding the §6
numbers. Nothing else in the scene reads CSS or the DOM. `useTheme` and `useMediaQuery` are
the app's existing hooks (GAP: confirm names when the app shell lands; if absent, 8-line
`matchMedia` hooks live next to the page).
