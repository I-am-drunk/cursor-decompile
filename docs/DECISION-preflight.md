# DECISION — Preflight code step (Devin "Preflight check") in v1

Status: pass 1. Branch `design-decisions`. Owner delegated 2026-10-13.
Question: SERVER-FROM-DEVIN §5 floated "store the `code_step` field but enforce `enabled:false`"
for v1. Should v1 **store-but-disable**, **ship enabled**, or **cut** it?

**Answer: cut it from v1.** No field, no route, no card, no modal. Reinstate as its own slice
when a real automation of the owner's needs it (§6 names the trigger condition).

## 1. What it is (plain words)

A Preflight check is **not** environment setup. It does not install dependencies or prepare
the agent's machine. It is a small user-written script (Python, Node or Bash) that Devin runs
in a throwaway VM *after* a trigger event matches and *before* the agent session starts.
The script reads the event and answers one question: **should the agent run at all, and on
what?** It writes exactly one of three answers to a file:

| Output | Effect |
|---|---|
| `{"run": true}` | start the agent once with the original event |
| `{"run": false, "reason": "…"}` | skip this event, record the reason |
| `{"items": [{"id": …}, …]}` | start one agent session per item (fan-out), deduplicated by `id` across runs |

It also gets a 64 KiB JSON state file that persists between runs (a polling cursor) and a
read-only record of how last run's items ended, so a failed item can be re-emitted.
Devin's own guide calls the two use cases: "check whether an alert is still active before
starting Devin" and "poll an external service on a schedule and start a session for each new
item" (DOCUMENTED, `product-guides/automations.md` §Preflight checks).

So the feature is a **programmable condition plus a fan-out mapper**. Trigger conditions are
declarative filters on event fields; Preflight is the escape hatch for when a filter needs code
or an external lookup.

## 2. Why Devin built it

Devin's triggers are mostly **inbound events** from Slack, GitHub, Linear, PagerDuty and
webhooks (DOCUMENTED guide §Trigger sources). Two problems appear at scale that declarative
conditions cannot solve:

1. **Stale or noisy events.** A PagerDuty alert may already be resolved by the time the
   automation fires; a Slack channel emits far more messages than deserve a session. Each
   unnecessary session costs the customer ACUs. Preflight lets a script ask the source "is
   this still live?" and skip. The default template in the editor is exactly the "only if the
   message contains `urgent`" filter (DOCUMENTED guide example).
2. **Polling sources with no webhook.** A cron trigger fires once, but the user wants one
   session per new incident / ticket / row since last time. Preflight's `items[]` output plus
   the persistent `STATE_FILE` cursor plus server-side dedup by `id` turns one tick into N
   deduplicated sessions, capped at 10 per run (DOCUMENTED guide §Items, state, and limits).

Both are **cost controls for metered multi-tenant sessions**. The feature is explicitly
"being rolled out" behind an org flag (DOCUMENTED guide note), ships with a test-run harness
against recent or sample events, a secrets picker gated on an org permission, a snapshot
environment selector and a network policy. That is the apparatus of an enterprise platform
protecting its compute, not a core part of the automations mental model. Devin's own guide
lists it fourth of four core concepts and marks it optional.

## 3. What Cursor does

Nothing equivalent. Cursor's automation editor has Triggers, Instructions, Tools and an
Environment card (OBSERVED, `facts/automations-launch-demo.md` D03). The Environment card is
the agent's **repo/runtime environment**, not a gating script. Cursor's answer to "filter
events" is the trigger's own conditions and the agent reading the payload. There is no
"before the agent runs" step, no fan-out mapper, no persistent cursor. The owner's shell
reference therefore has no slot for this card at all; adding it would be a Devin-only
intrusion into a Cursor-shaped editor.

## 4. What it would cost us

Measured against Devin's client (`decompile-3.10.31/automations/C-preflight-code-step-and-webhook.md`,
PROVEN line ranges) and the public contract:

