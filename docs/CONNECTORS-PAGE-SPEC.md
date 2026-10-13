# CONNECTORS PAGE SPEC — Devin's Connections + Customize, reimplemented exactly (2026-10-12)

> Branch `plan-devin-mashup`. Planning deliverable; no implementation. Companion to
> MASHUP-PLAN.md §3.7 and CONNECTOR-PACKAGES.md (owner's package vision). Styling is Cursor's
> token values over Devin's markup (MASHUP-PLAN §0).
>
> Evidence: Devin 3.10.31 dossiers `decompile-3.10.31/{integrations/A–D, mcp/A}` (web bundle
> 2026-09-20, PROVEN/PROJECTED/DERIVED/REMOTE), **3.10.48 desktop excerpts**
> `docs/evidence/desktop-3.10.48/*` + `docs/DESKTOP-3.10.48-{CONNECTORS,CUSTOMIZATION-SIDEBAR}.md`
> (branch `re-desktop-3.10.48`, PROVEN by byte offset), `re-server-3.10.48`
> `docs/{CONNECTOR-BACKEND,MARKETPLACE}.md`, public docs `docs/PUBLIC-CONNECTORS-SPEC.md`
> (DOCUMENTED). Cursor captures: `facts/automations-saved-editor.md` (mcp-menu/browse/url/
> command/json), `facts/automations-linear-capture.md` (A17). Ours: DESIGN.
>
> Devin has **two** connector systems and we reimplement both: **Connections** (provider
> integrations: Linear, Slack, GitHub…; OAuth/app-install lifecycle, native tools) and
> **Customize** (plugins · MCPs · skills · rules · hooks · subagents; the 3.10.48 local
> implementation is the exact shape). Our connector packages (CONNECTOR-PACKAGES.md) map onto
> Customize **plugins** (§7) so we inherit Devin's UX without inventing any.

## 0. Decisions

| # | Decision | Basis |
|---|---|---|
| C1 | Settings nav = `Linear` · `Connections` · `Customize` (6 tabs) · `Accounts` · `General`. SETTINGS-CARVE's "MCP connectors" entry becomes Customize → MCPs. | Owner mash; 3.10.48 `customization-routes` |
| C2 | Customize sidebar is copied from the 3.10.48 shared sidebar (`iyo/oyo/NCs`): 200px aside overlay, 224px content inset, 26px rows, non-collapsible group headings, always-on search. It renders inside Cursor's settings frame as the secondary nav for the Customize destination. | PROVEN `DESKTOP-3.10.48-CUSTOMIZATION-SIDEBAR.md` |
| C3 | Tab order Plugins · MCPs · Skills · Rules · Hooks · Subagents; Plugins and MCPs each have Installed/Available children in one scroll pane. v1 ships Plugins, MCPs, Skills; Rules/Hooks/Subagents render their 3.10.48 empty states (`No rules.` …) and are feature-flagged off by default. | PROVEN `customization-routes.md`; scope |
| C4 | MCP marketplace = the standard MCP registry (`registry.modelcontextprotocol.io/v0.1`), proxied by our server, not Devin's catalog. Card/detail/status UI is Devin's 3.10.48 verbatim. | re-server `MARKETPLACE.md` recommendation |
| C5 | `Add custom MCP` = Cursor's captured New Connection dialog (URL · Command · JSON tabs), the one Cursor-only port on this page; Devin 3.10.48 opens a JSON file editor here, which we also keep as `Open MCP config file`. | A13 captures; `[3.10.48] FEs` |
| C6 | Connection status vocabulary is Devin's: cards `Connected / Not connected / Needs auth / Connecting / Error / Disabled / Disabled by admin`; integrations `connected / user-not-linked / missing-config / needs-reauth`. | PROVEN `swo` (3.10.48); `integrationCheck` (3.10.31) |
| C7 | Credentials never reach the browser; UI gets only booleans and key names (`credential_keys`). | PROVEN dossier B §4 |
| C8 | Package install = plugin install dialog (`Install NAME?` → `This install will add:` MCP servers · Skills · Rules · Hooks). Skills attached to a connector are shown exactly as Devin shows plugin skills. | PROVEN `plugin-components.md` |

## 1. Settings frame and navigation

Cursor's dashboard frame (S01: title 20px/28px, sections gap 30px, rows 12px 16px, 55px min
height) is the outer page. Inside the Customize destination, Devin's 3.10.48 shared sidebar
is the secondary nav. Nothing else about Cursor's settings shell changes.

