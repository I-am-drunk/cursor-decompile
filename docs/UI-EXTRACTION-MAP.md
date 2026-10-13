# UI extraction map — 2026-10-12

Planning only. [RESTART-2026-10-12.md](RESTART-2026-10-12.md) governs. Target paths are proposed owned-source boundaries, not instructions to restore archived implementation. Owner approval precedes implementation.

## 1. Provenance

**Checkout discrepancy:** `~/cursor-decompile/corpus/`, including `automations.split.js` and `app/`, is absent. A search under `/Users/irene` found no `automations.split.js`. The sibling corpora contain shell captures and T3 research, not the desktop bundle. Original captured web response bodies are available under `reference/automations/` and supply the source mappings below. Restore the original desktop corpus before claiming a complete desktop inventory; do not substitute today's download. `pipeline/read.mjs` names the expected desktop entry: `corpus/app/out/vs/workbench/workbench.anysphere-ui-automations.js`.

Devin is at `/Users/irene/automation-project/devin-decompile`, revision `6ca0009666066a99fc2f4b46abe9d8b6c82b09b3`. Below, `D/` means its `app/src/`; SPEC means `DEVIN_AUTOMATIONS_DECOMPILED_SPEC.md` (title: 3.8.20). File line numbers refer to that revision. Its error-logs implementation explicitly declares reconstructed provenance.

Cursor bundles are minified: module IDs, function names and literal selectors identify sections. Numeric offsets are zero-based Unicode character offsets, secondary to symbols/hashes. Each capture's `inventory.json` maps body paths to immutable URLs and hashes. Raw captures are private/ignored; never publish whole HARs or account DOM.

Source aliases (all are original captured responses):

- **C-SHELL**: `reference/automations/twilight/bodies/0040-b3e51002195abc17.js`, module 1858170: `eu` header, `e7` sidebar, `tn` search controller, `tG` frame, `AgentsLayoutClient` persistence. Immutable chunk `3x6jmpsw-qx8t.js`; SHA-256 `b3e51002195abc178a6449950b45c7f1a64485734b721545543641f091073d38`.
- **C-GEO**: `reference/automations/twilight/bodies/0044-957c7545e03713b2.js`: modules 8295430 geometry, 7308391 route policy, 8630775 storage, 1456112 ToolbarIcon, 4419895 SHORTCUTS. SHA-256 `957c7545e03713b225a4f8137a56e12adf827165c963e8ac6af786c099f016a8`.
- **C-ICON**: same bodies directory, `0158-45a54329ff37aab5.js`, modules 4185316 glyph map and 1479037 Icon; `0036-bbc8667fbfe46d5e.js`, module 2594900 CursorIcon.
- **C-BUTTON**: same directory, `0144-aced0324258b9525.js`, module 9459166 Button sizes/variants.
- **C-LIST**, **C-FOOTER**, **C-SEARCH**: same directory, respectively `0125-1759de93bca037d6.js` (AgentsSidebarAgentList), `0219-053199df91ddf86d.js` (SidebarFooter), `0221-6cde25ed052b29b6.js` (AgentsCommandPaletteDialog, module 6816968).
- **C-SETTINGS**: `reference/automations/editor-2026-10-12/bodies/0217-5f39be3fc506ab5a.js`: DashboardCell (around offset 6000), DashboardSection, DashboardSectionHeader, DashboardSubSection, DashboardTabHeader (around 19600), SettingsAnchor, Switch.
- **C-SET-CSS**: same directory, `0006-f9bfd5afe73eebfa.css` (immutable `2cx3o64rp_adg.css`), `.dashboard-*` rules; unqualified `.dashboard-cell` at offset 8285, not the earlier usage-specific override.
- **C-MCP**: same directory, `0086-ae19aea6033fd05c.js`: McpServerModal, FORM_INPUT_CLASS, resolveMcpServerDraft; `0088-a66d868788735589.js`: McpMarketplaceModalContent, McpPluginInstallView, PluginAwareMcpServerModalContent.
- **C-LINEAR**: same directory, `0206-b6b130b72833c680.js`, auth/repository/unavailable presentation (`Requires connection`, near 10622); `0224-d21d3f96b37d005d.js`, Linear trigger/editor branch (`Requires connection`, near 171272).
- **S-ACCOUNT**: `reference/settings/navigation-2026-10-12/settings-account.json`, `.html`, `.elements[index]`, computed `.style`; sibling PNG and AX files. This is the original, unlike `artifacts/settings-account-measurements.json`, whose URL is localhost.

Evidence labels: **OBSERVED** = original interaction/capture; **EXTRACTED** = original code/DOM; **OWNER** = authorized adaptation, not parity; **GAP** = missing evidence, never permission to invent. Historical local verification images cannot certify the fresh implementation.

## 2. Shell extraction table

Targets are relative to proposed `app/src/`. Copy full source subtrees and dependencies first; remove product branches afterward. Preserve source class strings, tokens, font assets and icon glyphs before tuning anything.

