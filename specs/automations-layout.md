# Automations exact-layout contract

The target is Cursor's exact Automations layout, consumed inside Linear's exact
shell. This is an owner requirement ([O01](../facts/INDEX.md)); every physical
layout value remains `UNVERIFIED` until a reference capture supports it.
Public documentation establishes features, not positions or dimensions.

| Reference state to capture | Evidence required before implementation claims parity |
|---|---|
| list: loading, empty, populated, search/filter, row menu | screenshot, visible copy, hierarchy, row/column geometry, interactions |
| editor: new and saved automation | section order, controls, save/activate behavior, dirty/validation states |
| triggers: add/edit/remove; multiple triggers | menu copy, card layout, type-specific options, duplicate behavior |
| MCP: unconfigured, connected, auth required, failed | server/config/tool scope, status copy, configuration affordances |
| model and repository selection | picker contents, selection/persistence, no-repo/single/multi-repo states |
| runs: empty, running, success, failure | list/detail navigation, statuses, output and action controls |
| themes and supported viewport sizes | paired screenshots and measured style differences |

Each capture records reference version/date, route, account/permission state,
viewport and scale, theme, screenshot, interaction steps, and DOM/computed-style
or reference-corpus locators. Keep raw artifacts in gitignored `corpus/`.
Store the extracted values and citations in the owning package's `ui-facts.json`.
No guessed pixels, fonts, radius, labels, icons, or copied vendor implementation.

A UI slice is accepted when citations reproduce its values, the reference and
implementation screenshots use the same state, meaningful interactions match,
and a peer checks both. Record every remaining mismatch explicitly. A feature
working from docs alone does not complete the layout task.

On 2026-10-05, T3 preview status/open were unavailable in the reset environment
and the Automations app URL returned HTTP 403. The public documentation was
readable. That attempt supplied no authenticated state capture; it does not
establish current browser availability. Authenticated capture is the next
C-AUTOMATIONS slice.

On 2026-10-07, T3 preview status/open again reported no connected automation
host. An unauthenticated request to `https://cursor.com/automations` redirected
to `authenticator.cursor.sh`, which returned HTTP 403. Neither attempt supplied
current layout evidence. The public [launch demo](../facts/automations-launch-demo.md)
now supplies seven pinned historical frames and eight visible facts; its unknown
build, viewport, and recording scale prevent CSS exactness claims.

Resume this capture with a connected T3 desktop preview and an authenticated
Cursor account that can open Automations. Record the list first, then one saved
editor and its `Add Tool or MCP` state, using the metadata above. Compare current
labels/order with D01–D08 and record differences; do not silently treat the
2026-03-05 demo as today's product. Sign-in, account permissions, current DOM/
computed styles, and same-state screenshots remain unmet.