| Element | Spec | Source |
|---|---|---|
| Primary settings nav | `Linear` · `Connections` · `Customize` · `Accounts` · `General` (row anatomy S-ACCOUNT) | C1 |
| Customize aside | `pointer-events-none flex w-[200px] shrink-0 flex-col pl-[8px] pt-[40px]`; overlay `absolute inset-0 z-10 mx-auto flex`; content `pb-20 pl-[224px] pr-6 pt-10` (aside overlays, does not push) | PROVEN `sidebar.md`, `customization-content.md` |
| Search | always present, no placeholder, aria `Search customizations`; `h-7`, 6px radius, secondary border, accent border on focus-visible; 300 ms debounce for registry search; counts shown only while query non-empty, registry count `N+` when more pages | PROVEN `sidebar-input.md`, `Kpu` |
| Group headings | non-clickable divs `py-[4px] pl-[10px] pr-[5px] text-12 font-medium text-text-tertiary`; `mt-[8px]` after the first | PROVEN `htc/NCs` |
| Rows | native buttons `rounded-[6px] py-[4px] pl-[10px] pr-[5px] text-13 leading-[18px]`; active `aria-current="true" bg-tint-primary`; hover/focus `bg-tint-secondary`; color transition 150 ms cubic-bezier(.4,0,.2,1) | PROVEN `sidebar.md`, `css-transitions.md` |
| Rows (v1) | **Plugins** → Installed, Available · **MCPs** → Installed, Available · Skills · Rules · Hooks · Subagents | PROVEN `customization-routes.md` order; C3 |
| Selection/scroll | child select scrolls `max(0, childTop − 16)` instantly, pins index; user scroll > 1 px clears pin; active child = last whose top ≤ scrollTop + 17 | PROVEN `customization-scroll.md` |
| Refresh buttons | spinner/disabled held ≥ 500 ms | PROVEN `S2u` |

Token binding: `bg-bg-page`, `bg-tint-primary/secondary`, `text-text-primary/secondary/tertiary`
resolve to Cursor values per MASHUP-PLAN §0. Devin light/dark values are the documented fallback.

## 2. Connections page `/settings/connections` (Devin 3.10.31 exact)

Devin copy (PROVEN `en-CsbykFSh.js`): title `Connections`; description `Tools Devin can
reach from this organization.` → ours drops the product name and scope: `Tools the agent can
reach from this workspace.` Group headings (mockup 05 / dossier A registry `E`): **Source
control** · **Issue tracking** · **Chat** · **Support & incidents** · **Connected accounts**
(`Connect your personal accounts to use integrations and MCPs established by your team
members.` — PROVEN, hidden in single-user v1).

| Element | Spec | Source |
|---|---|---|
| Row | `flex h-[34px] items-center gap-2 rounded-md px-2` (clickable variant adds `cursor-pointer`); icon slot `flex size-4 shrink-0`; name `min-w-0 flex-1 truncate text-13 font-medium text-text-primary`; trailing status `shrink-0 text-13 text-text-secondary` (warning states `text-text-orange`); value column `w-[300px] min-w-[300px]` | PROVEN `ConnectionsSection-nv--b3JI.js` classes |
| Row content | provider logo · label (`Linear`, `Slack`, …) · description (`integrationDescription*`, e.g. Linear `Turn Linear tickets into PRs`) · status · action | PROVEN registry `E` + i18n |
| Status vocabulary | `connected` · `user-not-linked` · `missing-config` · `needs-reauth` (sources `schedule|webhook` exempt) | PROVEN `integrationCheck` |
| Status → copy/action | connected → `Connected` + account subtitle; missing-config → `Missing configuration` + `Configure`; needs-reauth → `Needs re-authorization` + `Re-authorize`; not connected → `Not connected` + `Connect` | mockup 05 (PROVEN labels `Configure`, `Re-authorize`; others DERIVED from state enum) |
| Dependency warning | `Re-authorize {{source}} to use this trigger.` shown under a row when an automation depends on it | PROVEN i18n |
| Row click | → `/settings/connections/<slug>` detail page | PROVEN route registry `[3.10.48] cloud-settings-routes` |
| Empty section | `px-2 py-4 text-center text-13` | PROVEN |