| Our target file | Source file(s), section | Copy verbatim | Chisel and why | Acceptance evidence |
|---|---|---|---|---|
| `shell/AppShell.tsx` | C-SHELL `tG`, AgentsLayoutClient | `.agents-page`, content slot/margin/padding compensation, overflow and hydration handling | Route/data adapters for our chat/automations/settings; remove SCM/review/team rollout plumbing | C-SHELL `data-mobile-web-chrome-page`; shell reference PNGs; contract below |
| `shell/Sidebar.tsx` | C-SHELL `e7` | Fixed panel, rail slot, clipping, edge, peek handlers, inert regions, lazy-content lifetime | Delete Codebase, Bugbot, Review, managed-agent/provider upsells; no replacement rail icons | `facts/shell-verification.md` OBSERVED portion; `artifacts/shell/reference-{expanded,collapsed,drag-over}.png` |
| `shell/useSidebarVisibility.ts` | C-SHELL AgentsLayoutClient, `tj`; C-GEO 8630775/7308391 | Persisted vs temporary visibility, server default, viewport hydration, toggle cleanup | Namespace storage/cookie keys; map conversation predicate to real Linear session route; remove deleted route predicates | Extracted storage key `agents-left-sidebar-visible`; reload/resize checks |
| `shell/SidebarHeader.tsx` | C-SHELL `eu` | Home/open toggle branches, Search at header right, tooltips and focus glyph | Home destination/copy only; no standalone Search or Profile route | Expanded PNG; original AX `Search (⌘K)`, `Collapse sidebar (⌘⌥B)` |
| `shell/CommandPalette.tsx` | C-SHELL `tn`, C-SEARCH export | Dialog, keyboard/focus/search/result rendering and close behavior | Replace provider data/results with supported destinations and Linear sessions; no invented search overlay | EXTRACTED source; original search-open CU pass still required |
| `shell/SidebarThreads.tsx` | C-LIST, C-SHELL `R` | Thread grouping, controls, empty state, visibility/selection inputs | Linear session projection; delete unsupported type filters | Expanded capture: Customize thread list / No Agents Yet; populated projection needs QA |
| `shell/AccountMenu.tsx` | C-FOOTER; C-SHELL `q`, `M` | Footer/menu geometry, trigger, dismissal, avatar shape | Local identity; delete billing/upgrade entries | Original settings-user-menu/dismissed AX/PNG; `facts/settings-navigation-capture.md` |
| `shell/MobileNavigation.tsx` | C-SHELL `B`, `eu` mobile branch | Modal drawer, page inerting, close/focus handling, 280px width | Destination list only | EXTRACTED; mobile CU/raster is GAP |
| `shell/sidebar.css` | C-SHELL eK/eQ/eX/eJ; C-GEO 8295430 | Clip, duration, token and viewport classes; preserve cascade | Only unreachable feature selectors | `artifacts/shell/reference-measurements.json`; formulas below |
| `ui/cursor/{Button,Icon,CursorIcon,ToolbarIcon}.tsx` | C-BUTTON, C-ICON, C-GEO | Variant tables, glyph map, inline SVG, size/focus behavior | Unused exports; no Lucide/Unicode substitutes | `data-icon-name`, `--cursor-icon-content`, `.cursor-icon` |
| `styles/cursor.css`, `assets/cursor/*` | twilight inventory / rendered-dom.html and loaded CSS; icon rules in `bodies/0012-8d3d166a91a48638.css` | Tokens, text/icon fonts, stylex classes and URL asset closure | Scope without altering computed values | Asset hashes; glyph/text-width comparison before shipping |

### Sidebar contract: state and persistence

Authority: C-SHELL `e7`, `AgentsLayoutClient`, `tj`; C-GEO route/storage modules.

- `V=tL`: effective pinned visibility = external visibility or local `tT` (default true).
- `hidden=tk`: forceHide OR mobile; `collapsed=tD = !hidden && !V`.
- `peek=tB`; `peekVisible=tW = collapsed && peek`; `railOnly=tU = collapsed && !peek`.
- `armed=tG`: keeps Activity content visible while preparing/exiting peek; `everShown=tq` keeps deferred content eligible after first reveal. Do not unmount/remount the whole sidebar on each page render.
- `motionSuppressed=tK`: previous collapsed state differs from current collapsed state. It suppresses motion for pin/unpin; it is not reduced-motion detection.
- Persisted key `agents-left-sidebar-visible`, default true, server default from `serverIsLeftSidebarVisible`, `storageSync:false`; mirror collapsed state into `cursor_agents_sidebar_collapsed`. Storage exceptions fall back to an in-memory Map. Namespace keys for our product, preserve semantics.
- Temporary visibility overrides persisted state. Explicit toggle clears the override before changing persistence. Content scope bookkeeping is distinct from sidebar mount state.

| State | Reserved width | Panel/edge | Accessible regions |
|---|---:|---|---|
| Pinned expanded | 280px | 280px absolute panel; clip `inset(0 -40px 0 0)`; edge x=279 | Expanded header, navigation, list/footer |
| Compact | 44px | Same panel; clip `inset(0 236px 0 0)`; edge x=43 | Open button and compact navigation; list/footer inert and aria-hidden |
| Transient peek | 44px | Same full clip as expanded, `shadow-lg`; edge x=279; overlays content | Expanded header with Keep sidebar open, list/footer restored |
| Force hidden | 0px | Hidden desktop shell, aria-hidden | No desktop targets |

### Sidebar transitions and hit targets