| Piece | Devin has | We would need |
|---|---|---|
| Editor card | toggle, runtime, script row, environment, timeout, secrets, state summary + Clear state, contract panel (~460 lines, `AutomationEditorPage` 1382–1840) | same card, copied; plus the script dialog (Monaco 380px) |
| Test-run harness | event picker (recent/sample), VM start, result card with preview counters | sample-event fixtures per trigger, a draft-run endpoint, polling |
| Run modal | status badge derivation, items, logs with Copy/Download, stale window | same |
| Server | 9 HTTP routes, `code_step_runs` table, dedup history, state store, VM sandbox | subprocess sandbox (Seatbelt/bwrap), 4-file contract, caps 10/50/64 KiB/256 KiB/1 MiB, serialised live runs |
| Secrets | org-secrets store + permission | we have no secrets store (CONNECTOR-PACKAGES §11 cuts the OAuth broker) |

That is one of the largest single surfaces in the Devin automations app, bigger than the
trigger editor. Every row above is a user-visible state the owner's law 1 says must be
documented before code and CU-verified after. Our v1 trigger set is cron plus webhook
(MASTER-PLAN §5); event pollers are v2. The fan-out use case has no event source to fan out
from yet, and the "is the alert still active" use case has no alert source.

## 5. Options

| Option | What ships in v1 | Pros | Cons |
|---|---|---|---|
| **A. Cut** | nothing: no `code_step` field, no routes, no card | smallest server; editor stays Cursor-shaped; passes simplicity test 2 | a Devin automation JSON with `code_step` must be stripped on import (one line) |
| **B. Store, disabled** (SERVER-FROM-DEVIN §5) | `code_step` stored verbatim; `enabled:true` → 422 `PreflightUnavailable`; 9 routes exist but 404/422 | Devin editor's Advanced card round-trips | a visible toggle that always errors; dead routes; a hidden card still needs an interaction doc and CU pass by law 1; vision audit already called it "dead weight" (`vision-audit/NOTES.md` 163) |
| **C. Ship enabled** | sandbox runner + card + script dialog + test harness + run modal | feature parity with Devin | ~5 PR-sized surfaces for a use case our v1 triggers cannot exercise; no secrets store; no sandbox audit yet |

## 6. Recommendation: A, cut

Reasoning, in order of weight:

1. **No v1 need.** The two documented use cases both require event or polling sources. v1
   triggers are cron and webhook (MASTER-PLAN §5). A cron automation that talks to Linear
   needs no gate: the agent reads Linear itself. There is no automation in the owner's stated
   daily use (Classroom, Linear triage) that a declarative condition cannot serve.
2. **Simplicity test 3.** Cursor, the shell reference, has no such card. Devin ships it behind
   an org flag as an optional fourth concept. Copying the Devin editor exactly does not require
   it; the captured 3.8.20 editor spec predates it.
3. **Option B is the worst of both.** It keeps the complexity surface (field validation, 422
   path, routes, a toggle in the Advanced card) while delivering nothing. A control that is
   always disabled is an invented interaction, which law 1 bans. The vision audit reached the
   same conclusion independently.
4. **It is cleanly re-addable.** Devin itself gated it per org and added it in 3.10.31 as an
   additive top-level key on the automation payload with its own route family. Nothing in our
   schema needs to anticipate it; `code_step` is an optional column added in one migration.

**Reinstate when** the first event poller lands (v2) *and* the owner has one automation where
a declarative condition is not enough. At that point build it as one `preflight` slice exactly
per SERVER-FROM-DEVIN §5, documented first, in this order: card → script dialog → runner →
run modal → test harness.

## 7. Interaction spec

None. The decision is cut, so no UI, copy or state ships in v1. The import rule is the only
behaviour: a Devin automation JSON carrying `code_step` is accepted and the key is dropped with
one run-log line `Preflight check not supported; ignored`. Not a UI state.

## 8. Evidence

- DOCUMENTED: Devin public guide `product-guides/automations.md` §Core concepts, §Preflight
  checks (rollout note, Run now bypass, four files, three envelopes, caps).
- PROVEN: `decompile-3.10.31/automations/C-preflight-code-step-and-webhook.md` §1.1–1.7
  (config object, 9 routes, editor line ranges, badge derivation).
- EXTRACTED: `DEVIN_AUTOMATIONS_DECOMPILED_SPEC.md` §13.5, §18.4.
- OBSERVED: Cursor saved automation sections Triggers · Instructions · Tools · Environment
  (`facts/automations-launch-demo.md` D03); no gating step.
- Prior positions: SERVER-FROM-DEVIN §5 (store, disabled); vision audit NOTES 163 (dead weight);
  MASHUP-PLAN §8 Q4.