v1 renders **Issue tracking → Linear** only (everything else exists in code behind
`capabilities.connections[]`, DELETED from the DOM when off, not hidden). The Linear row and
its detail page are specified in SETTINGS-SIMPLIFICATION.md. The connection lifecycle state
machine (dossier B §7: Disconnected → Starting → AtProvider → Returning → Connected; Failed via
`oauth_error=`; Disconnecting) is the template, with Linear's email-code flow substituted for
the OAuth leg (LINEAR-CONNECTION §2). Disconnect dialog copy is Devin's verbatim:
`Disconnect Linear` / `Are you sure you want to disconnect your Linear integration? This will
remove all Linear functionality from <product>.` / `Disconnect` · `Cancel`, destructive
(PROVEN `linear-SXExP7cj.js:1287-1290`).

## 3. Customize → Plugins tab (3.10.48 exact)

Plugins are Devin's unit of "connector + baked-in skills" (public plugins guide: most official
marketplace plugins are one MCP server plus skills). Our connector packages are plugins (§7).

| Element | Spec | Source |
|---|---|---|
| Children | **Installed** (state `installed`) above **Available** (order `available` › `blocked` › `unsupported`) in one scroll pane | PROVEN `Csi/Dpu` |
| Card | two-uppercase-initial tile `h-10 w-10 rounded-lg bg-bg-elevated-secondary text-12 font-medium text-text-secondary`; title `text-13 font-medium text-text-primary`; subtitle = source · version joined by ` · ` (`text-12 text-text-secondary`); description; card body `flex items-center gap-3 py-4`; hover `bg-tint-secondary` | PROVEN `plugin-components.md`, `customization-content.md` |
| Search | matches name, description, source label, version | PROVEN `Lpu` |
| Card states | pending metadata → skeletons (`h-4 w-32`, `h-3 w-48`); unreadable → `Couldn't load details` + error tooltip; blocked/unsupported → `opacity-60`, `aria-disabled`, no detail, no install; inactive installed → `Inactive` badge | PROVEN |
| Availability copy | `Still checking for available plugins…` · `Couldn't refresh available plugins — showing the last known list` · `Couldn't check for available plugins` · `Available plugins haven't been checked yet` | PROVEN `Ppu` |
| Install dialog | `Install NAME?`, max-w 520px, source subtitle, asset preview headed `This install will add:` with groups **MCP servers · Skills · Rules · Hooks**; `This plugin adds no skills, rules, hooks or MCP servers.`; `This plugin's contents are unknown until it is installed.`; `Also installs NAME, NAME.`; always-on warning `Adds N always-on rule(s) that applies to every prompt in scope`; footer `Cancel` · `Install`; card shows `Installing…` | PROVEN `L2u/M2u` |
| Remove dialog | `Remove NAME?`, max-w 440px; `Cancel` · destructive `Remove`; required plugins show a lock labelled `Required in this org` (v1 label for the pre-installed Linear package) | PROVEN `T2u/P2u` |
| Details sheet | asset groups in order **MCP servers → Skills → Rules → Hooks**; each group shows count and `N more not shown`; skills list `name` + `description` keyed by `namespacedName`, click opens the skill file; MCP rows open §4.3; empty `No MCP servers` / `No skills` / `No rules` / `No hooks`; `Contents unavailable until installed`; `Couldn't load the full contents` | PROVEN `dwo/F2u/W2u/H2u` |
| Rules sort | Always on (warning badge) › Glob › Agent decided › Manual › unknown | PROVEN `H2u` |

Deleted for v1: `Install locally` / `Remove locally` split (no cloud-vs-device distinction),
`Devin Desktop only`, enterprise/org scope tabs. The plugin list contract (`list/refresh/
install/remove/assets`, availability `{complete, originsPending, originsWalked, originsFailed}`)
is reproduced by our server in §8.

## 4. Customize → MCPs tab (3.10.48 exact)

### 4.1 Available (marketplace)

