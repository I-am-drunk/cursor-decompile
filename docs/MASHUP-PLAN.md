# MASHUP PLAN — Cursor shell + Devin pages (planning spec, 2026-10-12)

> Branch `plan-devin-mashup`. Planning deliverable under RESTART §5; no implementation.
> Owner decision ("the mash"): **Cursor's shell + styling**, **Devin's automations pages**
> (replacing Cursor's), **Devin's connectors/settings system** (exact reimplementation),
> **Devin's customization sidebar**, Cursor-only features ported *into* Devin's pages, and
> **Devin's client/server split as the model for our server** (T3 Code is no longer the model).
>
> Evidence labels (facts/INDEX.md): OBSERVED / EXTRACTED_UI (Cursor captures), PROVEN /
> PROJECTED / DERIVED / REMOTE (Devin dossiers), DOCUMENTED (public docs), DESIGN (ours).
> Devin baseline: 3.8.20 spec + 3.10.31 dossiers (`decompile-3.10.31/`) + **3.10.48 desktop
> excerpts** (`docs/evidence/desktop-3.10.48/`, landing now). 3.10.31 docs are shape, not gospel;
> where 3.10.48 excerpts disagree, 3.10.48 wins and is marked `[3.10.48]`.
>
> Companions: CONNECTORS-PAGE-SPEC.md, SETTINGS-SIMPLIFICATION.md, LOGIN-PAGE-SPEC.md,
> SERVER-FROM-DEVIN.md. Earlier plans still in force unless named here: UI-EXTRACTION-MAP
> (shell contract), DEVIN-PORT-MAP (automations port), LINEAR-CONNECTION, LOOP-RUNTIME.

## 0. The one rule that makes the mash seamless

Two donor codebases, **one token layer**. Devin's pages are Tailwind over CSS-variable tokens
(`--bg-page`, `--bg-elevated`, `--border-secondary`, `--text-primary/secondary/tertiary`,
`--text-accent-primary`, `text-12/13/14/17` scale — PROVEN `[3.10.48] css-theme.md`,
`css-typography.md`). Cursor's shell is also Tailwind over tokens (`--bg-quaternary`,
`--sidebar-motion-ms`, `border-tertiary` — EXTRACTED C-SHELL). The mash is therefore not a
restyle of Devin's markup; it is **one `tokens.css` that defines Devin's variable names with
Cursor's measured values**. Devin markup is copied verbatim; only the variable *values* change.

| Devin token (PROVEN 3.10.48) | Bound to Cursor value from | Rule |
|---|---|---|
| `--bg-page`, `--bg-wash` | shell page background, C-SHELL frame | measured from `artifacts/shell/reference-expanded.png` + computed styles |
| `--bg-elevated`, `--bg-elevated-secondary` | Cursor card/dashboard-cell background (C-SET-CSS `.dashboard-cell`) | |
| `--border-primary`, `--border-secondary` | Cursor `border-tertiary` / cell divider | |
| `--text-primary/secondary/tertiary/disabled` | Cursor settings text colors (S-ACCOUNT computed styles) | |
| `--text-accent-primary`, `--bg-accent-primary` | Cursor accent (settings link `#055180` in light, SETTINGS-CARVE) | one accent, used by chat gate underline too |
| `--text-red/green/orange/blue/purple` | Devin's own values kept (status semantics; Cursor has no captured equivalents) | DESIGN, documented exception |
| `text-12/13/14/15/16/17/18` | **Devin's scale kept** (Cursor settings body is 13px/18px — identical to Devin `text-13`) | |
| radii 10px cards (Devin) vs 6px inputs (Cursor) | both kept: Devin pages use 10px cards; Cursor shell/settings rows keep 6px | no harmonising; each page keeps its donor's radii |
| font family | Cursor's text/icon fonts (asset closure, UI-EXTRACTION-MAP §2 last row) | Devin glyphs replaced by Cursor icon font only where a Cursor glyph exists; else Devin SVG kept |

