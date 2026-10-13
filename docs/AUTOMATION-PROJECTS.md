# AUTOMATION PROJECTS — the board (iPhone-home-screen model for automations)

Status: **pass 9 — final sweep; ready for Runner review.** Branch `design-projects`. Fable, 2026-10-13. Owner's
flagship. Law: GOAL-SYSTEM §1 — nothing here is implemented until every state, transition, timing
and copy string below is filled. Evidence labels: VERIFIED > OBSERVED > EXTRACTED > DOCUMENTED >
DESIGN (ours). GAP = missing evidence, never permission to invent.

## 0. The idea in one paragraph

Every automation is a card on a board. Cards can be dragged onto each other to make a
**project** (a folder: "Google Classroom"), or dragged into an existing project. Projects open
in place like an iOS folder: the board dims, the folder expands from its card, its automations
sit inside it in the same card grammar. Default is **unfiled** — a new automation lands on the
board, not in a project. The board is the global run view's context: open a project and the
run view shows that project's runs. The list view copied from Devin stays as the second view
of the same data. Desktop-native, not touch-native: immediate pickup on mouse drag, no
long-press, no jiggle mode.

## 1. References studied (what we copy, what we refuse)

| Source | What it gives us | Evidence |
|---|---|---|
| iOS home screen folders | folder-from-collision, dwell-to-open, open/close geometry from the source tile, dim behind | DOCUMENTED (Apple HIG "Home Screen"; behaviour observed on iOS 17/18) |
| Devin `AutomationListItem.tsx` | the card = the row: 16px source glyph, 13px/18px medium name, `Disabled`/`Personal` badges, `creator · channel` 13px secondary subtitle, 91×20 sparkline, 12px relative date, `—` for never | EXTRACTED (`app/src/features/list/AutomationListItem.tsx` L66–L120) |
| Devin `ListFrame` / `AutomationsListPage.tsx` | page frame `py-4 sm:py-8`, `px-4 sm:px-6`, `max-w-[min(1200px,max(50vw,800px))]`; header 18px medium + 13px secondary subtitle; `mx-1 rounded-lg border-border-secondary bg-bg-elevated` shell; rows `gap-0.5 p-1`, `rounded-md px-3 py-2 hover:bg-tint-secondary` | EXTRACTED (`ListPagination.tsx` L71–L79, `AutomationsListPage.tsx` L28–L30, L208–L213) |
| Devin template card (spec §7.3) | grid card grammar: `rounded-xl`, secondary border, elevated bg, `p-4`, hover primary-border/wash, 2→3 columns at `lg`, min-height 126px | EXTRACTED (spec §7.3) |
| Cursor shell | 180ms `cubic-bezier(.22,1,.36,1)` is the one captured easing in this repo; neutral chrome; the board lives inside Cursor's page frame | OBSERVED (`docs/verification/motion-audit.md`) |
| atsu.moe | capture on disk is a splash shell only (`../atsu-original.html`, 21 KB); the owner's brief gives the principles we apply: quiet frame, response before decoration, motion follows the cause | DESIGN (brief), GAP for timings |

Refused from iOS: long-press to pick up, jiggle/edit mode, page paging, badges, widgets, the
App Library, blur behind folders. Reasons in §12.

## 2. Board layout

The board is the Devin automations page with the `ListFrame` swapped for a grid. Everything
above the frame is Devin's, byte for byte (EXTRACTED `AutomationsListPage.tsx` L208–L240):

