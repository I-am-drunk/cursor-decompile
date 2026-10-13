# Raycast homepage animation specification

Captured 2026-10-13 on `ref-raycast-animation`. Scope: captured homepage background and standalone proof, not a login layout. Files are under `reference/raycast/`.

Status: source analysis established; proof remains under verification. Do not claim pixel identity across states yet. Refraction discrepancies are recorded below.

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

Camera: vertical perspective FOV 35°, near .01, far 100, position (0,0,16.54), no rotation. Cube: BoxGeometry(7,7,7), position (0,0,-9), initial scale zero. Glass: group z=0, rotation z=.73 radians (41.826°). Sixteen capped CylinderGeometry(.5,.5,15,8,1) instances have centers (i−7,0,0), i=0…15. These are faceted octagonal cylinders, not flat diagonal stripes. [C,S,Q,F]

The background container is absolutely inset into the hero, centered, width 100%, max-width 1200px, z-index −1. Its height comes from hero content, not a fixed aspect ratio. The isolated proof uses 100vh as its host; compare identical canvas dimensions, not full-page viewport dimensions. Live 1200×800 browser: canvas CSS 1185×969.203125 due scrollbar and hero content. [H,L]

CSS overlay: bottom gradient #07080a20 at 0% and 90% to var(--grey-900) at 100%; left/right gradients transparent #07080a00 to the same grey across 5% width. Root --grey-900 is #07080a. Canvas clear color differs: #07090a. [H; evidence/theme-check.json]

## Colors

Source C,Q: color1 RGB(244,254,255), hex #f4feff; color2 RGB(255,122,152), #ff7a98; color3 RGB(184,2,50), #b80232. Configured color4 RGB(255,22,42), #ff162a is unused. Scene clear RGB(7,9,10); CSS grey RGB(7,8,10).

Both emulated OS color schemes returned the same values, root classes and body background. See evidence/theme-check.json. The captured homepage has no observed two-palette theme adaptation. A light login variant would require a separate design decision and cannot be described as copied from this build.

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

The dynamic import stub is chunks/3tdptv0if1tq0.js (ledger). It loads rendering dependencies before mounting the scene. Canvas uses linear output, flat shading mode and preserveDrawingBuffer=true. PerformanceMonitor starts factor=1, step=.25; each of ten windows lasts at least 250 ms. It compares FPS windows against [.75*observedMaxFPS, observedMaxFPS]; more than 75% outside a bound changes factor. [F; performance function at bytes 517 onward]

DPR=round(10*(1.5+.5*factor))/10. Refraction resolution=round(10*(256+768*factor))/10. Thus the source may change from 1024²/DPR2 to lower quality while running. Observed live: 448²/DPR1.6. Changing DPR changes the color field because uResolution remains CSS-sized, and changes the pixel-seeded grain. Fixed 1024²/DPR2 is the baseline in the proof; it is not equivalent to every adaptive-quality state. [F,L]

An effect also toggles a scene mount counter immediately and after 100 ms when visibility changes. This contributes to delayed/restarted motion. The proof removes that mount cycle and framework hydration, retaining the animation itself. [F]
