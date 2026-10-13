# Status

| Lane | State | Next |
|---|---|---|
| C-RESET | plan and sibling contract merged in [#4](https://github.com/I-am-drunk/cursor-decompile/pull/4) | follow the next C-AUTOMATIONS parity slice |
| C-TOOLS | raw reader merged in [#5](https://github.com/I-am-drunk/cursor-decompile/pull/5); 8 regression tests | use [read.mjs](pipeline/README.md) for inspection; it certifies no UI facts |
| C-AUTOMATIONS | **Local foundation complete** in [#10](https://github.com/I-am-drunk/cursor-decompile/pull/10): runnable original UI, persistence and CI template | full parity remains open; the main list is gated, but a saved editor is reachable after API creation |
| C-AUTOMATIONS rows | **Slice complete** in [#11](https://github.com/I-am-drunk/cursor-decompile/pull/11): [creation eligibility, real failed-run row/menu/summary](facts/automations-api-rows.md) | successful/running execution and observed main-list parity still require suitable reference access |
| C-AUTOMATIONS editor | **Slice complete** in [#12](https://github.com/I-am-drunk/cursor-decompile/pull/12): [saved editor, tools/MCP menus, connection browser, URL/command/JSON forms and model picker](facts/automations-saved-editor.md); 30 tests, 737 measured checks across 14 states | live MCP authorization/execution and full pixel parity remain UNVERIFIED; trigger follow-up below |
| C-AUTOMATIONS triggers | **Slice complete** in [#14](https://github.com/I-am-drunk/cursor-decompile/pull/14): [Add Trigger, Scheduled submenu, custom-cron and dismissal](facts/automations-trigger-verification.md) from [#13](https://github.com/I-am-drunk/cursor-decompile/pull/13) | preset/validation follow-up below; runtime scheduling remains UNVERIFIED |
| C-AUTOMATIONS presets | **Slice complete** in [#15](https://github.com/I-am-drunk/cursor-decompile/pull/15): [preset rows, day/time menus, live errors and unsaved guard](facts/automations-preset-verification.md) | Linear/unconnected follow-up below |
| C-AUTOMATIONS Linear | **Slice complete** in [#16](https://github.com/I-am-drunk/cursor-decompile/pull/16): [nested Linear menus, unconnected triggers and MCP disclosure](facts/automations-linear-verification.md); 47 tests, 2,157 measured checks, 456 source pins | web filter backlog closed below; full lane parity remains open |
| C-AUTOMATIONS acceptance | **Captured web subset complete** in [#17](https://github.com/I-am-drunk/cursor-decompile/pull/17): [55-state closure and desktop disposition](facts/automations-acceptance-closure.md); 51 tests, 2,678 checks | whole-lane exact parity remains UNVERIFIED; desktop promotion transferred to C-SHELL/C-ACCOUNT, not certified |
| C-SETTINGS navigation | **Opener complete** in [#18](https://github.com/I-am-drunk/cursor-decompile/pull/18): [account/navigation](facts/settings-navigation-verification.md); 55 tests, 3,676 checks across 60 states, 745 source pins | next: one unconnected provider panel under Integrations; team/admin, other settings and authorization remain UNVERIFIED |
| C-WHOLE-UI | planned | follow PLAN.md surface slices |
| Historical #2 / #3 | closed as superseded by #4/#5; original branches and reviews retained | consult [findings](docs/archive/2026-10-04.md) before changing readers |

Live claims and PRs take precedence over this snapshot. See
[#1](https://github.com/I-am-drunk/cursor-decompile/issues/1) and the
[PR queue](https://github.com/I-am-drunk/cursor-decompile/pulls).

## Owner product directive — P0

C-SHELL neutral rail: [capture and verification](facts/shell-verification.md).
Codebases removed; five accessible destinations, overlay reveal, reduced-motion
support and settings entry added. Unit/type/evidence gates pass (57 tests).
Timing/hover fidelity remains explicitly UNVERIFIED; no whole-shell parity claim.
P1 functional settings, P2 local login, P3 T3 inference and P4 MCP remain pending.

## P1 functional settings

Five functional settings sections now save and reload via a validated,
revisioned disk API; write-only credentials never appear in responses.
[Scope/evidence and UNVERIFIED list](facts/settings-functional.md).
59 tests, strict TS and existing evidence checks pass. Historical comparison
fixtures remain read-only; live identity/pairing/MCP registry follow in P2–P4.

## P2 local login

Signed-out gate, one local account, scrypt password store, hashed expiring
session cookies, server revocation and settings identity/sign-out implemented.
[Security boundary, checks and UNVERIFIED scope](facts/account-login.md).
61 tests pass. Loopback-only deployment; multi-user ACL/TLS/reset not claimed.

## P3 T3 inference

Pinned actual T3 auth/RPC bridge, instance/model/project discovery, per-automation
selection and on-disk streamed/cancellable transcripts are implemented.
[Protocol evidence and honest gaps](facts/t3-bridge.md). 69 tests pass, including
replay without duplicate start and visible incompatibility/expiry failures.
Live deployment compatibility remains UNVERIFIED without a supplied environment.

## P4 MCP server and registry

Official SDK 1.32.1 isolated to `mcp/`: 24 management tools, read resources,
guided prompt, stdio + authenticated Streamable HTTP; shared product state.
Registry CRUD, real transport probes, five states and per-automation grants.
[Verification and honest gaps](facts/mcp-verification.md); 72 root + 6 MCP tests
pass, both strict TS projects and existing standard evidence gates remain green.
MCP invocation in runs is deliberately a follow-up; bound runs fail visibly.

## Owner delivery sequence

P0 shell [#19](https://github.com/I-am-drunk/cursor-decompile/pull/19),
P1 settings [#20](https://github.com/I-am-drunk/cursor-decompile/pull/20),
P2 login [#21](https://github.com/I-am-drunk/cursor-decompile/pull/21),
P3 inference [#22](https://github.com/I-am-drunk/cursor-decompile/pull/22) merged.
P4 MCP [#23](https://github.com/I-am-drunk/cursor-decompile/pull/23) completes
this ordered product series, not whole-reference parity.

## UI SETTINGS CARVE — owner correction in progress

Four retained sections now use captured rows/headings instead of the invented
index, tables and registry forms. Standalone search and Profile were deleted;
the disconnected chat gate links to Linear connection.
[Source mapping, file audit, validation and blockers](docs/SETTINGS-CARVE.md).
71 root + 6 MCP tests and Chromium checks pass. Not ready to ship: original
search/connected-chat captures and a real Linear account/chat backend are
missing; the strict repository-wide branding scan also remains nonzero.
Search/Connect remain disabled. No connected-chat or whole-page parity claim.

## Agent B — automations carve and polish

Automations/Run History shell, compact SVGs, hover/drag cleanup, removed
Chat/Search/billing surfaces and HTML not-found routes implemented.
New and saved editors use Devin-style preset rows, custom cron and searchable
timezones, with minute-precision metadata persistence.
[Source mapping and validation](docs/verification/automations-carve.md).
Captured evidence is unchanged; full raster parity is not claimed.
Settings, Linear connection and server execution remain their own lanes.

## Automations copy-first correction — PR #27

Removed unsupported shell reveal/motion and extra rail destinations; carved
non-automation dashboard routes to HTML 404s. Schedule uses separate Devin
hour/minute choices, labeled timezone search and raw cron editor, retaining
Cursor validation behavior. [Complete change/source audit](docs/verification/automations-carve.md).
Historical passing tests do not establish new raster parity; limitations remain
explicit. Peer COMMENT review is required before merge.

## Animation / interaction audit

[Motion inventory and screenshots](docs/verification/motion-audit.md) retain
180ms sidebar width easing and remove invented opacity/shadow/reveal motion.
44px rail icons and toggle remain clickable; 280px labels and narrow-screen
explicit toggle verified. Devin scheduling pass fixes invalid custom dismissal
through timezone selection and uses a trash action. 15 local screenshots saved;
75 root + 6 MCP tests and Chromium interaction gate pass. Reference hover timing
and whole-page raster parity remain UNVERIFIED. Peer COMMENT review requested.
