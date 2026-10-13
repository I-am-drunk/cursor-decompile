# DECISION — Preflight code step (Devin "Preflight check") in v1

Status: DRAFT skeleton (pass 0). Branch `design-decisions`. Owner delegated 2026-10-13.
Question: SERVER-FROM-DEVIN §5 floated "store the `code_step` field but enforce `enabled:false`"
for v1. Should v1 **store-but-disable**, **ship enabled**, or **cut** it?

## 1. What it is (plain words)
TODO

## 2. Why Devin built it
TODO

## 3. What Cursor does
TODO

## 4. What it would cost us
TODO

## 5. Options
| Option | What ships | Pros | Cons |
|---|---|---|---|
| A. Cut | nothing | | |
| B. Store, disabled | field + 422 | | |
| C. Ship enabled | runner + UI | | |

## 6. Recommendation
TODO

## 7. Interaction spec (only if kept)
TODO

## 8. Evidence
TODO
