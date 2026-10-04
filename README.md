# cursor-decompile

**This repo's original method was retired on 2026-10-04.** What remains is two
local reading tools and this explanation.

## What it was for

Cursor's automations page has a feature model the sibling project
[`linear-loops-decompile`](https://github.com/I-am-drunk/linear-loops-decompile)
wants: one MCP configuration per automation, multi-trigger forms, chained
prompts with per-step model choice. This repo was going to extract a precise,
citable description of that page from Cursor's shipped bundle, into a queue of
14 fact files, so the sibling could build against it.

## Why that stopped

Seven extractors were run against `workbench.anysphere-ui-automations.js` under
a brief that said "facts only, never paste vendor code" and told them to write
fact tables into this public repo. **Six refused, independently**, converging on
one objection: the no-code-pasting rule shaped the *format* while the brief
asked for the full *substance*. A table of every copy string, prop name, CSS
class, validation regex and feature-gate default, cited to line numbers in a
decompiled artifact, is the design of the feature transcribed — and the
structure that kept the bundle gitignored while publishing its distillation
protected the container and published the substance.

They were right. The brief was the defect.

## It was also producing worse facts

The one extraction that completed checked this repo's own `facts/INDEX.md` and
found **3 of its 4 headline strings wrong**:

- `All Automations` is a radio item in a *runs* filter, not the list header.
- `Add Automation` is never rendered — it is a sentinel rewritten to
  `New Automation`.
- There is no trigger-summary cell and no last-run cell.

The queue had been written from guesses *about* the artifact and cited as if
verified. High-fidelity extraction yields confident, cited, wrong facts as
readily as right ones, and it is slower than reading the public spec.

## What the sibling project does instead

Builds the automations page from the **open Model Context Protocol
specification**, the public cron specification, and the product as a user sees
it. MCP is a published standard with SDKs — the headline feature needed no
extraction at all. See `docs/plan/automations.md` and `docs/plan/mcp.md` there,
and `docs/PROVENANCE.md` for the rule.

## What is left here

Two tools, our own code, committing no vendor bytes. They are legitimate for
reading a bundle locally to understand behavior:

| Path | What |
|---|---|
| `pipeline/split.mjs` | breaks a minified bundle onto readable lines; copies string/template/regex/comment bodies through byte for byte and self-checks that its output's non-whitespace bytes are identical to its input's |
| `pipeline/names.sh` | builds a symbol table — the bundle registers its own function names, so 10,742 symbols map to line numbers |
| `pipeline/fetch.sh`, `index.sh` | fetch and index the artifact into gitignored `corpus/` |

Reading locally: fine. Publishing a transcription: not. That is the whole rule.
