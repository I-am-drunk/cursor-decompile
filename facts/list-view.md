# Automations list view

Artifact: cursor 3.23.12 · `workbench.anysphere-ui-automations.js`
(readable copy `corpus/automations.split.js`, 101,250 lines)
Rows extracted 2026-10-04. Citations are `names.tsv` symbols plus split-file lines.

## Corrections to the row brief (read first)

| Fact | Value | Label | Citation |
|---|---|---|---|
| `AutomationsListHeader` renders **no** `All Automations` copy | its only literals are the four column labels | PROVEN | `AutomationsListHeader` L72856 (body L72811–72855) |
| `All Automations` is **not** a list-header string | it is one radio item in the *runs* filter dropdown, value `__all__` | PROVEN | L100004; sentinel `"__all__"` L99979 |
| `Add Automation` is **not** rendered anywhere | it exists only as a sentinel the create-button label resolver rewrites | PROVEN | `resolveAsyncAgentsListCreateButtonLabel` L72699 |
| `Automation filters` is the filter-tab list `aria-label`, not a header | hard-coded on `Tabs.List` inside the page shell | PROVEN | `AutomationsListPageShell` L73322 |
| no illustration component in any list empty state | empty state is title + description + outline button only | DERIVED | `AsyncAgentsList` empty branch L73028–73053 |
| no trigger-summary column, no last-run column | the five rendered cells are name / model / author / status / tools (+ actions) | PROVEN | `AutomationsListHeader` L72811–72855; row map L73065–73139 |

## Component graph

| Fact | Value | Label | Citation |
|---|---|---|---|
| page shell | `AutomationsListPageShell` | PROVEN | L73353 |
| list body | `AsyncAgentsList` | PROVEN | L73147 |
| header row | `AutomationsListHeader` | PROVEN | L72856 |
| generic cell wrapper | `AutomationsListCell` (props `children`, `cellClassName`, `cellStyle`, `title`) | PROVEN | L72864 |
| right-cell group wrapper | `AutomationsListRightCells` | PROVEN | L72810 |
| row click target | `AutomationsListRowLink` | PROVEN | L72880 |
| status cell | `AutomationsListStatus` (prop `enabled`) | PROVEN | L72802 |
| author cell | `AutomationAuthorMeta` (prop `agent`) | PROVEN | L72778 |
| model cell | `AutomationModelLabel` (props `agent`, `getModelDisplayName`) | PROVEN | L72787 |
| tools cell | `ActionIcons` (prop `agent`) + `IconForType` (prop `type`) | PROVEN | `ActionIcons` L72761, `IconForType` L72736 |
| row action menu | `AutomationRowActions` | PROVEN | L72283 |
| one menu row | `AutomationRowActionMenuItem` | PROVEN | L72263 |
| search box | `AutomationsCompactSearchInput` | PROVEN | L73258 |
| search box adapter in the shell | `AutomationsSearchControl` | PROVEN | L73359 |
| pagination | `PaginationFooter` | PROVEN | L68589 |

## Page shell: props and copy

| Fact | Value | Label | Citation |
|---|---|---|---|
| default page title | `Automations` (prop `title` default) | PROVEN | `AutomationsListPageShell` L73302 (signature L73302–73304) |
| title renderer | `PageHeader` (`title`, `description`), overridable whole-cloth by prop `header` | PROVEN | L73306–73307; `PageHeader` L67914 |
| shell prop list (destructured signature) | `header`, `title`, `description`, `overview`, `prompt`, `tabs`, `search`, `searchControl`, `searchLeading`, `toolbarActions`, `belowToolbar`, `templateGallery`, `agents`, `isLoading`, `isSearching`, `onSelectAgent`, `onDeleteAgent`, `getAgentHref`, `createAgentHref`, `onCreateAgent`, `onDuplicateAgent`, `defaultAutomationScope`, `getAgentWorkflowJson`, `getModelDisplayName`, `labels`, `pageSize`, `platform`, `renderRowActions`, `renderAfterOverview`, `topPadding` | PROVEN | L73302–73304 |
| `topPadding` values | `"default"` (default) / `"compact"`; `"compact"` adds the `compactTop` style on the content container | PROVEN | L73303, L73338 |
| `renderAfterOverview` default | identity | PROVEN | L73303 |
| DOM order inside the shell | content container → `__chunks` → `__chunk` → [ header, `__body` ] ; body = [ `overview`, renderAfterOverview( [ `prompt`, `__toolbar-section` ] ), `templateGallery` ] | PROVEN | L73306–73352 (`__body` children L73348) |
| toolbar order | `automations-filter-tabs` (left) then `__toolbar-actions` = [ `searchLeading`, search control, `toolbarActions` ] | PROVEN | L73314–73331 |
| toolbar-actions block is omitted entirely when all three are nullish | `(searchLeading != null \|\| control !== null \|\| toolbarActions != null)` guard | PROVEN | L73327 |
| `belowToolbar` slot position | between the toolbar and the list | PROVEN | L73332 |
| pagination reset key | `JSON.stringify([tabs.value, search?.value ?? null])` — changing the active filter tab or query resets to page 1 | PROVEN | L73310, passed L73333, applied L72885 |

