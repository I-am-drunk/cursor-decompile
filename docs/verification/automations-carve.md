# Automations carve and schedule presentation

Owner directive: [MASTER-PLAN](../MASTER-PLAN.md), agent B. No changes to
`facts/`, `corpus/`, or `artifacts/`. No dependencies added.

The shell contains Automations, Run History, Settings and Accounts. Chat/search
pages and the billing gate/checkout link are removed. Codebases was already
absent; both spellings of that old route now return an HTML not-found view,
including before sign-in. Unknown automation IDs show a not-found view.
Settings routes remain agent A's ownership.

One SVG per destination replaces overlapping compact/expanded copies.
The 44px rail and 280px expanded width follow existing
[shell evidence](../../facts/shell-verification.md). Pointer, focus and drag
reveal overlay content without moving the main pane. Drop, drag-end, leave and
Escape clear drag state. Unverified width/opacity animations were removed.

## Schedule source mapping

Presentation comes from sibling `DEVIN_AUTOMATIONS_DECOMPILED_SPEC.md`,
sections **12.6–12.7**, lines 7358–7383, and
`DEVIN_AUTOMATIONS_COPY_CATALOG.md`, lines 805–821 (`scheduleEveryHour`,
`scheduleEveryDay`, `scheduleEveryWeek`, `scheduleCustom`, the three
`schedule*Phrase` keys, `selectTimezone`, `searchTimezones`, `noTimezonesFound`).

- Hourly: “Every hour at minute [minute]”.
- Daily: “Every day at [time] [timezone]”.
- Weekly: “Every week on [weekday] at [time] [timezone]”.
- Flat preset menu; existing rows can change frequency.
- Custom: start-aligned 340px popover, three-row monospace editor, timezone,
  Cancel and Apply. Errors keep the editor open.
- Searchable timezone list includes the current zone and UTC; explicit empty state.

The requested adaptation uses **cron**, not Devin's RRULE representation or
RRULE Visual tab. Numeric 5–7 field / alias validation and defaults retain
[captured trigger behavior](../../facts/automations-trigger-verification.md)
and [preset evidence](../../facts/automations-preset-verification.md).
Invalid custom input blocks outside/Escape dismissal; Cancel discards it.
Apply stages the change; Save persists it. No schedule preview is invented.

`trigger.value` remains cron with `{kind,time,day,timeZone}` metadata. Minute
precision and IANA timezone validation round-trip through the store. Existing
custom triggers without metadata display UTC, matching the previous editor.
Timezone changes retain wall time. Execution belongs to the server lane.

Historical captures cannot certify this new presentation. New spacing, native
time/select controls, icons, and full raster parity are **UNVERIFIED**.

## Validation

Fresh-clone full gate passes: strict app/MCP TypeScript, 75 app/reader tests,
6 MCP tests, 748 evidence metadata records and whitespace checks.
Real headless Chrome at 1270×764 checks preset/time/day/zone edits, custom
validation/Apply, compact icons, hover, drag/drop cleanup and HTML 404s.
The browser gate also passes against the fresh clone.

Repeat the browser gate with an existing Playwright install and Chrome:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright-core/index.mjs \
BROWSER_EXECUTABLE=/absolute/path/to/chrome node test/browser-automations.mjs
```

The gate creates a temporary local store/account, checks saved schedule reloads,
custom invalid/Escape handling, compact navigation without losing state,
mobile icons and removed routes, then removes its temporary store.