| Event / source handler | Exact transition |
|---|---|
| Enter `[data-sidebar-peek-target]`, `nl` | When collapsed: clear timer; everShown/armed true; if not peeking, peek true after **100ms**. Target is header AND nav wrapper, not entire blank rail. |
| Leave peek target, `no` | If not yet peeking: cancel timer, disarm. If peeking: outer-shell leave controls closure. |
| Enter `[data-sidebar-shell]`, `nc` | If peeking: cancel pending close/cleanup, arm. Blank compact rail alone does not initiate peek. |
| Leave shell, `nu` | Clear timer. If not peeking, disarm. Otherwise wait **180ms** and check visible `[role="menu"]:not([hidden]),[role="dialog"]:not([hidden])`. If present, repeat after 180ms. Uses checkVisibility or display fallback. When absent: peek false, disarm after **150ms**. |
| Open / Collapse / Keep sidebar open, `nd` | Cancel timer; clear peek; external setter(!V), else supplied toggle, else local setter. Peek→pinned expands reserved slot. |
| Collapsed-state change / unmount | Effect cancels timer, clears peek, schedules disarm at 0ms. Unmount clears pending timer. |
| Keyboard toggle | Mod+Alt+B; toggles persisted visibility; preventDefault; enabled in forms/contentEditable; terminal events excluded. |
| Search | Header click closes mobile navigation then dispatches palette-open event. Mod+K toggles via `tn`; explicit event opens. Lazy dialog, no `/search` route. |
| Focus / drag | No generic focus-in or drag-enter peek handler. Open control changes glyph on focus-visible. Never add whole-rail focus/drag expansion. |

OBSERVED drag selected text without expansion. The old shell fact's DESIGN paragraphs (focus/drag reveal and 180ms width motion) are not source authority.

### Sidebar pixels, motion and compact icon set

C-SHELL constants eK/eQ/eX/eJ (near offset 13060) and render (near 31700):

- Panel stays **280px**, absolute inset-y-0 left-0, overflow-hidden, transparent right border. Inner width observed 279px. Shell is relative/isolate/z-40/flex-none; hidden below 768px.
- `--sidebar-motion-ms = motionSuppressed ? 0ms : railOnly ? 150ms : 200ms`. Clip-path, nav clipping, edge transform and region opacity use cubic-bezier(.22,1,.36,1). Clip/edge/nav include `motion-reduce:transition-none`; preserve each source rule rather than inventing uniform animation.
- Edge: pointer-events-none, absolute, border-l border-tertiary, left **43px**, translateX **0px compact / 236px expanded or peek**. Slot itself does not animate width.
- Nav full clip `inset(0 0 0 0 round 6px)`; compact chip clip `inset(3px calc(100% - 28px) 3px 2px round 6px)`. Do not replace with opacity-only labels or squeezed panel widths.
- Peek wrapper: `flex flex-col gap-3 px-1.5 pb-0 pt-2`. Nav: `flex flex-col gap-px pb-1`. Rows: h-8, max-md:h-[34px], w-full, gap-2, px-2, overflow-hidden; labels inline-flex/min-w-0/gap-1.5/whitespace-nowrap. Active bg is `--bg-quaternary`; icon secondary→primary on row hover/active.
- Header base: flex/items-center/pl-[2px], expanded justify-between/pr-1; home/open control h-6, rounded-md, px-1, focus-visible ring-2. Copy C-BUTTON icon-size variants, not just drawn glyph bounds.
- Open control: CursorIcon **18px desktop**, accessible `Open sidebar (⌘⌥B)`, aria-expanded=false, tooltip right. On focus-visible, logo fades out and overlaid **14px layout-sidebar-left** fades in. Expanded toggle uses ToolbarIcon left, aria-pressed=V, bottom tooltip; Search glyph **14px**, bottom tooltip.
- Observed compact destinations, in order: **Open sidebar, New Chat, Automations, Codebase**. Source glyph names: CursorIcon/focused layout-sidebar-left, **agent**, **robot**, **code**; nav glyphs 14px. Source label fallback is New Agent, observed surface mode labels it New Chat. Keep source glyph font/map, never emoji or approximate SVG.
- V1 removes Codebase and its Early Beta badge/preview; it does not replace it with Search, Settings or Profile. Search and account footer disappear in compact mode. Other source gated branches (lightning/managed agents, rect-magnifying-glass/Review, bugbot) are deleted for v1.
- List `[data-sidebar-list-region]` and footer `[data-sidebar-account-footer]` are inert/aria-hidden/opacity-0 when railOnly. Footer also pointer-events-none and absolute at bottom; account region stays relative/mt-auto/shrink-0. Preserve Activity visibility and delayed disarm; hidden rows must not remain tabbable.

### Viewport, mobile and observational limits

C-GEO uses **1512px** conversation auto-collapse boundary (media max-width 1511px), not the desktop/mobile boundary. Conversation route + narrow viewport gets a temporary false override; leaving that condition restores it only according to route-key policy. C-SHELL `railFollowsViewport` provides CSS slot/header/nav clipping before viewport hydration. Delete Codebase/review predicates; preserve mapped conversation behavior. Automations is not generically auto-collapsed merely for being narrower than 1512px.

Below 768px desktop shell is hidden; C-SHELL `B` uses a **280px left modal drawer**, Navigation title, close button, background inerting and focus restoration suppression when route/viewport changes. Mobile top header has min-h-14, gap-2.5, py-3, pl-[18px], pr-4; drawer header uses mobile logo constant 18px. Route change closes drawer. Copy overlay primitive exit behavior; mobile raster/touch validation remains required.

OBSERVED original: 1270×764 screenshots, 936×764 instrumented measurement, DPR 2. Physical click sampled 41 frames, first at 9ms, last 652ms, duration 0s and reduced motion false. This agrees with pin/unpin suppression; it does not measure hover. Hover timings above are **EXTRACTED**, not newly observed.