## Filter vocabulary

| Fact | Value | Label | Citation |
|---|---|---|---|
| filter UI primitive | `Tabs` (`Tabs.Root` size `lg`, `Tabs.List` `wrap` true, `Tabs.Item`) | PROVEN | L73320–73325; `Tabs` registry L68422 |
| `Tabs.List` aria-label | `Automation filters` (hard-coded in the shell; no `ariaLabel` prop) | PROVEN | L73322 |
| tab option shape | `{ value, label, secondaryLabel? }`, keyed by `value` | PROVEN | L73322–73324 |
| `tabs` controlled contract | `{ value, onChange, options }` — required prop, no default | PROVEN | signature L73302, use L73321 |
| the filter *values and labels themselves* | not in this bundle; supplied by the embedding workbench page | REMOTE | exhaustive search of the bundle finds no option array; client requires only `{value,label,secondaryLabel?}` and that `value` be the controlled `tabs.value` |
| sibling surface confirming the same aria-label default | `CustomerEvalsTabbedList` defaults `tabs.ariaLabel` to `Automation filters` | PROVEN | L91444 |
| client-side filtering of `agents` | none — `AsyncAgentsList` renders `agents` as given; filtering is the caller's job | DERIVED | the only transform on `agents` is the enabled-first sort + page slice, L72885–72886 |

## Header row

Column set depends on two booleans: `showStatusColumn` = gate `green_dot_automation_status`;
`showModelColumn` = `getModelDisplayName !== undefined`.

| Order | Header copy | Cell class (in addition to `automations-list-table__header`) | Condition | Label | Citation |
|---|---|---|---|---|---|
| 1 | `nameColumnLabel` (default `Automations`) | `automations-list-table__cell--name-with-status` when status column on, else `automations-list-table__cell--name` | always | PROVEN | L72843–72847; default L72696 |
| 2 | `Model` | `automations-list-table__cell--model` | `showModelColumn` | PROVEN | L72816 |
| 3 | `Created By` | `automations-list-table__cell--author` | always | PROVEN | L72820, L72834 |
| 4 | `Status` | `automations-list-table__cell--status` | `showStatusColumn` only | PROVEN | L72824 |
| 5 | `Tools` | `automations-list-table__cell--tools` | always | PROVEN | L72828, L72838 |
| 6 | *(empty)* | `automations-list-table__cell--actions` | always | PROVEN | L72852 |

| Fact | Value | Label | Citation |
|---|---|---|---|
| wrapper | `div.automations-list-table__header-row` | PROVEN | L72842, L72853 |
| when `showStatusColumn` is true, cols 2–5 are wrapped in `AutomationsListRightCells` | yes; when false they are a bare fragment and the Status cell is dropped | PROVEN | L72847–72849 vs L72839–72841 |

## Row anatomy, left to right

