# Settings navigation opener verification — 2026-10-12

[PR #18](https://github.com/I-am-drunk/cursor-decompile/pull/18) uses the
[read-only capture](settings-navigation-capture.md) to drive an original
settings sidebar, account Privacy/Profile panel, account menu and overview
preview. Start the local server and open
`/dashboard/settings?fixture=settings-navigation` (also available from the
Automations **Local preview → My Settings** link).

**55 tests, 3,676 measured checks across 60 states, and 745 raw-source pins
pass.** All 2,678 prior checks (including the original 2,157) remain passing.
The five settings states contribute 998 comparisons: account, account menu,
overview, keyboard return and menu dismissal. All 60 current-build exports
and paired screenshots were refreshed via Computer Use in Twilight.

The source labels are exact: OBSERVED attributes/destinations are separate
from EXTRACTED_UI computed rectangles/styles/copy. The comparator checks the
same 1270 × 764 viewport at DPR 2, the sanitized fixture URL, build identity,
selected navigation styling, retained control state and keyboard return focus.
Private account identity is never a committed fact or a served fixture value.

## Deliberate boundaries

- Local identity is synthetic; the overview is a labeled reference-derived
  preview, not live usage, pricing advice, or a purchase offer.
- Inputs are readonly, Save is disabled, and state-changing/external controls
  report an unavailable notice. No account, privacy, upload, authorization,
  session, installation, billing or execution API is invoked.
- Integrations/Spending navigation has explicit UNVERIFIED placeholders.
  Lower settings sections and team/admin panels are not rebuilt.
- The reference entry dropdown is captured; the local entry is a DESIGN link
  in Local preview, not a claim of global account-menu parity.
- Logo/icon glyphs, private identity text widths, full raster matching,
  alternate viewports/themes and unobserved settings behavior remain UNVERIFIED.
  Responsive fallback rules are DESIGN, not measured parity.

Next slice: open **Integrations** read-only and capture one unconnected
provider panel before implementing it. Do not connect, install or authorize.

## Count audit

`pipeline/measurement-summary.mjs` reproduces and sums every comparison:
2,157 baseline + 521 run-filter + 998 settings = **3,676**. Earlier #17 prose
incorrectly added the filter subset as 621; its unchanged passing log totals
2,678. This slice corrects that reporting error and asserts group counts.