## 3. Settings and integration extraction table

Exactly four settings destinations: Linear connection, MCP connectors, Accounts, General. Names and product bindings are OWNER adaptations. Preserve Cursor row/frame geometry; no index cards or invented registry/account tables.

| Our target file (`app/src/`) | Source file(s), section | Copy verbatim | Chisel and why | Acceptance evidence |
|---|---|---|---|---|
| `features/settings/SettingsLayout.tsx` | S-ACCOUNT html; C-SETTINGS DashboardTabHeader/Section | Original dashboard content frame, heading, section and scroll structure | Replace Overview/Settings/Integrations/Spending nav contents with four owner sections; remove billing/usage pages | `facts/settings-navigation-capture.md`; original account/returned PNGs; S-ACCOUNT elements 71–82 |
| `features/settings/SettingsRow.tsx` | C-SETTINGS DashboardCell/SubSection; C-SET-CSS | Leading/content/trailing/divider anatomy, clickable/stacked variants, inputs, disabled buttons | Labels/value adapters only; no new row design | S-ACCOUNT 103–138; `.dashboard-cell`, `.dashboard-cell-divider`, `.dashboard-cell-input` |
| `features/settings/AccountsPage.tsx` | S-ACCOUNT Email row (label index 107), Profile form rows 125/132, Save 169; original user menu | Email row and supported identity fields; captured Save/menu/logout control visuals | Local account data; delete public profile/link/handle, vendor Privacy Mode, billing; Google OAuth gating deferred | Original settings-account/user-menu/dismissed triples; Accounts is OWNER heading |
| `features/settings/GeneralPage.tsx` | C-SETTINGS rows and S-ACCOUNT text/input geometry | Row/heading/control primitives | Only approved backed preferences; old local timezone/theme/defaults screenshot is not vendor evidence | `docs/SETTINGS-CARVE.md` provenance warning; field inventory remains approval/capture gap |
| `features/settings/LinearConnectionPage.tsx` | C-SETTINGS frame/rows; C-LINEAR auth presentation; linear capture triples | Linear icon, connection copy/status/action treatment in existing row geometry | Sole inference connection; replace vendor connection transport with MASTER-PLAN V1–V10; no token form invented | `facts/automations-linear-capture.md`, baseline, linear-created/status, mcp-linear-unconnected |
| `features/settings/McpConnectorsPage.tsx` | C-SETTINGS rows; C-MCP marketplace/server form | No MCP servers configured / New Connection, Browse/Custom transition, existing dialog controls | Replace catalog/storage binding with mcp public API; no permission/binding tables | `facts/automations-saved-editor.md`; original mcp-menu/browse/url/command/json triples |
| `features/settings/McpConnectionDialog.tsx` | C-MCP McpServerModal/resolveMcpServerDraft and marketplace content | URL/Command/JSON tabs, names/URL/headers, command/arguments/environment, Back/Close/error/submitting states | Transport adapter only; do not copy archived single-header limitation or fake authorization | Original Command tab keyboard pass and JSON/URL screenshots; actual connection not established by these captures |
| `features/settings/IntegrationsPage.tsx` → no standalone v1 page | S-ACCOUNT nav link to `/dashboard/integrations`; C-LINEAR and C-MCP fragments | Retained integration rows/forms through the two pages above | Delete non-Linear inference integrations; generic MCP connectors remain in scope | Full original dashboard Integrations page was not captured here; nav presence alone proves no page layout |
| `features/chat/ConnectionGate.tsx` | C-SETTINGS typography/link token; RESTART §2.4 | Existing text/link primitives | Center Connect to Linear; accent underline on Linear; OWNER-required composition | No original connected-chat/empty-state parity capture; require owner acceptance + live gate journey |

S-ACCOUNT extraction pins: title 20px/28px; header padding 0 8px; sections gap 30px; section gap 9px. Standard profile rows padding **12px 16px**, gap **20px**, measured height **55px** for first/last name; input **28px** high, radius **6px**, padding 0 8px, text 13px/18px. This is not a universal 55px fixed height: the public-profile description row is 64px. Copy cascading rules, not a screenshot-derived fixed-height approximation. Raw JSON indexes are evidence locators; `st-*` data-evidence IDs belong to the old reconstruction and are not original selectors.

Settings page-specific account save/privacy handlers and full Integrations module are not identified in the supplied response bodies. DOM proves rendering, not mutation behavior. Recover those original modules before promising behavioral parity; never infer authorization from a stored credential.

## 4. Devin automations: file-by-file extraction

Targets below use prefix `app/src/features/automations/`; sources use `D/features/`.
Copy markup/classes/state machines, including loading/error/empty branches. Linear-only
means inference through Linear; generic MCP remains allowed. Remove unsupported execution
promises. Schedule controls require approved Loop capability before activation; this plan
does not authorize a separate scheduling engine.