| Order | Element | Class(es) | Content | Label | Citation |
|---|---|---|---|---|---|
| — | row container | `automations-list-table__row automations-list-table__row--linked` + `ui--default-marker`; attr `data-automations-list-row` | — | PROVEN | L73066–73069 |
| 0 | divider | `automations-list-table__row-divider`; attr `data-automations-list-row-divider` | — | PROVEN | L73069–73072 |
| — | link wrapper (wraps cells 1–5, not actions) | `automations-list-table__row-link`; attr `data-automations-list-row-link` | `<a href>` when `getAgentHref` returns a value, else `<button type="button">` | PROVEN | `AutomationsListRowLink` L72880, branches L72867–72879 |
| 1 | name cell | `automations-list-table__cell--{name\|name-with-status} automations-list-table__cell--primary` | `agent.name \|\| "Untitled"` | PROVEN | L73075; branches L73074–73091 |
| 1a | name text | `automations-list-table__name-text` (inside `automations-list-table__name` in the no-status layout) | the name | PROVEN | L73077, L73084 |
| 1b | inline inactive badge | `automations-list-table__badge`, copy `Inactive` | only when status column OFF and `!agent.enabled` | PROVEN | L73086–73089 |
| 2 | model cell | `automations-list-table__cell--model` | `AutomationModelLabel` | PROVEN | L73093–73095 (and L73111–73113) |
| 3 | author cell | `automations-list-table__cell--author`, `title={agent.ownerName}` | `AutomationAuthorMeta` | PROVEN | L73097–73099 (and L73115–73117) |
| 4 | status cell | `automations-list-table__cell--status` | `AutomationsListStatus` | PROVEN | L73101–73103 |
| 5 | tools cell | `automations-list-table__cell--tools` | `ActionIcons` | PROVEN | L73105–73107 (and L73119–73121) |
| 6 | actions cell (outside the link) | `automations-list-table__cell--actions automations-list-table__cell--right`, inner `span.automations-list-table__actions` | `renderRowActions({agent, items, separatorBeforeIndex})` if supplied, else `AutomationRowActions` | PROVEN | L73125–73136 |
| — | row key | — | `agent.automationId` | PROVEN | L73138 |

Cells 2–5 are the same two-branch shape as the header: under
`green_dot_automation_status` they are wrapped in `AutomationsListRightCells` and
include the status cell (L73092–73109); without the gate they are a bare fragment
of model/author/tools only (L73110–73123). The model cell in both branches is
conditional on `getModelDisplayName` being supplied.

### Row cell internals

| Fact | Value | Label | Citation |
|---|---|---|---|
| author cell layout | outer `span` attr `data-automations-list-author-meta` containing owner-name span then created-at span attr `data-automations-list-created` | PROVEN | `AutomationAuthorMeta` L72778 (body L72771–72776) |
| owner fallback | `agent.ownerName \|\| "-"` | PROVEN | L72771 |
| created-at value | `formatRelativeTime(agent.access === "full" ? agent.createdAtSeconds : 0)` | PROVEN | L72770, `formatRelativeTime` L72415 |
| model cell | `span.automations-list-table__truncate` with `title` = resolved name, text = resolved name or `-` | PROVEN | `AutomationModelLabel` L72787 (body L72783–72785) |
| model resolution | `getModelDisplayName(agent.workflow.model) ?? agent.workflow.model`, only when `agent.access === "full"` and the id is non-empty | PROVEN | L72781 |
| local-link click guard | plain left click only: not default-prevented, `button === 0`, no meta/alt/ctrl/shift, `target !== "_blank"` | PROVEN | `shouldHandleLocalLinkClick` L72767 (body L72766) |

## Status badge

There is exactly one status axis — the boolean `agent.enabled`. There is no
multi-valued status enum on the list row.

| `enabled` | Label copy | Icon name | Icon color | Label | Citation |
|---|---|---|---|---|---|
| `true` | `Active` | `check` | `green` | PROVEN | `AutomationsListStatus` L72790, L72792 |
| `false` | `Inactive` | `x` | `quaternary` | PROVEN | L72790, L72792 |

| Fact | Value | Label | Citation |
|---|---|---|---|
| badge container | `div.automations-list-table__status` | PROVEN | L72791, L72799 |
| label span | `span.automations-list-table__status-label` | PROVEN | L72796 |
| icon props | `Icon` `size="sm"`, `aria-hidden` true | PROVEN | L72794 |
| gate | whole cell appears only under `green_dot_automation_status`; with the gate off the state is shown as the inline `automations-list-table__badge` pill reading `Inactive` | PROVEN | gate read L72883; fallback badge L73086–73089 |
| `green_dot_automation_status` is **not** in `automations_*` flags | it is a separate gate name read through the same `useAutomationsGate` | PROVEN | absent from `corpus/index/flags.txt`; read at L72883 |

## Tools cell (`ActionIcons`)

