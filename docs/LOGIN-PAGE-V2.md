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

## 2. The source animation — EXTRACTED facts (raycast.com, 2026-10-13 live)

Pulled live from `www.raycast.com` HTML + chunk `2c5k8hkujs8m5.js` (115 KB raw / 32 KB gz,
plus three.js r123 chunk 943 KB / 247 KB gz). The scene is a React-Three-Fiber canvas
behind the hero, lazily mounted after hydration. Config literal (RSC payload, verbatim):

| Group | Values |
|---|---|
| scene | bg `rgb(7,9,10)`; cube at z −9, y 0; glass group z 0, rotation 0.73 rad; camera z 16.54, fov 35, near .01, far 100; dpr 2 |
| cubeShader | speed 0.1, size 0.99; color1 `244,254,255`, color2 `255,122,152`, color3 `184,2,50`, color4 `255,22,42` (color4 unused by shader) |
| cube mesh | `boxGeometry 7×7×7`, starts `scale 0`, `damp3(scale → 1,1,1, smoothTime 1)` per frame |
| cubeInteraction | enabled; rotation x = pointer.x × 0.3, y = −pointer.y × 0.3, angular damp smoothTime 0.5; translationInfluence 0.2 unused |
| glass | 16 cylinders r 0.5 h 15 subdiv 8 (`Instances`), MeshTransmissionMaterial: thickness 1, roughness .35, anisotropicBlur 2.88, ior 1.5, chromaticAberration 3, transmission 1, resolution 1024, samples 6 (5 when viewport < 7.3 world units) |
| distortion | if viewport width > 7.3: `damp(distortion → 15, λ30)`, `damp(temporalDistortion → .025, λ10)`; else both 0 |
| loop | `frameloop: demand` off-screen, `always` on-screen; **stops forever at elapsed > 200 s** (`setFrameloop("never")`) |
| canvas | `linear: true`, `flat: true` (no tone mapping), `preserveDrawingBuffer` |
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
ramps use an `easeInExpo` curve on the damp (`2^(10e−10)`).

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