| Element | Spec | Source |
|---|---|---|
| Title / search | `Devin MCP Marketplace` → ours drops the product name: `MCP Marketplace`; search `Search MCPs...`, 300 ms debounce | PROVEN `Kmu` |
| Header action | `Add custom MCP` (opens Cursor's New Connection dialog, §4.4) | PROVEN `NEs`; C5 |
| Grid | `grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-3` | PROVEN `DEs/REs` |
| Card | icon `h-10 w-10 rounded-lg bg-bg-elevated-secondary` (image `object-cover`, fallback two uppercase initials `text-12 font-medium text-text-secondary`); title `text-13 font-medium`; description `text-12 text-text-secondary`; body `flex items-center gap-2 py-3`; row click → detail, action buttons stop propagation | PROVEN |
| Paging | registry pages of 50, cursor-driven IntersectionObserver sentinel; 12 skeleton cards initial, 4 per next page | PROVEN `NEs` |
| States | error `Failed to load MCP servers from the registry.` + `Retry`; empty `No MCP servers available.` / `No results found for "QUERY".` | PROVEN |
| Installed excluded from Available; installed IDs missing from registry get name-only fallback cards | | PROVEN |

Card action by condition (PROVEN `REs`): not installed → `Install`/`Installing...`; policy
blocked → none; disabled → `Enable`/`Enabling...`; error → `Reconnect`/`Reconnecting...`;
auth required → `Authenticate`/`Authenticating...`; not started → `Connect`/`Connecting...`;
otherwise none. Install goes to detail when the server declares configurable inputs; else
installs the cached config and refreshes.

Status pill precedence (PROVEN `swo`): `Error` (destructive) › `Disabled by admin`
(destructive) › `Disabled` › `Needs auth` (warning) › `Connecting` › `Not connected` ›
`Connected` (success). A busy action overrides the pill with blue `Loading...`.

Data source (C4): our server proxies `GET https://registry.modelcontextprotocol.io/v0.1/servers`
and returns the registry schema unchanged: `{metadata:{count,next_cursor}, servers:[{_meta,
server:{name,title,description,version,websiteUrl,repository,packages[],remotes[],icons[]}}]}`
(PROVEN schema offsets in re-server `MARKETPLACE.md`). Package runtime defaults npm→`npx`,
pypi→`uvx`, docker/oci→`docker`, nuget→`dnx` (PROVEN `X3t/T1e`). Because Linear cannot dial
stdio (CONNECTOR-PACKAGES §4), **package (stdio) entries render with the `Install` action
disabled and tooltip `Remote servers only`** (DESIGN, the only deviation; remotes install normally).

### 4.2 Installed

Same card grid; installed query `[installedServers]`, invalidated on any connector change
(PROVEN `NEs`). Each card carries the §4.1 pill. Customize's Installed child sits above
Available in the one scroll pane; the sidebar highlights whichever is under the scroll
position (§1 selection rule). Empty: `No MCP servers installed.` (PROVEN
`customization-content.md`). Rows from a plugin/package are read-only (`Managed by a session
plugin`; 3.10.31 `plugin_managed` prefix rule) and link to the plugin instead of the MCP form.

### 4.3 MCP detail `/settings/customize/mcp/:id`

| Element | Spec | Source |
|---|---|---|
| Frame | `px-6 pb-6 pt-10`; title `text-17 font-medium tracking-tight` = `NAME MCP`; description `text-13` | PROVEN `r2u` |
| Header | status pill + actions by state: blocked → `Uninstall`; auth required → `Uninstall` · `Authenticate`; error → `Disconnect`; not started → `Uninstall` · `Connect`; installed+enabled → enable/disable switch · `Uninstall` | PROVEN `e2u` |
| Body by state | connected+enabled → **Tools**; other installed → **Configuration**; uninstalled → input form | PROVEN |
| Configuration form | remote title `Configuration`, subtitle `Headers and variables`; descriptor keys read-only; secret values password inputs, placeholder `Required`/`Value`; blank required → `"KEY" is required.`; free rows `Add variable`/`Remove variable` (local/stdio only, so **hidden** for us) | PROVEN `Xmu` |
| Installed credentials | disabled, masked; eye `Show value`/`Hide value`; UI never receives values, only key names (C7) | PROVEN; dossier B §4 |
| Tools | split `Read-only` vs `Write` by `annotations.readOnlyHint === true`; each group has count, per-tool switch, description tooltip (0 ms); empty `No tools found.`; toggle payload `{serverId, toolName, sourcePath}` | PROVEN `Zmu/UEs` |
| Metadata | `Status` · `Transport` (`Streamable HTTP`/`HTTP`) · `Repository` · `Website`; links HTTP(S) only, display host | PROVEN `i2u/n2u` |
| Error alert | title `Disabled by admin` or `Connection failed`; non-policy errors add `View logs` | PROVEN |
| `Open config file` | icon when `sourcePath` exists → opens the JSON (§6) | PROVEN |

Per-tool switches are our **tool allowlist** (CONNECTOR-PACKAGES §5.2) made visible with
Devin's exact control; defaults come from the package's `defaultDisabled`.

### 4.4 `Add custom MCP` — Cursor's captured New Connection dialog (the one Cursor-only port)

Devin 3.10.48 answers `Add custom MCP` by opening a JSON config file (§6). Cursor's captured
flow is richer and is what the owner wants: `New Connection` → `Browse MCPs` catalog →
`Custom MCP` form with **URL · Command · JSON** tabs (OBSERVED A13: `mcp-menu`, `mcp-browse`,
`mcp-url`, `mcp-command`, `mcp-json`; C-MCP `McpServerModal`, `FORM_INPUT_CLASS`,
`resolveMcpServerDraft`). Copy the dialog frame, tab strip, field anatomy, Back/Close, error
and submitting states verbatim (UI-EXTRACTION-MAP §3 `McpConnectionDialog`).

| Tab | Fields (captured) | What we do with them |
|---|---|---|
| URL | name, URL, headers rows (label/value) | → `POST /mcp/installations` `{name, slug, transport:'HTTP', url, headers, auth_method:'none'|'auth_header', auth_header_key}` (Devin 3.10.31 create body, PROVEN) |
| Command | command, arguments, environment | **disabled with inline note `Remote servers only`** — Linear cannot dial stdio (CONNECTOR-PACKAGES §4). Tab stays so the captured dialog is intact |
| JSON | one pasted server config | normalised with Devin's rule `stdio→STDIO`, `http|http-stream|streamable-http|shttp→HTTP`, `sse→SSE` (PROVEN 3.10.31 mcp dossier); STDIO results hit the same `Remote servers only` error |

The `Browse MCPs` step is replaced by §4.1's Available grid (same registry). After create, the
dialog navigates to §4.3 detail where the five-state probe (`connected / disconnected / needs
auth / missing / error`, `facts/mcp-verification.md`) is shown with Devin's pills.

## 5. Customize → Skills tab

Devin's Skills tab lists the skills the agent loads on demand, from installed plugins and
repositories (DOCUMENTED plugins guide; 3.10.48 copy `Skills extend Devin Local's
capabilities with instructions, resources and tools.` → ours: `Skills extend the agent's
capabilities with instructions, resources and tools.`). Row anatomy is the plugin-details
skill row (§3): `name` `text-13 font-medium text-text-primary`, `description` `text-12
text-text-secondary`, grouped under the owning plugin's name; empty `No skills.` (PROVEN
`customization-content.md`).

