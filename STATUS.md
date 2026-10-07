# Status

| Lane | State | Next |
|---|---|---|
| C-RESET | plan and sibling contract merged in [#4](https://github.com/I-am-drunk/cursor-decompile/pull/4) | capture the first Automations state |
| C-TOOLS | raw reader merged in [#5](https://github.com/I-am-drunk/cursor-decompile/pull/5); 8 regression tests | use [read.mjs](pipeline/README.md) for inspection; it certifies no UI facts |
| C-AUTOMATIONS | public behavior, [demo facts](facts/automations-launch-demo.md), and [3.23.12 desktop list facts](facts/automations-desktop-list.md) recorded; exact current UI UNVERIFIED | authenticated list/editor/MCP capture; [resume requirements](specs/automations-layout.md) |
| C-SETTINGS | planned | capture settings navigation and provider controls |
| C-WHOLE-UI | planned | follow PLAN.md surface slices |
| Historical #2 / #3 | closed as superseded by #4/#5; original branches and reviews retained | consult [findings](docs/archive/2026-10-04.md) before changing readers |

Live claims and PRs take precedence over this snapshot. See
[#1](https://github.com/I-am-drunk/cursor-decompile/issues/1) and the
[PR queue](https://github.com/I-am-drunk/cursor-decompile/pulls).
