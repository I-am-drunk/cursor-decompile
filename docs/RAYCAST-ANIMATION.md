# Raycast homepage animation specification

Captured 2026-10-13 on `ref-raycast-animation`. Scope: captured homepage background and standalone proof, not a login layout. Files are under `reference/raycast/`.

Status: source baseline matched at 21 controlled desktop/intermediate/mobile states; final verification and derived theme evidence are recorded below. Exactness is conditional on matched frame history and rendering parameters.

## Evidence map

Offsets are zero-based UTF-8 bytes in unmodified downloads. `manifest.json` records sizes and SHA-256. `extracted/offsets.json` and `extracted/claim-offsets.json` give machine-readable mappings. Compiled shaders are derived artifacts.

| ID | Source | Bytes | Content |
|---|---|---|---|
| C | index.html | claim-offsets.json | Server scene configuration |
| G | chunks/2c5k8hkujs8m5.js | 80986–93236 | Transmission material |
| W | Same | 93236–94725 | Offscreen render wrapper |
| S | Same | 97942–98853 | Cylinder scene and damping |
| Q | Same | 99023–102089 | Cube and color shader |
| F | Same | claim-offsets.json | Scene, camera, Canvas, quality |
| H | chunks/36itj4davfnhf.css | claim-offsets.json | Hero and edge fades |
| L | evidence/live-renderer.json | meshes/programs | Live renderer capture |

Chunk paths start with `_next/static/immutable/`.

## Technique and geometry

WebGL2 with Three.js r186 and React Three Fiber. A procedural color field is drawn on a cube, rendered into a square half-float target, and refracted through glass cylinders. CSS only supplies edge fades. No bitmap texture or video drives the pattern. [G,W,Q,L]

Camera: vertical perspective FOV 35°, near .01, far 100, position (0,0,16.54), no rotation. Cube: BoxGeometry(7,7,7), position (0,0,-9), initial scale zero. Glass: group z=0, rotation z=.73 radians (41.826°). Sixteen capped CylinderGeometry(.5,.5,15,8,1) instances have centers (i−7,0,0), i=0…15. These have octagonal silhouettes and smoothly interpolated side normals, not flat diagonal stripes. [C,S,Q,F]

The background container is absolutely inset into the hero, centered, width 100%, max-width 1200px, z-index −1. Its height comes from hero content, not a fixed aspect ratio. The isolated proof uses 100vh as its host; compare identical canvas dimensions, not full-page viewport dimensions. Live 1200×800 browser: canvas CSS 1185×969.203125 due scrollbar and hero content. [H,L]

CSS overlay: bottom gradient #07080a20 at 0% and 90% to var(--grey-900) at 100%; left/right gradients transparent #07080a00 to the same grey across 5% width. Root --grey-900 is #07080a. Canvas clear color differs: #07090a. [H; evidence/theme-check.json]

## Colors

Source C,Q: color1 RGB(244,254,255), hex #f4feff; color2 RGB(255,122,152), #ff7a98; color3 RGB(184,2,50), #b80232. Configured color4 RGB(255,22,42), #ff162a is unused. Scene clear RGB(7,9,10); CSS grey RGB(7,8,10).

Both emulated OS color schemes returned the same values, root classes and body background. See evidence/theme-check.json. The captured homepage has no observed two-palette theme adaptation. The owner directive requires a light palette. The two-tone palette below is derived from this build’s color math; it is in scope and is explicitly labeled as our adaptation.

## Color math

Source Q; exact GLSL in extracted/cube-fragmentShader.glsl. Let e be elapsed seconds, t=.1e+10000, and xy=.99*(gl_FragCoord.xy/uResolution−.5)+.5. The resolution uniform uses CSS pixels even when the drawing buffer uses DPR=2, and even in the square refraction target. Preserve this mismatch.

H=cos(3x+t)

D=cos(x*cos(t)+5y*sin(t)+t)

