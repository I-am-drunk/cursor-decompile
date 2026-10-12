# Automations carve: copy-first correction

This replaces the earlier acceptance notes for PR #27. Hover/drag reveal and
native time inputs were inventions; passing interaction tests did not establish
reference parity. The owner correction supersedes those choices.

## Source-to-change audit

| Changed surface | Reference and disposition |
|---|---|
| Shell widths | [Measurements](../../artifacts/shell/reference-measurements.json): 280px expanded, 44px compact. |
| Compact destination | [Capture](../../artifacts/shell/reference-collapsed.png), DPR 2: 26px target, 14px icon, 8px inset. One visible, clickable SVG. |
| Expanded destination | [Capture](../../artifacts/shell/reference-expanded.png): 32px row, 6px outside inset, 8px icon inset. Deleted rows close up. |
| Interaction | Explicit Collapse/Open click only. Deleted pointer, drag and focus reveal, shortcut, active tint, overlay shadow and responsive overlay. [Evidence](../../facts/shell-verification.md) observed no drag expansion and did not establish hover behavior. |
| Contents | Retained captured Automations destination. Deleted Workspace heading, added Run History item and Settings/Accounts/Local preview footer. Runs remain reachable through All Runs and the editor tab. |
| Schedule phrase | Devin §12.6: hourly minute; daily separate hour/minute/timezone; weekly weekday/hour/minute/timezone. Removed native time/number/weekday inputs. |
| Choices | Devin §9.4 and Appendix E: hours 00–23, minutes 00–55 by five, Monday–Sunday. Existing off-grid minutes retained; no invented random jitter. |
| Timezone | Devin Appendix E: offset + long name + city, UTC last, Search timezones / No timezones found. Removed raw-IANA-only labels and custom datalist. |
| Custom | Devin §12.7: 340px start-aligned popover, three-row monospace field, 12px padding, full-width Apply. Deleted invented heading, Cancel and grammar prose. Owner-required cron replaces RRULE; Visual/RRULE and Run once are carved out because Cursor evidence does not establish them. |
| Validation | [Cursor presets](../../facts/automations-preset-capture.md): live empty/field-count errors; invalid Escape/outside retain editor. Enter/Apply stages valid cron; Save persists. Range rejection remains local parser policy. |
| Shared styles | Reused captured tr-schedules, pr-options, tr-pop and ed-trigger-row. Removed invented 34px preset rows, 48px schedule rows and global 340px menu width. |
| New editor | Reuses saved-editor components; Create label follows source facts. |
| Provider copy | Removed earlier Cursor/domain substitutions; descriptions render captured copy. |
| Routes | Chat, Search, Codebase(s), dashboard and unknown pages return HTML 404 before sign-in. Automation/authentication remain. Settings is separately owned configuration, absent from this rail. |
| Plumbing | Minute precision, validated IANA metadata, escaping, asset registration and package name remain; none prove visual parity or execution. |

## Reference identity and limits

Devin source: `~/decompile-hub/devin-decompile/DEVIN_AUTOMATIONS_DECOMPILED_SPEC.md`,
Devin Desktop/Windsurf 3.8.20, captured 2026-09-02; §9.4, §12.6–12.7
(in the later full specification), Appendix E. Copy source:
`DEVIN_AUTOMATIONS_COPY_CATALOG.md`: schedule*Phrase, scheduleEvery*,
scheduleCustom, selectTimezone, searchTimezones, noTimezonesFound, apply.
Sibling `_work/classes/` corroborates custom layout and phrase gaps.
No vendor implementation or bundles are committed.

Cursor: 2026-10-12, web build unspecified, 1270×764 at DPR 2;
shell measurement viewport 936×764. Local captures use 1270×764 at DPR 2.
The composition combines the requested Devin schedule layout with Cursor's
shell and cron behavior. It is not an exact raster copy of either complete app.
Fonts/icons, unavailable Devin screenshot geometry and ICU-dependent timezone
catalog size remain UNVERIFIED; they are not counted as passing parity checks.

## Validation

The browser gate checks persisted minute/day/zone edits, choices, live errors,
Apply, compact icon hit targets, no hover/drag/focus expansion and HTTP 404s.
Screenshots remain in ignored `corpus/`.

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright-core/index.mjs \
BROWSER_EXECUTABLE=/absolute/path/to/chrome node test/browser-automations.mjs
```

Use Node 22.18+; the machine's default Node 18 cannot run TypeScript tests.
A fresh clone avoids unrelated ancestor Bun ambient types affecting the MCP
TypeScript check in the home-directory checkout.