Dark theme: both donors ship light and dark variable sets. We ship both, Cursor values first;
where a Cursor dark value was not captured (GAP), Devin's dark value is used and listed in
`styles/tokens.css` under a `/* devin-fallback */` comment, never silently.

## 1. Decisions

| # | Decision | Basis |
|---|---|---|
| M1 | Cursor shell (sidebar, header, command palette, account footer, mobile drawer) is the only app shell. Devin's `AppShell`/sidebar/`PageHeaderBar` are **not** mounted; Devin pages render inside Cursor's content slot via a header-actions outlet. | UI-EXTRACTION-MAP §2, §5 (`AutomationHeaderOutlet`); RESTART §2.1 |
| M2 | Automations list/templates/editor/detail/error-logs are Devin's clean implementation, chiseled. Cursor's automations pages are deleted, not merged. | RESTART §1; DEVIN-PORT-MAP §2 |
| M3 | Settings is **Devin's Connections/Customize system**, exactly reimplemented, styled with Cursor tokens, inside Cursor's settings frame. SETTINGS-CARVE's "four entries" is superseded by §3 below. | Owner decision; CONNECTORS-PAGE-SPEC |
| M4 | Devin's **Customize** sidebar (Plugins · MCPs · Skills · Rules · Hooks · Subagents tabs, PROVEN `[3.10.48] customization-routes.md`) drops into Cursor's settings secondary nav as the "Connectors" group. | 3.10.48 excerpt; public plugins guide |
| M5 | Cursor-only features (global Run History, Linear "End of cycle", custom cron, Teams/Sentry/PagerDuty triggers, custom-MCP add forms) are ported **into** Devin containers per DEVIN-PORT-MAP §3; never the reverse. | RESTART §2.2 |
| M6 | Styling precedence: Cursor token values > Devin token values (fallback) > nothing invented. Markup precedence: donor page's own markup, verbatim. | §0 |
| M7 | Server follows Devin's client/server boundary (feasibility audit §0/§2, spec §22) with Linear as the brain. SERVER-FROM-DEVIN.md supersedes ARCHITECTURE.md where they conflict. | Owner decision |
| M8 | Per-account Linear connection is ONE big card with Connect/Disconnect; team mapping hidden in UI, kept in code. | SETTINGS-SIMPLIFICATION.md |
| M9 | Login page is the only surface allowed a designed (not copied) element: the animated background. Form geometry copies Cursor settings inputs. | LOGIN-PAGE-SPEC.md |
| M10 | 3.10.48 excerpts are re-read on every fetch of `re-desktop-3.10.48` / `re-server-3.10.48`; this doc carries a `[3.10.48]` changelog in §9. | Task brief |

## 2. Route map (what the user can reach)

| Route | Page | Donor | Shell slot |
|---|---|---|---|
| `/login` | Login | Cursor inputs + designed background (LOGIN-PAGE-SPEC) | none (full-bleed) |
| `/` → `/chat` | Chat (Linear-only, gated) | Cursor conversation page shell; gate per MASTER-PLAN §6 | content |
| `/automations` | List | Devin `list/*` | content + header outlet |
| `/automations/templates` | Templates | Devin `templates/*` | content |
| `/automations/create[?template=]` | Editor (create) | Devin `editor/*` | content + sticky bar |
| `/automations/:id` | Detail | Devin `detail/*` | content + header outlet |
| `/automations/:id/edit` | Editor (edit) | Devin `editor/*` | content |
| `/automations/:id/error-logs` | Error logs | Devin `error-logs/*` (reconstructed; quarantined) | content |
| `/automations/runs` | **Global run history** (Cursor-only port) | Devin `EventsSection` + `analytics.tsx` composed | content |
| `/settings` → `/settings/connections` | Connections | Devin Connections (CONNECTORS-PAGE-SPEC §2) | settings frame |
| `/settings/connections/linear` | Linear connection card | SETTINGS-SIMPLIFICATION | settings frame |
| `/settings/customize?tab=plugins|mcps|skills|rules|hooks|subagents` | Customize | Devin Customize (CONNECTORS-PAGE-SPEC §3–§6) | settings frame + Customize sidebar |
| `/settings/customize/mcp/:id` | MCP detail | Devin `[3.10.48] mcp-detail` | settings frame |
| `/settings/accounts`, `/settings/general` | Accounts, General | Cursor settings rows (UI-EXTRACTION-MAP §3) | settings frame |

