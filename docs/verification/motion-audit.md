# Motion and interaction audit — 2026-10-12

Audited `src/` from main `2c37b3d`. The final implementation retains only two
CSS transitions: the sidebar's layout width and surface width, both 180ms with
`cubic-bezier(.22,1,.36,1)`. No CSS keyframes, Web Animations, smooth scrolling,
or JavaScript motion loops exist. All screenshots below are of our local UI.

## Evidence and timing provenance

The [expanded reference](../../artifacts/shell/reference-expanded.png),
[collapsed reference](../../artifacts/shell/reference-collapsed.png) and
[measurements](../../artifacts/shell/reference-measurements.json) establish
280px / 44px widths and the easing curve. Reference: Cursor web, build unknown,
2026-10-12, `/automations` Free upsell; screenshot viewport 1270×764 at DPR 2,
measurement viewport 936×764. The two published PNGs are cropped.

The current owner request explicitly says to keep the captured 180ms sidebar
ease. **KEEP, OWNER_REQUIREMENT:** retain that duration. The older committed
measurement reports click duration `0s` and normal duration `UNVERIFIED`;
[facts/shell-verification.md](../../facts/shell-verification.md) called local
180ms DESIGN. We preserve those historical facts rather than rewriting the
capture to claim it measured 180ms. Likewise, static PNGs cannot establish
hover/focus timing. The available capture observed no drag expansion and could
not measure pure hover. No independent hover/focus reveal parity is claimed.

## Complete motion inventory

Rows refer to the baseline selectors; deleted selectors no longer exist.

| Source / property or trigger | Captured support | Verdict and final behavior |
|---|---|---|
| `shell/sidebar.css` `.shell-sidebar` width | Width endpoints and easing observed; duration owner-required as above | **KEEP** 180ms width transition. Layout reservation follows the visible rail. |
| Same, `.sidebar-surface` width | Same shell evidence | **KEEP** same duration/easing; both widths stay synchronized. |
| Same, `.sidebar-surface` box-shadow transition | No captured animated shadow; only dormant reveal rules used it | **DELETE** transition and invented reveal shadow. |
| Same, `.side-label` opacity transition | No captured label fade | **DELETE** fade; hide compact labels immediately, keep expanded labels unwrapped. |
| Same, `.rail-icon` opacity transition | No captured icon crossfade | **DELETE** fade. One icon remains visible and clickable in both states. |
| Same, `.full-icon` opacity transition | No captured duplicate icon/crossfade | **DELETE** duplicate markup and rules. |
| Same, `.rail-revealed` / `.rail-focus` overlay expansion and icon/label switches | No handlers in current JS; no positive capture | **DELETE** dormant overlay rules. |
| Same, ≤639px `:focus-within` width/label reveal | No mobile/focus capture; conflicted with collapsed state and click expansion | **DELETE** auto-reveal. **FIX** explicit toggle at narrow widths; retain visible rail and 280px expanded endpoint. |
| Same, reduced-motion override | Accessibility policy, not a captured vendor fact | **KEEP** disable both remaining transitions. |
| `automations/style.css` reduced-motion `scroll-behavior:auto` | Accessibility policy; no smooth scroll declaration exists | **KEEP** nonanimated safeguard. |
| `automations/app.ts` `requestAnimationFrame` in `exportMeasurements` | Measurement tooling | **KEEP** one frame before reading geometry; no motion/update loop. |
| Same, 1000ms `setTimeout` | Object URL cleanup | **KEEP** resource cleanup; no visual changes. |
| Same, 1500ms `setInterval` | Local run polling, documented in `facts/t3-bridge.md` | **KEEP** data refresh; no interpolated motion. Poll timing is local policy. |
| `net/policy.ts`, `net/websocket.ts`, `inference/rpc.ts`, `inference/t3.ts` 15s timers; `inference/turn.ts` 15min timer | Transport/observation deadlines | **KEEP** nonvisual failure handling. |

Scanned CSS and TypeScript for transition/animation/keyframes, `.animate`,
requestAnimationFrame, timers, transforms, scrolling, opacity and visibility.
There are no additional motion declarations in auth, settings or other src
packages. Switch position/color changes, popover/dialog mounting, hover colors,
focus outlines and title/model/trigger action reveals are instantaneous state
changes, not animations. The existing `editor.css`, `trigger.css` and
`schedule.css` hover/focus reveals remain instantaneous; see
[editor evidence](../../facts/automations-saved-editor.md),
[trigger evidence](../../facts/automations-trigger-capture.md) and the schedule
source below. These citations establish the controls, not a fade duration.

## Sidebar verification

