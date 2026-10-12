# Local reading tools

`read.mjs` reads `BUNDLE`, defaulting to the artifact under `corpus/app/out/vs/workbench/`.
It writes only to stdout/stderr. It never executes, reformats, or parses the input.
All tests use our own fixtures; no vendor artifact is needed.

| Command | Output |
|---|---|
| `node pipeline/read.mjs find 'text' [padding]` | Non-overlapping literal UTF-8 matches |
| `node pipeline/read.mjs ctx 'regex' [padding]` | Unicode JavaScript regex matches |
| `node pipeline/read.mjs names [regex]` | Textual `i(identifier,"Name")` candidates, optionally filtered by name |
| `node pipeline/read.mjs slice offset [length]` | Exact bytes, without a trailing newline |

Searches emit JSONL with byte offsets/lengths. Contexts include the full match
and expand padding to whole UTF-8 characters. Padding defaults to 200 bytes;
slice length defaults to 2000. `find`/`ctx` stop at 60 hits and report truncation
on stderr. No matches is success with empty stdout. Bad input exits 2.

`names` recognizes simple double-quoted names without escapes; it includes text
inside comments or strings and makes no declaration or symbol-table claim.
Searches require valid UTF-8. `slice` accepts arbitrary bytes. Cite the original
file's SHA-256 and byte range, then inspect the surrounding text before asserting
a behavior. A search hit alone does not verify a fact.

## Migration from the unmerged tools

