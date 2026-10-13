# Raycast animation proof interaction contract

Status: extracted-source contract, recorded before proof implementation. Scope is an isolated
background proof, not a product login implementation. Canonical analysis: ../RAYCAST-ANIMATION.md.
Source: reference/raycast/extracted/{config.json,offsets.json,cube-component.js,glass-scene.js}.

- Initial state: canvas background RGB(7,9,10), cube scale zero; no text or hit targets.
- Load trigger: initialize WebGL and start clock immediately, without React/Next hydration.
- Every visible frame: scale cube toward (1,1,1) with source damp3(smoothTime=1), update
  color field time=elapsed*0.1+10000 and glass time=elapsed; render transmission target then scene.
- Pointer movement: normalize against window width/height; cube Euler x=pointer.x*0.3,
  y=-pointer.y*0.3 with source angular damping smoothTime=0.5. No translation (unused config).
- Wide 3D viewport (>7.3 world units): source distortion/temporal distortion damping.
- Narrow viewport (<7.3): five refraction samples; otherwise six. Resize updates projection,
  CSS resolution uniform and drawing buffer separately. Device pixel ratio baseline=2.
- At elapsed >200 seconds: source stops frame loop. Leaving viewport uses demand rendering.
- The decorative surface has no controls, focus targets, click behavior, copy, empty state,
  forms, navigation or error messages. If WebGL fails, retain source background and report
  the error to the diagnostic collector (no invented fallback illustration).
- Theme: use the owner-directed derived two-tone mapping below. Reduced-motion behavior
  is a documented product adaptation, not an observed source behavior.
- Diagnostic URL parameters may fix time/viewport for comparisons; these are test apparatus,
  not product interactions. No visible diagnostic controls in the reproduced background.
- Source CSS edge overlays must be copied verbatim. Pixel equivalence requires matching
  viewport, DPR, refraction resolution, elapsed time, frame deltas and pointer history.

Optimization stages: first remove framework/hydration with the captured shader unchanged;
then specialize dead material branches and replace general scene machinery only after
matched-state visual comparison. Any approximation must be labeled and rejected as exact.

## Owner-directed theme adaptation (2026-10-13)

This supersedes the earlier theme gap; documented before implementation.
Two-tone means continuous shades between two RGB endpoints. D=(7,9,10)/255 from C;
L=pow((244,254,255)/255,3) from C,Q. For final source pixel P, w=(.2126,.7152,.0722),
u=clamp((dot(P,w)-dot(D,w))/(dot(L,w)-dot(D,w)),0,1).
Dark=mix(D,L,u); light=mix(L,D,u). Light values are **derived**, not observed.
Map after refraction, never the offscreen texture. Theme changes swap endpoints
immediately, without remount, clock reset, compilation or transition. CSS fades use
the background endpoint with source alpha 32/255. Diagnostic palette=source keeps
original colors for direct comparisons.

React props: theme='system'|'dark'|'light', motion='system'|'full'|'reduced',
className?:string, onError?:(error:Error)=>void; defaults system/system.
Canvas is aria-hidden with no tabIndex and pointer-events:none. Parent owns dimensions.
ResizeObserver follows CSS size; mousemove uses window coordinates. Media-query,
visibility, intersection and context-loss listeners update the runtime.
Hidden/offscreen/zero-size surfaces cancel RAF; resume resets the previous timestamp.
Stop after 200 seconds; theme changes still redraw. Reduced motion renders the state
after 5 seconds of 60 Hz source updates once, disables pointer response, and redraws
only on theme/size changes. This is a product adaptation. Full motion retains the
original zero-scale reveal; instant refers to removing startup gates.
Failure retains the CSS endpoint and reports onError without visible copy. Context
restoration rebuilds resources and restarts the reveal. Cleanup cancels RAF, removes
listeners/observers and releases GPU objects, supporting StrictMode setup/cleanup/setup.
Diagnostic URL theme, palette, motion and t parameters introduce no visible controls.

Verification refinement: normalize live material state and refresh its compiled bindings
before pixel comparisons; stale bindings produced invalid mismatch results. Preserve the
captured instance transforms and instance-color shader path. A smaller renderer may copy
only the matrix/quaternion methods it uses, retaining source arithmetic order. CSS page and
fade ends are #07080a, distinct from the scene clear #07090a (live theme-check.json).

Frame-order refinement (W/S/Q): the transmission callback renders the previous cube state before the cube callback updates scale, rotation and color time. Retain that previous state for the offscreen pass. Snapshot diagnostics set previous=current to compare static states. On the terminal frame, setFrameloop(never) resets the source clock before the cube callback: direct cube time becomes zero; glass time retains the terminal value.

Diagnostic refinement: source-color comparison may compile the captured shader without
the product theme branch. This is a diagnostic-only option, selected at initialization;
production dark/light swaps must still share one program and preserve state. Validate
both clean-browser and lifecycle/context-recovery-first sequences before claiming equality.