R=sin(20*sqrt((.3x−.5+cos(t))²+(.3y−.5+sin(.5t))²+1)+t)

n=(1+(H+D+R)/3)/2

For n<.5 interpolate color3 to color2 with weight 2n; otherwise color2 to color1 with weight 2n−1. Divide RGB inputs by 255; output pow(color,vec3(3)), alpha 1. No sRGB decoding of inputs, tone mapping or output gamma conversion. Canvas is linear and flat. [Q,F]

## Transmission math

Source G,W; extracted/glass-material.js is the authoritative implementation. Roughness=.35, anisotropicBlur=2.88, thickness=1, IOR=1.5, chromaticAberration=3, transmission=1, specularIntensity=0. No lighting, environment image or postprocessing is configured. The transmission wrapper uses an RGBA half-float render target, initially 1024², linear filtering. It temporarily substitutes a discard material for the glass while rendering the color scene. Then the glass samples that target.

Each visible glass fragment makes six samples, five below world viewport width 7.3. Each sample evaluates separate R/G/B refraction paths (18 or 15 texture fetches). Hash-based random values depend on pixel coordinates and an incrementing seed; this produces the fine grain. The cylinder normals vary across their eight faces. No added noise bitmap is necessary.

The distortion vector has three four-octave simplex-noise components. Offset O=(e,−e,−e)*temporalDistortion; evaluate N(pos*.08+O), N(pos.zxy*.08−O), N(pos.yxz*.08+O), then multiply by distortion. N(p)=.5333333*snoise(p)+.2666667*snoise(2p)+.1333333*snoise(4p)+.0666667*snoise(8p). Keep the captured random3/hash implementation and floating-point operation order. [G]

For sample i, progress=(i+random(pixel,0))/samples; thickness=1+2.88*progress. Perturb the normal with roughness²*2 times a normalized random vector times random^(1/3), then add distortion and normalize. Refract −view against this normal at IOR 1.5, 1.5*(1+3*progress), and 1.5*(1+6*progress) for R,G,B. Project each exit point into the render target, sample its corresponding channel, and average all samples. The source exponent is literal .33, not exact 1/3. [G]

## Load, interaction and timing

Source Q: scale starts at (0,0,0) and uses damp3 toward (1,1,1), smoothTime=1 second. Pointer maps x=2*clientX/window.innerWidth−1 and y=1−2*clientY/window.innerHeight. Euler targets are (pointer.x*.3,−pointer.y*.3,currentZ), angular damping smoothTime=.5. translationInfluence=.2 exists in configuration but is unused. There is no CSS easing curve for the canvas.

Source S: when world viewport width >7.3, distortion damps toward 15 with smoothTime=30, maxSpeed=.0002, and temporalDistortion toward .025 with smoothTime=10 and the same maxSpeed. Its easing function is E(x)=0 if x=0, otherwise 2^(10x−10). This is passed into the damping formula, not applied as a 30-second CSS tween. Frame deltas materially affect the result. On narrower canvases both remain zero.

Damping implementation: chunks/3-2m-3c7p20_j.js byte 932958 (ledger), copied in extracted/damp.mjs. Maintain velocity per property. If abs(current−target)≤.001, snap to target. Otherwise omega=2/max(.0001,smoothTime), decay=E(omega*dt), change=clamp(current−target,±maxSpeed*smoothTime), adjustedTarget=current−change, temp=(velocity+omega*change)*dt, velocity=(velocity−omega*temp)*decay, next=adjustedTarget+(change+temp)*decay. Clamp overshoot to the original target. Default E(x)=1/(1+x+.48x²+.235x³); scale/pointer use that default. [Q,S; damping ledger]