| Fact | Value | Label | Citation |
|---|---|---|---|
| source | `agent.access === "full" ? agent.workflow.actions ?? [] : []` | PROVEN | L72739 |
| icon-type derivation | `getActionIcons` → `actionDraftToIconType` → `actionCaseNameToIconType` | PROVEN | L72710, L72706, L72704 |
| icon-type map | `gitPr`/`prComment`/`manageCheckRun`/`requestReviewers` → `github`; `slack`/`readSlack` → `slack`; `mcp` → `mcp`; everything else → `null` (no icon) | PROVEN | `actionCaseNameToIconType` L72704 (body L72700–72703) |
| icon glyphs | `github` → `Icon name="logo-github" size=14`; `slack` → `SlackIcon`; `mcp` → `Icon name="logo-mcp" size=14` | PROVEN | `IconForType` L72736 (L72718, L72724, L72730) |
| unknown icon type | throws `` `Unknown icon type: ${type}` `` | PROVEN | L72733 |
| dedupe | icon types are deduped, first-seen order preserved | PROVEN | `getActionIcons` L72710 (body L72707–72709) |
| max visible icons | 3 | PROVEN | constant `gLr=3` L72695, slice L72748 |
| overflow pill | `span.automations-action-icon-overflow`, text `+` then the remainder count | PROVEN | L72751–72754 |
| icon row wrapper | `span.automations-action-icon-row` | PROVEN | L72749 |
| per-icon class | `automations-action-icon` | PROVEN | L72713, L72717, L72723, L72729 |
| **empty state** | `span.automations-action-icon-empty` whose entire content is the literal `-` | PROVEN | L72743–72745 |
| tooltip | on the icon row: `Tooltip` `placement="top"` `openDelay=200`, content = action labels joined with `, ` | PROVEN | L72758–72759 |
| action-label map used in the tooltip | `gitPr`→`Pull Request`, `prComment`→`PR Comment`, `slack`→`Send Slack Message`, `microsoftTeams`→`Send Microsoft Teams Message`, `requestReviewers`→`Reviewers`, `readSlack`→`Read Slack`, `readMicrosoftTeams`→`Read Microsoft Teams`; `mcp`→ server name or `MCP`; unknown → its `wireCase` | PROVEN | `getWorkflowDraftActionLabels` L72411, map L72405 |

## Row action menu

| Order | Label copy | Icon | Destructive | Condition | Label | Citation |
|---|---|---|---|---|---|---|
| 1 | `Edit Details` | none | no | always | PROVEN | L72930 |
| 2 | `Duplicate` | none | no | always | PROVEN | L72932 |
| 3 | `Copy as JSON` | none | no | always | PROVEN | L72934 |
| 4 | `Delete` | none | **yes** (`destructive: true`) | only when `onDeleteAgent` is supplied | PROVEN | L72935–72938 |

No list row-action item sets an `icon`. `AutomationRowActionMenuItem` supports one
(`item.icon`), but every item the list builds omits it.

| Fact | Value | Label | Citation |
|---|---|---|---|
| separator position | `separatorBeforeIndex = onDeleteAgent !== undefined ? 3 : undefined` — i.e. a `Menu.Section` break immediately before `Delete` | PROVEN | L73130 |
| `AutomationRowActions` props | `items`, `separatorBeforeIndex`, `triggerSize` (default `"sm"`), `surfaceStyle`, `triggerClassName` | PROVEN | L72265–72266 |
| trigger | `IconButton` `icon="dots-3-horizontal"` `variant="ghost"`, aria-label `More actions` | PROVEN | L72269–72270 |
| menu content aria-label | `Row actions` | PROVEN | L72272, applied L72279 |
| trigger event isolation | `onClick`, `onMouseDown`, `onKeyDown` each `stopPropagation()` so the row link does not fire | PROVEN | L72270, helpers L72291–72296 |
| rendering split | items `[0, separatorBeforeIndex)` in one `Menu.Section`, the rest in a second section rendered only when non-empty | PROVEN | L72266, L72268, L72273–72276 |
| `AutomationRowActionMenuItem` item shape | `{ label, onSelect, icon?, disabled?, tooltip?, destructive? }`; React key is `item.label` | PROVEN | `AutomationRowActionMenuItem` L72263 (body L72250–72262); key L72262 |
| destructive styling | wraps both icon and label in a `span` with class `ui-1jh5svw` | PROVEN | L72252, L72254, L72259 |