Deleted routes: `/search` (palette only), Codebases, Review, Bugbot, Spending, Overview,
`/oncall/*`, `/security/automations/*`, Devin voice. Type-aware redirects in Devin §2 collapse
to the single standard detail route because v1 has no code-scan or responder automations.

## 3. Page-by-page composition

Column key: **Devin** = copied from devin-decompile `app/src` + spec; **Cursor** = copied from
captured Cursor code (C-* aliases in UI-EXTRACTION-MAP §1); **Merge** = how the seam is hidden;
**Style** = which tokens/radii apply (always Cursor values per §0).

### 3.1 Shell (every page)

| Part | Devin | Cursor | Merge | Style |
|---|---|---|---|---|
| Sidebar panel, rail, peek, Mod+Alt+B, persistence | — | `e7`, `AgentsLayoutClient`, `tj` verbatim (UI-EXTRACTION-MAP §2 contract) | Devin pages never touch sidebar state | Cursor as-is |
| Compact destinations | — | Open sidebar · New Chat · Automations (Codebase deleted) | Settings reached via account footer menu, as captured | glyphs `agent`, `robot` from Cursor icon font |
| Header outlet | `header-portals.tsx` `HeaderActions` portal target | header right slot (`eu`) | Devin detail/editor pages portal their action bars (Edit · Run automation · ⋯; Cancel · Create) into Cursor's header right slot. Devin's own `PageHeaderBar` and breadcrumb are deleted | Cursor header height; button variants from C-BUTTON |
| Command palette | — | `tn` + C-SEARCH dialog | results = automations by name, settings destinations, Linear sessions | Cursor |
| Account footer menu | — | C-FOOTER | entries: Settings · Sign out (billing deleted) | Cursor |
| Theme | Devin `useTheme` bridge | Cursor theme class | one `data-theme` attribute drives both token sets | §0 |

### 3.2 Automations list `/automations`

| Part | Devin (SPEC §6) | Cursor port (facts) | Merge |
|---|---|---|---|
| Header `Automations` + subtitle | kept; subtitle loses "Devin" → `Bring the agent into your recurring and event-driven workflows` (COPY_CATALOG wording minus product name) | — | subtitle is the only copy edit |
| Tabs `All <n>` · `Created by you <n>` | kept | Cursor `Mine/Team` scope (A11) | single-user: `Created by you` stays (DEVIN-PORT-MAP §3 forbids relabeling to Team) |
| Search ⌘F, metadata filter chips | kept | — | |
| `Create automation` split: Generate · Manual · Template | kept; Generate wired to Linear conversation bootstrap (LOOP-RUNTIME) or deleted if unavailable | — | no fake 600 ms generate |
| Table Name · Last 30 days · Last triggered | kept, 91×20 sparkline, `Disabled`/`Personal` badges | Cursor desktop columns Model/Tools/Duration (A10) **not** added to the list | Cursor run columns live on the run row (§3.6) |
| Toolbar analytics link slot | capability-gated link | → **`Run History`** link to `/automations/runs` (A11 global history) | reuses Devin's existing slot |
| Empty state three cards + suggested templates | kept | Cursor empty state deleted | |
| Intro dialog (4 steps) | kept only for honest slides (Event · Scheduled · Customization); Persistent Memory slide deleted | — | per UI-EXTRACTION-MAP §4 |

### 3.3 Automation editor `/automations/create`, `/automations/:id/edit`

Frame: Devin centered `max-w-[800px] px-3 py-[28px]`, `gap-6`, sticky Cancel + Create/Update
(SPEC §8.1) — the sticky bar portals into Cursor's header right slot (§3.1). Section order is
Devin's: Name → Triggers → Agent definition → Notifications → Advanced (SPEC §8.2).