| Our target file | Source / components, props and state | Copy verbatim | Chisel and why | Acceptance evidence |
|---|---|---|---|---|
| `list/AutomationsListPage.tsx` | `list/AutomationsListPage.tsx:129`; no props; URL→activeTab/searchText/tagFilters/searchOpen; introOpen; list/responders/sparklines queries. CreationEntry(category), CreationLinkCard(to,disabled,children), CreationCardBody(icon,title,description,footer,highlighted) | Toolbar, All/Mine, search focus/Escape/blur, filters, create menu, skeleton/error/retry/empty states | Delete responder/security routing, billing analytics/spending gates; real user; Generate only with real Linear generation | SPEC §6; source :34–333 |
| `list/AutomationListItem.tsx` | `list/AutomationListItem.tsx:67`; automation, buckets/state, canManage, creator/channel/subtitle, basePath/date flags, hideActions/hideDuplicate, toggle/delete callbacks/pending; menuOpen/deleteOpen/deleting, clamp observer | Row, clamp-only tooltip, confirmation, 91×20 Sparkline, duplicatePrefill | Provider/session ID adapter; remove unsupported badges; no fake activity | SPEC §6.4; Sparkline :21; duplicatePrefill :169 |
| `list/ListPagination.tsx` | Same source suffix; useSortable(items,accessors,initial sort); useListPaging(items,search,tags,creator/channel/search text,pageSize,resetKey); sort/page identity state | ListSkeleton/Frame/SortHeader/Table/Pagination; 50 rows; asc→desc→none; enabled/recent comparator; reset/clamp | Delete unsupported channel/base-path adapters | SPEC §6.3–6.4; :20,51,54,72,82,97,139,152,204 |
| `list/AutomationTagFilter.tsx` | `list/AutomationTagFilter.tsx:27`; tagCounts, selectedFilters, onFiltersChange, chipsOnly/iconOnly; open/query/input ref | Grouping, counts, reserved-tag exclusion, menu/chips and removal | Bind actual metadata; no seeded tags | SPEC §6.2; source :27–180 |
| `list/AutomationsIntroDialog.tsx` | `list/AutomationsIntroDialog.tsx:111`; open/onOpenChange; step; Pill, DownArrow, FanOut, Reveal(delayMs), Events/Schedule/Memory/Customization visuals | Dialog paging, existing illustration geometry and reveal behavior for retained slides | Remove slides promising unavailable Slack/Devin memory/runtime; namespace dismissal key; omit onboarding if no honest source slide remains | SPEC §6.6; helpers :11–110 |
| `editor/AutomationEditorPage.tsx` | `editor/AutomationEditorPage.tsx:59`; route id/template; form/baseline/touched/showErrors/saving/saveError/advancedOpen/webhookCreds/regenerating/mcpHosts/networkConfirm; navigation blocker | EditorSkeleton, frame, section ordering, save gating, dirty guard and confirmation, create/edit/template initialization | Real API adapter; remove unused Slack/security/webhook queries with their controls; no fake save/run success | SPEC §8,14,15; page :59–418 |
| `editor/form.ts` | `editor/form.ts:11`; FormState; emptyForm, formFromTemplate/Automation, consumePrefill, validate, canonical/isDirty, normalize/serialize helpers | Cloning, dirty comparison, metadata handling, retained trigger/action validation, create-vs-update semantics | Project onto Linear schema; remove Devin billing, Slack, security defaults and wire fields together; preserve unknown retained data deliberately | SPEC §4,8.1,14–15; :61,91,110,150,286,468,503,540,565 |
| `editor/TriggerEditor.tsx` | Same suffix; AddTriggerMenu :219; TriggerCardProps :945; TriggerCard :970; schedule/condition helpers detailed below | Card geometry, condition groups, menu/submenu anatomy, schedules/timezone/RRULE editor, connection warning treatment | Retain Linear source and supported schedule controls; delete unsupported GitHub/Slack/Pylon/code-scan/webhook branches and plan upsells; add only evidenced missing Cursor Linear events | SPEC §9; Cursor Linear/trigger facts anchor additions |
| `editor/AgentCard.tsx` | `editor/AgentCard.tsx:712`; action/index/count/change/remove, readonly/error, type/lock flags, mode/identity, MCP Set/recommendations, Linear switch, session options, Slack/security inputs; per-type draft ref and autoUnselected | Instructions card/textarea, supported session-type conversion and destination select, MCP selector geometry/search | One Linear inference path; delete Devin mode/billing, Slack monitor/triage/remediation, unsupported impersonation/security; no seeded sessions | SPEC §10–11; helpers :47,82,117,137,204,366,618,679 |
| `editor/NotificationsSection.tsx` | Same suffix :125; actions/onActionsChange/readonly/triggerEventTypes/onChannelToJoinChange; derives notify/start; SlackChannelPicker query state; EmailNotificationRow/SlackNotificationRow | Existing section/rows and action update logic only if delivery supported | Remove Slack destination; remove email section if no approved sender. Do not invent Linear notification card | SPEC §12; :38,79,99,125 |
| `editor/AdvancedSection.tsx` | Same suffix; AdvancedAccordion(open,onOpenChange,children), MetadataRows, LimitsRow, QueueingRow, ChildSessionsRow, ScratchpadRow, SecurityProfile/NetworkPolicy rows | Accordion and retained metadata/limit control anatomy | Retain metadata; expose invocation/concurrency only if actual Loop limits exist. Delete ACU, Devin security profiles/network machine policy, child sessions/scratchpad if unsupported | SPEC §13; :27,89,149,249,379,511,603,626,697,732,743 |
| `editor/useGenerateWithLinear.ts` | `editor/useGenerateWithDevin.tsx:39`; optional onSuccess; inflight ref, isGenerating/error; generate/improve callbacks | Single-flight and visible pending/error transitions | Replace fake 600ms postSession, client Devin IDs, prompts and route with real Linear conversation bootstrap; otherwise delete entry points | SPEC §16; source :28 explicitly local transport |
| `detail/AutomationDetailPage.tsx` | Same suffix :473; route id; query, toast/deleteOpen/deleting, preset/custom, tab/tabChosen; EventsSection, RunDialog, RunNowButton, read-only cards | Detail frame/action bar, name/status/tags, retained trigger/instructions, run/disable/delete/duplicate UX, event table | Linear IDs/results; delete Improve until real; remove consumption, Slack legacy migration, responder/security/Pylon branches | SPEC §17–18; detailed contracts below |
| `detail/analytics.tsx` | Same source suffix; rangeFor/aggregate; ChartCard(children,className); ActivitySummary/ConsumptionSummary(automationId,since,until); DateRangeControl(preset/custom callbacks); RangeCalendar(value,onValueChange,months,disableFuture,className) | Activity aggregation/chart, calendar/ranges, error/retry | Delete ACU consumption/conversion; real run events only | SPEC §18.1–18.2,18.6; :24,67,114,130,232,346,373 |
| `detail/constants.ts` | Same suffix :1–22 | Status palette/order; 30s poll, 50 events/page, activity 5000/invocations 100 limits where API matches | Delete USD_PER_ACU=2.25; polling is not execution scheduling | SPEC §18; constants |
| `detail/IssuesSection.tsx` | Same suffix; Highlight(text,query), NewIssuesChart(issues/loading/error/retry/since/until), IssuesList(automationId,issues/loading/error,initialExpandedIssueId), IssuesSection(automationId,since,until,showChart); selectedId/search/sheet phase | Search highlighting, drawer and invocation cards if supported | Devin triage issues are not automatically Linear issues. Omit reachable tab until semantic adapter approved | SPEC §18.5; :52,84,173,228,288 |
| `templates/TemplatesPage.tsx` | Same suffix :16; query/searchOpen/category; templates/mine queries; usedIds/installed/connections | Availability/ranking, token search, counts/grouping, 2-column/lg:3 grid, six skeletons, retry/empty | Real user/catalog; exclude unsupported requirements; delete seed CURRENT_USER_ID/MCP_CATALOG | SPEC §7.1–7.3 |
| `templates/TemplateCard.tsx` | Same suffix :56; template prop; TemplateCardSkeleton; category/icon helpers | Card geometry, requirement indicators, template-prefill link | Exclude unsupported templates rather than rewrite promises; preserve Linear/installed MCP icons | SPEC §7.3; :11–50,84,94 |
| `error-logs/ErrorLogsPage.tsx` | Same suffix :22; route id; memoized 90-day range; failed-events query limit 50; loading/error/empty/rows | Owner-selected clean component may be copied mechanically with provenance warning | Session IDs→Linear; original-layout acceptance blocked pending missing org-scoped module | Source :10–17 says RECONSTRUCTED; only route redirect, three catalog keys and shared events shape were captured |