This replaces raw inspection from [#2](https://github.com/I-am-drunk/cursor-decompile/pull/2)
and [#3](https://github.com/I-am-drunk/cursor-decompile/pull/3).

| Previous command | Replacement |
|---|---|
| `sym.mjs names` / `names.sh` | `read.mjs names`; JSONL byte positions replace line indexes |
| `sym.mjs ctx` | `read.mjs ctx`; offsets/padding now consistently count bytes |
| `sym.mjs slice` | `read.mjs slice`; raw bytes, no appended newline |
| `sym.mjs src` / `ident` | `names`, then `find` or `ctx`; no declaration-boundary inference |
| `sym.mjs strings` | `find` or `ctx`; no assertion that a hit is a string literal |
| `split.mjs` | Read original ranges with `slice`; no rewritten artifact |

The broader docs/fact-table changes in #3 are not included. Its old branch and
reviews remain available. The whole-Cursor roadmap is a separate change.

## Reproduced review findings

Observed against #2 `e204caa` and #3 `b000a95`, using original synthetic fixtures:

| Input/probe | Old result | Reader result |
|---|---|---|
| `function $x(){return 1}i($x,"Dollar");` | `src Dollar` cannot find declaration, exits 0 | `names` finds `$x`; `find` preserves text |
| `function f(){return /}/.test("}")}i(f,"Regex");` | `src Regex` ends at regex brace | Full original text |
| `function f(){/*` | `ident f` hangs; killed after 1 second | Raw queries finish; no parser |
| `é🙂hello`, slice offset 6 length 5 | Returns `lo` plus newline | Returns exact `hello` bytes |
| Nested template from `read.test.mjs` | Formatter inserts newlines into literal, claims identical bytes | Original bytes unchanged |
| Unknown command | Prints usage/import to stdout, exits 0 | Diagnostic on stderr, exits 2 |

Run `node --test pipeline/read.test.mjs`. Eight tests cover these probes plus
empty Unicode regex matches, bounded output, UTF-8 validation, numeric/regex
arguments, and absence of filesystem writes. This validates the reader's own
contract; it certifies no Cursor UI facts.

## Original Automations implementation checks

`npm run check` runs strict TypeScript, the reader/model/store/HTTP/view
regressions, negative comparator tests, fact-schema validation and diff checks.
It requires no account, vendor assets or network. It explicitly does **not**
claim a live-browser comparison when private snapshots are absent.

For the private same-state comparison:

1. Keep captures in ignored `reference/automations/`, with paths specified in
   `src/automations/ui-facts.json`.
2. Run the app, open `/automations?state=upgrade` and `/automations/runs` in
   Twilight at **1270 × 764 CSS px, DPR 2**, light theme, expanded sidebar.
3. For each state, open **Local preview → Export layout measurements**.
   Save those downloads as `artifacts/upgrade-measurements.json` and
   `artifacts/runs-measurements.json`. Keep corresponding screenshots private.
4. Run `sh ci/check-src.sh --reference`.

The optional pass hashes every cited raw artifact, verifies measured values
and byte-range anchors, then checks current-build geometry (0.75px tolerance),
selected typography, radius and copy. Missing or stale snapshots fail.
Font glyphs/text widths, custom icons, sidebar identity and unobserved
editor/list states are **not** certified. Screenshots still need visual review;
this is a measured-subset gate, not a whole-page pixel-diff claim.

The server deliberately cannot serve `reference/`, `artifacts/` or its
private store. The HAR captures are sensitive; never upload them in a PR.

`ci/github-workflow.example.yml` is an optional hosted-CI template, not an
enabled workflow. Publishing `.github/workflows/` was rejected because the
available GitHub token lacks `workflow` scope. Local checks remain runnable
without changing account permissions.

### Populated failed-run checks

The optional reference gate also requires three exports from
`/automations/runs?fixture=observed-failure`:

- Table visible → press **Alt+Shift+E**, save the download as
  `artifacts/failed-run-list-measurements.json`.
- Open the row or **More actions → View details**, then press
  **Alt+Shift+E** while the summary is open. Save as
  `artifacts/failed-run-summary-measurements.json`.
- Open **More actions** and press **Alt+Shift+E** while its menu is open;
  save as `artifacts/failed-run-menu-measurements.json`.

These fixtures derive from a real, agent-created failed launch captured on
2026-10-12. Their IDs are sanitized and their clock is fixed; they never
create a local or remote execution. The comparison selects only the matching
state's measured facts in `src/automations/row-facts.json`.
API eligibility facts in that file reproduce response JSON paths separately.

### Saved-editor / MCP checks

Open `/automations/editor-fixture?fixture=saved-editor` in the same Twilight
viewport (**1270 × 764, DPR 2**). This is a reference-derived local fixture,
not a remote automation; editing it does not modify the reference account.
Use **Alt+Shift+E** and save each download as
`artifacts/<state>-measurements.json`:

| State | Action |
|---|---|
| `saved-editor` | Open the fixture with Save disabled |
| `tools-menu` | Add Tool or MCP |
| `mcp-menu` | MCP Server |
| `mcp-browse` | New Connection |
| `mcp-url` | Custom MCP |
| `mcp-command` | Command tab |
| `mcp-json` | Return to URL, then Edit JSON |
| `model-picker` | Cancel the form, then Composer 2.5 |
| `model-options` | Open Grok 4.7 options; do not save |

Keep paired screenshots for visual review. Run `sh ci/check-src.sh --reference`
after exporting all fourteen baseline/editor states from the current build.
The additional nine states check 434 measured properties; total checks: 737.
The source gate reproduces all property pins and both catalogues, including
their original element indexes or API model definitions. It does not certify
provider logos, font glyphs, focus rings, uncaptured forms, or authorization.

### Trigger-control comparisons

Open `/automations/editor-fixture?fixture=saved-editor&controls=triggers`
at the same **1270 × 764 CSS px, DPR 2** viewport. Keep the fixture unchanged.
Export with **Alt+Shift+E** to `artifacts/<state>-measurements.json`:

| State | Action |
|---|---|
| `trigger-baseline` | Fresh fixture; Save disabled and switch off |
| `add-trigger` | Click Add Trigger; leave search empty |
| `scheduled-submenu` | Press Down, then Right; Hourly receives focus |
| `schedule-picker` | Escape twice; click the existing `0 0 1 1 *` |
| `trigger-dismissed` | Escape; focus returns to the existing cron control |

The five states add **255** checks, for **992** across nineteen states.
The comparator checks geometry, copy, input values, clean/disabled state,
overlay dismissal and final focus. It rejects wrong fixture URLs, stale
build hashes and wrong viewports. Re-export all states after runtime edits.
For the earlier failed-run table, move the pointer outside the row before
exporting (click its Run History heading): the pinned row is not hovered.

No new live reference calls are required by this gate. Default `npm run check`
remains account/network-free. The local cron validator, preset defaults and
Enter-to-stage/Escape-to-discard policy have regression tests but are not
claims about unobserved reference save behavior. Full preset/provider forms
and native focus-ring/font/icon raster parity remain outside this subset.

### Preset and live-validation comparisons

Open a fresh tab at
`/automations/editor-fixture?fixture=saved-editor&controls=presets`
for each preset group, at **1270 × 764 CSS px, DPR 2**. Do not save or run
the fixture. Use **Alt+Shift+E**, saving each download as
`artifacts/<state>-measurements.json`.

| States, in order | Actions |
|---|---|
| `preset-baseline`, `hourly-added` | Fresh fixture; Add Trigger → Scheduled → Hourly |
| `daily-added`, `daily-time`, `daily-selected` | Fresh fixture; add Daily; open 09:00; select 10:00 |
| `weekly-added`, `weekly-days`, `weekly-selected`, `weekly-time` | Fresh fixture; add Weekly; open Monday; choose Tuesday; open 09:00 |
| `custom-added`, `custom-popup` | Fresh fixture; add Custom (cron); open its new 0 13 1 * * control |
| `cron-invalid`, `cron-range`, `cron-empty` | Replace that input with `bad`, then `60 0 * * *`, then empty |
| `invalid-escape`, `invalid-outside` | Press Escape with empty input; then click the Triggers heading |
| `custom-restored`, `unsaved-dialog` | Restore `0 13 1 * *`; Escape; click the Automations breadcrumb |

Both invalid-dismissal attempts must leave the popup open. Valid restoration
closes it. The unsaved guard is captured without invoking Save or Discard.
Screenshots remain part of visual review; numeric checks do not certify fonts,
icons, native focus treatments or unobserved runtime semantics.

`sh ci/check-src.sh --reference` now covers **1,736** checks across 37 states:
the previous 992 plus 744 for this slice. It also verifies **360 source pins**,
including live input values, validity and presence/absence of disabled state.
Default `npm run check` remains network/account-free.

### Linear and unconnected MCP comparisons

Open a fresh local tab at
`/automations/editor-fixture?fixture=saved-editor&controls=connections`
at **1270 × 764 CSS px, DPR 2**. Wait until the requested state has rendered.
Export with **Alt+Shift+E** into `artifacts/<state>-measurements.json`.

| State | Action |
|---|---|
| `connection-baseline` | Fresh, unchanged fixture |
| `linear-menu` | Add Trigger; Down five times; Right |
| `linear-issue-menu` | Right again on Issue... |
| `linear-created` | Select Created |
| `linear-status` | Fresh fixture; Linear → Issue... → Status changed |
| `linear-cycle` | Fresh fixture; Linear → End of cycle |
| `mcp-unconfigured` | From the cycle state: Add Tool or MCP → MCP Server |
| `mcp-linear-search` | New Connection; search Linear |
| `mcp-linear-unconnected` | Open the Linear card; do not Add Plugin |
| `mcp-linear-expanded` | Show More |
| `mcp-returned` | Back, preserving the Linear query |

This adds **421** checks: **2,157** across 48 states, plus **456** raw-source
pins. No reference authorization, installation, save or execution is needed.
The local Connect/Add Plugin controls deliberately make no such request.
Visual reference metadata does not certify this local implementation.

### Run-filter closure comparisons

Use `/automations/runs?fixture=observed-failure&controls=filters` at the same
1270 × 764, DPR 2 viewport. Export these states with Alt+Shift+E:
`runs-baseline`; open Filter → `runs-filter`; open Status → `runs-status`;
select Running → `runs-running`; add Failed → `runs-multiple-status`;
deselect Failed and dismiss both menus → `runs-filtered-empty`; reopen
Filter, Clear all filters and dismiss → `runs-cleared`.

These add 521 checks: **2,678 across 55 states**, preserving all 2,157.
The gate rejects wrong selection URLs, stale builds and wrong viewports.
Desktop PNG/AX/metadata are an explicit audit, not a DOM/pixel comparison;
see the [disposition](../facts/automations-acceptance-closure.md).

### Settings navigation / account opener

The settings server route is `/dashboard/settings?fixture=settings-navigation`.
At 1270 × 764 CSS px, DPR 2, use Alt+Shift+E for these exports:

| State | Action |
|---|---|
| `settings-account` | Fresh account route; move the pointer to its heading |
| `settings-user-menu` | Open User menu |
| `settings-dismissed` | Escape; focus returns to User menu |
| `settings-overview` | Click Overview |
| `settings-returned` | Tab to Settings, Enter; pointer remains over Overview |

Downloads use `local-settings-<state>.json`; copy to
`artifacts/<state>-measurements.json`, retaining paired PNGs and AX snapshots.
The optional source checker expects `reference/settings/` beside
`reference/automations/`. No account-changing action is required.

Five settings states add **998** checks: **3,676 across 60 states**. The final
`measurement-summary.mjs` pass sums current-build comparisons and asserts
2,157 baseline + 521 filters + 998 settings. It corrects the earlier prose
arithmetic for #17 (2,678, not 2,778); no checks were lost. The settings entry
menu is captured but only the dashboard shell/account states are compared.