| Section | Devin kept | Cursor port | Deleted |
|---|---|---|---|
| Name | `h-[38px]` 17px medium input | — | — |
| Triggers: Add-trigger picker, `TriggerCard`, OR-of-AND conditions | Schedule (hourly/daily/weekly/custom RRULE/one-time, 5-min steps, IANA tz), Webhook (minted secret shown once, URL, cURL, payload regex), Linear source group | **Linear events** from C-LINEAR captures (A17): Issue → Created / Status changed; Cycle → End of cycle, added as rows in Devin's Linear source group; **Custom cron** (A14–A16): a `Cron` variant inside Devin's RRULE popover, shown only when the server proves the cron→RRULE subset (DEVIN-PORT-MAP §3); Teams/Sentry/PagerDuty labels (A14) **not** added until schemas exist | GitHub/GitLab/Slack/Pylon/Jira/code-scan sources, Slack monitor mode, plan upsells |
| Agent definition `AgentCard` | Instructions textarea (minH 120, maxH max(250px,30vh)), mention hydration, `Run as` row | `Run as` lists **Linear accounts** `<email> · <org>` (LINEAR-CONNECTION §5) | Devin mode selector, session destination, Slack monitor/triage, security notices |
| Tools (inside last AgentCard) | `McpSelector`: 42px header with select-all + `Search MCPs...` + `N selected`, 265px body, 34px rows, `Suggested`/`Setup` badges (SPEC §11.2) | Cursor's custom-MCP URL/Command/JSON forms live in Settings (CONNECTORS-PAGE-SPEC), reached by the `Manage MCPs` button | `Not recommended`/`Blocked` rows (no governing profiles in v1) |
| Built-in Linear row | `linear_tools_enabled` switch, visible only when connected (SPEC §11.5) | row shows Cursor's captured `Requires connection · Connect` when no account is `connected` | — |
| Notifications | Email row (Always / On failure / On success) only if a sender exists; else section deleted | — | Slack destination |
| Advanced accordion | Metadata rows, Limits (invocation count + window), Queueing (concurrent/queue depth), Preflight code step **[3.10.31+]** if the server ships the step runner (SERVER-FROM-DEVIN §5) | — | ACU spend, security profile, network policy, child sessions, scratchpad |
| Guards | dirty-state navigation confirm, save gating, `inert`/`aria-busy` while saving | — | network-change confirm |

Validation/normalization state machine is Devin's (SPEC §14) minus deleted action/trigger kinds.
Save payload is SERVER-FROM-DEVIN §4 (Devin create/update shape, pruned).

### 3.4 Automation detail `/automations/:id`

| Part | Devin (SPEC §17–18) | Cursor port | Deleted |
|---|---|---|---|
| Action bar | `Edit` · `Run automation` · ⋯ (View runs · View errors · Disable/Enable · Duplicate · Delete), portaled to Cursor header | — | `Improve with Devin` (until Linear generation is real) |
| Header | 17px name (`Untitled automation` fallback), source logo prefix, `Active`/`Inactive`, `Created by / Last updated by`, metadata chips (2-row clamp, `+N more`) | — | Pylon banner |
| Read-only Triggers + Instructions cards | kept verbatim (whitespace-preserved prompt, no markdown) | — | Legacy monitor banner |
| Run dialog | idle → triggering → success; prompt textarea hidden when a recurring schedule exists; `Automation triggered` success | — | spending-frozen gate |
| Tabs | Events (default) with Last week / Last 4 weeks / Custom range, 166px activity chart, `N events · P% success rate` | Cursor status filter order already matches Devin's (Queued…Canceled) | Consumption tab (no metering), Issues tab |
| Events table | 50/page, status multi-select, current-page search with highlight, session link, 5 s poll while queued/running | **Run drill-in** (Cursor A12 run summary: dated trigger, failure title/message, View Automation) hosted in Devin's Preflight-modal frame; Cursor `Model/Tools/Duration` shown as modal rows | em-dash session target |
| Session link | `/sessions/{id}` | → run detail route `/automations/:id/runs/:runId` (LOOP-RUNTIME §4 run view) | — |