The transmission callback precedes the cube callback: its texture contains previous-frame cube scale/rotation/time. Glass time is current elapsed time. Preserve this ordering for load reproduction. At elapsed >200 seconds S calls setFrameloop(never); the clock resets before Q reads elapsed time, leaving the terminal direct cube time at zero. Leaving the viewport changes frameloop to demand; reentry and quality remounts can restart the scene. [W,S,Q,F]

## Adaptive quality and startup

The dynamic import stub is chunks/3tdptv0if1tq0.js (ledger). It loads rendering dependencies before mounting the scene. Canvas uses linear output, disabled tone mapping (Canvas flat=true) and preserveDrawingBuffer=true. PerformanceMonitor starts factor=1, step=.25; each of ten windows lasts at least 250 ms. It compares FPS windows against [.75*observedMaxFPS, observedMaxFPS]; more than 75% outside a bound changes factor. [F; performance function at bytes 517 onward]

DPR=round(10*(1.5+.5*factor))/10. Refraction resolution=round(10*(256+768*factor))/10. Thus the source may change from 1024²/DPR2 to lower quality while running. Observed live: 448²/DPR1.6. Changing DPR changes the color field because uResolution remains CSS-sized, and changes the pixel-seeded grain. Fixed 1024²/DPR2 is the baseline in the proof; it is not equivalent to every adaptive-quality state. [F,L]

An effect also toggles a scene mount counter immediately and after 100 ms when visibility changes. This contributes to delayed/restarted motion. The proof removes that mount cycle and framework hydration, retaining the animation itself. [F]

## Required two-tone palettes: derived design

Owner directive 2026-10-13 supersedes the earlier light-mode gap. Production uses two
tones in **both** modes. Source RGB remains available only for proof comparisons.
Two-tone means continuous mixtures of two endpoints, retaining the fine grain.

D=(7,9,10)/255 comes from C; L=pow((244,254,255)/255,3) comes from C,Q.
Do not round L: its 8-bit-scale RGB is
(223.4030603613995,252.01174932718186,255), approximately **#dffcff**.

| Mode | Background / low endpoint | Highlight / high endpoint |
|---|---|---|
| Dark | D = #07090a | L ≈ #dffcff |
| Light | L ≈ #dffcff | D = #07090a |

For final source fragment P after refraction, w=(.2126,.7152,.0722) and
u=clamp((dot(P,w)-dot(D,w))/(dot(L,w)-dot(D,w)),0,1).
Dark=mix(D,L,u); light=mix(L,D,u). Thus dark+light=D+L at every fragment.
This is **DESIGN (ours)**, derived from source color math, not an observed site theme.

At unrefracted n=0,.5,1, dark RGB on a 0–255 scale is respectively
(17.805941,21.134628,22.233910), (70.269914,80.049515,81.630821), L;
light RGB is (212.597119,239.877122,242.766090),
(160.133146,180.962234,183.369179), D.
Refraction samples original RGB at its three wavelengths, then maps the result.
Recoloring before refraction changes the image and is prohibited.

theme.mjs maps final output in both screen shaders: uTheme=0 for offscreen/source,
1 for dark, 2 for light. No extra framebuffer/pass. CSS retains source fade geometry
and alpha 32/255, but uses the background endpoint. On mode change, update the uniform
and CSS variable together, redraw once, keep time, velocity, rotation and resources.
No transition, remount, reset or shader compilation. System follows matchMedia changes;
an explicit app theme takes precedence. Float arithmetic is normative; 8-bit screenshots
include framebuffer dithering/rounding. The measured dark+light sum differs by at most
1.59694 channel levels, within the two independent quantization operations' 2-level bound.
See evidence/lifecycle-verification.json.

## React implementation target

Component: **RaycastBackground**. The page owns the resolved theme if it has a theme
switch; pass theme={resolvedTheme}. Default system uses OS preference. This component
contains only a decorative background; existing login content remains a sibling above it.

Ship background.js with background.d.ts from the reference folder; the latter
provides strict TypeScript declarations for the imperative API.

