# Whole-Cursor roadmap

Every row is a lane, not permission to build a whole layer. Split a lane into
one visible state or interaction per PR; claim the exact slice on #1.

| Order | Lane | Surface / first slice | Acceptance evidence |
|---|---|---|---|
| 1 | C-AUTOMATIONS | next: Add Trigger and schedule-control capture; saved-editor/MCP measured subset verified; foundation [#10](https://github.com/I-am-drunk/cursor-decompile/pull/10) and failed-run rows [#11](https://github.com/I-am-drunk/cursor-decompile/pull/11) complete | authenticated state captures; [layout](specs/automations-layout.md) and [handoff](specs/linear-as-integration.md) |
| 2 | C-SETTINGS | settings navigation, account/team, models, integrations, MCP | navigation and one panel at a time; measured UI facts |
| 3 | C-SHELL | window, sidebar, command palette, navigation | route/state/keyboard captures |
| 4 | C-AGENTS | agent list, conversation, tool results, review, projects | loading/empty/populated/error states and interactions |
| 5 | C-EDITOR | files, tabs, search, source control, terminal, diff | pane layouts and keyboard behavior |
| 6 | C-CUSTOMIZE | rules, skills, subagents, hooks, plugins/marketplace | observed configuration and install flows |
| 7 | C-CLOUD | cloud agents, environments, repositories, runs, managed agents | observed list/detail/setup states |
| 8 | C-ACCOUNT | web dashboard, team/admin, usage/billing, integration management | account-scoped reference captures |

Cross-cutting work: accessibility, theme, responsive states, evidence validation,
and the shared execution adapter. These accompany each slice; they are not
separate speculative redesigns. Surface coverage is a planning inventory,
not a claim that every reference screen has been captured.

Automations delivery order: evidence → exact list → exact editor → per-automation
MCP → model/provider binding → Linear connection → runs. Reuse the Linear
project's execution runtime through adapters; do not create a second scheduler.

## Completed foundation — 2026-10-12

[PR #10](https://github.com/I-am-drunk/cursor-decompile/pull/10) delivers private
authenticated captures, cited facts, a runnable original local list/editor,
trigger and per-automation MCP configuration, model/repository selection,
persistence, run views, comparison checks and a hosted-CI template.
The [verification report](facts/automations-verification.md) records 18 passing
tests and 101 measured checks for the upsell and empty Run History states.

This completes the **foundation slice**, not C-AUTOMATIONS exact parity.
Unmatched current editor/list states, full feature variants, live MCP/execution,
font/icon raster parity and independent parity acceptance remain UNVERIFIED.
The hosted workflow remains a template because publishing it requires
additional GitHub permissions.

## Completed API/row slice — 2026-10-12

[PR #11](https://github.com/I-am-drunk/cursor-decompile/pull/11) establishes
that this account can create disabled definitions through the API. The
main list still shows an upsell; corrected test execution creates a real
plan-restricted failed run. Its row, menu, summary and navigation are now
measured, while main-list row corrections remain bundle-extracted.

The saved editor is reachable by ID, and additional editor/MCP/model
screenshots are captured. Next claim: reproduce **one saved-editor control
state**, then its per-automation MCP flow. A plan-enabled populated main list
and successful/running executions remain separate evidence gaps. Do not
promote extracted or reference-derived fixture behavior into observed parity.

## Saved-editor/MCP measured subset — 2026-10-12

The [editor slice](facts/automations-saved-editor.md) implements the captured
saved editor, tools/MCP menus, new-connection browser, custom URL/command/JSON
forms, and eight-model picker with parameter controls. Configurations persist
locally behind opaque references; no MCP command, authorization or run executes.
Thirty tests and 737 measured checks across fourteen states pass; 149 raw
source pins reproduce. This is subset verification, not independent pixel parity.

Next thin slice: **capture Add Trigger and the existing schedule's picker** on
the same disabled private fixture, without saving or running it. Record menu,
schedule variants and keyboard behavior before replacing the current DESIGN
trigger form. Event-provider authorization, live MCP and execution remain
separate adapter work; a plan-enabled populated main list remains an access gap.