Our additions, all inside the captured row: a **mode badge** (`Always on` / `Manual` — the
3.10.48 rules-badge vocabulary reused, PROVEN strings) for CONNECTOR-PACKAGES `always` /
`mention`; a trailing `N tools` count; and a mirrored-to-Linear check (`✓ in Linear` /
`Not mirrored`) using the plugin pill style. Clicking a skill opens the markdown file
(3.10.48 behaviour) in a read-only sheet; editing is on disk (CONNECTOR-PACKAGES §9.3).
Skill file format is Devin's `SKILL.md` frontmatter (`name`, `description`, `allowed-tools`,
`triggers`) — see §7 for the mapping onto our `tools:`/`mode:` keys.

## 6. JSON visible in the UI

Devin shows JSON in three places; we reproduce all three with the same containers.

| Surface | Devin behaviour | Ours | Source |
|---|---|---|---|
| `Add custom MCP` / `Open MCP config file` (3.10.48 local) | opens a JSON file editor on `mcp_config.json`; file created if absent with `{"mcpServers": {}}`; failure `Failed to open Devin config file: MESSAGE` | Cursor dialog's **JSON tab** (§4.4) is the paste surface; `Open MCP config file` on the MCPs tab opens a read-only code view of the server's stored config (secrets shown as `${NAME}`) | PROVEN `FEs/jpu/fLo` |
| MCP detail `Open config file` | opens the installed server's `sourcePath` | same read-only view, header `Configuration` | PROVEN `e2u` |
| Plugin manifest editor (cloud) | `Plugin settings (gear) → Edit manifest`: JSON with `requiredPlugins / optionalPlugins / forbiddenPlugins` | **Package card → `View connector.json`** read-only code view; the folder on disk is the editor (CONNECTOR-PACKAGES §9.3) | DOCUMENTED plugins guide; 3.10.48 `[CLOUD-CONNECTORS]` manifest-editor trace |
| MCP declared configuration (read-only) | `MCPDeclaredConfiguration` renders the normalised `{transport,url|command,args,env,headers}` block for plugin-managed servers | identical block on the detail page for package-provided servers | PROVEN 3.10.31 mcp dossier |

