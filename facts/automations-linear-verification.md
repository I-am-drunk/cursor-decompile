# Linear / unconnected-state verification — 2026-10-12

The [capture](automations-linear-capture.md) now drives original local views
for nested Linear trigger menus, three unconnected trigger rows, empty MCP
configuration, filtered Linear discovery, and its pre-install disclosure.
The 96 [property records](../src/automations/connection-facts.json) preserve
OBSERVED control-state versus EXTRACTED_UI measurement labels.

**47 tests, 456 reproduced source pins, and 2,157 measured checks pass.**
All previous 1,736 checks remain passing; eleven added comparison states
contribute 421 checks. The thirteen capture triples include two baselines
and an intermediate submenu repeat, not thirteen distinct UI states.

## Matching reference state

Computer Use in Twilight supplied all 48 current-build local exports at
1270 × 764 CSS px, DPR 2, light theme and expanded sidebar. Build SHA-256:
`74af44ad464801b82b36c633597320d52677d47d89db554ecfbe9687cd052398`.
The comparator verifies selected geometry, copy, styles, control state and
the retained Linear search query. See the [workflow](../pipeline/README.md).

The observed menu path is Add Trigger → Linear → Issue... → Created or
Status changed; End of cycle is the other first-level Linear choice.
Each selection adds an unsaved row with Requires connection, Connect and
an authentication warning. No authenticated filters or connected state
were reached. The original saved fixture stayed disabled and unchanged.

MCP Server showed No MCP servers configured. New Connection → search Linear
showed one result. Selecting the card opened a pre-install disclosure with
Show More, Back and Add Plugin. Keyboard activation expanded the description;
Back retained the search. Neither Connect nor Add Plugin was invoked.

## Safety and remaining boundaries

The local Connect/Add Plugin controls show an unavailable notice and make
no authorization, installation or execution request. Tests check this, local
definition isolation, nested navigation and safe metadata rendering.
The captured Verified by Cursor text is reference metadata, not a claim
that this original implementation is affiliated with or certified by Cursor.

Provider authorization, connected filters/tools, execution, remaining provider
variants, alternate viewport/theme states and full font/icon/raster parity
remain UNVERIFIED. Local storage and unavailable notices are DESIGN.
Unsaved reference inspection tabs may remain open; none was saved.

## Lane handoff audit

This finishes the scheduled Linear/unconnected slice and its 48-state measured
matrix, **not all of C-AUTOMATIONS**. The older screenshot-only
`twilight/runs-filter-window.png`, `runs-status-window.png` and
`runs-filtered-window.png` are not covered by that matrix. The desktop
`upgrade-modal-window.png` is likewise not a computed-style parity claim.
These must be measured/accepted or explicitly retired before declaring the
entire captured-state backlog complete. Gated populated-list and connected
execution states remain additional, uncaptured access gaps.

The queued C-SETTINGS opener is a read-only capture of settings entry,
navigation/default panel and one unconnected provider/integration panel.
Record selected navigation, copy, geometry and keyboard behavior first; do not
change settings or authorize providers. It is not marked started by this PR.
