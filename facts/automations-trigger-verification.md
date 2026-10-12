# Trigger-control verification — 2026-10-12

The original local implementation now covers the observed **Add Trigger**,
**Scheduled submenu**, **custom-cron editor**, and unchanged/dismissed states
from the [trigger capture](automations-trigger-capture.md).
The 50 [property records](../src/automations/trigger-facts.json) retain their
original source hashes and OBSERVED / EXTRACTED_UI labels.

Computer Use in Twilight exercised the matching local fixture at
**1270 × 764 CSS px, DPR 2**, light theme and expanded sidebar.

| State | Passing measured checks |
|---|---:|
| Trigger baseline | 39 |
| Add Trigger | 74 |
| Scheduled submenu | 40 |
| Custom-cron picker | 62 |
| Dismissed, focus restored to cron control | 40 |
| Prior fourteen editor/MCP/run/gate states | 737 |
| **Total** | **992** |

Strict TypeScript, **35 tests**, and **199 raw-source pins** pass.
All nineteen exports match UI build
`02359c51321510e9dd2ca9cc56078613ac65453359468cfaba309ad1ba14fc07`.
No reference fixture was changed, activated, authorized or run.

## Local behavior versus reference evidence

Observed keyboard steps are reproduced: Add Trigger focuses search; Down then
Right opens Scheduled and focuses Hourly; Escape returns to Scheduled; another
Escape closes the menu. The cron editor focuses its input and Escape restores
the invoking control. Closed-state checks also reject a remaining overlay,
changed enabled/Save state, wrong input values or a missing focus return.

Local cron editing was tested separately: Escape discards an unsaved input;
Enter validates/stages it; Save persists a disabled local definition; reload
retains it. The local store still contains no runs. Those commit semantics,
preset defaults, validation messages and provider notices are **DESIGN**, not
observations of reference mutation behavior.

## Explicit limits

- Numeric five-, six- and seven-field expressions and common `@` aliases are
  locally validated. Field ranges (including the local 1970–9999 year bound)
  and unsupported named/special syntax are our policy, not vendor parser parity.
  No scheduler or second execution runtime was added.
- The four preset choices create local schedule drafts using declared defaults;
  their reference configuration forms remain UNVERIFIED. Provider choices show
  an unavailable notice rather than inventing an authorized integration.
- Upcoming dates are a labeled reference-derived fixture only for its captured
  annual expression. Other expressions show that a local preview is unavailable;
  no fabricated schedule prediction or successful execution is displayed.
- The annual label width, cron text width and chevron margin are pinned in
  `baseline.json` elements 132, 134 and 135. A nowrap regression found during
  screenshot review now has explicit geometry/copy checks.
- System-font glyphs, provider icon substitutes, native focus rings, hover
  highlights, shadows, alternate themes/viewports and independent visual
  acceptance remain outside the measured-subset claim.

Reproduce all checks using the [pipeline workflow](../pipeline/README.md).