### Destructive confirm and action copy

| Fact | Value | Label | Citation |
|---|---|---|---|
| delete confirm | `window.confirm` with `Are you sure you want to delete “<name>”? This cannot be undone.` (U+201C / U+201D curly quotes) | PROVEN | `confirmBrowserDeleteAutomation` L72299 (body L72298) |
| confirm name fallback | `agent.name \|\| "this automation"` | PROVEN | L72923 |
| delete failure toast | `Failed to delete agent` | PROVEN | L72926 |
| duplicate: blocked while scope loads | toast `Automation settings are still loading. Try again in a moment.` | PROVEN | L72897–72898 |
| duplicate: blocked while Slack conversations load | toast `Slack channels are still loading. Try again in a moment.` (only when a Slack action needs DM remapping) | PROVEN | L72910–72911 |
| duplicate failure toast | `Failed to duplicate automation`; console `Failed to prepare automation duplicate payload` | PROVEN | L72920 |
| duplicate name rule | `Copy of <name>`, left as-is if it already starts with `Copy of `; name source = workflow name, else agent name, else literal `Automation` | PROVEN | L72909 |
| duplicate navigation | `onDuplicateAgent(prefillKey)` if supplied, else navigate `{kind:"new", prefillKey}` | PROVEN | L72916–72917 |
| `Duplicate` is a no-op when `agent.access !== "full"` | returns early | PROVEN | L72897 |
| `Copy as JSON` payload | `JSON.stringify({name, description, ...workflowJson}, null, 2)` written to the clipboard; chain-prompt fields stripped unless `automations_chain_prompts` | PROVEN | L72890–72894; gate L72883; stripper `stripChainPromptFieldsFromWorkflowJson` L72344 |
| fields stripped from prompt entries when the chain gate is off | `model`, `isFilter`, `is_filter`, `runMode`, `run_mode` | PROVEN | L72339 |
| share-url helper available to the row platform | `new URL(<base>/<encodeURIComponent(id)>, window.location.origin)` | PROVEN | `getAutomationShareUrl` L72300 |

## Empty states

Two distinct empty branches, both inside `div.automations-list-table__empty`
(this branch replaces the whole table — no header row is rendered).

| Fact | Value | Label | Citation |
|---|---|---|---|
| branch condition | `agents.length === 0` and not loading | PROVEN | L73028 |
| title element | `div.automations-list-table__empty-title` | PROVEN | L73031–73033 |
| **searching** title | `No Results Found` | PROVEN | L73034 |
| **no-automations** title | `labels.emptyTitle`, default `No Automations Yet` | PROVEN | default L72696, use L73034 |
| description + create button suppressed while `isSearching` | yes — `!isSearching && <>…</>` | PROVEN | L73035 |
| description element | `div.automations-list-table__empty-description` | PROVEN | L73036–73038 |
| description copy | `labels.emptyDescription`, default `Run agents on a schedule or automatically in response to events. Billed at plan rates.` | PROVEN | default L72696, use L73039 |
| create button element | `automations-list-table__empty-button`, `Button` `variant="outline"` `size="md"` `rounded` | PROVEN | L73046–73047, L73050–73051 |
| create button render mode | an `<a href={createAgentHref}>` (nativeButton false) when `createAgentHref` is set, else a plain button calling `onCreateAgent`; `null` if neither | PROVEN | L73040–73052 |
| anchor click | intercepted with `shouldHandleLocalLinkClick` then `preventDefault()` + `onCreateAgent()` | PROVEN | L73041–73043 |
| create button label | `resolveAsyncAgentsListCreateButtonLabel(labels.createButton)` → `New Automation` when the label is `undefined` **or** exactly `Add Automation`; otherwise the given label verbatim | PROVEN | `resolveAsyncAgentsListCreateButtonLabel` L72699 (body L72698); use L73047, L73051 |
| create button can be hidden | `labels.showEmptyCreateButton === false` | PROVEN | L73040 |
| `automations-action-icon-empty` is **not** a list empty state | it is the per-row "no tools" dash inside the Tools cell | PROVEN | `ActionIcons` L72743–72745 |
| no illustration / graphic component | none in either branch | DERIVED | L73028–73053 contains only the title, description and button nodes |