| Element | Spec | Evidence |
|---|---|---|
| Page scroll container | `flex size-full flex-col items-center overflow-y-auto`, `scrollbar-gutter: stable`, `py-4 sm:py-8` | EXTRACTED |
| Content column | `w-full flex-col gap-4`, `px-4 sm:px-6`, `max-w-[min(1200px,max(50vw,800px))]` | EXTRACTED |
| Header | `mx-1` · h2 `Automations` 18px medium · p 13px secondary `Bring Devin into your recurring and event-driven workflows` → ours: `Automations that run on your Linear workspace` | EXTRACTED / copy DESIGN |
| Toolbar row | `mx-1 flex items-center justify-between gap-2`: left = segmented tabs `All <n>` · `Created by you <n>`; right = search (⌘F), metadata filter, **view toggle (new, §9)**, `Create automation` split button | EXTRACTED + 1 addition |
| Grid frame | same `mx-1 rounded-lg border border-border-secondary bg-bg-elevated`, no header row (columns make no sense on a grid), inner `p-1` | EXTRACTED shell, DESIGN removal of header |
| Grid | CSS grid, `gap-0.5` (2px, exactly the row gap; cards are borderless tiles with a hover wash, like rows), columns `repeat(auto-fill, minmax(260px, 1fr))` → 3 cols at 800px, 4 at 1200px | gap EXTRACTED (`ListFrame` `gap-0.5 p-1`); column count DESIGN |
| Card | one grid cell, §3 | — |
| Ordering | Devin §6.3 default comparator (enabled first, newest `last_invocation_at`, newest `created_at`); projects are **not** sorted into the automations — they sit first, in `position` order, then unfiled automations | EXTRACTED comparator, DESIGN placement |

No manual reordering of cards in v1 (§6, §14 Q5). The only thing a drag can change is
**membership** (which project a card is in). That single decision removes displaced-neighbour
animation, insertion indicators, and the position column from the drag spec — the simplest
thing that serves "drag automations into folders".

Responsive: below 640px (`sm`) the grid is one column and the board behaves exactly like the
list with taller rows; the drag lifecycle is unchanged. Touch pointers use §8.

## 3. Card design (the Devin row, re-flowed into a tile)

Rule: every token on the automation card already exists in `AutomationListItem.tsx`. We
re-flow the row's three columns into two lines; we add nothing.

### 3.1 Automation card anatomy

