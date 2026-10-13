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
- Theme: no alternate palette has been extracted. OS light/dark must be tested; do not invent
  colors. Reduced-motion behavior has not been established; do not claim source equivalence.
- Diagnostic URL parameters may fix time/viewport for comparisons; these are test apparatus,
  not product interactions. No visible diagnostic controls in the reproduced background.
- Source CSS edge overlays must be copied verbatim. Pixel equivalence requires matching
  viewport, DPR, refraction resolution, elapsed time, frame deltas and pointer history.

Optimization stages: first remove framework/hydration with the captured shader unchanged;
then specialize dead material branches and replace general scene machinery only after
matched-state visual comparison. Any approximation must be labeled and rejected as exact.
