# Preset / validation verification — 2026-10-12

The [reference capture](automations-preset-capture.md) supplied nineteen
AX/JSON/PNG triples from unsaved inspection tabs. The reopened saved definition
remained disabled and unchanged. No reference Save, Test, activation or
authorization action was submitted; unsaved inspection tabs may remain open.

## Delivered measured subset

- Hourly, daily, weekly and custom preset rows and their captured defaults.
- Daily time selection; weekly day and time selection, including changed values.
- The multiple-cron warning and dirty Save state.
- Custom-cron empty/field-count errors and the distinct no-upcoming-runs view.
- Invalid Escape/outside-click attempts leave the popup visible; restoring a
  valid value permits dismissal.
- The Unsaved Changes safeguard's measured layout, copy and control order.

`OBSERVED` refers to these reference states/interactions, not a saved definition
or execution. `EXTRACTED_UI` records in
[`preset-facts.json`](../src/automations/preset-facts.json) pin their DOM values.
The local implementation is original; no vendor assets or code are served.

## Verification

**43 tests**, strict TypeScript, **360 source pins**, and **1,736 measured
checks across 37 states** pass. All previous **992 checks** are preserved;
the eighteen added comparison states contribute **744**. The two reference
baseline captures map to the same clean local baseline.

Current-build Twilight exports use 1270 × 764 CSS px, DPR 2, light theme.
UI build SHA-256:
`f4eb912281381cd7d2a06bc93e77c3aba76d30ba80d9143db551eae663ed98a4`.

Screenshot review and comparison caught/fixed proportional time-label widths,
a detached popup anchor after live validation, dirty Save styling and the
unsaved-dialog backdrop. Tests cover metadata validation/persistence,
per-preset selection, invalid dismissal, anchoring, escaping and dirty state.

## Explicit limits

The reference displayed `60 0 * * *` without a syntax error but with no upcoming
runs. This is not proof of server acceptance. The local save validator remains
stricter; its numeric ranges and unsupported syntax policy are **DESIGN**.
No reference save or invalid-input submission was attempted.

Non-custom presets retain local wall-time/zone metadata. Its serialization and
execution interpretation are DESIGN, not Cursor's API protocol. The displayed
upcoming dates are reference-derived fixtures, not computed scheduling results.
Outside the fixture no schedule prediction is invented. No scheduler was added.

Fonts/glyphs/weights, native focus rings, hover/shadow/icon raster parity,
other timezones/viewports, unobserved validation variants and provider-specific
forms remain UNVERIFIED. Independent visual acceptance remains open.
