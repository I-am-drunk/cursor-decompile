# Browser verification — 2026-10-13

Research verification, not a product implementation approval. Chrome 155, fresh anonymous contexts, desktop 1440×1000 and narrow viewport 390×844. The narrow pass uses desktop pointer capabilities; it verifies responsive layout, not touch hardware.

## Repeatable live and local pass

[Live measurements](16-live.json), [local measurements](17-replay.json), and [runner](../tools/browser-pass.mjs) record the exact run time, resource URLs, font availability, styles and geometry.

| Exercise | Result | Evidence |
|---|---|---|
| Home layout and typography | Same heading geometry and font roles; six 180px desktop cards | [Live](16-live-home.png), [local](17-replay-home.png) |
| Poster hover | 2px outline changes transparent → foreground; title brightens; no geometry shift or CSS transition | [Live](16-live-hover.png), [local](17-replay-hover.png); JSON posterHover/titleHover |
| Poster focus with pointer moved away | Foreground outline remains; focus styling is independent of hover | JSON posterFocus |
| Cmd+K | Expanded search opens and input receives focus | [Live](16-live-search.png), [local](17-replay-search.png) |
| Type query; ArrowDown | Selected result receives aria-selected; focus remains in input | [Live](16-live-search-results.png), [local](17-replay-search-results.png); JSON search.afterArrow |
| Escape | Form becomes opacity 0 and pointer-events none | Both JSON search.closedForm/escapeClosed |
| Navigation trigger | Overlay opens above unchanged page | [Live](16-live-menu.png), [local](17-replay-menu.png) |
| Customize home | Preferences dialog opens from footer action | [Live](16-live-preferences.png), [local](17-replay-preferences.png) |
| Narrow home | Heading 20/28px, x16; carousel and fixed bottom navigation; document width 390px | [Live](16-live-mobile.png), [local](17-replay-mobile.png) |

Visually inspected the live desktop/mobile and local desktop images. Structure, spacing, typography and surfaces agree. Catalog ordering, counts and relative dates can differ because live data changes and replay retains earlier responses. This is a structural comparison, not a claim of identical pixels for changing content.

The runner was corrected during this pass: `isVisible()` does not detect opacity-zero ancestors, so it incorrectly reported Escape as failing. Measuring the form's computed opacity and pointer-events verifies dismissal. Mobile screenshot capture now waits for route scroll restoration before scrolling to the top. These were instrumentation errors, not tests retried into green.

## Motion pass

[Frame samples](18-motion.json) and [runner](../tools/motion-pass.mjs) record navigation opening under both `no-preference` and `reduce`. Opacity 0→1 and individual scale .9→1 complete around 150ms; Web Animations timing confirms 150ms, cubic-bezier(0,0,.2,1). Reduced motion retains this animation. Frame timestamps depend on scheduling; an initial requestAnimationFrame timestamp can precede the click's performance.now timestamp. They are observations, not a universal latency benchmark.

The computed transition property is `all`; the malformed source property list does not limit it to transform/opacity. The opening visibly interpolates the individual scale property as well as opacity. See interactions' cascade note.

## Earlier evidence and boundaries

Screenshots 01–15 and accompanying AX excerpts survived the previous pass. They show original home/preferences/navigation/search/explore/filter/detail and local home/search/preferences/nested panels. Some AX files contain only “no change” and are not sufficient to establish all interaction claims independently. Current scripts re-establish the table above; earlier clicks not covered there remain screenshot evidence.

Not exercised: authentication, account mutations, reader controls, downloads, management routes, premium theme selection, actual touch long-press, every route's error state. Those portions of the analysis are EXTRACTED, not VERIFIED. Spring simulation is a source reconstruction. No UI implementation or PR was created; the verification is of the captured reference.
