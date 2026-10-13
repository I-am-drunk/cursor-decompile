# AUTOMATION PROJECTS — the board (iPhone-home-screen model for automations)

Status: **pass 1 — skeleton.** Branch `design-projects`. Fable, 2026-10-13. Owner's flagship.
Law: GOAL-SYSTEM §1 — nothing here is implemented until every state, transition, timing and
copy string below is filled. Evidence labels: VERIFIED > OBSERVED > EXTRACTED > DOCUMENTED >
DESIGN (ours). GAP = missing evidence, never permission to invent.

## 0. The idea in one paragraph

Every automation is a card on a board. Cards can be dragged onto each other to make a
**project** (a folder: "Google Classroom"), or dragged into an existing project. Projects open
in place like an iOS folder: the board dims, the folder expands from the card, its automations
sit inside it in the same card grammar. Default is **unfiled** — a new automation lands on the
board, not in a project. The board is the global run view's context: open a project and the
run view shows that project's runs. The list/table view copied from Devin stays as the second
view of the same data. Desktop-native, not touch-native: immediate pickup on mouse drag, no
long-press, no jiggle mode.

## 1. References studied (what we copy, what we refuse)

| Source | What it gives us | Evidence |
|---|---|---|
| iOS home screen (folders, drag, drop zones) | folder-from-collision, hover-open, folder open/close geometry, spring curves | DOCUMENTED (Apple HIG + observed behavior); §4, §5 |
| Devin automations list (3.8.20 spec §6.4) | the card = the row: icon, 13px medium name, badges, `creator · channel` subtitle, 91×20 sparkline, relative last-triggered | EXTRACTED; §3 |
| atsu.moe principles | quiet frame, relational spacing (2/6 · 12/16 · 32/48), motion follows the cause, response before decoration | EXTRACTED; cited inline |
| Cursor shell | neutral chrome, surfaces, radii; the board lives inside Cursor's page frame | OBSERVED (ui-map) |

Refused from iOS: long-press to pick up, jiggle/edit mode, page paging, badges, widgets,
the App Library. Reasons in §12.

## 2. Board layout

_TODO pass 2: page frame, header copy, grid metrics, card size, gaps, responsive columns,
view toggle placement, sort order of cards (reuses Devin §6.3 default comparator)._

## 3. Card design (copied from Devin's list row)

_TODO pass 2: anatomy table; hover; focus; disabled/personal badges; sparkline; last-triggered;
project-folder card anatomy (2×2 mini-tile preview like iOS, count, name)._

## 4. Drag lifecycle

_TODO pass 2. States: idle → armed (mousedown) → dragging (moved ≥4px) → over-empty /
over-card / over-folder / over-folder-dwell → dropped / cancelled → settled. One table per
transition with trigger, duration, curve, scale, shadow, opacity._

## 5. Folders (projects)

_TODO pass 2: create by collision; default name; rename inline; delete (automations go back
to unfiled, never deleted); folder open view geometry + timing; close by Escape/outside click/
drag out; nesting = never._

## 6. Unfiled default and board ordering

_TODO pass 2._

## 7. Empty, loading, error states

_TODO pass 2: no automations; no projects; folder empty after last automation dragged out;
loading skeleton (reuse Devin's four-row skeleton metric for cards); stale-data alert._

## 8. Keyboard, touch, reduced motion

_TODO pass 2: Space-to-pick, arrows to move, Enter on folder to open, "Move to project…"
context menu as the no-drag path; touch = long-press 400ms canceled by >10px movement
(atsu E20 pattern) ONLY on coarse pointers; prefers-reduced-motion table._

## 9. Coexistence with the list/table view

_TODO pass 2: segmented Board | List toggle, persisted; board is default; list gains a
`Project` column + filter; URL form._

## 10. Data model additions

_TODO pass 2._ Sketch: `projects` table `{id, name, position, created_at, updated_at}`;
`automations.project_id NULL` (NULL = unfiled); `automations.board_position`. Lives in the
`automations` slice (SERVER-FROM-DEVIN §3), no new slice.

## 11. API surface

_TODO pass 2._ Sketch: `GET/POST /projects`, `PATCH/DELETE /projects/:id`,
`PATCH /automations/:id {project_id, board_position}` (reuses PUT revision/409 rule),
`PUT /board/order` for one-shot reorder. All additive to SERVER-FROM-DEVIN §2.

## 12. Resolutions: iOS vs desktop

| iOS does | We do | Why |
|---|---|---|
| long-press (≈500ms) to pick up | mousedown + 4px movement picks up immediately | desktop mouse; atsu switcher arms at 4px (E ledger) |
| jiggle / edit mode | none; drag is always live | mode is a cost; a mouse has no ambiguity between tap and hold |
| drop-onto-icon makes a folder | same | the one iOS idea the owner asked for |
| hover-over-folder opens it after dwell | same, dwell 400ms | lets you drop inside a folder without first opening it |
| folder opens as modal sheet over blurred home | same geometry; dim not blur | blur is expensive and fights Cursor's flat chrome |
| paging across home screens | single scrolling board | desktop has a scrollbar |

## 13. Physics spec (one table rules all)

_TODO pass 2: pickup scale 1→1.04 @120ms ease-out, shadow 0→lg; drag follows cursor with 0
lag; displaced neighbours slide 200ms (.2,0,0,1); drop settles 180ms ease-out; cancel returns
220ms (.33,1,.68,1); folder open 260ms, close 200ms; dim 150ms._

## 14. Open questions for Runner / owner

1. Is the board the default view, or the list (Devin truth) with board as opt-in?
2. One level of folders only — confirm no nesting ever.
3. Does dragging a card onto a card in the open folder view do anything? (proposal: no)
4. Do projects need colour/emoji? (proposal: no in v1; name + 2×2 preview only)

## 15. Changelog
- pass 1 (2026-10-13): skeleton banked.