## Search

| Fact | Value | Label | Citation |
|---|---|---|---|
| component | `AutomationsCompactSearchInput` | PROVEN | L73258 |
| props | `searchQuery`, `onSearchChange`, `onSearchSubmit`, `disabled`, `placeholder`, `expandable`, `style` | PROVEN | L73199–73200 |
| placeholder default | `Search...` (three ASCII periods, not U+2026) | PROVEN | L73201; same default in `AutomationsSearchControl` L73356 |
| placeholder is also the input `aria-label` | yes, in both the expandable and outlined branches | PROVEN | L73221, L73246 |
| `expandable` default | `true` | PROVEN | L73201 |
| **debounce** | none — `onChange` calls `onSearchChange(e.target.value)` on every keystroke | PROVEN | L73244 (expandable), L73219 (outlined); no `useDebounceValue` on this path |
| `Enter` | calls `onSearchSubmit?.()` then blurs the input | PROVEN | L73209–73210 |
| `Escape` | clears (`onSearchChange("")`) , collapses, then blurs | PROVEN | L73211; clear handler L73206–73207 |
| blur behaviour | collapses back to the icon only when `expandable` and the query is `""` | PROVEN | L73212–73213 |
| collapsed state | renders only `IconButton` `icon="search"` `size="md"` `iconSize="base"` aria-label `Search`; clicking expands and focuses | PROVEN | L73235–73236; focus effect L73202–73204; expand L73205 |
| expanded-state visibility rule | expanded when `!expandable \|\| isExpanded \|\| searchQuery !== ""` | PROVEN | L73201 (`A`), branch L73234 |
| clear button | `IconButton` `icon="x"` aria-label `Clear search`, `automations-compact-search__clear`; shown via style `visible`/`hidden` on `searchQuery.trim() !== ""` (kept mounted) | PROVEN | L73248–73254; style variants L73175–73178 |
| clear fires on `onMouseDown` with `preventDefault()` | yes (so focus is not lost first) | PROVEN | L73250–73251 (and L73223–73224 in the outlined branch) |
| leading icon | `Icon name="search" size=14 color="secondary"`, class `automations-compact-search__icon` | PROVEN | L73239–73241 |
| text input | native `<input type="text" autoComplete="off">`, class `automations-compact-search__input` | PROVEN | L73243, L73245–73246 |
| non-expandable branch | `InputGroup` (`size="lg"`) inside `div.automations-compact-search-outlined`, with `InputGroup.IconButton` clear (aria-label `Clear search`) rendered only when the query is non-empty | PROVEN | L73214–73230 |
| disabled class | `automations-compact-search--disabled`, appended to `automations-compact-search` | PROVEN | L73231–73233 |
| **what the query matches** | nothing in the client — the component is fully controlled and `AsyncAgentsList` never filters by text; it only takes the boolean `isSearching` to pick the empty-state title | REMOTE | controlled value L73200; list uses `isSearching` only at L73034. The client requires the caller to filter `agents` and set `isSearching`. |
| the one in-bundle text filter (for reference, runs not automations) | `filterRuns` matches trigger-metadata values, the run's title, and a side-map value, all lower-cased `includes` | PROVEN | `filterRuns` L99945 |

## Sort, pagination, virtualization

| Fact | Value | Label | Citation |
|---|---|---|---|
| sort order | enabled-first, otherwise original array order preserved (comparator returns 0 for equal `enabled`) — a stable partition, no name or date sort | PROVEN | L72885 |
| sort input is a copy | `[...agents].sort(...)` — the prop array is not mutated | PROVEN | L72885 |
| page size default | `25` | PROVEN | constant `o9i=25` L72695; prop default L72881 |
| page count | `max(1, ceil(total / pageSize))` | PROVEN | L72885 |
| current page clamp | `min(page, totalPages)` | PROVEN | L72885 |
| page slice | the `pageSize` items starting at `(page-1) * pageSize` | PROVEN | L72886 |
| pagination visibility | only when `total > pageSize` | PROVEN | L72887, render guard L73141 |
| pagination container class | `automations-list-pagination` | PROVEN | L73143 |
| reset to page 1 | whenever `paginationResetKey` changes (shell feeds it active tab + query) | PROVEN | L72885 |
| **virtualization** | none — the page slice is mapped directly to DOM rows | PROVEN | row map L73065–73139 |
| footer root class | `pagination-footer` with `pagination-footer__summary`, `pagination-footer__controls`, `pagination-footer__status` | PROVEN | `PaginationFooter` L68589; L68561, L68564, L68566, L68572 |
| footer range copy | `<from>–<to> of <total>`, each number `toLocaleString()`-formatted (en-dash separator) | PROVEN | L68570 |
| footer page copy | `<page> / <totalPages>`, both `toLocaleString()`-formatted | PROVEN | L68578–68581 |
| footer controls | `IconButton` `chevron-left` aria-label `Previous page`, `chevron-right` aria-label `Next page`, both `size="sm"` `variant="ghost"`, disabled at the ends or while loading | PROVEN | L68576, L68583; disabled computation L68573, L68582 |
| first-item index when total is 0 | `0` (so the range reads `0–0 of 0`) | PROVEN | L68556 |