### 3.5 Templates `/automations/templates`

Devin §7 verbatim: search, categories (All · Monitoring & Triage · CI/CD & Release · Security
· Project Management), 2/lg:3 grid, six skeletons, card = whole-card create link + requirement
chips. Templates are **server data** from `GET /automations/templates` (SERVER-FROM-DEVIN §4);
v1 ships the Linear-only subset (triage, cycle planning, status report, write issue — the
skills of CONNECTOR-PACKAGES §8.2 as templates). Templates whose required connector is
disconnected are hidden, not greyed (DEVIN-PORT-MAP §2 qualifications).

### 3.6 Global run history `/automations/runs` (Cursor-only feature, Devin containers)

Composed page, DESIGN-labelled because neither donor has it as one surface:
Devin `AutomationsListPage` toolbar (scope tabs reuse → `All` · `Created by you`; search) above
Devin `analytics.tsx` date control + `EventsSection` fed by `GET /events?automationId=*`.
Columns are Devin's event row (status · message · relative time) plus an **Automation** name
column (A11 Run History shows it). Row click opens the §3.4 run drill-in. No new primitives.

### 3.7 Settings `/settings/*` (summary; full spec in CONNECTORS-PAGE-SPEC + SETTINGS-SIMPLIFICATION)

| Part | Devin | Cursor | Merge |
|---|---|---|---|
| Frame, heading, section stack, rows | — | C-SETTINGS `DashboardTabHeader/Section/Cell` (S01 geometry: title 20/28, rows 12px 16px, 55px, inputs 28px) | Devin pages are rendered **inside** Cursor's dashboard sections |
| Secondary nav | Devin Customize tabs (PROVEN `[3.10.48]` `plugins, mcps, skills, rules, hooks, subagents`) | Cursor nav row anatomy (S-ACCOUNT) | nav entries: **Linear**, **Connections**, **Customize** (6 tabs), **Accounts**, **General** |
| Connections page | Devin `ConnectionsSection` groups: Source control · Issue tracking · Chat · Support & incidents · Connected accounts (mockup 05 headings; dossier A registry) | row = Cursor settings row | v1 shows Issue tracking (Linear) only; other groups exist in code, hidden by capability |
| Linear connection | Devin connect/disconnect lifecycle (dossier B §7), "MCP access included" callout (dossier D §2.1) | row/button geometry | SETTINGS-SIMPLIFICATION |
| MCPs tab | Devin `[3.10.48]` marketplace + detail (status pills, env-var table, Test tools) | Cursor custom-MCP dialog (URL/Command/JSON) as the `Add custom MCP` form | CONNECTORS-PAGE-SPEC §4 |
| Plugins/Skills tabs | Devin `[3.10.48]` plugin components (details sheet, "This install will add:", scope labels) | — | our connector packages are plugins (CONNECTORS-PAGE-SPEC §7) |

### 3.8 Chat `/chat`

Cursor conversation shell; Linear-only. Zero connected accounts → centered `Connect to Linear`
gate with accent underline → `/settings/connections/linear` (MASTER-PLAN §6). Connected →
Linear conversation proxied through our server (LOOP-RUNTIME §3). Skill chips above the composer
(CONNECTOR-PACKAGES §10) remain DESIGN pending owner acceptance.

### 3.9 Login `/login`

LOGIN-PAGE-SPEC.md. Cursor settings input/button geometry; animated background is the one
designed element. Local account (facts/account-login.md) in v1; Google OAuth deferred.

## 4. Seam inventory (every place two donors touch)