Code view primitive: monospace `text-12`, elevated background, 10px radius card, copy button
copied from Devin's Preflight logs modal (`Copy`/download, byte+line counts — SPEC §18.4).
No JSON is ever editable in-browser in v1; the file is the truth.

## 7. Our connector packages = Devin plugins (mapping, no invention)

CONNECTOR-PACKAGES.md defines a folder with `connector.json`, `tools/`, `skills/*.md`.
Devin's plugin format (DOCUMENTED CLI plugins overview; compatible layouts Devin › Claude ›
Agent Plugins 1.0.0) is the same idea with different file names. **Decision: adopt Devin's
plugin layout as the on-disk package format**, so every Devin UI surface above renders our
packages without an adapter, and the owner's packages also load in Devin/Claude tooling.

| CONNECTOR-PACKAGES concept | Devin plugin file / field | Notes |
|---|---|---|
| `connector.json` manifest | `.devin-plugin/plugin.json` (also honoured: `.claude-plugin/plugin.json`, root `plugin.json`) | `id`, `short`, `version`, `displayName`, `description`, `icon` → manifest `name`, `version`, `description`, `icon`; `short` = manifest `name` |
| `tools/server.ts` MCP server | `.mcp.json` entry `{transport:'streamable-http', url, headers}` pointing at our gateway mount `/pkg/<short>/mcp` | Devin's `type` field accepted (`stdio|streamable-http|sse`); stdio entries rejected at load (Linear cannot dial them) |
| `tools/openapi.json` generated tools | not a Devin concept → stays ours; the gateway still mounts the result as a `.mcp.json` remote | DESIGN |
| `auth.kind` + `fields[]` | `.mcp.json` `${NAME}` secret references + registry-style `required/secret` input descriptors | 3.10.48 detail form (§4.3) renders them: descriptor keys read-only, secret values password inputs |
| `skills/*.md` with `title/mode/tools` frontmatter | `skills/<name>/SKILL.md` with `name`, `description`, `allowed-tools`, `triggers` | `mode: always` → an always-on **rule** (`AGENTS.md` at plugin root or `rules/*.md` with `trigger: always_on`); `mode: mention` → ordinary skill with `triggers: ["user"]`; `tools:` → `allowed-tools:` (enforced by our gateway, CONNECTOR-PACKAGES §5.2) |
| `skills.budget` | no Devin equivalent; Devin caps always-on rules at 16 KiB | keep our 6 000 / 12 000 char budgets; surface over-budget as the 3.10.48 `Couldn't read what this plugin adds.` error row |
| `mirrorToLinear` | no Devin equivalent | ours; shown as `✓ in Linear` in §5 |
| Installation / connection split | plugin install (§3 dialog) vs MCP `Connect` (§4.3) — Devin keeps them separate too ("Plugin installation and MCP authentication are separate steps") | our two tables `package_installation` / `package_connection` map 1:1 |
| Attachment to an automation | `recommended_mcps[]` + Devin's editor `McpSelector` rows | rows are packages; expanding lists skills with checkboxes (MASHUP-PLAN §3.3) |

## 8. Server contract behind these pages (summary; SERVER-FROM-DEVIN.md owns it)

Endpoints are Devin's names where PROVEN, pruned to what the pages above call.

