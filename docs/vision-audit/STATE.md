# Vision — where it stands tonight (2026-10-13, updated 03:15)

Sixty-second read for the morning. Detail per audit in `NOTES.md`. Law: `/tmp/goals/VISION-BRIEF.md`.

## One line
Planning is strong and mostly on-vision; **zero product code exists yet**, and three specs
contradict decisions the owner made last night. Fix the contradictions before any implementation PR.

## Status by the five things the owner cares about

| # | Pillar | Tonight | Risk |
|---|---|---|---|
| 1 | UI quality, copy-first | Doc-before-code is holding: every lane shipped docs only. Raycast lane wrote its 29-line interaction contract before touching code. | Raycast "exact" vs "instant/tiny" tension unbudgeted (NOTES 02). |
| 2 | Connector packages w/ skills | `CONNECTOR-PACKAGES.md` nails the thesis; `CONNECTORS-PAGE-SPEC §7` maps packages onto Devin plugins with no adapter. | Two specs disagree on settings nav naming (NOTES 01, 06). |
| 3 | Linear as brain, Devin-shaped server | `SERVER-FROM-DEVIN.md` supersedes the T3 plan cleanly. Linear chat + MCP loop VERIFIED live in linear-loops-decompile. | Dead-weight v1 endpoints (code-step); no folder/project table yet (NOTES 07). |
| 4 | Simple settings | `SETTINGS-V2.md` (design-settings-v2, 02:49) = one list, two rows (Linear, Devin), one big button each. **Exactly the brief.** | Nav still has five entries in CONNECTORS-PAGE-SPEC; collapse (NOTES 06, 08). |
| 5 | Speed | Budgets exist in LOGIN-PAGE-SPEC §1 (0 ms JS, ≤ 3 layers). | Those budgets predate the raycast decision and conflict with a WebGL source (NOTES 02, 03). |

## Contradictions to resolve first (Runner, in this order)
1. **Login background.** LOGIN-PAGE-SPEC offers 3 invented options; owner chose raycast. Strike §2/§4, point at `docs/interactions/raycast-animation.md`, carry the perf budget over.
2. **Marketplace source.** CONNECTORS-PAGE-SPEC C4 + SERVER-FROM-DEVIN §6 say "public registry, Devin catalog not proxied." Brief says Devin marketplace via connected Devin account. Flip both.
3. **Settings nav.** Brief: two cards (Linear, Devin). CONNECTOR-PACKAGES says 4 entries w/ "Packages"; CONNECTORS-PAGE-SPEC says 5 with a redundant `Connections`. Collapse to ≤ 3.

## Gaps the brief names that no lane owns yet
- **Automation projects board** (iPhone-home-screen folders, default unfiled). No spec, no
  schema, `design-projects` branch is empty at main. Highest-value unstarted item.
- **Light/dark two-tone for the raycast background.** Source has one palette. Owner decision needed.
- **Our runs vs Linear native Loops.** linear-loops 008326b maps Linear's own Loop system (definitions, runs, history, inbox). Our plan drives plain chats. Owner must pick one (NOTES 10). Default stays: our records.

## Lane scoreboard (commits ahead of main)
| Lane | Tip | Ahead | Verdict |
|---|---|---|---|
| vision-connector-packages | b8f5638 | 1 | on-vision, 2 drift points |
| ref-raycast-animation | 97eb399 | 2 | on-vision; budget missing |
| ref-atsu | bf11753 | 1 | capture OK; **152 MB, no index** → slop-risk |
| plan-devin-mashup | c30282c | 6 | 4 of 5 specs on-vision; LOGIN superseded |
| design-settings-v2 | 56311b0 | 1 | **on-vision**, best doc tonight |
| design-login / design-projects | 65afacc | 0 | not started |
| devin-decompile re-server-3.10.48 | 741da31 | — | marketplace evidence VERIFIED |
| linear-loops re-chat-automations | 008326b | — | rigorous map; raises Loops-vs-ours question |

## What "good" looks like by morning
Contradictions 1–3 resolved in docs; a projects-board interaction doc exists; raycast contract
has a byte/ms budget; atsu commit rewritten under 50 MB with an INDEX. Still no code. That is fine.