| # | Part | Spec | Evidence |
|---|---|---|---|
| 1 | Shell | `rounded-md px-3 py-2`, `hover:bg-tint-secondary`, whole card is the `Link` to `/automations/$id`; height **78px** fixed (8 + 18 + 2 + 18 + 4 + 20 + 8) so every cell is identical | EXTRACTED row classes; height is the sum of Devin's own line metrics |
| 2 | Line 1 | `flex gap-2.5`: 16px source glyph in an 18px box (`py-px`) · name 13px/18px medium, one-line truncate, tooltip only when clamped · `Disabled` / `Personal` badges `shrink-0` | EXTRACTED L89–L96 |
| 3 | Line 2 | 13px/18px `text-text-secondary` truncate: `creator · <channel>` (channel in `text-text-accent-primary`) or creator alone | EXTRACTED L97–L99 |
| 4 | Line 3 | `flex items-center justify-between` `mt-1`: left = 91×20 sparkline (null / 91×20 skeleton / flat centerline / normalised 1.5px stroke, gradients from Devin §6.4) · right = 12px/16px secondary relative date, `—` for never, absolute tooltip | EXTRACTED L104–L113 |
| 5 | Focus | `focus-visible:ring-2 focus-visible:ring-border-primary` on the card | EXTRACTED (Devin's ring pair, 7 + 4 uses in bundle) |

Draggable surface = the whole card. Clicking without moving ≥4px follows the link (§4.1).

### 3.2 Project (folder) card anatomy

| # | Part | Spec | Evidence |
|---|---|---|---|
| 1 | Shell | same as 3.1 #1 but `bg-bg-wash` at rest (`248 248 248` light / `25 25 25` dark — one step below the elevated frame; iOS tints the folder tile) | token EXTRACTED (`index.css` L22, L84); use DESIGN |
| 2 | Line 1 | 16px folder glyph (lucide `Folder`) · project name 13px/18px medium truncate · count badge `<n>` using Devin `Badge` | DESIGN reusing Devin `Badge` |
| 3 | Line 2 | 13px secondary: member names joined by ` · `, truncated (a folder always has ≥2 members, §5.3) | DESIGN (replaces iOS 3×3 mini-icon preview; we have 16px glyphs, not icons) |
| 4 | Line 3 | left = **summed** sparkline of members (bucket-wise sum, same renderer) · right = most recent `last_invocation_at` across members | DESIGN reusing renderer |
| 5 | Hover | `hover:bg-tint-secondary` like rows; cursor default; click opens folder (§5.4) | EXTRACTED hover |

A folder card is never a link. Enter/click opens it. It is a drop target (§4.3). It does not
pick up (reordering is v2, §14 Q5).

## 4. Drag lifecycle

One state machine, one pointer. Only automation cards pick up (v1). Only membership changes.

### 4.1 States (pass 3: seven states, down from ten)

| State | Entered by | Visible | Exits to |
|---|---|---|---|
| `idle` | — | card at rest | `armed` on `pointerdown` (primary button, fine pointer) |
| `armed` | pointerdown | nothing; `setPointerCapture` | `dragging` at ≥4px; `idle` on pointerup (= click = navigate) |
| `dragging` | ≥4px | pickup (§4.2); **ghost** follows pointer with 0 lag; origin card stays in its cell at 40% opacity so the grid never moves | `over-target`, `return`, drop → `return` |
| `over-target` | pointer inside another card's rect inset 8px (automation **or** folder) | target gets `ring-2 ring-ring` + `bg-tint-secondary` in 120ms | leave → `dragging`; drop → `commit` |
| `commit` | drop on target | ghost flies into target (§4.2 drop); optimistic `POST /projects` or `PATCH .../project` | `idle` when motion ends |
| `return` | drop on nothing · Escape · blur · `pointercancel` · right button | ghost returns to origin (§4.2 return) | `idle` |

Target kind decides the commit: automation → create folder (§5.1); folder → move into.
There is no dwell-to-open while dragging (iOS "folder peek"). Cut in pass 3: it needed a
sub-machine (sheet under the ghost, leave-to-close timer, drop-on-dim rules) for one gain —
moving a card from folder A straight into folder B — which the open view already covers:
open A, drag the card out (sheet closes, §5.4), drop on B. One fewer mode, zero lost outcomes.

### 4.2 Physics (the one table)

| Moment | Property | From → to | Duration | Curve | Evidence |
|---|---|---|---|---|---|
| pickup | ghost `transform: scale` | 1 → 1.03 | 120ms | `cubic-bezier(.22,1,.36,1)` | curve OBSERVED (Cursor sidebar); values DESIGN |
| pickup | ghost `box-shadow` | none → `shadow-L3` (`0 10px 15px -3px rgb(0 0 0/.1), 0 4px 6px -2px #0000000d`; dark alpha .3) | 120ms | same | EXTRACTED token (`index.css` L70, L105) |
| pickup | ghost `opacity` | 1 → .92 | 120ms | same | iOS DOCUMENTED translucency; value DESIGN |
| pickup | origin cell `opacity` | 1 → .4 | 120ms | same | DESIGN |
| pickup | `cursor` | default → `grabbing` on `<html>` | 0 | — | desktop convention |
| drag | ghost position | = pointer − grab offset | 0 lag, per `pointermove` | none | iOS DOCUMENTED (icon stays under finger) |
| enter target | target `ring-2 ring-border-primary`, `bg-tint-secondary` | off → on | 120ms | same | tokens EXTRACTED (Devin's own focus ring is `ring-2 ring-border-primary`); duration DESIGN |
| leave target | same | on → off | 80ms | `ease-out` | DESIGN (leave faster than enter) |
| drop | ghost `transform` | current → target card centre, scale 1.03 → .6 | 180ms | same | iOS DOCUMENTED (icon flies into folder) |
| drop | ghost `opacity` | .92 → 0 | 180ms, last 60ms | `ease-in` | DESIGN |
| drop | origin cell | removed from DOM when ghost finishes; grid reflows with **no** animation | 0 | — | DESIGN (cheaper; see §12) |
| drop | target folder count badge | n → n+1; on collision the target automation card is **replaced in place** by the new folder card (no motion, name field selected §5.1) | 0 | — | iOS DOCUMENTED (folder forms at the target's slot) |
| return | ghost `transform` | current → origin rect, scale → 1 | 220ms | `cubic-bezier(.33,1,.68,1)` | DESIGN |
| return | origin `opacity` | .4 → 1 | last 100ms of the 220 | `ease-out` | DESIGN |
| reduced motion | every row above | instant (duration 0) except opacity rows at 80ms | — | — | motion-audit policy |

Ghost = a `position: fixed` clone (same DOM) in a portal, `pointer-events: none`, `will-change:
transform`. Rendering is `transform` + `opacity` only; nothing lays out during a drag.

### 4.3 Hit testing

Targets are computed from `getBoundingClientRect()` of every card on pickup and cached for the
drag (the grid never moves mid-drag, §2). A target is "hit" when the **pointer** (not the ghost
rect) is inside the rect inset by 8px — iOS tests the dragged icon's centre; the pointer is
the honest cursor equivalent. The origin card is excluded. Auto-scroll: when the pointer is
within 40px of the scroll container's top/bottom edge, scroll 8px per frame; rects are
recomputed on scroll.

## 5. Projects (folders)

### 5.1 Create by collision

Drop automation A on automation B → one call, `POST /projects {name, automation_ids:[A,B]}`
(§11), both moved in the same transaction. Optimistic: the folder card appears at B's cell instantly, named
**`Untitled project`**, with its name field in **inline edit, selected** (iOS opens the folder
and selects the auto-name; we skip the open — the folder card itself is the edit surface).
Enter/blur commits; Escape keeps `Untitled project`. Empty name on commit → reverts to
`Untitled project`. Max 60 chars, trimmed. No auto-generated category names (iOS guesses
"Productivity"; we have no taxonomy — DESIGN).

### 5.2 Rename

Double-click the name on a folder card, or `Rename` in its `…` menu, or F2 while focused.
Inline input in the same 13px medium type, same box; no dialog. Same commit rules as 5.1.
In the open folder view (5.4) the sheet title is the same inline-editable field.

### 5.3 Delete

`…` menu → `Remove project`. No confirm dialog: the action is non-destructive. Members return
to **unfiled** (never deleted). Copy on the menu item: `Remove project` with secondary line
`Automations stay on the board`. Folder with 0 members after its last card is dragged out is
removed **automatically** (iOS DOCUMENTED) — immediate, with the folder card fading out 120ms.

### 5.4 Open view

| Moment | Spec | Timing | Evidence |
|---|---|---|---|
| open | sheet grows from the folder card's rect to a centred panel `max-w-[720px]`, `max-h-[70vh]`, `rounded-lg border-border-secondary bg-bg-elevated`; `shadow-L4`; board behind gets Devin's `bg-bg-scrim` (`0 0 0/.12` light, `.32` dark) | 260ms `cubic-bezier(.22,1,.36,1)` on transform (scale + translate from source rect), opacity over the first 120ms; scrim = Devin `fade-in` 150ms ease-out | iOS geometry DOCUMENTED; scrim, shadow, fade EXTRACTED (`index.css` L49, L71, L246); 260ms DESIGN |
| content | title row: folder glyph · inline-editable name · count · `…` (Rename, Remove project) · close ×. Below: the **same grid** (§2) of member cards | — | — |
| close | reverse of open, 200ms; scrim fades 300ms (Devin's dialog exit `transition-opacity duration-300`) | Escape · click scrim · × | iOS DOCUMENTED; scrim exit EXTRACTED (`IssuesSection.tsx` L193) |
| drag out | pick up a member and move the pointer onto the scrim: the sheet closes (200ms) and the drag continues on the board in `dragging`; drop anywhere → unfiled, drop on a card/folder → §4.1 commit | iOS DOCUMENTED; no timer (pass 4) |
| URL | `?project=<id>` via router replace; deep-linkable; refresh re-opens without motion | DESIGN (matches Devin's `replace` policy §6.1) |
| run view | while open, the global run view filters to `project_id` (VISION: "the global run view's context") | — | — |

Nesting: **never**. Dropping a folder on a folder is not possible because folders don't pick up.

## 6. Unfiled default and board ordering

- A new automation (manual, template, or generated) has `project_id = NULL` and appears on the
  board as an unfiled card. There is no "Unfiled" folder and no "Unfiled" heading — unfiled
  is just the board (iOS: apps that are not in a folder are on the home screen).
- Order on the board: projects first in `position` order, then unfiled automations in Devin's
  default comparator (§2). Explicit column sort (`Name`, `Last triggered`) exists only in the
  list view; the board never shows sort controls.
- Search / tabs / tag filters apply to automations, not projects. A project card stays
  visible while any member matches and shows `<matching>/<total>` in its badge; projects with
  no matching member are hidden. The `All` / `Created by you` counts stay automation counts.

## 7. Empty, loading, error states

| State | Board renders | Evidence |
|---|---|---|
| loading | frame with 8 skeleton cards, each = Devin's skeleton row re-flowed: `h-[14px] w-48` bar · `h-[14px] w-32` bar (gap-1) · line 3 `h-5 w-[91px]` left, `h-4 w-16` right | EXTRACTED `ListSkeleton` (`ListPagination.tsx` L54–L66); no glyph placeholder because Devin has none |
| no automations, can manage | Devin §6.5 three creation cards + suggested templates, unchanged; no frame | EXTRACTED |
| no automations, cannot manage | `No automations yet` centred, same as Devin | EXTRACTED |
| filters match nothing | `No automations match these filters` + `Clear all` inside the frame | EXTRACTED |
| search matches nothing | `No matching automations` | EXTRACTED |
| list error, has cached data | stale-data alert above the frame | EXTRACTED |
| list error, no data | full centred error, no frame | EXTRACTED |
| project move failed | optimistic move reverts with the return motion (§4.2, 220ms); toast `Couldn't move "<name>"` with `Retry` | DESIGN; toast component is Devin's |
| open folder, 0 members | cannot happen (auto-remove §5.3); if it does (stale), sheet shows `Empty` and closes on first refetch | DESIGN |

## 8. Keyboard, touch, reduced motion

### 8.1 Keyboard (the no-drag path — every drag outcome must be reachable)

| Key / control | Where | Does |
|---|---|---|
| Tab / Shift-Tab | board | moves focus card to card in DOM order (projects first) |
| Arrow keys | board | move focus by one cell; Left/Right wrap rows |
| Enter / Space | automation card | open detail (same as click) |
| Enter / Space | folder card | open folder (§5.4) |
| Escape | open folder | close |
| ⌘F | page | Devin's search (unchanged) |
| `…` menu → `Move to project ›` | automation card (menu is `canManage` only; revealed on hover/focus-within, replacing the date, like Devin's) | submenu: list of projects + `New project…` + `Remove from project` (when filed) |
| F2 | folder card | rename inline |

`Move to project ›` is inserted after `View sessions` in Devin's row menu (Enable/Disable ·
View sessions · Duplicate · ─ · Delete; EXTRACTED `AutomationListItem.tsx` L132–L145). Devin's
main page mounts rows with `canManage=false, hideActions=true` so the menu is **hidden**
there; we mount with `canManage=true` because the owner is always the manager of a
one-workspace product. The menu is also the touch path and the screen-reader path.

### 8.2 Touch (coarse pointer)

Scroll must win. Pickup = press 400ms with <10px movement (atsu/iOS pattern), then the same
state machine as §4. Haptic none (web). Drop and return timings identical. A 400ms press
on a folder opens it instead.

### 8.3 Reduced motion

`prefers-reduced-motion: reduce`: all transforms instant; opacity changes 80ms; the folder
sheet appears centred without the grow-from-tile; scrim is instant. The ghost still follows
the pointer (it is position, not animation).

## 9. Coexistence with the list view

| Decision | Spec | Why |
|---|---|---|
| Toggle | icon-only segmented control `Board ⊞ · List ☰` in the toolbar right group, left of `Create automation`; Devin `SegmentedTabs variant="rounded"` | the toolbar already holds a segmented control; same component |
| Default | **Board**, always (pass 4: owner calls this the flagship; a default that hides it is a hedge) | VISION-BRIEF "Automation projects"; list remains one click away |
| Persistence | `localStorage automations.view = board \| list`; URL `?view=list` overrides for a link | matches Devin's `replace` URL policy |
| List additions | a `Project` facet in the existing metadata filter popover (key `project`, values = project names, same OR/AND rules §6.2); row subtitle gets ` · in <project>` after the channel when filed | zero new columns; the filter popover already exists |
| Row menu | `Move to project ›` (§8.1) in both views | one menu, two views |
| Folder open | list view never opens folders; `?project=<id>` in list view = filter by that project | folders are a board idea |

## 10. Data model additions

Lives in the `automations` slice (SERVER-FROM-DEVIN §3). One migration, one new table, one
nullable column. No new slice, no new event types beyond `project.*` on the event log.

```sql
CREATE TABLE projects (
  id          TEXT PRIMARY KEY,            -- ulid
  name        TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 60),
  position    INTEGER NOT NULL,            -- order among projects on the board
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
ALTER TABLE automations ADD COLUMN project_id TEXT NULL
  REFERENCES projects(id) ON DELETE SET NULL;   -- NULL = unfiled; delete project → unfiled
CREATE INDEX automations_project ON automations(project_id);
```

Invariants (enforced in the slice, tested): a project with zero members is deleted by the
server on the `PATCH` that empties it; `position` is dense `0..n-1`, renumbered on delete;
no `parent_id` exists, ever. `Automation` wire shape gains `project_id: string | null`;
projects ride along as `GET /automations` response field `projects: Project[]` so the board
needs one request.

## 11. API surface (additive to SERVER-FROM-DEVIN §2; all under `/api`)

| Method + path | Body / query | Returns | Notes |
|---|---|---|---|
| `GET /automations` | — | `{data: Automation[], projects: Project[]}` | one request feeds the board (§10) |
| `POST /projects` | `{name, automation_ids: [a, b]}` | `201 Project` | collision create; both ids are moved in the same transaction |
| `PATCH /projects/:id` | `{name?}` | `Project` | rename |
| `DELETE /projects/:id` | — | `204` | members → `project_id = NULL`; `position` renumbered |
| `PUT /projects/order` | `{ids: string[]}` | `Project[]` | v2 (§14 Q5); reserved |
| `PATCH /automations/:id/project` | `{project_id: string \| null}` | `Automation` | move / unfile; distinct from `PUT /automations/:id` so no `revision` 409 for a board action |

Event log rows: `project.created`, `project.renamed`, `project.removed`, `automation.moved`
`{automation_id, from, to}`. Devin has no projects concept, so every row here is ours
(DESIGN), modelled on the existing CRUD rows and zod-validated both ways.

## 12. Resolutions: iOS vs desktop

| iOS does | We do | Why |
|---|---|---|
| long-press (≈500ms) to pick up | mousedown + 4px movement picks up | a mouse has no tap/hold ambiguity; 4px is the common desktop drag threshold |
| jiggle / edit mode | none; drag is always live | a mode is a cost the mouse doesn't need |
| drop-onto-icon makes a folder | same | the one iOS idea the owner asked for |
| hover over folder, dwell → opens (peek) | **cut**; drop on the folder card moves in; open the folder to drop at a position | one fewer mode; §4.1 explains the no-loss argument |
| folder opens as sheet over blurred home | same geometry; Devin's `bg-bg-scrim` (12% light, 32% dark), no blur | blur fights the flat chrome and costs frames; the scrim token already exists |
| displaced icons slide aside | nothing slides; drag changes membership only | no reorder in v1 → nothing to displace |
| auto-named folder ("Productivity") | `Untitled project`, name field selected | no taxonomy to guess from |
| empty folder vanishes | same | — |
| paging across home screens | one scrolling board | desktop has a scrollbar |
| 3×3 mini-icon preview on folder | three member names as the subtitle | we have 16px glyphs, not icons; names read better at 13px |

## 13. Physics index (pointer to §4.2)

§4.2 is the single source of truth for every duration and curve. Two curves exist in the whole
feature: `cubic-bezier(.22,1,.36,1)` (Cursor's captured ease, used for everything that moves
toward a goal) and `cubic-bezier(.33,1,.68,1)` (return). Durations: 80 (leave), 120
(pickup, enter, fade), 150 (scrim in), 180 (drop), 200 (close), 220 (return), 260 (open), 300
(scrim out). Devin's bundle ships exactly three motion tokens — `menu-in` 120ms
`cubic-bezier(.16,1,.3,1)`, `fade-in` 150ms ease-out, sheet exit 300ms ease-in-out — and every
visual token we touch (`shadow-L3/L4`, `bg-bg-scrim`, `bg-bg-wash`, `ring-border-primary`,
`bg-tint-secondary`) is theirs. Nothing in this feature introduces a colour or shadow.

### 13.1 Build order (one idea per PR, GOAL-SYSTEM §2)

1. server: migration + `projects` table + `project_id` column + `GET /automations` `projects[]`
2. server: `POST /projects` (collision) · `PATCH /automations/:id/project` · invariants tests
3. server: `PATCH/DELETE /projects/:id` + auto-remove on empty + event rows
4. ui: view toggle + `localStorage` + `?view` (list still Devin's, board renders cards read-only)
5. ui: automation card (§3.1) + folder card (§3.2) + skeleton + empty states (§7)
6. ui: drag machine `idle→armed→dragging→return` only (no targets yet), ghost + physics
7. ui: `over-target` + `commit` (create folder, move into), optimistic + revert toast
8. ui: folder open view (§5.4) + URL + drag-out
9. ui: rename / remove / `Move to project ›` menu (§5.2, §5.3, §8.1)
10. ui: keyboard + touch + reduced motion (§8); verification PR with CU artifacts

### 13.2 Verification checklist (Astra, computer-use, before any UI PR flips ready)

- 4px threshold: a 3px mousedown-move-up on a card navigates; 5px picks up.
- Pickup, drop, return each measured with a frame recording: 120 / 180 / 220ms ±1 frame.
- Drop on automation → folder card appears in the target's cell, name field selected.
- Drop on folder → count badge +1, no layout shift anywhere else on the board.
- Escape mid-drag, window blur mid-drag, right-click mid-drag → return, no stuck ghost.
- Open folder: sheet origin rect = folder card rect; scrim colour sampled = `bg-bg-scrim`.
- Drag last member out → folder disappears; refresh → still gone (server auto-remove).
- Keyboard-only: create a folder and move a card using only `Move to project ›`.
- `prefers-reduced-motion`: no transform animates; opacity rows ≤80ms.
- Dark and light: screenshots of rest / hover / drag / target / open, compared side by side.

## 14. Open questions for Runner / owner

1. Board default: pass 4 sets board always (§9). Confirm.
2. One level of folders only — confirm no nesting ever (spec assumes never).
3. Dragging a card onto a card **inside** the open folder view: proposal = no-op (no sub-folders).
4. Project colour/emoji: proposal = no in v1; name + count + member names only.
5. Manual reordering (automations within the board, projects among projects): proposal =
   v2. v1 drag changes membership only. This is the biggest simplification in the spec.
6. Subtitle copy `Automations that run on your Linear workspace` — owner to approve.

## 15. Changelog
- pass 1 (2026-10-13): skeleton banked.
- pass 2 (2026-10-13): every section filled; evidence pulled from Devin `list/*.tsx`,
  SERVER-FROM-DEVIN §2–§3, motion-audit; reorder cut from v1.
- pass 3 (2026-10-13): drag states 10 → 6; folder-peek (dwell-to-open while dragging) cut
  with the no-loss argument in §4.1; `over-card`/`over-folder` merged into `over-target`.
- pass 4 (2026-10-13): board is the default view; drag-out of an open folder has no 300ms
  timer (pointer on the dim closes it); collision create is one request; stale `over-nothing`
  reference removed; Backspace-to-close dropped.
- pass 5 (2026-10-13): card height fixed at 78px from Devin's own line metrics; folder
  subtitle rule simplified (folders always have ≥2 members); read-through for stale references.
- pass 6 (2026-10-13): ghost shadow → `shadow-L3`, sheet → `shadow-L4`, dim → `bg-bg-scrim`,
  folder tint → `bg-bg-wash`, target/focus ring → `ring-border-primary`, scrim in/out → Devin's
  150/300ms. DESIGN labels on those rows replaced by EXTRACTED with `index.css` line refs.

- pass 7 (2026-10-13): grid gap is Devin's own `gap-0.5`, not an invented 4px; row-menu
  reveal described as Devin does it (hover/focus-within replaces the date).- pass 8 (2026-10-13): §13.1 build order (10 PRs) and §13.2 computer-use verification
  checklist added; atsu evidence row made honest; dim → scrim everywhere.

- pass 9 (2026-10-13): stale `cancel` wording → `return`; collision drop row says the folder
  card replaces the target in place. Doc frozen for Runner review; next edits come from review.
