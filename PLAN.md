# Whole-Cursor roadmap

Every row is a lane, not permission to build a whole layer. Split a lane into
one visible state or interaction per PR; claim the exact slice on #1.

| Order | Lane | Surface / first slice | Acceptance evidence |
|---|---|---|---|
| 1 | C-AUTOMATIONS | next: plan-enabled populated list and row navigation; local foundation complete in [#10](https://github.com/I-am-drunk/cursor-decompile/pull/10) | authenticated state captures; [layout](specs/automations-layout.md) and [handoff](specs/linear-as-integration.md) |
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
Gated current editor/list states, full feature variants, live MCP/execution,
font/icon raster parity and independent parity acceptance remain UNVERIFIED.
The hosted workflow remains a template because publishing it requires
additional GitHub permissions.

Next claim: capture a **plan-enabled populated list** with version/state,
viewport, screenshot and computed styles; reconcile its rows and opening an
automation with the local implementation. Follow with a separately claimed
saved-editor/MCP slice. Do not promote source extraction into observed parity.
