# Status

| Lane | State | Next |
|---|---|---|
| C-RESET | plan and sibling contract merged in [#4](https://github.com/I-am-drunk/cursor-decompile/pull/4) | follow the next C-AUTOMATIONS parity slice |
| C-TOOLS | raw reader merged in [#5](https://github.com/I-am-drunk/cursor-decompile/pull/5); 8 regression tests | use [read.mjs](pipeline/README.md) for inspection; it certifies no UI facts |
| C-AUTOMATIONS | **Local foundation complete** in [#10](https://github.com/I-am-drunk/cursor-decompile/pull/10): runnable original UI, persistence and CI template | full parity remains open; the main list is gated, but a saved editor is reachable after API creation |
| C-AUTOMATIONS rows | **Slice complete** in [#11](https://github.com/I-am-drunk/cursor-decompile/pull/11): [creation eligibility, real failed-run row/menu/summary](facts/automations-api-rows.md) | successful/running execution and observed main-list parity still require suitable reference access |
| C-AUTOMATIONS editor | **Slice complete** in [#12](https://github.com/I-am-drunk/cursor-decompile/pull/12): [saved editor, tools/MCP menus, connection browser, URL/command/JSON forms and model picker](facts/automations-saved-editor.md); 30 tests, 737 measured checks across 14 states | live MCP authorization/execution and full pixel parity remain UNVERIFIED; trigger follow-up below |
| C-AUTOMATIONS triggers | **Slice complete** in [#14](https://github.com/I-am-drunk/cursor-decompile/pull/14): [Add Trigger, Scheduled submenu, custom-cron and dismissal](facts/automations-trigger-verification.md) from [#13](https://github.com/I-am-drunk/cursor-decompile/pull/13); 35 tests, 992 measured checks, 199 source pins | next: capture hourly/daily/weekly configuration and validation/dirty states without saving; preset/provider semantics and execution remain UNVERIFIED |
| C-SETTINGS | planned | capture settings navigation and provider controls |
| C-WHOLE-UI | planned | follow PLAN.md surface slices |
| Historical #2 / #3 | closed as superseded by #4/#5; original branches and reviews retained | consult [findings](docs/archive/2026-10-04.md) before changing readers |

Live claims and PRs take precedence over this snapshot. See
[#1](https://github.com/I-am-drunk/cursor-decompile/issues/1) and the
[PR queue](https://github.com/I-am-drunk/cursor-decompile/pulls).
