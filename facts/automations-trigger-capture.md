# Add Trigger / schedule evidence — 2026-10-12

This is an **evidence-only slice**, not a trigger implementation or parity claim.
Computer Use in authenticated Twilight opened the existing private, disabled,
agent-created fixture A. No trigger was selected or edited, and no Save, Test,
activation, provider authorization or API mutation was performed.

Raw DOM/computed-style JSON, PNGs and AX trees are private in
`reference/automations/triggers-2026-10-12/`. Viewport: **1270 × 764 CSS px,
DPR 2**, light theme, expanded sidebar, America/Toronto timezone.
Web build is unspecified; artifact hashes identify the captured state.

| State | JSON SHA-256 |
|---|---|
| `baseline` | `30177fa5067eb7423047828e628c640db430b341c0e655996403a4c2f3c22ded` |
| `add-trigger` | `d837be9c0d0a5eb833b87f572fdaa382ad2855b3a81304201f2f2546dd16a224` |
| `scheduled-submenu` | `04e52820cdc429a54fccaf583d67bd0cf1a8e1ea870581fb3a4b3b8984b4d99d` |
| `schedule-picker` | `08782fe63b557da5f6b77394d96e8d02634e847a099ac0f13f19b10ab1baea03` |
| `dismissed` | `0a54aa76b2c39a20c33a0f552382d90d44801d86f490a1f474c94040821e5de2` |

The 30 records in [`trigger-facts.json`](../src/automations/trigger-facts.json)
pin individual properties. `OBSERVED` records confirm Save remains disabled
and the enabled switch remains off before and after inspection.
`EXTRACTED_UI` values come from the observed DOM, not a compiled bundle.

## Findings

- Add Trigger opens a searchable popup, not the current local generic dialog.
  `add-trigger.json` element 187: x 341, y 316.5, 280 × 265, radius 14.
  Its seven choices are Scheduled, Slack, Microsoft Teams, Sentry, Linear,
  Webhook Triggered and PagerDuty (elements 203, 210, 217, 224, 231, 239, 243).
- Down then Right opens Scheduled; Hourly receives focus. Its submenu has
  Hourly, Daily, Weekly, Custom (cron). Element 256: x 617, y 365.5,
  200 × 132, with 30px rows. Escape returns to Scheduled, then Escape closes
  Add Trigger. These steps are recorded in the private interaction log/AX trees.
- Clicking the existing cron value opens **Cron expression (UTC)**, its input,
  three upcoming dates and an ellipsis. `schedule-picker.json` element 189:
  x 488, y 264.5, 204 × 152, radius 14; elements 197/201/203 pin the controls.
  The hint says **5-7 fields or @daily/@hourly**. This proves displayed copy,
  not acceptance or execution semantics for every such expression.

## Implementation handoff and exclusions

Next: replace the DESIGN Add Trigger and custom-cron editor with measured
controls, and add same-state local comparisons. The existing local five-field
validator is narrower than the displayed reference hint; do not silently claim
grammar parity. Hourly/daily/weekly configuration forms still need captures.
Provider-specific forms, trigger creation/removal, validation errors, scheduling
and responsive/theme variants remain UNVERIFIED. No new automation was created.

Run `node pipeline/check-evidence.mjs reference/automations` to reproduce the
source pins. Existing 737 local UI checks remain unchanged: this capture does
not add a local comparison before a matching implementation exists.
