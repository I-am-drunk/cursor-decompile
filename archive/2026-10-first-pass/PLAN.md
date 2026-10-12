# Whole-Cursor roadmap

Every row is a lane, not permission to build a whole layer. Split a lane into
one visible state or interaction per PR; claim the exact slice on #1.

| Order | Lane | Surface / first slice | Acceptance evidence |
|---|---|---|---|
| 1 | C-AUTOMATIONS | Captured web subset complete; retain gated/connected and desktop acceptance gaps | authenticated state captures; [layout](specs/automations-layout.md) and [handoff](specs/linear-as-integration.md) |
| 2 | C-SETTINGS | Navigation/account opener verified; next: one unconnected provider panel | read-only capture first; no settings mutations or authorization; measured UI facts |
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

[PR #12](https://github.com/I-am-drunk/cursor-decompile/pull/12), the
[editor slice](facts/automations-saved-editor.md), implements the captured
saved editor, tools/MCP menus, new-connection browser, custom URL/command/JSON
forms, and eight-model picker with parameter controls. Configurations persist
locally behind opaque references; no MCP command, authorization or run executes.
Thirty tests and 737 measured checks across fourteen states pass; 149 raw
source pins reproduce. This is subset verification, not independent pixel parity.

The subsequent [trigger evidence slice](facts/automations-trigger-capture.md),
[PR #13](https://github.com/I-am-drunk/cursor-decompile/pull/13),
captures Add Trigger, Scheduled choices and the existing custom-cron editor,
with 30 source pins and unchanged disabled/clean fixture state.

[PR #14](https://github.com/I-am-drunk/cursor-decompile/pull/14), the
[trigger implementation](facts/automations-trigger-verification.md), now
reproduces the captured menu, custom-cron and dismissal subset: 35 tests,
992 measured checks (737 preserved + 255 new), 199 source pins.
Local parser, commit and preset policies are explicitly DESIGN; no scheduler
or authorization/execution integration was added.

[PR #15](https://github.com/I-am-drunk/cursor-decompile/pull/15), the
[preset/validation follow-up](facts/automations-preset-verification.md),
adds hourly/daily/weekly/custom rows, day/time selectors, live validation and
the unsaved guard. Nineteen private capture triples support eighteen added
local comparison states: 43 tests, 1,736 measured checks and 360 source pins
pass, preserving all prior 992 comparisons.

[PR #16](https://github.com/I-am-drunk/cursor-decompile/pull/16), the
[Linear/unconnected slice](facts/automations-linear-verification.md),
now verifies nested menus, three Requires connection rows, empty MCP state,
Linear discovery and the pre-install disclosure: 47 tests, 2,157 measured
checks (all 1,736 preserved) and 456 raw-source pins pass.

## Captured-web acceptance closure — 2026-10-12

The [closure audit](facts/automations-acceptance-closure.md) adds seven run-filter
states: 51 tests, 2,678 measured checks, 551 source pins. Every earlier 2,157
check is preserved. The web captured-state backlog is complete, not whole-lane
pixel parity. No new runs, saves, authorization or fixture mutations occurred.

Desktop reinspection did not reproduce the historical Grok Bot promotional
modal. That global promotion is explicitly transferred to C-SHELL/C-ACCOUNT;
current desktop gate geometry is still UNVERIFIED. Neither is counted as a
passing Automations web comparison. Gated populated lists, connected/execution,
alternate themes/viewports and independent raster acceptance also remain open.

## Settings navigation/account opener — 2026-10-12

[PR #18](https://github.com/I-am-drunk/cursor-decompile/pull/18), the
[settings opener](facts/settings-navigation-verification.md), captures
entry/navigation, Privacy/Profile, the account menu and overview without
changing any account settings. The original shell implements observed
navigation and uses only synthetic identity and read-only controls.
Five new comparison states add 998 checks. Total: 55 tests, **3,676 checks**,
745 source pins. All 2,157 baseline and 521 filter checks are preserved.
A machine-summed gate corrects #17's prose arithmetic: 2,678, not 2,778.

No team selector was observed on the captured Free account; team/admin panels
remain UNVERIFIED, not declared absent from the product. Lower settings,
global menu parity, connected providers and full raster acceptance stay open.

Next thin slice: **C-SETTINGS Integrations: one unconnected provider panel**.
Open Integrations read-only, capture navigation/empty configuration and one
provider's pre-authorization panel before implementation. No Connect, Install,
Save, billing, account creation, authorization, or execution actions.