| Page call | Endpoint (ours, Devin-shaped) | Devin evidence |
|---|---|---|
| Connections list | `GET /integrations` → rows `{slug, state: connected\|user-not-linked\|missing-config\|needs-reauth, account?}` | `integrationCheck` enum (3.10.31) |
| Linear connect/disconnect | `POST /integrations/linear/connect` (email → code), `DELETE /integrations/linear` | LINEAR-CONNECTION §8; Devin `integrations/linear` + Disconnect dialog |
| MCP Available | `GET /mcp/registry?search&cursor` → registry schema verbatim | re-server MARKETPLACE.md (`registry.modelcontextprotocol.io/v0.1`) |
| MCP Installed / detail | `GET /mcp/servers`, `POST /mcp/installations`, `PUT/DELETE /mcp/installations/:id`, `GET .../credentials` (keys only), `PUT .../credentials/:key {value, kind}`, `POST .../tools/list` (120 s timeout) | PROVEN 3.10.31 mcp dossier |
| Tool switches | `PUT /mcp/installations/:id/tools/:name {enabled}` | 3.10.48 `toggleTool{serverId,toolName,sourcePath}` (ACP) → HTTP |
| Connect / Authenticate / Reconnect | `POST /mcp/installations/:id/connect`, `.../disconnect`, `.../oauth/authorize {return_to}` → `{authorization_url}` (v2) | 3.10.48 ACP `connectServer/disconnectServer`; 3.10.31 `oauth/authorize` |
| Plugins list/install/remove/assets | `GET /plugins`, `POST /plugins/install {pluginKey}`, `POST /plugins/remove`, `GET /plugins/:key/assets` → `{mcpServers, skills, rules, hooks}` + availability `{complete, originsPending, originsWalked, originsFailed}` | 3.10.48 `PLUGINS_*_METHOD` shapes |
| Manifest view | `GET /plugins/manifest` → `{requiredPlugins, optionalPlugins, forbiddenPlugins}` (read-only in v1) | cloud `managed-plugins` PUT `{manifestJson}` (not exposed) |

Credential rule (C7): write-only `PUT`, read-back returns key names only; OAuth tokens
stored server-side with refresh grant per the recovered mcp-go transport (re-server
AUTH-SESSION: `grant_type=refresh_token`, keep old refresh token when omitted) — v2.

## 9. Acceptance (per PR, RESTART §4)

- Sidebar: 200px aside, 224px inset, 26px rows, `aria-current`, 150 ms color transition,
  group headings not clickable, child-scroll pin/clear rules (§1) — measured at 1270×764.
- MCPs: 12/4 skeletons, pill precedence table, card action table, `No results found for
  "QUERY".`, detail body-by-state, Read-only/Write split, masked credentials with eye.
- Plugins: install dialog 520px with `This install will add:`, remove dialog 440px, lock label
  on the Linear package, details sheet group order.
- Custom MCP: Cursor dialog tabs URL/Command/JSON with keyboard tab activation (A13 note),
  Command tab disabled note, JSON normalisation table.
- Every string above matches its donor verbatim except the four product-name edits listed
  (§2 title description, §4.1 title, §5 description, §2 disconnect body `<product>`).

## 10. `[3.10.48]` changelog for this document

| When | Evidence landed | Change here |
|---|---|---|
| 2026-10-12 23:22 | `DESKTOP-3.10.48-CONNECTORS.md`, `CUSTOMIZATION-SIDEBAR.md` | §1, §3, §4 written from excerpts, replacing 3.10.31 marketplace shape (route `/settings/connections?tab=mcps` → Customize tabs) |
| 23:38 | `DESKTOP-3.10.48-CLOUD-CONNECTORS.md` (web capture 2026-10-13 UTC) | §6 manifest editor row; web tab order is Plugins · Skills · MCPs · Hooks · Rules (+Memory) vs desktop Plugins · MCPs · Skills · Rules · Hooks · Subagents — **we keep the desktop order** (C3) because the desktop sidebar is the exact component we copy |
| 23:49 | re-server `AUTH-SESSION.md` MCP OAuth refresh grant | §8 credential rule; OAuth stays v2 |
| open | `nav-manifest`, remote Connections provider forms (REMOTE, NEEDS-CAPTURE) | §2 status→copy rows stay DERIVED until captured |