| Seam | Resolution | Acceptance |
|---|---|---|
| Devin page inside Cursor content slot | Devin page root drops its own `bg-bg-page` wrapper (`[3.10.48] sidebar.md iyo` shows Devin's own page wrapper); Cursor `.agents-page` owns background and scroll | screenshot: no double scrollbar, no background seam at 1270×764 |
| Devin action bar vs Cursor header | portal; Devin bar's own sticky container is unmounted | header height unchanged when navigating list → editor |
| Two button systems | Devin pages use Devin `ui/button.tsx` (10px radius family); Cursor shell uses C-BUTTON. Both read the same color tokens. No cross-use | focus ring color identical on both |
| Two dialog systems | Devin `ui/dialog.tsx` for Devin pages; Cursor `McpServerModal` for the custom-MCP form only. Both Radix, same scrim token `--bg-scrim` | Escape/focus-return pass on each |
| Icons | Cursor icon font in shell/settings; Devin SVG icons inside automations pages; brand logos (Linear) from Devin `icons/brand.tsx` | no emoji, no Lucide substitutes |
| Fonts | Cursor text font everywhere (asset closure) | glyph-width comparison before shipping |
| Toasts | Devin `LocalToast` inside automations; Cursor has none captured → settings reuse Devin's | one toast primitive |

## 5. Deleted, not hidden (merged list)

Cursor: Codebases, Review, Bugbot, managed-agent upsells, Spending/Overview, model picker in
editor (Linear-only inference), standalone search route, billing menu entries, Cursor-branded
strings/logos. Devin: own AppShell/sidebar/breadcrumb, Devin mode, security profiles, network
policy, child sessions, scratchpad, Slack/GitHub/GitLab/Jira/Pylon/code-scan triggers, on-call,
Consumption/ACU, Issues tab, voice, enterprise scope/governance UI, `Improve with Devin`.

## 6. Build order (each arrow = one PR)

tokens.css + Cursor shell → settings frame + Accounts/General → Linear connection card →
Connections page → automations shared primitives + list → editor → detail → templates →
Customize MCPs tab (+ custom-MCP dialog) → Customize Plugins/Skills → global run history →
chat gate → login page → error-logs (once original captured).

## 7. Verification doctrine (unchanged)

RESTART §4: Playwright critical journeys (connect Linear, create, edit, view run, chat gate),
CU screenshot pass per PR against the donor at matching viewport/theme/DPR, 80% on changed lines.

## 8. Open questions for the owner (ranked)

1. Login background: A (gradient mesh, recommended), B (aurora), or C (constellation)?
2. Customize tab order: desktop 3.10.48 (Plugins · MCPs · Skills · Rules · Hooks · Subagents,
   chosen) vs current web (Plugins · Skills · MCPs · Hooks · Rules)?
3. Global run history page is a DESIGN composition (§3.6); accept, or drop to per-automation
   Events only?
4. Preflight code step: accept "stored but disabled" for v1 (SERVER-FROM-DEVIN §5)?
5. Skill chips on chat (§3.8) — accept or defer?

## 9. `[3.10.48]` changelog for this document

| When (local) | Landed on RE branches | Change here |
|---|---|---|
| 2026-10-12 23:22 | `DESKTOP-3.10.48-CONNECTORS.md` + `evidence/desktop-3.10.48/*` | §0 token table built from `css-theme.md`/`css-typography.md`; M4 Customize tab set |
| 23:31 | `DESKTOP-3.10.48-CUSTOMIZATION-SIDEBAR.md`, `-SETTINGS.md` | §3.7 secondary nav geometry; settings root `max-w 900px`, `pl-[230px]` noted as Devin's own frame — **not** adopted, Cursor frame wins |
| 23:38 | `DESKTOP-3.10.48-CLOUD-CONNECTORS.md` (web capture) | §2 route table unchanged; web tab order recorded as open question 2 |
| 23:38 | `DESKTOP-3.10.48-AUTOMATIONS.md` | states list/editor/detail deltas vs 3.10.31 are **not yet established**; §3.2–3.5 stay on 3.8.20 spec + 3.10.31 changelog until that pass lands |
| 23:47–23:58 | re-server `CONNECTOR-BACKEND`, `AUTH-SESSION`, `LIVE-MARKETPLACE-ACCESS` | SERVER-FROM-DEVIN §6 gateway verbs and OAuth refresh; marketplace = public registry, not Devin's token-gated catalog |
| open | remote Automations list/editor/detail capture; Connections provider forms | re-read on landing; §3 rows marked `[3.10.48]` when revised |
