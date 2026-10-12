# Status

| Lane | State | Next |
|---|---|---|
| C-RESET | plan and sibling contract merged in [#4](https://github.com/I-am-drunk/cursor-decompile/pull/4) | follow the next C-AUTOMATIONS parity slice |
| C-TOOLS | raw reader merged in [#5](https://github.com/I-am-drunk/cursor-decompile/pull/5); 8 regression tests | use [read.mjs](pipeline/README.md) for inspection; it certifies no UI facts |
| C-AUTOMATIONS | **Local foundation slice complete** in [#10](https://github.com/I-am-drunk/cursor-decompile/pull/10): [capture](facts/automations-web-capture.md), runnable original UI, persistence and CI template; [18 tests + 101 measured checks](facts/automations-verification.md) pass | plan-enabled populated-list capture and exact row/navigation parity; gated editor states, live execution/auth, omitted variants and full visual parity remain UNVERIFIED |
| C-AUTOMATIONS rows | [API probe](facts/automations-api-rows.md): two disabled creations accepted; normal list remains gated; one real failed-launch row captured | finish observed failed-run row/summary and extracted automation-list parity; no successful execution claim |
| C-SETTINGS | planned | capture settings navigation and provider controls |
| C-WHOLE-UI | planned | follow PLAN.md surface slices |
| Historical #2 / #3 | closed as superseded by #4/#5; original branches and reviews retained | consult [findings](docs/archive/2026-10-04.md) before changing readers |

Live claims and PRs take precedence over this snapshot. See
[#1](https://github.com/I-am-drunk/cursor-decompile/issues/1) and the
[PR queue](https://github.com/I-am-drunk/cursor-decompile/pulls).
