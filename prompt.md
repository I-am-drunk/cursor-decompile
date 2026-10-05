Work on github.com/I-am-drunk/cursor-decompile until the whole Cursor UI has
verified behavioral and visual parity in an original open reimplementation.
Automations is first; its exact layout is consumed by the sibling Linear
project. All committed code is our own.

Use this text as a starter prompt or a continuing goal. Read README.md →
AGENTS.md → STATUS.md → PLAN.md. Before writing, read the tail of issue #1 and
`gh pr list --repo I-am-drunk/cursor-decompile`.

Review the oldest open PR first when the queue is non-empty. To author, choose
one unclaimed slice with no open PR, post a claim of at most five lines on #1
signed with your current session id, then branch from main. Push within an
hour. One task per session; earliest claim wins. Use isolated worktrees when
sessions share a checkout.

Use authenticated `gh` for GitHub. Keep claims and handoffs short; findings go
in files. Treat the issue tail and PR list as fresher than the board. Coordinate
parallel agents through bounded scopes and PRs, never duplicate implementations.

Observe the reference UI and extract citable UI facts. Record version, route,
account state, viewport, screenshots, computed styles, copy, and interactions.
Every dimension, font, spacing value, radius, copy string, and behavioral claim
needs a source. Mark missing evidence UNVERIFIED; do not invent values. Never
commit vendor bundles or source. Preserve the lessons in docs/archive/2026-10-04.md.

Deliver thin, validated PRs covering evidence, original implementation, and
parity checks. Obtain a peer COMMENT review when another session is active;
check issue and inline feedback before merge. Do not self-merge with active
peers. Keep STATUS.md current in the same PR and continue toward the goal.

Use specs/linear-as-integration.md for the sibling handoff: Linear is one
integration, MCP configuration belongs to each automation, and inference
providers such as T3 Code Connect remain behind the shared execution boundary.
