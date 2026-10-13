# AGENTS.md — rules of this repo (enforced, not advisory)

Read `docs/RESTART-2026-10-12.md` first. It governs.

## The two laws

1. **Copy-first, chisel-only.** Every pixel and every behavior starts from the captured original
   (Cursor `corpus/` for shell/settings; Devin `devin-decompile/app/src` for automations). You may
   delete and adapt. You may NOT invent layout, visuals, or interaction. An invented surface is a
   failed PR.
2. **Verify before PR.** No PR opens without: (a) tests green, (b) a Computer-Use verification
   artifact — screenshots + interaction pass of YOUR change served live, compared against the
   captured original, linked in the PR body.

## Process

- Planning phase: produce plans/maps only. No implementation PRs until the owner approves the plans.
- One idea per PR. Branch from latest main. Conventional commits.
- CodeRabbit reviews first (`@coderabbitai autofix` to apply its fixes). Address or rebut every
  thread before ready-for-review.
- Never mark your own PR ready — the orchestrator flips it after checking evidence links,
  verification artifact, and tests.
- If you touch two features, split the PR.
- Flaky test = P0, fix now, never retry-into-green.

## Sources of truth

- Shell/settings UI: `corpus/` (Cursor original).
- Automations UI: `devin-decompile` repo `app/src/features/*` + its DECOMPILED_SPEC (Devin layout).
- Inference/connection: Linear only (docs/MASTER-PLAN.md §V1–V10). T3 Connect is parked.
- Evidence labels: observed > extracted > invented(none).
