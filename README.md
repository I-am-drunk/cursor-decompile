# cursor-decompile

Extracted facts and original specs for **Cursor's Automations surface**, plus a
clean reimplementation of it.

Why this repo exists: Cursor's automations page has the layout and the feature
model we want — **one MCP configuration per automation**, multi-trigger forms,
chained prompts, per-automation model selection. The sibling project
[`linear-loops-decompile`](https://github.com/I-am-drunk/linear-loops-decompile)
rebuilds Linear's UI; its Loops page adopts **this** page's layout. So the
deliverable here is a precise, citable description of Cursor's automations UI
and behavior that the Linear project can build against.

## The legal line (read before committing anything)

This repo is **public**. Never commit vendor code: no bundles, no `.deb`/
AppImage contents, no decompiled or prettified Cursor source, no verbatim
module text. Commit only:

- **facts** — identifier names, class names, copy strings, route paths, field
  shapes, enum values, state transitions, validation rules;
- **our own original code**.

The artifact lives locally under `corpus/` (gitignored). `pipeline/` fetches and
unpacks it on demand.

## Evidence quality

Cursor ships `workbench.anysphere-ui-automations.js` — the automations surface
as its own bundle, with original component, hook, and helper names retained and
BEM class names in full (`automations-mcp-status-badge__error`,
`McpActionForm`, `findAvailableMcpServerForAction`). Behavior is readable
directly; almost nothing has to be guessed.

Evidence labels used throughout `facts/` and `specs/`:

| Label | Meaning |
|---|---|
| `PROVEN` | a literal string, identifier, constant, branch, or class in the artifact |
| `PROJECTED` | minimum server response shape, inferred from fields the UI reads |
| `DERIVED` | forced by proven control flow |
| `REMOTE` | lives behind Cursor's server; not in the client, never invented |

## Repo map

| Path | What |
|---|---|
| `PROMPT.md` | the prompt every session boots from |
| `AGENTS.md` | how to work here |
| `pipeline/` | fetch + unpack + index the artifact into `corpus/` (gitignored) |
| `facts/` | extracted facts, one file per area, every claim labeled and cited |
| `specs/` | the specs built from those facts — what a reimplementation must do |
| `src/` | our own code |

Working here: read `PROMPT.md`.