## Loading / skeleton state

| Fact | Value | Label | Citation |
|---|---|---|---|
| branch | `isLoading` renders the header row plus skeleton rows and nothing else (no pagination, no empty state) | PROVEN | L72940–73027 (header at L72943–72944) |
| skeleton row count | 4 | PROVEN | key array `s9i` L72695; map L72948, key L73026 |
| skeleton row keys | the literal strings `first`, `second`, `third`, `fourth` | PROVEN | L72695 |
| skeleton rows reuse the real row classes | `automations-list-table__row` + `ui--default-marker` + `data-automations-list-row`, with `automations-list-table__row-divider` — but **not** `--linked` and not wrapped in a row link | PROVEN | L72949–72954 |
| base skeleton class | `automations-list-table__skeleton` | PROVEN | L72958 |
| skeleton width modifiers | `--wide` (name cell), `--medium` (model cell; author name), `--short` (author date; status; tools), `--action` (actions cell) | PROVEN | L72958 (`--wide`), L72965 + L72972 (`--medium`), L72976 + L72983 + L72989 (`--short`), L73022 (`--action`) |
| author skeleton is two bars | a `--medium` over a `--short` inside the same inline wrapper the real author cell uses | PROVEN | L72970–72978 |
| skeleton respects both column gates | model skeleton only when `getModelDisplayName` is set; status skeleton only under `green_dot_automation_status` | PROVEN | model cell behind `D` at L72962 / L72994; status cell only in the `P` branch L72961, L72980–72985 |

## Containers and attribute hooks

| Fact | Value | Label | Citation |
|---|---|---|---|
| outer list wrapper (populated branch only) | `div.automations-list` with `data-vr="automations-list"` | PROVEN | L73055–73057 |
| table wrapper | `div.automations-list-table` (also used in the loading and empty branches) | PROVEN | L73059, L72942, L73030 |
| rows wrapper | `div.automations-list-table__rows` | PROVEN | L73064 (and L72947 in the loading branch) |
| page content container | `div.automations-content-container automations-content-container--padded` | PROVEN | L73338 |
| shell internals | `automations-page-shell__chunks`, `__chunk`, `__body automations-page-shell__body--list`, `__toolbar-section`, `__toolbar`, `__toolbar-actions`; plus `automations-filter-tabs` | PROVEN | L73341, L73344, L73347, L73313, L73316, L73329, L73319 |
| data attributes on the list surface | `data-automations-list-row`, `data-automations-list-row-divider`, `data-automations-list-row-link`, `data-automations-list-author-meta`, `data-automations-list-created`, `data-vr="automations-list"` | PROVEN | L73069 / L72951, L73072 / L72954, L72873 + L72878, L72776, L72774, L73057 |
| class names present in source but **missing** from `corpus/index/classes.txt` | `automations-list-table__cell`, `…__cell--primary`, `…__cell--right`, `…__cell--actions`, `…__header`, `…__skeleton`, `…__skeleton--wide/--medium/--short/--action`, `…__row--linked`, `automations-content-container--padded`, `automations-page-shell__body--list`, `automations-compact-search-outlined` | PROVEN | each grepped directly in `automations.split.js`; the index is not exhaustive |
| every BEM class is paired with a `ui-`-prefixed root class | e.g. class `automations-list-table__row` ships alongside `rootClass: "ui-automations-list-table__row"` | PROVEN | `attach` (`i($e,"attach")`) call sites throughout L72940–73146 |

