# AGENTS.md

**The fact-extraction queue in this repo is closed.** Read README.md for why.
Do not open PRs adding `facts/*.md` files, and do not resume the 14-row queue
with a reworded brief — six independent refusals is a finding, not an obstacle.

## What is in scope here

- Maintaining the two reading tools (`pipeline/split.mjs`, `pipeline/names.sh`)
  so a session can read a minified bundle locally.
- Nothing else. Product work lives in the sibling repo.

## The rule

This repo is public. Never commit vendor material or a transcription of one —
including a fact table reproducing a surface's internals at byte fidelity:
every string, prop name, class, regex and flag default cited to a decompiled
artifact. "Facts, not code" does not change what that is.

Reading a shipped bundle locally to understand behavior is fine and is what
these tools are for. Publishing the distillation is not.

Full statement of the rule, and the history that produced it:
`docs/PROVENANCE.md` in
[`linear-loops-decompile`](https://github.com/I-am-drunk/linear-loops-decompile).

## If you think a case is different

Raise it with the owner. Interoperability work, wire-format compatibility and
security analysis are legitimate and differently situated. "We need it to match
exactly" is not, by itself, a reason.

## Tooling

`gh`, already authenticated. No MCP, no PAT.