### Editor component contracts to retain while chiseling

`TriggerEditor.tsx`:

- AddTriggerMenu props: triggers/onAdd, label/chipClass, currentEventType, disabledEventTypes, showMonitor/onSelectMonitor, disabled. Singleton/current-row exemption remains for retained types.
- TriggerCard: trigger/onChange/onRemove, readonly/showError/canRemove, credentials/URL/regeneration, connection map, disabled types/locked type, start-session/reply flags, monitor/triage flags, disabled channel IDs. Delete removed-feature props and handlers together, not merely their visible controls.
- TimeSelect(hour,minute,onChange,showHour,disabled) :275 uses 24 hours and five-minute choices. TimezoneSelect(value,onChange,disabled) :292 has open/query state. RRuleEditor(value,onApply,children) :330 has open, visual/RRULE mode, frequency, interval, weekdays, month day, hour/minute, raw text and error; apply is distinct from dismissal. SchedulePhrase(trigger,onChange,readonly,frequencyControl) :410 composes the original inline controls.
- ConditionEditor :632 takes trigger/change/readOnly, prefix/suffix, hidden fields, extra menu/pick handler/trailing node. Preserve OR-of-AND grouping and source schemas; ValueEditor :595 takes field/condition/value callback. ReplyRow :857 derives availability from action/trigger compatibility.
- WebhookBody :761, secret visibility/confirm-regenerate, Slack monitor/channel selectors :456/509, CodeScanLimit :795 and Pylon banners :1064/1086 are explicitly mapped deletions when not backed by v1.

`AgentCard.tsx`:

- AgentTypeSelect(value/options/onValueChange, Slack/code-scan flags, disabled/lockedTooltip) and buildAgentTypeOptions :47 preserve draft restoration and one-new-session restriction where retained. SessionSelect :618 takes value/change, placeholder/className/disabled, pinnedOption/sessions; input/open state; DestinationSessionSelect :679 takes action/change/readonly/variant/sessions. Replace parser/Devin ID handling, not the picker layout.
- McpSelector :366 takes selected/recommended Sets, change callback, runAsUser, linearEnabled/change, readOnly, auto-unselect callback, Slack controls, profile/automation/governing IDs/name and host/blocked callbacks. State: query; catalog loading/error; visibilitychange refresh. Keep generic connector availability and selection; remove unsupported governing-profile/Slack branches. Empty/disconnected/error are distinct.
- useRunAsIdentityChange :204 tracks removed names; McpAutoUnselectedNotice :137 renders them. Do not leave identity/security notices after deleting their capability. SessionSummary/default sample sessions must become actual Linear sessions.
- Instructions retain minHeight 120, maxHeight max(250px,30vh), textarea autosizing to at least 118px. Keep card radius 10px/p-3.5, rather than importing Cursor's editor layout.

