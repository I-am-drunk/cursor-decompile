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
