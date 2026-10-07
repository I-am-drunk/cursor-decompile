# Automations list — Cursor 3.23.12 desktop

`EXTRACTED_UI`, inspected 2026-10-07. These facts describe the shipped desktop
list with the page header, standard padding, and compiled gate defaults. They
do not certify an authenticated account, the current web app, or screenshot parity.
Raw byte offsets below are zero-based and end-exclusive; keep artifacts local.

## Pinned sources

| ID | Artifact | SHA-256 |
|---|---|---|
| A | `out/vs/workbench/workbench.anysphere-ui-automations.js` | `c9d093b36ee3d74603689aa90bb2f73fd2e4c0c3b3c45144a0bad4bbab2fcd3f` |
| G | `out/vs/workbench/workbench.glass.main.js` | `b00e55478f16df05e10c6c5f18ab96c6a6563a28a1c9fa871758b04b2e06a29a` |

The [official Linux archive](https://downloads.cursor.com/production/2d29876d567da1607532b23bbf2cd5ddbca496fe/linux/x64/deb/amd64/deb/cursor_3.23.12_amd64.deb)
has SHA-256 `4b38d23926c72f2080e2ba108593e38f3688312464d70adc9088db63a53c0346`.
Extract with `dpkg-deb -x`; artifact paths are relative to
`usr/share/cursor/resources/app/`. Its package version is `3.23.12`;
`product.json` records build `2d29876d567da1607532b23bbf2cd5ddbca496f0`,
2026-10-01T04:41:16.627Z. The download identifier ends in `6fe`; the internal
build identifier ends in `6f0`. Preserve that distinction.

Use `BUNDLE=<artifact> node pipeline/read.mjs slice <start> <end-start>` to
reproduce a citation. G contains the actual `.ui-*` stylesheet as a string;
matching `.glass-*` selectors in the separate CSS file are not needed as proxies.

## State and ownership

| ID | Fact | Source bytes |
|---|---|---|
| DL01 | Compiled defaults: `custom_agents_enabled=true`, `green_dot_automation_status=true`, `customer_evals_ui=false`. Account overrides are unobserved. | G[979900,985500) |
| DL02 | This slice selects the normal page header and standard top padding. Parent fallback selects `mine`; the cloud subpanel is a different variant. | G[42157757,42158760), G[42160595,42161598) |
| DL03 | Title: `Automations`. Rollout-on description: `Automate repetitive tasks with always-on agents and configure Cursor's built-in agents for your team.` | G[24107818,24108027), G[42101140,42101779) |
| DL04 | `New Automation` is the rounded large primary button in the **page header trailing slot**. Plus icon only with rollout off. `New Eval` precedes it only with Evals enabled and its creation callback supplied. | G[42128696,42134925)  G[24107818,24108027) |
| DL05 | Toolbar starts with `Mine`, `Team`, and gated `Evals` tabs. Tab-list accessible label: `Automation filters`. | G[42131353,42131467), A[7310427,7313130) |
| DL06 | `All Runs` precedes search in the toolbar actions when rollout is on. Desktop search is always expanded/outlined, placeholder `Search...`; the shared control's collapsible icon default is not used. | G[42128696,42134925), A[7304961,7307000) |
| DL07 | Caller omits hidden full-access automations. `Mine` keeps full-access rows owned by the current numeric user; without that ID it is empty. Search trims/lowercases and matches name **or owner name** by substring. | G[42129420,42130100) |
| DL08 | Enabled rows come first; equal enabled states retain incoming order. No alphabetical/date sort. Pagination defaults to 25; footer appears only above page size; tab/query changes reset page 1. | A[7281040,7281399), A[7291469,7292480), A[7310427,7313130) |
| DL09 | Default columns: `Name`, `Created By`, `Status`, `Tools`, unlabeled actions. Desktop caller supplies no model-display callback, so **no Model column**. No trigger-summary or last-run cell. | G[42131467,42131730), G[42134369,42134925), A[7287122,7290018)  G[24107818,24108027) |
| DL10 | Rollout-off name header is `Automations`. Status-gate-off removes Status and adds `Inactive` beside disabled names. The shared Model column exists only with the omitted callback. | G[42131467,42131730), A[7299719,7302525)  A[7291469,7291952) |
| DL11 | Name fallback: `Untitled`. Created By shows owner name (fallback `-`) then relative creation time **inline**, not a second column or subtitle. Date becomes an em dash without full access. | A[7284695,7285346), A[7299719,7302525), A[7270261,7270366) |
| DL12 | Status is `Active` with check icon or `Inactive` with x icon, derived from enabled. Tools displays distinct supported integration icons; when none, `-`. | A[7281750,7284495), A[7285911,7287122) |
| DL13 | Name/author/status/tools are wrapped in one row link with `display:contents`. Actions remain outside. Desktop omits href builder, so this link is a button calling edit navigation. | A[7290459,7291469), A[7299719,7302525), G[42128696,42134925) |
| DL14 | Row menu: `Edit Details`, `Duplicate`, `Copy as JSON`, then a separate Delete section when deletion callback exists (desktop supplies it). There is no Pause menu item here. Trigger label `More actions`; menu label `Row actions`. | A[7293637,7294150), A[7263085,7264334), G[42134369,42134925) |
| DL15 | Loaded-empty is a **standalone card without table header**, title then description then create button. Search-empty contains only `No Results Found`. | A[7297984,7299500) |
| DL16 | Non-search empty title: `No Automations Yet`. Rollout-on description equals DL03. `New Automation` is rounded, medium, outlined; only shown when creation is available and not explicitly hidden. | G[42131467,42131730), A[7281107,7281399), A[7297984,7299500) |

## Layout values

These are declared values, not browser measurements. Spacing/radius variables
resolve from pinned root defaults at G[15048500,15052500). Preserve `rem`:
the effective root font and inherited font family are unobserved.
CSS selectors below are exact locators in G. A ranges bind them to elements;
loaded-row ownership: A[7299719,7302525); shell: A[7310427,7313130);
empty card: A[7297984,7299500).

| ID | Element and declared default | Binding in A | CSS selectors in G |
|---|---|---|---|
| DL20 | Content: border-box; width 100%; max-width 60rem; horizontal margins auto; horizontal padding 3rem. | [7309121,7309443) | `.ui-9f619`, `.ui-h8yej3`, `.ui-14jpq49`, `.ui-8x9d4c`, `.ui-ack27t`, `.ui-1hi4g37`, `.ui-l8an7g` |
| DL21 | Standard content padding top/bottom 4rem. At viewport width ≤639px all four content paddings become 1.5rem. Compact variant changes top to 24px; excluded from this state. | [7309121,7309770) | `.ui-f6mfmo`, `.ui-1q8uoa4`, `.ui-1g325gp`, `.ui-1hr4iz1`, `.ui-1kyyjj0`, `.ui-98fzwu`, `.ui-1avjwpx` |
| DL22 | Page chunks are stretched column flex with 56px gap; each chunk has 24px gap. List body overrides base 24px gap with 56px. These are separate owners. | [7309771,7310128) | `.ui-78zum5`, `.ui-dt5ytf`, `.ui-1qjc9v5`, `.ui-kh2ocl`, `.ui-v9sppr`, `.ui-1m87ff3` |
| DL23 | Toolbar section: column flex, 12px gap. Toolbar: centered row, space-between, 12px gap, 8px horizontal padding. Toolbar actions: centered row, 8px gap. | [7310129,7310426) | `.ui-78zum5`, `.ui-dt5ytf`, `.ui-6s0dn4`, `.ui-1qughib`, `.ui-1oot3zn`, `.ui-yab65l`, `.ui-1yxiud8`, `.ui-ehausa` |
| DL24 | Filter wrapper: wrapping flex, center aligned, 1px gap. Outlined search wrapper: width/max-width 160px, min-width 120px. | [7309529,7309627), [7304880,7304960) | `.ui-78zum5`, `.ui-1a02dak`, `.ui-6s0dn4`, `.ui-5cdhqx`, `.ui-q1dxzn`, `.ui-1i9suas`, `.ui-18qnofl` |
| DL25 | Loaded table: width 100%; hidden overflow; padding top 4px, other sides 6px; 1px solid tertiary-stroke border; 12px radius; elevated background. | [7273386,7273818) | `.ui-h8yej3`, `.ui-6ikm8r`, `.ui-10wlt62`, `.ui-f6zju3`, `.ui-17v7654`, `.ui-1rgtt3y`, `.ui-1lfpczk`, `.ui-178xt8z`, `.ui-13fuv20`, `.ui-1aeic0j`, `.ui-s1s249`, `.ui-32b0ac`, `.ui-141kqco`, `.ui-so031l`, `.ui-1q0q8m5`, `.ui-17fyfba`, `.ui-e0pwq`, `.ui-19ypqd9`, `.ui-1arpupx`, `.ui-1pkpdue`, `.ui-f1vpex` |
| DL26 | Header row and loaded row: horizontal flex, stretched items, 12px gap; padding 0 vertically, 8px horizontally. Header adds a transparent 1px bottom border. | [7278037,7278274), [7278764,7279077) | `.ui-78zum5`, `.ui-1q0g3np`, `.ui-1qjc9v5`, `.ui-1oot3zn`, `.ui-exx8yu`, `.ui-18d9i69`, `.ui-yab65l`, `.ui-1yxiud8`, `.ui-so031l`, `.ui-1q0q8m5`, `.ui-16stqrj` |
| DL27 | Cells: center-aligned flex; padding 12px vertically and 2px horizontally; hidden overflow, single-line ellipsis. Header cells use 12px font /16px line-height, normal weight. Rows wrapper uses 13px /20px. | [7274341,7274632), [7277605,7277954), [7279799,7279897) | `.ui-1t8xvyj`, `.ui-usxwy5`, `.ui-14ndyrl`, `.ui-1e7ydrk`, `.ui-6s0dn4`, `.ui-78zum5`, `.ui-6ikm8r`, `.ui-10wlt62`, `.ui-lyipyv`, `.ui-jlip5`, `.ui-kyw5k8`, `.ui-fifm61`, `.ui-1d3mw78`, `.ui-20ajya`, `.ui-4z9k3i`, `.ui-1fc57z9` |
| DL28 | Name and author cells: flex 2 1 0, min-width 100px. Status/tools: flex 1 1 0, min-width 0. Actions: flex 0 0 40px and width 40px, right aligned. | [7274715,7274960), [7275350,7275411), [7275499,7275597), [7276011,7276109) | `.ui-gyuaek`, `.ui-s83m0k`, `.ui-1r8uery`, `.ui-ktpd3l`, `.ui-1iyjqo2`, `.ui-euugli`, `.ui-dq0rj2`, `.ui-100vrsf`, `.ui-13a6bvl`, `.ui-1hr2gdg` |
| DL29 | Row link and conditional right-cell wrapper use display:contents. Their children participate in the outer row's flex layout. | [7275882,7275922), [7279553,7279713) | `.ui-jp7ctv` |
| DL30 | Owner/date wrapper: flex row, width 100%, min-width 0, center aligned, 6px gap. Date does not shrink. Status icon/label: center-aligned flex, 6px gap; status label 13px /18px. | [7284695,7285346), [7275598,7275715), [7276276,7276449) | `.ui-78zum5`, `.ui-h8yej3`, `.ui-euugli`, `.ui-6s0dn4`, `.ui-pkkfsy`, `.ui-2lah0s`, `.ui-4z9k3i`, `.ui-d4r4e8` |
| DL31 | Row is position:relative. Divider is absolute at top 0, inset 8px each side, height 1px, quaternary-stroke color, no pointer events. Hover hides its divider and the following row's divider. | [7278764,7279077), [7279288,7279464) | `.ui-1n2onr6`, `.ui-10l6tqk`, `.ui-13vifvy`, `.ui-1qo02jc`, `.ui-134kyd4`, `.ui-jyxbwm`, `.ui-iw1gut`, `.ui-47corl`, `.ui-rkmga`, `.ui-137pwu2` |
| DL32 | Hovered row gets 6px radius and quaternary background. A focused row link gives its row a 6px radius, 2px solid primary-text outline, offset -2px. | [7278764,7279077) | `.ui-gfevyv`, `.ui-qjnua1`, `.ui-h9vb52`, `.ui-1sa73qq`, `.ui-51e1m` |
| DL33 | Empty card: same border/radius/background as DL25; 32px vertical and 16px horizontal padding; centered text. It is not nested inside the loaded table container. | [7276539,7276932) | `.ui-tgesqp`, `.ui-1dbk7ps`, `.ui-10cfkro`, `.ui-193t4r6`, `.ui-2b8uid`; border set as DL25 |
| DL34 | Empty title: 13px /18px, secondary text. Description: max-width 28rem, margin top 4px, bottom 0, horizontal auto; 13px /18px, tertiary text. Create-button margin top 16px. | [7277016,7277516) | `.ui-4z9k3i`, `.ui-d4r4e8`, `.ui-19aaqeu`, `.ui-1983rqf`, `.ui-1om1abp`, `.ui-at24cr`, `.ui-8x9d4c`, `.ui-ack27t`, `.ui-4b2ntj`, `.ui-1x419k1` |
| DL35 | Pagination wrapper: top margin 4px; padding 8px vertically and 10px horizontally; 13px /18px. It is a sibling after the loaded table, not a table row. | [7273144,7273302), [7302490,7302812) | `.ui-1om1abp`, `.ui-13ly8rp`, `.ui-1xlntvz`, `.ui-16b7oty`, `.ui-o7x2bt`, `.ui-4z9k3i`, `.ui-d4r4e8` |

## Remaining evidence

`UNVERIFIED`: authenticated state, account overrides, viewport/scale, effective
font family/root font, screenshots and interactive execution. This file does
not certify button/tab/menu primitive geometry, the managed-agent overview,
template gallery, or current web layout. Those need separate scoped evidence.
The parent supplies overview above this toolbar and templates after the list
(G[42128696,42134925), A[7310427,7313130)); omitting them is a recorded partial
implementation, not an exact reproduction of the full page.