`AdvancedSection.tsx`:

- MetadataRows :511: rows/change, readOnly/showErrors, suggestions/tagItems/error/label/description. SuggestInput :471 owns open state. Preserve duplicate/blank validation and reserved-tag handling.
- LimitsRow :626: form/patch/readOnly/showAcu/enabled/change/defaultInvocationLimit; localOn. QueueingRow :697: form/patch/readOnly; on state. Keep switch-off null serialization only for supported runtime settings.
- SecurityProfileSelect/Row :89/149 receive selection/form/patch, readonly/automation/saving/load-failure context; async profiles/resolved-security state. NetworkPolicyEditor :249 has entries/change/default/extra/readOnly/blocked, focusNewest/copy state; NetworkPolicyRow :379 has confirmOff. Delete these with `git-manager.devin.ai` default hosts if unsupported.
- ChildSessionsRow :732 and ScratchpadRow :743 use form/patch/readOnly; scratchpad also forceEnabled/onBrowse. Their tooltips are execution claims and cannot be carried over to Linear without runtime evidence.

Detail contracts (`AutomationDetailPage.tsx`):

- EventsSection :92 props automationId/automationEnabled/since/until/triggers; page/statuses/search state; page query plus lifetime-events probe. Preserve never-run/no-match/loading/stale-error/disabled distinctions, filters and message highlighting. displayMessage/partsFor preserve resource links.
- MetadataChips :212: tags, expanded/limit. RunDialog :248: open/change/onTrigger/showPrompt/description; prompt and idle→triggering→success. RunNowButton :279: automation/canRun/spendingFrozen/pylonOff/label/description/onError; open state. Replace vendor gates with real runtime eligibility; success requires accepted run response.
- ReadOnlyCondition :317: condition/eventType/channelLabel. ReadOnlyTriggerCard :330: trigger/webhookUrl/channelLabel/onCopied. CopyValueButton :385: value/label/onCopied. LocalToast :394: message/onDone. InstructionPanel :442: action. OriginLine :454: automation/divider flags. Remove unsupported branches, preserve remaining typography.
- LegacyMonitorBanner :413 owns busy/migration state: delete with Slack legacy support; do not repurpose it.
- IssuesSection's IssueSheet :173 has starting/open/closing/closed phase. LinkedInvocations :148 queries automation/issue. Do not turn its sheet into an invented issue editor.
- analytics DateRangeControl :373 has menuOpen/pickerOpen; RangeCalendar :346 has month state; activity derives buckets from events. Retain date boundary/incomplete range behavior.

## 5. Shared dependency closure and adapters

| Our target (`app/src/`) | Source file(s) | Copy verbatim | Chisel and why | Acceptance evidence |
|---|---|---|---|---|
| `ui/devin/*` | D/ui/{button,icon-button,input,input-group,select,checkbox,switch,menu,dialog,tooltip,popover,badge,segmented,skeleton,alert,card,settings}.tsx | Imported variants, portals, keyboard/focus, LabeledControlRow/SettingsCard/SectionHeader | Unused variants only; no global restyling | SPEC §19; source imports |
| `styles/devin.css`, `assets/devin/*` | D/index.css and referenced assets | Tokens/fonts/utilities/keyframes/scrollbars | Scope against Cursor reset/token collisions; preserve computed result | SPEC §19; same-viewport comparison |
| `features/automations/model/*` | D/model/types.ts, sources.tsx, tags.ts, rrule.ts | Retained schemas/operators, recurrence parsing/summary, metadata/source icons | Linear schema adapter; prune unsupported kinds after callers; no blind casts | SPEC §4,9,14,15 |
| `features/automations/lib/*`, `data/timezones.ts` | D/lib/time.ts, cn.ts; data/timezones.ts | Dates, timezone ordering, class merge | Import paths only | SPEC §9.4,18 |
| `features/automations/i18n/*`, `icons/*` | D/i18n/en.automations.json, t.ts; icons/brand.tsx, devin.tsx | Retained copy and glyph paths | Remove Devin/unsupported promises; approved naming only | COPY_CATALOG and SPEC |
| `features/automations/api.ts`, `capabilities.ts` | D/data/store.ts, capabilities.ts interfaces | Query/error/retry/stale/optimistic rollback contract | Real slice API/Linear account/session/events; delete seeded success | MASTER-PLAN V1–V10; SPEC §5 |
| `shell/AutomationHeaderOutlet.tsx` | D/shell/header-portals.tsx, PageHeaderBar.tsx, breadcrumb.tsx, crumbs.tsx | HeaderActions outlet and required page breadcrumb composition | Mount in Cursor shell; do not copy Devin sidebar/whole AppShell; bridge useTheme | SPEC §17.2; no second app shell |
| `router.tsx` | D/router.tsx automations routes | List/create/templates/:id/edit/:id/error-logs params/search | Supported routes only; real Linear session destinations | SPEC §2; critical journeys |

Trace transitive imports/CSS asset URLs before extracting. `data/seed.ts`, fake postSession, sample session arrays, spending-frozen UI and placeholder routes are not runtime foundations. Dependency closure must include actual glyph fonts, not just icon component names.

## 6. Cursor-only feature deltas inside Devin layout