**FIX:** the old compact header kept the invisible Search button's width and
clipped the Open sidebar button. Compact Search now occupies no space; the
single 24px toggle is centered and receives clicks. Every destination has one
14px SVG inside a 26px target, inset 8px; expanded rows remain 32px high with
labels. Hover/focus never hides an icon or unexpectedly expands the rail.
Rapid toggles finish at the requested width; reduced-motion disables animation.
Browser checks cover 1270×764 and 390×844, clicking the compact Automations
link, expanded/compact toggle hits, keyboard focus and hover/drag stability.

| Same local upsell state, 1270×764 DPR 2 | Screenshot |
|---|---|
| Expanded 280px | [Expanded](motion-audit/shell-expanded.png) |
| Collapsed 44px | [Collapsed](motion-audit/shell-collapsed.png) |
| Keyboard focus on compact destination | [Focus](motion-audit/shell-focus.png) |
| Hover on compact destination | [Hover](motion-audit/shell-hover.png) |

The reference's vendor logo/Codebase and local Settings entry remain the
existing product carve; font/icon outlines and full-page raster parity are
not certified. Hover/focus screenshots demonstrate local stability, not new
reference observations. Mobile behavior remains a local accessibility policy.

## Schedule pass

Re-read `~/decompile-hub/devin-decompile/DEVIN_AUTOMATIONS_DECOMPILED_SPEC.md`
§9.4 (lines 669–677), §12.6–12.7 (7361–7381), and Appendix E
(4026–4038). Reference is Devin Desktop/Windsurf 3.8.20, captured 2026-09-02.
This remains the owner-requested Devin presentation with Cursor cron
semantics, not Devin's RRULE engine. No vendor code is included.

| Control / verdict | Source and verification | Local screenshot |
|---|---|---|
| **KEEP** frequency rows | §12.6, Appendix E: hourly/daily/weekly/custom. Existing Run once carve remains. | [Presets](motion-audit/presets.png) |
| **KEEP** hourly minute | §12.6: no hour, weekday or timezone in hourly row. | [Hourly](motion-audit/hourly.png) |
| **KEEP** daily hour/minute/timezone | §12.6, Appendix E; separate 00–23 hours and 00–55 minutes in steps of five. | [Daily](motion-audit/daily.png), [hours](motion-audit/hours.png), [minutes](motion-audit/minutes.png) |
| **KEEP** weekly weekday/time/timezone | §12.6; edited Tuesday 10:25 Tokyo persists as `25 10 * * 2` with zone metadata through save/reload. | [Weekly](motion-audit/weekly.png) |
| **KEEP** searchable timezone labels | Appendix E: GMT offset + long name + city; UTC last; search and empty copy. ICU may expose a different catalogue count from captured 419. | [Tokyo search](motion-audit/timezone.png), [empty search](motion-audit/timezone-empty.png) |
| **KEEP** 340px custom popup, three-row monospace field, Apply | §12.7 gives layout; cron replaces RRULE per owner carve. [Cursor validation evidence](../../facts/automations-preset-capture.md) supports live invalid-input errors and blocked invalid dismissal. | [Custom](motion-audit/custom.png), [invalid](motion-audit/custom-invalid.png), [applied](motion-audit/custom-applied.png) |
| **FIX** custom → timezone → outside click | Previously discarded an invalid custom draft, bypassing Cursor's dismissal guard. Return to custom and validate before closing. Regression checks preserve `bad` through outside click and timezone selection, then apply valid cron. | Same custom/invalid states above; interaction checked by browser gate. |
| **FIX** remove action | Appendix E explicitly identifies a trash icon. Replaced the local X with our own trash SVG; hover/focus reveal has no animation. | Visible when interacting with the row. |

The adapted cron label/help, raw-only custom mode, deterministic preset defaults,
and selected off-grid minutes remain local policies described in
[the prior source map](automations-carve.md). They do not implement Devin's
Visual/RRULE tabs, random minute generator or future one-time schedule.
Timezone editing stages metadata immediately; Save persists it. No scheduler
runs and no execution parity is asserted.

## Validation and reproduction

Node 22.23.3: 75 root tests + 6 MCP tests, both strict TypeScript projects,
standard evidence validation and `git diff --check` pass. Removed one stale,
unused `editor` import that prevented strict TypeScript on the merged baseline.
The expanded Chromium gate passes timing, width, rapid-toggle, reduced-motion,
hover/focus/drag, mobile click, schedule persistence and validation checks.
[Capture metadata](motion-audit/capture.json) records browser version, timestamp,
viewport, state names and a sampled intermediate motion width.

```sh
npm ci
npm --prefix mcp ci
npm run check
PLAYWRIGHT_MODULE=/absolute/path/to/playwright-core/index.mjs \
BROWSER_EXECUTABLE=/absolute/path/to/chrome node test/browser-automations.mjs
```

The browser gate uses a temporary local account/store and writes these 15 local
screenshots to `docs/verification/motion-audit/`. It never calls a reference or
provider account. The historical full-reference comparator was not rerun;
passing the standard evidence gate validates records, not private source pins
or whole-page pixel parity. Peer review is requested in the PR.
