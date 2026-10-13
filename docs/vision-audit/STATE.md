# Vision — where it stands tonight (2026-10-13, updated 05:40)

Sixty-second read for the morning. Detail per audit in `NOTES.md`. Law: `/tmp/goals/VISION-BRIEF.md`.

## One line
Planning is strong and on-vision; **zero product code exists yet**. Three spec contradictions
remain, two pushed branches are truncated stubs, settings-v2 finished five passes and is ready for Astra, and the three
other Fable design lanes (login, projects, decisions) have died repeatedly with no output.

## Status by the five things the owner cares about

| # | Pillar | Tonight | Risk |
|---|---|---|---|
| 1 | UI quality, copy-first | Doc-before-code holding across all lanes. UI-EXTRACTION-MAP pins the sidebar to captured constants and names the first-pass inventions to never repeat. DEVIN-PORT-MAP inventories all 19 Devin feature files with citations. | Raycast "exact" vs "instant" still unbudgeted; light-mode palette confirmed NOT in source (NOTES 02, 16). |
| 2 | Connector packages w/ skills | Thesis nailed in CONNECTOR-PACKAGES; packages = Devin plugins (CONNECTORS-PAGE-SPEC §7). Devin cloud now has a Create-Plugin dialog + manifest editor captured (NOTES 14) = our authoring UX, copy it. | Settings nav naming still split across two specs (NOTES 01, 06). |
| 3 | Linear as brain, Devin-shaped server | SERVER-FROM-DEVIN is the only server plan; T3-derived ARCHITECTURE is superseded and should be closed (NOTES 13). Linear chat loop VERIFIED live. | Scheduler format decided in prose (RRULE+tz) but three docs still differ (NOTES 15). Runs-vs-native-Loops question open (NOTES 10). |
| 4 | Simple settings | SETTINGS-V2 pass 5 = one list, two rows, three states, one button per row (Connect or Disconnect). Exactly the brief; lane parked clean. | Nav still 5 entries in CONNECTORS-PAGE-SPEC; collapse to ≤3 (NOTES 06, 08). |
| 5 | Speed | LOGIN-PAGE-SPEC §1 budget exists; raycast lane has live shaders + geometry in hand. | Budget predates the WebGL source; needs ms/KB numbers in the raycast contract (NOTES 02). |

## Contradictions to resolve first (Runner, in this order)
1. **Login background.** LOGIN-PAGE-SPEC offers 3 invented options; owner chose raycast. Strike §2/§4, point at `docs/interactions/raycast-animation.md`, carry the perf budget over. (fable-login is rewriting this now as LOGIN-PAGE-V2.)
2. **Marketplace source.** CONNECTORS-PAGE-SPEC C4 + SERVER-FROM-DEVIN §6 say "public registry, Devin catalog not proxied." Brief says Devin marketplace via connected Devin account. Flip both. Name which catalog "Available" lists (NOTES 14).
3. **Settings nav.** Brief: two cards (Linear, Devin). CONNECTOR-PACKAGES says 4 entries w/ "Packages"; CONNECTORS-PAGE-SPEC says 5 with a redundant `Connections`. Collapse to ≤ 3.
4. **Scheduler format.** RRULE + per-schedule IANA tz, Devin's storage shape; cron only via a proven adapter. State it once in SERVER-FROM-DEVIN §1; park Cursor's raw-cron input as v2 (NOTES 15).

## Housekeeping that blocks a clean morning
- **Three Fable design lanes are dying before writing anything.** fable-login (3×), fable-projects, fable-q45: 35–66 tool calls, zero writes, then a gateway error (`300s wall-clock budget … upstream degraded`, one `risk-refused`). Fix: stream output, resume instead of cold relaunch, and make each goal commit a skeleton doc in the first 10 minutes (NOTES 20). **Night's biggest risk.**
- **Truncated pushes:** `origin/plan-devin-port` (65 lines) and `origin/plan-ui-extraction` (141 lines) are stubs; the real docs (1,268 / 267 lines) are only in local worktree commits 2630d27 / aeb5b19. Force-push with lease (NOTES 12).
- **Stray files:** untracked copies of both maps sit in the `design-decisions` working tree. Delete.
- **atsu tree is 161 MB in git.** Lane recovered and wrote README + three docs (good); still needs the one-poster-size rewrite before any merge (NOTES 07, 19).
- **Close plan-server-architecture** as superseded; harvest the scaffold tree into SERVER-FROM-DEVIN (NOTES 13).

## Gaps the brief names that no lane has landed yet
- **Automation projects board** (iPhone-home-screen folders, default unfiled). fable-projects
  started 03:50; `design-projects` still at main. No schema either: add `automation_folders` +
  `automations.folder_id` to SERVER-FROM-DEVIN §3 before any schema PR (NOTES 07).
- **Light/dark two-tone raycast.** Source has one palette (confirmed 04:26). Light mode will be
  DESIGN. Owner decision needed; lanes must not guess (NOTES 02, 16).
- **Our runs vs Linear native Loops.** Owner must pick. Default stays: our records (NOTES 10).
- **v1 keep/hide/cut over Devin's automations surface.** DEVIN-PORT-MAP inventories everything
  (ACU limits, security profiles, Issues triage, consumption charts). Nobody has drawn the v1
  line yet (NOTES 12).
- **Preflight code steps + skill chips.** fable-q45 started 03:53; DECISION docs pending.

## Lane scoreboard (tips as of 05:00)
| Lane | Tip | Verdict |
|---|---|---|
| vision-connector-packages | b8f5638 | on-vision, 2 drift points (nav name, marketplace) |
| ref-raycast-animation | 97eb399 | on-vision; budget missing; light palette = DESIGN |
| ref-atsu | f1372bc | principles/tokens/interactions docs on-vision, README added; **161 MB in git**, shrink before merge (NOTES 19) |
| plan-devin-mashup | c30282c | 4 of 5 specs on-vision; LOGIN superseded |
| design-settings-v2 | a697aa4 | **on-vision**, 5 passes, 3 states, one button; ready for Astra (NOTES 18) |
| plan-ui-extraction | aeb5b19 local / 24bbd22 origin | on-vision; **origin truncated** |
| plan-devin-port | 2630d27 local / 991d4ae origin | on-vision evidence; scope unbounded; **origin truncated** |
| plan-server-architecture | 97f6018 | superseded by SERVER-FROM-DEVIN; close |
| plan-linear-connection | 6e74317 | on-vision; Turnstile-Chrome vs cookie-paste ASK open |
| design-login / design-projects / design-decisions | at main / b8f5638 | Fable lanes running since 04:00, nothing landed |
| devin-decompile re-server / re-desktop / docs-public-spec | 741da31 / 0cc66a8 / b20e607 | VERIFIED evidence; cloud plugin editor = authoring copy source |
| linear-loops re-chat-automations | 008326b | rigorous map; raises Loops-vs-ours question |

## What "good" looks like by morning
Contradictions 1–4 resolved in docs; truncated branches re-pushed; LOGIN-PAGE-V2 and
AUTOMATION-PROJECTS exist and pass audit; raycast contract has a byte/ms budget; atsu commit
rewritten under 50 MB with an INDEX; v1 keep/hide/cut line drawn over Devin's surface.
Still no code. That is fine.
