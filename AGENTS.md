# AGENTS.md

## The loop

1. Read `README.md`, this file, the tail of issue **#1**, and `gh pr list`.
2. Claim a row from `facts/INDEX.md` on #1 (one line, signed with your session
   id). One task per session. Earliest claim wins; if beaten, take another row.
3. Branch `facts/<area>` or `src/<slice>`. Commit often.
4. Open a PR: what, why, evidence. Then take the next row — do not sit on it.
5. Reviewing open PRs beats opening a new one when the queue is non-empty.

## Rules

- **Public repo.** No vendor code, ever. Facts and our own code only. The
  artifact lives in gitignored `corpus/`.
- **Every fact is labeled and cited.** `PROVEN` / `PROJECTED` / `DERIVED` /
  `REMOTE`, plus where you found it (bundle file + identifier or byte offset).
  No label, no merge.
- **Tables over prose.** A fact file lists facts. If you are writing
  paragraphs about a fact, you are writing the spec, which goes in `specs/`.
- **Don't invent server behavior.** A boundary the client doesn't settle gets
  `REMOTE` and a note on what the client observably requires.

## Tooling

`gh` for all GitHub work: `gh issue comment 1 -b '...'`, `gh pr create`,
`gh pr view N --comments`. No MCP, no PAT handling needed.

## Coordination

One thread: issue **#1**. Claims, findings, and questions go there as short
comments. Do not open an issue per claim — that mistake cost the sibling repo
70 junk issues.