## Row view-model the server must satisfy

Every field below is forced by a read in the list code; nothing else is read.

| Field | Type / values | Forced by | Label | Citation |
|---|---|---|---|---|
| `automationId` | string | React key; `onDeleteAgent`, `getAgentWorkflowJson` arguments | PROJECTED | L73138, L72924, L72890 |
| `name` | string (may be empty → `Untitled`) | name cell, delete confirm, duplicate naming | PROJECTED | L73078 + L73085, L72923, L72909 |
| `enabled` | boolean | sort key, status badge, inactive pill | PROJECTED | L72885, L73103, L73086 |
| `access` | `"full"` \| something else | gates model, tools and created-at to `"full"` | PROJECTED | L72739, L72770, L72781, L72897 |
| `ownerName` | string (may be empty → `-`) | author cell text and cell `title` | PROJECTED | L72771, L73098 |
| `createdAtSeconds` | number, **seconds** since epoch; `<= 0` renders the em-dash `—` | created-at cell | PROJECTED | L72770, `formatRelativeTime` L72415 |
| `description` | string | included in the `Copy as JSON` payload and duplicate fallback workflow | PROJECTED | L72893, L72901 |
| `workflow.model` | string model id | model cell | PROJECTED | L72781 |
| `workflow.actions[]` | each `{ kind, wireCase?, server?: {name}, channels?, generalized? }` | tools icons + tooltip labels; Slack DM remap on duplicate | PROJECTED | L72739, L72405, `needsSlackConversationsForDuplicateRemap` L72349 |
| `workflow.triggers[]`, `workflow.prompts[]` | arrays | duplicate payload fallback shape | PROJECTED | L72901 |

### Relative-time formatting used by the created-at cell

| Fact | Value | Label | Citation |
|---|---|---|---|
| helper | `formatRelativeTime(seconds)` wrapping the generic `formatRelativeTime(date, opts)` | PROVEN | L72415 (seconds wrapper), L72381 (generic) |
| non-positive input | em-dash U+2014 | PROVEN | L72412 |
| thresholds | `<60s` → `now`; `<1h` → `Nm`; `<24h` → `Nh`; `>= longDateAfterDays` → `toLocaleDateString` `{month:"short", day:"numeric"}`; else `<30d` → `Nd`; `<365d` → `Nmo`; else `Ny` | PROVEN | L72375–72380; bucket constants L72368 |
| list passes `longDateAfterDays: 30` | so anything 30 days or older shows as e.g. `Mar 4` | PROVEN | L72412–72413 |
| default `nowLabel` | `now` | PROVEN | L72372 |
| `includeAgo` / `includeSeconds` | both default false; the list passes neither, so no ` ago` suffix in this cell | PROVEN | L72372, L72412; suffix helper `withAgo` L72371 |

## Runtime contract the list requires

| Fact | Value | Label | Citation |
|---|---|---|---|
| gate provider | `AutomationsGatesProvider` / `useAutomationsGate` — throws `useAutomationsGate must be used inside <AutomationsGatesProvider>` | PROVEN | L72317, L72319; message L72310 |
| nav provider | `AutomationsNavProvider` / `useAutomationsNavigate` — throws `useAutomationsNavigate must be used inside <AutomationsNavProvider>` | PROVEN | L72325, L72328 |
| runtime provider | `AutomationsRuntimeProvider` / `useAutomationsRuntime` — throws `useAutomationsRuntime must be used inside <AutomationsRuntimeProvider>` | PROVEN | L72334, L72337 |
| runtime surface the list uses | `runtime.toast.error`, `runtime.useSlackConversationOptions({includePrivate, enabled})`, `runtime.integrationAuth.hasSlackAuth` | PROVEN | L72883, L72887–72888 |
| `platform` prop defaults | merged over a two-method default of `writeClipboardText` + `confirmDeleteAutomation` | PROVEN | L72307–72308, merge L72883–72884 |
| full platform object available elsewhere in the bundle | `writeClipboardText`, `confirmDeleteAutomation`, `getAutomationShareUrl`, `createClientId`, `scrollToSection` | PROVEN | L72300–72306 |
| gates read by the list surface | `automations_chain_prompts`, `green_dot_automation_status` | PROVEN | L72883 |
