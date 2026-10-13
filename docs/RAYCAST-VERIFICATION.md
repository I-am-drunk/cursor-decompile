# Raycast background verification — 2026-10-13

Spec: [RAYCAST-ANIMATION.md](RAYCAST-ANIMATION.md).
Proof: [proof.html](../reference/raycast/proof.html).
Evidence root: ../reference/raycast/evidence/.

Computer Use used the local Chrome UI through the Computer Use skill and @oai/sky.
Opened the live homepage, observed its loaded background, opened the served proof,
checked source-color motion and pointer response, then inspected fixed-time dark/light
variants. The proof has no interactive controls; clicks do not navigate or intercept
the page. Source/proof hero heights differ in these full-window inspection captures;
the controlled comparisons below normalize canvas dimensions.

- [Live homepage](../reference/raycast/evidence/cu-live-loaded.png)
- [Source-color proof, after pointer movement](../reference/raycast/evidence/cu-source-pointer.png)
- [Dark](../reference/raycast/evidence/cu-dark.png)
- [Light](../reference/raycast/evidence/cu-light.png)

| Check | Result | Evidence |
|---|---|---|
| Live source vs proof, 390×844 | 7/7 frames, zero different channels | corrected-sequence-verification-390.json |
| Live source vs proof, 800×600 | 7/7 frames, zero different channels | corrected-sequence-verification-800.json |
| Live source vs proof, 1200×800 | 7/7 frames, zero different channels | corrected-sequence-verification-1200.json |
| Palette swap, clock preservation | Pass, quantization error ≤1.597 levels | lifecycle-verification.json |
| System theme and reduced motion | Pass | lifecycle-verification.json |
| Resize and context recovery | Pass | lifecycle-verification.json |
| Dispose and no page exceptions | Pass | lifecycle-verification.json |
| Offscreen pause/resume | Pass | boundary-verification.json |
| Immediate unmount/remount | Pass | boundary-verification.json |
| WebGL unavailable | Correct CSS endpoint, reported error | boundary-verification.json |
| Asset integrity | 130 manifest entries checked, no mismatches | source-integrity.json |

Frame times: .1,.5,1,5,30,199,200.02 seconds; 60 Hz updates; pointer at 85% width,
70% height; DPR2; target 1024². Screenshots use the prefix
corrected-sequence-{width}-{source,proof}-{time}.png.

The old intermediate-width mismatch was traced to resizing the source after mount
and its stale material ref. The corrected harness sets dimensions before mount.
A smaller shader failed pixel comparison and was reverted. Neither failure was
retried into a passing result without identifying and correcting its cause.

Performance evidence: final-startup.json, warm-startup.json, final-runtime.json.
Final fresh-process run: first background paint 28–44 ms; ready 31–82.1 ms;
no long tasks. Only the first variant (dark) is first-context cold. Driver caches
can survive browser processes. Earlier cold setup took up to 310.3 ms; this is
recorded in pre-inline-startup.json. Hardware/network guarantees are not implied.

The source-color baseline is pixel-identical for the tested configurations on this
Chrome/ANGLE implementation. The required two-tone palettes, reduced motion,
fixed quality and repaired resize lifecycle are explicitly documented adaptations.
Cross-GPU floating-point identity and every adaptive-quality history are not claimed.

Final recheck found and fixed a diagnostic shader sensitivity after context recovery.
The five-sample source-color shader differed by at most one level in 235 channels
when it retained the unused product theme branch. Source captures were unchanged.
The diagnostic now compiles the captured shader without that branch; the production
two-tone shader retains uniform-based theme switching. The final 21-frame matrix
passes with zero differences after lifecycle/context recovery runs first in the
same process (recheck-pass.json). Failure evidence is retained in
recheck-after-lifecycle.json; see the spec's final section for controlled experiments.

Fresh Computer Use inspection: recheck-cu-live.png, recheck-cu-dark.png,
recheck-cu-light.png and recheck-cu-source-pointer.png. Checked loaded original,
both derived palettes, animated source mode, pointer response and non-navigating
background click. Final warm startup: paint 48–56 ms, ready 44.7–57.4 ms,
no long tasks (recheck-startup.json). Final proof: 43,823 bytes / 12,752 gzip bytes.

Reproduce locally:
1. Serve with: python3 reference/raycast/serve.py
2. Open http://127.0.0.1:8766/proof.html (system theme), or add ?theme=dark,
   ?theme=light, ?palette=source, ?motion=reduced, or &t=5.
3. Rebuild with esbuild 0.25.12 on PATH: sh reference/raycast/build.sh
4. In a Node session with Playwright/Chrome, import verify-sequence.mjs and call
   verifySequence({browser,width:800,height:600}); repeat with 390×844 and 1200×800.
   It saves comparisons and throws on any differing channel.
5. Import verify-lifecycle.mjs and verify-boundaries.mjs; call
   verifyLifecycle(browser,referenceRoot) and verifyBoundaries(browser,referenceRoot).
   Both throw on failed assertions. measure-startup.mjs and measure-runtime.mjs
   expose analogous measureStartup/measureRuntime functions.

Syntax checks and git diff --check pass. Build output is deterministic (hashes in
final-delivery.json). The standalone HTML is retained on the branch. Full source
mirrors, authoring files and large captures remain local reference assets under the
repository's existing reference/ ignore convention. No implementation PR is opened.