| Our target | Exact source | Copy | Chisel | Acceptance evidence |
|---|---|---|---|---|
| `features/automations/model/linear-events.ts` | C-LINEAR; `reference/automations/linear-2026-10-12/{linear-menu,linear-issue-menu,linear-created,linear-status,linear-cycle}.json` | Linear→Issue→Created/Status changed and Cycle source choices, disabled connection treatment, captured field semantics | Project into Devin AddTriggerMenu/ConditionEditor; no Cursor editor frame transplant | Linear capture fact hashes and AX; note linear-issue.json is an intermediate menu, not configuration |
| `features/automations/editor/TriggerEditor.tsx` | D schedule controls plus Cursor triggers/preset original captures | Devin inline schedule/timezone/recurrence layout; any retained Cursor-only schedule capability from source | RRULE is not cron. Add explicit runtime conversion only for proven equivalent subset; do not replace Devin layout with Cursor popup | `facts/automations-trigger-capture.md`, `automations-preset-capture.md`; SPEC §9.4 |
| `features/settings/McpConnectionDialog.tsx` | C-MCP; original editor mcp-url/command/json | Cursor custom MCP add/edit forms absent from Devin automation selector | Keep Devin selector in editor; manage connections in Cursor settings | `facts/automations-saved-editor.md` |

**Actual gap in clean Devin source:** D/model/sources.tsx declares Linear label/icon, but
EVENT_SCHEMAS and SCHEMA_SOURCE_ORDER contain no Linear event group. Merely keeping the
Linear icon does not implement a Linear trigger. Extract source event IDs/payloads from
C-LINEAR and validate against the approved Loop adapter; observed labels alone do not
establish webhook delivery or authenticated field options. Unconnected captures do not
prove authorized forms. Cursor's model picker is deleted: it is not an inference catalog
for our Linear-only product.

## 7. Acceptance handoff (future implementation)

Each implementation PR is one feature, branches from then-latest main, and includes green
checks plus **Computer-Use screenshots and interaction log against the served change**,
compared with original at matching viewport/theme/DPR. Link source hash, before/after,
retained/deleted regions and gaps. CodeRabbit first; address/rebut all threads; orchestrator
alone marks ready. No PR is opened for this planning document.

Sidebar matrix:

1. Cold expanded/persisted compact reload, storage failure fallback, routes without sidebar teardown.
2. Button/Mod+Alt+B both ways including focused input; 0ms pin transition; 280/44 reserved width; fixed panel/border/clip; no label reflow.
3. Header/nav hover <100ms then leave (no peek), ≥100ms (peek); blank rail does not initiate; move within panel; leave/re-enter before deadline cancels close.
4. Visible menu/dialog holds peek through 180ms rechecks; dismissal permits closure; 150ms close then Activity disarm; 200ms open with exact easing.
5. Keep sidebar open persists expanded; collapse while hovered clears peek/timers; unmount with pending timer cannot leak delayed updates.
6. Compact glyph/order/hit targets, focus-visible swap, tooltips, no replacement Search/Profile/settings icons; inert list/footer not tabbable; no invented focus/drag reveal.
7. Active/hover/focus retained links; search click/Mod+K/Escape/focus return; account menu dismissal; no new search route.
8. Reduced-motion; 767/768 and 1511/1512 boundaries; conversation-only temporary collapse/restoration; mobile route-close/focus/inert behavior.

Raw shell timing/styles also live at `/Users/irene/cursor-product-shell/corpus/shell-2026-10-12/{measurements,styles,motion,timing-result,toggle-timing}.txt`. Some console strings truncate. Recovered code resolves hover logic; live hover/mobile/search validation remains required.

Other critical journeys: connect Linear with actual connection state; create from blank/template;
edit with dirty navigation/discard/save-error/reload; list search/tags/sort/page and stale-error;
view run/filter/date/manual-run pending/failure; disconnected chat gate; MCP tabs/keyboard/
validation/create/reload; settings route/menu/focus. Test source state transitions, not markup
snapshots alone. No retry-into-green. Runtime tests and CU are implementation gates, not
claims made by this documentation change.

## 8. Explicit blockers and extraction order

1. Restore missing captured desktop corpus with version/hash manifest before mapping its
   `automations.split.js`/`app/` sections. Web source mappings above are usable independently.
2. Close Cursor asset dependency graph (fonts, icon font, overlays, CSS variables) using
   captured inventories. Copy baseline shell intact and prove contract before deleting nav.
3. Recover dashboard account behavior/Integrations page module and connected Linear forms.
   Current nav/DOM/unconnected evidence cannot certify these mutations or layouts.
4. Resolve error-logs provenance: the owner selected the clean Devin tree, but its error page
   admits reconstruction. Capture original org-scoped page before claiming pixel parity;
   do not conceal this by relabeling it EXTRACTED.
5. Approve remaining product projections: General field inventory, runtime-supported
   schedule/action/limit/notification types, Linear generation and triage issue semantics.
   Unsupported controls are deleted, not filled with simulation.
6. After plan approval: shell contract slice; settings primitives/each retained surface;
   automation shared primitives/list; editor; detail; templates; error-logs once evidenced.
   These are separate implementation reviews. Port missing Cursor features into Devin
   controls, never replace Devin's editor with Cursor's layout.

No invented pixel or interaction is authorized by a GAP. The complete desktop/mobile
raster acceptance claim remains pending original asset closure and live comparison even
where the controller contract is fully extracted.