Exact props:
- theme?: 'system' | 'dark' | 'light' = 'system'
- motion?: 'system' | 'full' | 'reduced' = 'system'
- className?: string
- onError?: (error: Error) => void

React state is only status: 'loading' | 'ready' | 'error', initially 'loading'.
Refs: canvas, runtime, latest props. Animation state stays inside the renderer:
elapsed, previousCube, scale/rotation plus damping velocities, pointer, distortion and
temporal distortion plus velocities. Runtime owns RAF id, previous timestamp,
visibility, dimensions, reduced-motion flag and async generation. No per-frame setState.

The following is the implementation contract, using the bundled background.js API from the proof.
It specifies two effects: mount/unmount once; prop updates without renderer recreation.
Its ready promise resolves after initialization or reported failure; renderer is absent
on failure. SSR emits the themed CSS background before any effect executes.

~~~tsx
import {useEffect, useRef, useState} from 'react';
import {mountBackground} from './background.js';
type Props = {
  theme?: 'system' | 'dark' | 'light';
  motion?: 'system' | 'full' | 'reduced';
  className?: string;
  onError?: (error: Error) => void;
};
export function RaycastBackground({
  theme = 'system', motion = 'system', className, onError
}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const runtime = useRef<ReturnType<typeof mountBackground> | null>(null);
  const latest = useRef({theme, motion, onError});
  latest.current = {theme, motion, onError};
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    let alive = true;
    setStatus('loading');
    const instance = mountBackground(canvas.current!, {
      theme: latest.current.theme, motion: latest.current.motion,
      onError(error: Error) {
        if (!alive) return;
        setStatus('error');
        latest.current.onError?.(error);
      }
    });
    runtime.current = instance;
    void instance.ready.then(() => {
      if (alive && instance.renderer) setStatus('ready');
    });
    return () => {
      alive = false;
      instance.dispose();
      runtime.current = null;
    };
  }, []);
  useEffect(() => {
    runtime.current?.setOptions({theme, motion});
  }, [theme, motion]);
  return (
    <div className={['raycast-background', className].filter(Boolean).join(' ')}
         data-theme={theme} data-status={status} aria-hidden="true">
      <canvas ref={canvas} />
    </div>
  );
}
~~~

CSS: copy proof.html's canvas/overlay rules, scoped to .raycast-background.
Host position:absolute; inset:0; width:100%; max-width:1200px; margin:auto;
height:100%; pointer-events:none. Parent is position:relative; isolation:isolate;
the background has z-index:-1, as H. No fixed viewport-height assumption in React.
CSS endpoint rules apply before hydration: dark=7 9 10; light=L*255; system uses
prefers-color-scheme. Canvas fills the host, is nonfocusable and has no controls.
Loading/error shows the endpoint only, with no added copy or spinner.

mountBackground API is {ready:Promise<void>, renderer, setOptions, dispose}.
ResizeObserver reads CSS width/height; DPR2 and 1024² are fixed baseline quality.
IntersectionObserver and visibilitychange cancel RAF offscreen/hidden. Resume sets
previous timestamp to zero, excluding hidden time. A zero-sized host draws nothing.
After elapsed>200, stop RAF; resize/theme still redraw the terminal state.
Reduced motion advances exactly 300 CPU updates at 1/60 seconds, draws once, ignores
pointer motion, and redraws only on size/theme. These pause/reduced-motion rules are
product adaptations. Pointer math and full-motion damping remain source-exact.

Context loss cancels RAF; restoration rebuilds GPU objects and restarts the reveal.
Cleanup disconnects observers, removes mouse/media/visibility/context listeners,
cancels RAF, and deletes buffers, VAOs, programs, shaders, textures, framebuffer and
depth renderbuffer. Late async initialization disposes itself after unmount.
No forced context loss during StrictMode cleanup. Failure calls onError and keeps CSS.

## Measured cost and optimization

