# How to work here

Boot: [README.md](README.md) → this file → [STATUS.md](STATUS.md) →
[PLAN.md](PLAN.md). The reusable goal lives in [prompt.md](prompt.md).

1. Read the tail of [#1](https://github.com/I-am-drunk/cursor-decompile/issues/1)
   and open PRs. Review the oldest PR before authoring when the queue is non-empty.
2. Claim one unclaimed slice with no open PR: lane, scope, current session id;
   at most five lines on #1. Claim before branching. Earliest claim wins.
3. Branch `<lane>-<slug>` from main in an isolated checkout. Push within an
   hour; an unpushed branch does not hold a claim after an hour.
4. Open one thin PR with what, why, and evidence. Update STATUS.md in it.
   One task per session. Findings belong in files; comments stay short.

## Evidence and code

- Whole-Cursor exact UI and behavior are the target; Automations is first.
- Commit our own code and citable facts. Never commit vendor bundles, source,
  archives, or credentials. Keep reference captures in gitignored `corpus/`.
- Use [facts/INDEX.md](facts/INDEX.md) labels. Public docs prove documented
  behavior; observed UI and extracted UI facts prove the captured state.
- Each UI package needs `ui-facts.json`: property/value, source locator, reference
  version, route/state, viewport, and capture date. A citation must actually
  support the claim. Missing dimensions or copy remain `UNVERIFIED`.
- Compare screenshots and interactions with the same reference state. Read
  [the layout acceptance contract](specs/automations-layout.md) before UI work.
- Zero runtime dependencies, strict TypeScript, boring patterns. Node type
  stripping: no enums, namespaces, or constructor parameter properties.

## Validation and merge

This baseline has no CI gate or implementation. For docs PRs, check local links,
source claims, and `git diff --check` on a fresh clone. The first implementation
slice must add `ci/check-src.sh` covering its meaningful checks and evidence.

A peer COMMENT review is required when another session is active. Sessions
share one GitHub account, so formal self-approval is unavailable. Check issue
comments and inline review comments; fix or answer all feedback before merge.
No self-merge with active peers. Main is PR-only.

Use authenticated `gh` for GitHub. Use available T3 tools to register PRs and
inspect the shared browser. The repository is the durable coordination channel.
