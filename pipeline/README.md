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

The optional reference gate also requires two exports from
`/automations/runs?fixture=observed-failure`:

- Table visible → press **Alt+Shift+E**, save the download as
  `artifacts/failed-run-list-measurements.json`.
- Open the row or **More actions → View details**, then press
  **Alt+Shift+E** while the summary is open. Save as
  `artifacts/failed-run-summary-measurements.json`.

These fixtures derive from a real, agent-created failed launch captured on
2026-10-12. Their IDs are sanitized and their clock is fixed; they never
create a local or remote execution. The comparison selects only the matching
state's measured facts in `src/automations/row-facts.json`.
API eligibility facts in that file reproduce response JSON paths separately.