80 unique mirrored assets: 54 JS (4,511,848 decoded bytes), 21 CSS (633,852), 5 fonts
(255,704), total 5,401,404. Both manifests contain 130 entries including duplicates;
all SHA-256 checks pass. The fresh page references 32 immutable JS/CSS assets, all
present. See manifest.json, runtime-manifest.json and evidence/source-integrity.json.
capture.py and capture-runtime.py use curl and preserve immutable chunk paths.

The dynamic import at stub bytes 473 onward names 12 dependency chunks totaling
1,377,682 decoded bytes before the background mounts. The proof removes this chain,
Next hydration, R3F scheduling, the scene graph, remount timer and quality monitor.
It retains captured geometry/matrices, minimal copied matrix/quaternion/damping code,
and the compiled shader arithmetic. Bundle size is recorded in final-delivery.json.

Original live first draw: 2388.7 ms, document response end: 495.1 ms.
Original trace: 81.48 ms inclusive background parsing, 226.04 ms EvaluateScript;
these are separate event totals, not additive critical-path time.
Historical synchronous proof: 90.57 ms module evaluation including GPU setup.
Evidence: live-performance.json, live-trace.json, proof-trace.json. Those historical
runs used different observation durations; their aggregate CPU totals are not a
valid speed ratio. Network/site startup and local proof timings are not equivalent
network benchmarks.

The single-file proof has no runtime asset requests. It paints CSS first, waits two
RAF callbacks, then creates the WebGL context. The renderer submits both shader links before polling
KHR_parallel_shader_compile; it avoids synchronous compile-status queries while
work is pending. Drivers without that extension use checked synchronous linking.
The exact zero-scale initial background paints independently of shader readiness.

Fresh-browser measurements (Apple M1, Chrome/ANGLE Metal, 800×600 CSS, DPR2, local
HTTP, browser network cache disabled), final-startup.json:
- First paint: dark 44 ms, light 40 ms, source 28 ms.
- WebGL ready: dark 82.1 ms, light 50.2 ms, source 31 ms.
- No long tasks in this final run.
- Subsequent contexts share process/driver caches; only dark is the first context in the fresh process.

Warm runs: first paint 48–56 ms, ready 38.7–57 ms, no long tasks
(warm-startup.json). “Instant” is an engineering target of first background paint
under 100 ms on this machine, not a claim of zero GPU compilation or an all-device
guarantee. Preserve the intentional source reveal. Preload the small module from the
React page entry; do not dynamically import it after the login component mounts.

Final sustained measurement at t≈30, 60 samples: CPU submission median 0.20 ms,
p95 0.40 ms; GPU median 11.17 ms, p95 11.724 ms; RAF interval median 16.6 ms,
p95 19.3 ms. GPU timer reported no disjoint. See final-runtime.json.
Earlier source-equivalent renderer GPU median was 10.885 ms (gpu-cost.json).
The two-tone change does not eliminate the refraction workload.

Main GPU costs: 15/18 texture fetches per glass fragment, 12 simplex evaluations
when distortion is enabled, DPR2 rasterization, offscreen rendering and multisampling.
The 1024² RGBA16F target alone is 8 MiB, plus depth and the display framebuffer.
Source preserves the drawing buffer; proof uses normal presentation and captures
immediately after draw. Lowering DPR/target size/samples changes the image.

Precomputed now: geometry buffers, 16 instance matrices, static camera/group transforms,
shader call-graph pruning and copied minimal math. Preserve arithmetic order,
CSS-resolution mismatch, half-float target and frame order. No Three/R3F dependency.
Rejected: removing apparently zero lighting terms reduced the bundle to 35.7 KiB,
but changed 8-bit pixels and produced large late-frame distortion differences.
See rejected-specialization-{800,390}.json. The arithmetic simplification was reverted;
compiler transformations in procedural noise must not be assumed pixel-neutral.

