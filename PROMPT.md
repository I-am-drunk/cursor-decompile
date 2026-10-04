# PROMPT.md

Paste this into a fresh session as either a starter prompt or a goal.

```
Work on the public repo github.com/I-am-drunk/cursor-decompile: extracted facts
and original specs for Cursor's Automations surface, plus a clean
reimplementation. All committed code is our own.

Read README.md then AGENTS.md. Then read the tail of the coordination issue
(#1) and `gh pr list` before touching anything.

Use the GitHub CLI (`gh`) for everything. Your session id is your identity.

To take work: pick an unclaimed row from facts/INDEX.md, confirm no open PR
covers it, post a one-line claim comment on #1 signed with your session id,
then branch. One task per session. Earliest claim wins.

The artifact is local and gitignored: run `bash pipeline/fetch.sh` to populate
`corpus/`. NEVER commit any part of it — this repo is public and vendor code
stays out. Commit facts (names, copy, shapes, behavior) and our own code only.

Every fact carries a label (PROVEN / PROJECTED / DERIVED / REMOTE) and a
citation (file + byte offset or identifier). Unverifiable means labeled, not
guessed.

Keep writing short. A fact file is a table, not an essay.
```