Further safe optimization: cache immutable HTTP responses with gzip/Brotli, preload
the module, prewarm shaders before navigating to login in an already running React app,
and retain the existing hidden/offscreen pauses. Any ray lookup, reduced samples,
lower resolution, CPU trigonometry or CSS substitution must pass the same full frame
matrix before adoption. No unverified cheaper substitute is included in the proof.

## Verification and source lifecycle edge case

See [RAYCAST-VERIFICATION.md](RAYCAST-VERIFICATION.md) for the interaction pass,
screenshots, runnable checks and limitations. The corrected live-source comparison
has zero differing RGBA channels in 21 sampled frames: 390×844, 800×600, 1200×800,
each at .1,.5,1,5,30,199,200.02 seconds, DPR2, 1024² transmission, fixed 60 Hz updates,
and the same pointer sequence. Source/optimized PNG pairs and JSON reports are in
reference/raycast/evidence/corrected-sequence-*.

The source wrapper exposes its material once through useImperativeHandle(...,[])
at W byte 94499. Changing samples can replace the rendered material while the glass
animation callback retains the old reference. Observed in the old 800-width harness:
the rendered material remained at distortion=0 while the ref reached 15. The harness
had resized after mounting at the live hero height. Corrected verification sets the
host dimensions before mount. The raw renderer keeps a stable animation state when
switching 5/6-sample programs; this fixes that source lifecycle defect. It is not a
claim of matching the source's stale-reference path after arbitrary resize history.

Geometry clarification: material flatShading=false; Canvas flat disables tone mapping.
Cylinder thetaStart=0, thetaLength=2π, openEnded=false. Side vertices are
(.5*sin(theta), ±7.5, .5*cos(theta)), theta=2πj/8; side normals are
(sin(theta),0,cos(theta)), interpolated and normalized by the fragment shader.
Caps use normals (0,±1,0). Use extracted/geometry.json for exact Float32 vertices
and triangle indices. Cylinder implementation: dependency chunk byte 183901 onward;
Canvas tone-mapping switch: byte 898684 onward. See extracted/final-offsets.json.

## Final recheck and diagnostic shader isolation

Final standalone proof: 43,823 bytes / 12,752 gzip bytes. Exact bundle sizes and
hashes: final-delivery.json. Fresh curl capture: evidence/recheck-page.html;
recursive 51-asset manifest: evidence/recheck-assets.json. Three entry chunks
changed; the animation chunk and cited offsets remain unchanged. The original
index.html and manifests are preserved.

Recheck exposed a mobile diagnostic defect: after context recovery, the source
palette with the unused theme branch differed by one level in up to 235 of
5,266,560 channels. Source screenshots were unchanged. The failure reproduced
after verifyLifecycle alone; verifyBoundaries alone passed. See
recheck-after-verifyLifecycle.json and recheck-after-verifyBoundaries.json.
This isolates shader-path/compilation-history sensitivity; the driver's internal
optimization is not observable and is not claimed as proven.

Fix: createRenderer accepts internal sourceColors=false. The source diagnostic
passes true and compiles captured fragment shaders without themeShader. Product
dark/light still share one mapped shader and swap uTheme without compilation.
Source comparisons test geometry, refraction, timing and original color math;
the derived recoloring is separately checked by the endpoint-swap invariant.

With that fix, all 21 frames match exactly after lifecycle and boundary checks
in the same Chrome process: evidence/recheck-pass.json and corrected-sequence
reports. The failed report remains in recheck-after-lifecycle.json; the isolated
shader experiment is recheck-unmapped-shader.json. No tolerance was increased.
Warm recheck paints: dark 56 ms, light/source 48 ms; ready 57.4/44.7/46.3 ms,
no long tasks (recheck-startup.json). Earlier cold measurements remain separately
recorded in final-startup.json. Desktop inspection screenshots have recheck-cu-
prefixes for live, dark, light and source-pointer states.
