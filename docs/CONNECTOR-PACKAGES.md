# CONNECTOR PACKAGES — connection + tools + skills, "with direction"

> Vision spec, 2026-10-12. Planning deliverable under RESTART §5 (no implementation).
> Evidence labels follow `facts/INDEX.md`: **VERIFIED** (MASTER-PLAN §V1–V10, live),
> **CAPTURED** (Cursor/Devin UI in `facts/`, `corpus/`, devin-decompile),
> **DOCUMENTED** (vendor docs, Devin OAuth guide), **DECISION** (ours). Nothing invented ships
> in UI; the package format itself is ours and is labeled DECISION throughout.

## 0. The thesis in one paragraph

A **connector** today is an auth flow plus a URL. Our product's unit is a **connector package**:
one folder that carries (1) a **connection** declaration, (2) a **tool surface** served as an MCP
server, and (3) **skills** — the markdown playbooks that make the agent fluent in the service.
Devin's Linear plugin is the proof shape (connector + baked-in skills, sitting above a plain MCP
connector). Nobody else ships layer 3, and layer 3 is the whole product differentiation: a
"Google Classroom package" is not an OAuth flow, it is the agent learning what a teacher does all
day. Every decision below is made so the owner can author such a package in one afternoon with
the Cursor-style flow: **click → fill → it works**.

## 1. Decisions (read these first; detail follows)

| # | Decision | Basis |
|---|---|---|
| D1 | A package is a **directory** with one `package.json`-style manifest (`connector.json`), a `tools/` entry, and a `skills/` folder of markdown files. No archive format, no registry in v1. | DECISION; mirrors shadcn "owned source" doctrine (RESTART §3) |
| D2 | **Packages run on our server.** The server hosts each package's MCP server in-process (official SDK already isolated in `mcp/`, decision `docs/decisions/mcp-sdk.md`), exposes it on a per-package route, and connects that URL to the Linear Agent with `integrationMcpServerPersonalConnect`. Nothing runs client-side. | VERIFIED V5; §4 defends |
| D3 | A **skill is a prompt fragment with a tool allowlist**: body = markdown (Linear-compatible), frontmatter carries `tools:` scoping. Scoping is enforced by **our MCP gateway**, not by the model. | §5 defends; reconciles Linear's body-only model with Devin's coupled feel |
| D4 | Three invocation modes, all declared in frontmatter: `always` (injected into every turn of a run that has the package attached), `mention` (slash-invoked / `?skill=`), `trigger` (auto-attached when a run's trigger matches). v1 ships `always` + `mention`. | VERIFIED V7 for `mention`; §5.3 |
| D5 | Skills are **mirrored into Linear as AgentSkills** (`agentSkillCreate`) at package install so they work in native Linear chat too, and **injected by us as prompt prefix** in automation runs. Both from the same file. | VERIFIED V7; schema `AgentSkillCreateInput{body!,title,icon,color,teamId}` |
| D6 | Auth is declared, never implemented, by a package: `auth.kind ∈ {none, api_key, oauth2, session_cookie}`. The server owns storage (one encrypted secrets table, LINEAR-CONNECTION D6) and injection (credential broker rule: the model never sees a credential). | DOCUMENTED Devin OAuth guide §4.1 rule; LINEAR-CONNECTION D6 |
| D7 | The **Linear package is first-party and pre-installed**; its connection is the existing Linear account link. It is also the only package with `auth.kind: session_cookie`. | RESTART §2 "Linear-only" |
| D8 | Settings gains no new destination: "MCP connectors" is **renamed Packages** and becomes the home of every connector (a plain MCP server is a package with zero skills). Four entries stay four: Linear connection, Packages, Accounts, General. | Copy-first; §10 |
| D9 | v1 scope: local packages only, Linear + one owner-authored package (Google Classroom), api_key + session_cookie auth, no OAuth broker, no marketplace, no sharing. | §11 |

## 2. Vocabulary

- **Package** — the authored directory. Immutable identity = `id` (reverse-DNS string).
- **Installation** — a package registered on this server, enabled, with its tools served.
  One installation per package per server in v1 (no per-user scoping).
- **Connection** — the credential record that satisfies the package's `auth` declaration.
  Zero or one per installation in v1. Devin's guide separates *installation* from *grant*;
  we keep the separation in the schema (two tables) but collapse the UI to one card.
- **Tool** — one MCP tool exposed by the package's server. Names are `<pkg-short>.<verb>_<noun>`.
- **Skill** — one markdown file in `skills/`. Has a title, mode, tool allowlist, and body.
- **Attachment** — the act of binding a package to an automation (editor Tools section) or a
  chat conversation. Attachment decides which skills and tools are live for a run.
- **Run** — unchanged from MASTER-PLAN §2: a Linear Agent conversation we drive.

## 3. Package shape (DECISION)

### 3.1 File tree

```
packages/
  linear/                      ← first-party, shipped in repo
    connector.json
    icon.svg
    tools/
      server.ts                ← default export: (ctx) => McpServer
    skills/
      _always.md               ← mode: always
      triage.md
      cycle-planning.md
      write-issue.md
      status-report.md
  google-classroom/            ← owner-authored, lives in the same folder
    connector.json
    icon.svg
    tools/
      server.ts
      openapi.json             ← optional: generated tools (see 3.4)
    skills/
      _always.md
      grade-return.md
      weekly-digest.md
```

Rules: exactly one manifest; `tools/server.ts` is the only code the server loads; `skills/*.md`
are the only files read as skills; everything else is ignored. Underscore-prefixed skill files
are `always` mode by convention and may not also declare `mention`.

### 3.2 Manifest — `connector.json`

```jsonc
{
  "id": "app.ours.linear",            // reverse-DNS, immutable, used in tool names' prefix
  "short": "linear",                  // tool-name prefix and route segment: /pkg/linear/mcp
  "version": "1.0.0",                 // semver; bump = re-sync skills to Linear
  "displayName": "Linear",
  "description": "Issues, cycles, projects and triage in Linear.",
  "icon": "icon.svg",
  "auth": {                           // exactly one kind; see §6
    "kind": "session_cookie",         // none | api_key | oauth2 | session_cookie
    "label": "Linear account",
    "fields": [ { "key": "email", "label": "Email", "secret": false } ]
  },
  "tools": {
    "entry": "tools/server.ts",       // default export (ctx) => McpServer
    "egress": ["client-api.linear.app"], // allowlist; mcp/ pinned-fetch enforces
    "defaultDisabled": ["linear.delete_issue"]
  },
  "skills": {
    "dir": "skills",
    "mirrorToLinear": true,           // agentSkillCreate on install (D5)
    "budget": { "alwaysChars": 6000, "mentionChars": 12000 }
  },
  "triggers": ["linear.issue_created", "linear.status_changed"]  // v2: what trigger-mode skills may bind to
}
```

Manifest rules: validated by zod at load; unknown keys are an error (no silent drift); `id`,
`short` and `tools.entry` are required; `auth` defaults to `{kind:"none"}`; `skills.dir` defaults
to `skills`. `egress` is mandatory when `tools.entry` exists — the existing network policy in
`mcp/` already refuses unlisted hosts, and a package that needs no network declares `[]`.

### 3.3 Tool surface — the MCP server shape

`tools/server.ts` default-exports a factory `(ctx: PackageContext) => McpServer` using the
official SDK already pinned in `mcp/` (1.32.1). `ctx` provides: `credential` (an opaque handle,
see §6 — never the raw secret), `fetch` (the pinned-DNS, allowlisted fetch from `mcp/pinned-fetch.ts`),
`account` (the Linear identity triple for first-party packages), and `log`. The server:

- registers tools with names `<short>.<verb>_<noun>`, JSON-Schema inputs, and a one-line
  description that **names the entity vocabulary used by the skills** (e.g. "Create a Linear
  issue in a team; returns `identifier` like ENG-123");
- MUST be stateless between calls (the gateway may recycle it); durable state lives in SQLite
  through `ctx.store(namespace)`;
- MAY expose MCP resources (`<short>://…`) for read-mostly context; v1 ignores prompts/sampling.

The server is mounted by the gateway on `POST /pkg/<short>/mcp` (Streamable HTTP) behind a
per-installation bearer token, and that URL (through the existing tunnel) is what we pass to
`integrationMcpServerPersonalConnect(serverUrl, customHeaders)` — VERIFIED V5. The gateway
wraps every `tools/list` and `tools/call` to apply the **active allowlist** (§5.2) and to swap the
credential handle for the real secret at the last moment (§6).

### 3.4 Generated tools (authoring accelerator, v1)

If `tools/openapi.json` exists and `tools/server.ts` is absent, the gateway builds tools from the
OpenAPI operations (`operationId` → `<short>.<operationId>`), applying `auth` as a header or
query credential. This is how "make a little MCP package" stays a fill-in task for services with
public specs (Google Classroom has one). Hand-written `server.ts` wins when both exist.

## 4. Where packages run — server-side, defended

**Decision: our server hosts every package's MCP server and bridges it to the Linear Agent.**

1. **It is the verified path.** V5 proved Linear's backend will call *our* MCP server over a
   tunnel with one mutation and no OAuth. Client-side execution has no verified bridge to the
   inference brain at all; the browser cannot be the MCP server Linear's backend dials.
2. **Credentials never reach a browser or the model.** Devin's rule (OAuth guide §4.1) holds only
   if the credential broker sits in the same trust domain as the tool runtime. That is our one
   Node process with its one encrypted secrets table (LINEAR-CONNECTION D6).
3. **Automations run unattended.** A cron-fired run at 03:00 has no client. Any client-side
   design would need a second, server-side runtime anyway.
4. **One pacing authority.** We already own the Linear velocity problem (§7). Tool calls that
   originate inside the agent loop must land on the same process that meters prompts, or the
   two budgets fight.

Cost accepted: the server needs a reachable URL. v1 keeps the existing tunnel approach from V5;
a stable public hostname is a deployment concern, not a package concern. Stdio packages are
**not** supported — Linear cannot dial stdio, and `mcp/` already treats stdio as opt-in
hazard; a package is Streamable HTTP only.

Consequence for `mcp/`: it stops being "the product's single MCP server" and becomes the
**gateway** that mounts N package servers plus the existing management server (24 tools) at
`/pkg/_admin/mcp`. One process, one store, as today.

## 5. Skills — how direction is baked in

### 5.1 Format (DECISION): markdown + frontmatter, Linear-compatible body

```markdown
---
title: Triage new issues
mode: mention              # always | mention | trigger
tools: [linear.list_issues, linear.update_issue, linear.create_comment]
icon: 🔍                   # Linear AgentSkill.icon
color: "#5E6AD2"           # Linear AgentSkill.color
triggers: [linear.issue_created]   # only read when mode: trigger (v2)
---
When asked to triage, you are the on-call engineer's first pass. For each untriaged issue…
```

- `title` and the body map 1:1 onto Linear's `AgentSkillCreateInput{title, body, icon, color}`
  (schema verified in `linear-loops-decompile/extracts/linear-official/schema.graphql`).
  `description` is **not** authored: Linear generates it (`AgentSkill.description` is nullable,
  "Null if no description has been generated"), and we show Linear's value back.
- Body is plain markdown prose. No templating, no variables, no includes in v1. A skill that
  needs live data tells the agent which **tool** to call for it.
- Size budget is enforced at load (manifest `skills.budget`): `always` skills total ≤ 6,000
  chars per package; one `mention` skill ≤ 12,000 chars. Over budget = install error, shown
  in the package card. Budgets exist because `always` text is paid on every turn of every run
  that attaches the package, and because Linear's chat has no visible context meter.

### 5.2 Is a skill a prompt or a tool policy? Both, with the policy enforced by us

Linear's model is body-only (V7). Devin's plugin skills feel coupled to tools. We resolve it:
the **body** is what the model reads; the **`tools:` allowlist** is what the gateway enforces.
When a run has skill S active, `tools/list` returns the union of allowlists of all active skills
(plus the package's non-skill tools if the attachment says "all tools"); a `tools/call` outside
that set is rejected with an MCP error whose text names the skill that would permit it. The
model is told the rule in the injected preamble (§5.4) so it does not flail. Effects:

- a skill cannot be mis-used to drive tools its author did not intend;
- the author reasons about one file: "this playbook may touch these five tools";
- Linear's native chat (where we cannot intercept) still gets the body via the mirrored
  AgentSkill — the allowlist simply does not apply there, and we say so in the authoring UI.

### 5.3 Invocation model

| Mode | When live | How the model receives it | v1 |
|---|---|---|---|
| `always` | Every turn of any run/chat whose attachment includes the package | Injected as a preamble block before the user prompt (automation runs); mirrored AgentSkill is *not* used for this | yes |
| `mention` | User/automation prompt contains `/<skill-slug>`, or the automation editor pins the skill | Automations: body injected for that run only. Native Linear chat: `?skill=<id>` / slash-mention of the mirrored AgentSkill (VERIFIED V7) | yes |
| `trigger` | Run's trigger id ∈ skill `triggers` | Injected like `mention`, automatically | v2 |

Resolution order for one run: `always` skills (manifest order) → trigger-matched → mentioned.
Duplicates collapse. Total injected skill text per run is capped at 24,000 chars; overflow drops
`always` skills last (they are the package's identity) and reports the drop in the run log.

### 5.4 Injection into an automation run vs a chat turn

**Automation run** (we own the prompt): `sendPrompt(account, convId?, prompt)` from MASTER-PLAN §2
gains a `preamble` built by the gateway: one fenced block per skill, headed `## Skill: <title>`,
followed by one line listing the tools currently allowed for this run, then the automation's own
instructions. The preamble is sent only on the **first** turn of a conversation; later turns
rely on V4 memory and re-send only newly mentioned skills.

**Chat turn** (user types in our chat page): identical path — our chat is a Linear conversation
we proxy (RESTART §2.4), so the same `preamble` builder runs. The only difference is that the
chat UI renders each typed `/<skill>` as an inline mention token and names the attached packages
in the conversation header (DECISION-skill-chips.md §7). No chip row.

**Native Linear chat** (user is inside Linear): the mirrored AgentSkills carry the body; the
tools are whatever the connected MCP server exposes for that account. No allowlist, no `always`.
This is why mirroring is on by default but is explicitly "best effort" in the package card copy.

## 6. Auth — declared by the package, owned by the server

| `auth.kind` | What the package declares | What the server does | v1 |
|---|---|---|---|
| `none` | nothing | mounts tools immediately | yes |
| `api_key` | `fields[]` (key, label, secret flag, placeholder), `inject: {in: header|query, name}` | Settings card shows one form per field (captured Cursor custom-MCP form fields: URL/headers → reused as label/secret input); stores ciphertext; injects at `tools/call` | yes |
| `session_cookie` | identity fields only | first-party only; satisfied by the existing Linear connection (LINEAR-CONNECTION D1–D4) | yes, Linear only |
| `oauth2` | `provider`, `scopes[]`, `authorizationUrl`, `tokenUrl`, `pkce: true` | authorization-code + PKCE broker, single-flight refresh, revocation (Devin guide §7) | **v2** |

Rules (DECISION, from Devin guide §4.1 and LINEAR-CONNECTION D6):

- A credential is written once by the UI and never read back. The package receives
  `ctx.credential`, an opaque handle; `ctx.fetch` resolves it to a header at send time only for
  hosts in `tools.egress`. A package that tries to log or return a credential returns a redacted
  string (the gateway redacts known secret values in every tool result).
- Connection state is `missing | connected | expired | error`, surfaced in the package card and
  in the automation editor's Tools section exactly as the captured `Requires connection /
  Connect` row (facts A17). `expired` pauses attached automations like LINEAR-CONNECTION D4.
- Installation and connection are separate rows in SQLite (`package_installation`,
  `package_connection`) so v2 OAuth and per-user grants slot in without a migration of meaning.

## 7. Pacing — what the free-agent velocity reality does to packages

We already own the pacing problem for prompts (MASTER-PLAN §2: free chat, polled via
`/sync/batch`). Packages add a second axis: **tool calls inside the agent loop**, which Linear's
backend dials into our gateway at its own cadence. Decisions:

1. **One budget object per account**, shared by prompt sends and inbound tool calls:
   `{turnsPerMinute, toolCallsPerTurn, concurrentRuns}`. Defaults are conservative
   (`6 / 12 / 2`) and configurable in General. The scheduler already gates sends; the gateway
   counts inbound `tools/call` against the same object and, past `toolCallsPerTurn`, answers
   with an MCP error "tool budget for this turn exhausted — summarize and stop". The model
   recovers gracefully because the always-preamble (§5.4) tells it that rule up front.
2. **Tools are fast or they are not tools.** Gateway timeout per call is 20 s. Long work is a
   tool that *starts* a job and a second tool that *reads* status, never a blocking call; the
   Devin guide's "durable work uses explicit task state, never transport resumption" applies.
3. **Skills pace the agent too.** Every `always` skill for a service ends with a stock
   "Working style" paragraph (authored once in the Linear package, copied by authors): batch
   reads before writes, prefer one list call over N get calls, stop after the task, no polling.
   This is the cheapest velocity lever we have and it is pure direction.
4. **Runs are resumable records** (MASTER-PLAN §2), so a budget stop mid-run is not a failure:
   the run parks in `paused:budget` and the next tick resumes the conversation with resume:true
   (V4). The run detail shows the pause as a row, copied from Devin's error-log row style.

## 8. Reference implementation — the Linear package

First-party, shipped in `packages/linear/`, pre-installed, cannot be uninstalled (only disabled).
Connection = the existing Linear account link (`auth.kind: session_cookie`). Because the Linear
Agent already has native entity tools (V6: CreateEntity/UpdateEntity/DeleteEntity/
RestoreEntity, PostChatMessage, SpawnSubagent), our package exposes only tools that **add
information the native agent lacks or that we want gated**, and otherwise lets skills direct the
native tools. This keeps the package small and the pacing cheap.

### 8.1 Tools (from verified mutations/queries; names are final)

| Tool | Backed by | Why it exists when the native agent has entity tools |
|---|---|---|
| `linear.search_issues` | `issues(filter)` query via the account session | Native agent searches implicitly; an explicit, paginated, filter-shaped read lets skills say "list before you act" and lets us count reads |
| `linear.get_issue` | `issue(id)` with comments/history | Deterministic full read for triage/status skills |
| `linear.list_cycles` / `linear.list_projects` | `cycles`, `projects` queries | Planning skills need the calendar and the set of containers |
| `linear.create_issue` | `issueCreate` | Gated write with our allowlist and budget; native CreateEntity stays available in native chat |
| `linear.update_issue` | `issueUpdate` | Same; the one write most skills use |
| `linear.create_comment` | `commentCreate` | Status-report and triage skills post findings here, not in chat |
| `linear.run_automation` | our `src/core/fireRun` (MASTER-PLAN §2 "open abstraction") | Lets a Linear-fluent agent chain into our own automations — this is the first use of the v2 MCP facade seed |
| `linear.delete_issue` | `issueDelete` | Shipped **defaultDisabled**; must be enabled per attachment |

Not tools: anything that drives the Agent itself (`aiConversationSendMessage`,
`agentSkillCreate`, `integrationMcpServerPersonalConnect`). Those are server plumbing; exposing
them as tools would let a run rewire its own brain.

### 8.2 Skill set (outlines of the actual bodies)

**`_always.md` — "Linear fluency" (mode: always, ~2,500 chars, tools: all read tools)**
1. Entity vocabulary: issue (`identifier` like ENG-123, `state` in a team workflow, `priority`
   0–4 where 0 = none, `estimate`), cycle (time-boxed, team-scoped), project (cross-team,
   has milestones), initiative, label, triage state (team's inbox).
2. Workspace conventions the agent must infer, not assume: read the team's workflow states
   before setting one; never invent labels; prefer the team's existing priority usage.
3. Writing rules: titles are imperative and ≤ 70 chars; descriptions start with the user-facing
   symptom, then steps, then acceptance; comments quote evidence, link issues by identifier.
4. Working style (stock paragraph, §7.3): list before act, batch reads, one write per intent,
   stop when done, summarize changed identifiers at the end.
5. Budget rule: "If a tool reports the budget is exhausted, summarize and stop."

**`triage.md` — Triage new issues (mode: mention, tools: search_issues, get_issue,
update_issue, create_comment)**
- Scope: issues in the team's triage state created since the last run (the automation passes
  the window). Steps: dedupe against open issues by title similarity → classify bug/feature/
  question → set priority by impact × frequency rubric (table in body) → assign a label from the
  existing set → move out of triage → one comment explaining the decision in two lines.
- Hard stops: never close, never assign a person, never change estimates.

**`cycle-planning.md` — Plan the next cycle (mode: mention, tools: list_cycles, search_issues,
get_issue, update_issue, create_comment)**
- Inputs: team, target cycle. Steps: compute capacity from the last three cycles' completed
  estimate → rank backlog by priority then age → propose a cycle set within 80% capacity →
  move issues into the cycle → post one planning comment on the cycle's project (or the
  automation's result) with the rationale and the cut line.
- Hard stops: never move issues out of an active cycle; flag over-capacity instead of trimming.

**`write-issue.md` — Write a good issue from a loose request (mode: mention, tools:
search_issues, create_issue)**
- Steps: search for duplicates first → if a match exists, return its identifier and stop →
  otherwise draft title/description per the fluency rules → create in the requested team in the
  triage state → return the identifier. Includes a 10-line description template.

**`status-report.md` — Project status report (mode: mention, tools: list_projects,
search_issues, get_issue, create_comment)**
- Steps: for each project in scope, count by state, list issues that changed state in the
  window, surface blockers (issues with "blocked" relation or label), compute trend vs the
  previous window → write a report in a fixed format (Headline, Shipped, In progress, At risk,
  Needs decision) → post as a comment or return as the run result.

Each skill ends with the same two-line "Report back" convention so run results are
machine-scannable: `Changed: ENG-1, ENG-2` / `Skipped: ENG-3 (reason)`.

## 9. Authoring experience — "make a little MCP package with direction"

Target: the owner makes **Google Classroom** in one sitting without reading this doc. Two
entry points, both ending in the same folder on disk (D1), because the folder is the product.

### 9.1 Click path (Settings → Packages → New package)

The visual source is the **captured Cursor "New Connection" flow** (facts: `mcp-menu`,
`mcp-browse`, `mcp-url`, `mcp-command`, `mcp-json`; `facts/automations-saved-editor.md`): the
same dialog frame, the same tab strip, chiseled. Tabs become **URL · OpenAPI · Folder**.

1. **Name & icon** — display name, short id (auto-slugged, editable), icon upload. Copied from
   the captured custom-MCP name field; icon control is the captured avatar control from Accounts.
2. **Connection** — segmented: None · API key · (OAuth, disabled with "v2" badge). API key shows
   the captured headers-row form reused as `label / value (secret)` pairs plus `inject in: header | query`.
3. **Tools** — the chosen tab: **URL** = an existing remote MCP server (zero-code package, the
   old "MCP connector" case); **OpenAPI** = paste a spec URL or file → operation list with
   checkboxes (generated tools, §3.4); **Folder** = pick a local folder that already has
   `tools/server.ts`. The dialog probes the result with the existing five-state probe
   (connected / disconnected / needs auth / missing / error) before enabling Create.
4. **Skills** — a list with "Add skill": title, mode (Always / On mention), tools multi-select
   drawn from step 3's live `tools/list`, body (plain textarea; captured Agent Instructions
   textarea geometry). Character counter against the budget. First skill is pre-created as
   `_always.md` with the stock Linear-fluency skeleton (§8.2 item 4 and 5) for the author to fill.
5. **Create** — writes the folder under `packages/<short>/`, installs, probes, mirrors skills to
   Linear if the Linear connection exists, and lands on the package card.

Every step is a form over a file; nothing in the dialog is state the folder does not hold.

### 9.2 Worked example — Google Classroom, what the owner actually writes

```
packages/google-classroom/
  connector.json      ← id app.ours.google-classroom, short "classroom",
                        auth api_key (v1: a Google API key or a pasted OAuth access
                        token in the secret field; proper OAuth is v2), egress
                        ["classroom.googleapis.com"]
  tools/openapi.json  ← Google's Discovery doc, filtered to 7 operations:
                        courses.list, courseWork.list, courseWork.create,
                        studentSubmissions.list, studentSubmissions.return,
                        announcements.create, students.list
  skills/_always.md   ← "Classroom fluency": a course has courseWork (assignments,
                        questions, materials); a submission moves NEW → CREATED →
                        TURNED_IN → RETURNED; grades are draft until returned;
                        teachers batch work at 7am and 9pm; never message students
                        directly; always address a class, never a child by name in
                        announcements; working-style paragraph.
  skills/grade-return.md   ← mention; tools [submissions.list, submissions.return];
                        steps: list TURNED_IN → apply rubric from the prompt →
                        set draft grade → return in one batch → report counts.
  skills/weekly-digest.md  ← mention; tools [courses.list, courseWork.list,
                        submissions.list, announcements.create]; steps: due this
                        week, missing by course, one announcement per course in
                        the teacher's tone (sample in body).
```

Authoring time budget: manifest 5 min (dialog), tools 10 min (paste spec, tick 7 boxes),
skills 30–60 min (this is where the value is, and it is prose). No code.

### 9.3 Edit loop

Files are the truth: editing `skills/*.md` on disk and clicking **Reload** on the package card
re-validates, re-mounts, and re-mirrors. The dialog edits the same files. Version bump is
automatic on skill change (patch) and tool change (minor); the card shows the version and the
last mirror result ("4 skills in Linear · updated 2 min ago" or the error).

## 10. Settings / integrations UI — from four chiseled pages to package-aware

Rule unchanged: copy-first, chisel-only. Visual sources are the captured Cursor settings frame
(`facts/settings-navigation-capture.md`, S01 rows: 12px 16px padding, 55px min height), the
captured New Connection dialog (facts `mcp-*`), the captured Linear trigger row (A17), and
Devin's MCP selector (`DEVIN_AUTOMATIONS_DECOMPILED_SPEC.md` §11.2: 42px header, 34px rows,
265px body, `Suggested` / `Not recommended` / `Setup` badges).

| Surface | Today | Becomes | Source |
|---|---|---|---|
| Settings nav | Linear connection · MCP connectors · Accounts · General | Linear connection · **Packages** · Accounts · General | Rename only; the row/frame is S01 |
| Packages page (empty) | "No MCP servers configured / New Connection" | Same two strings; "New Connection" opens the dialog of §9.1 | captured `mcp-unconfigured` |
| Packages page (list) | n/a | One captured settings row per installed package: icon, displayName, connection state pill, `N tools · M skills`, trailing Enable switch; click → package card | S01 row anatomy; pill copy from A17 (`Requires connection`) |
| Package card | n/a | Captured dashboard section stack: Connection (form per `auth`), Tools (list with per-tool enable, `defaultDisabled` off), Skills (list: title, mode badge, size, mirrored ✓/✗), Danger (Disable / Uninstall; Linear has no Uninstall) | C-SETTINGS DashboardSection/Cell |
| Linear connection page | Connect flow | Unchanged; gains one line "Powers the Linear package" linking to its card | LINEAR-CONNECTION D7 |
| Automation editor → Tools | Devin MCP selector of servers | Same selector, rows are **packages**; expanding a row (captured `mcp-linear-expanded`) lists its skills with checkboxes and a "pin skill" state; `Setup` badge routes to the package card when connection is `missing` | Devin §11.2; facts `mcp-linear-expanded` |
| Chat page | Linear gate | Inline `/skill` mention token in the composer + header package line; chip row rejected | DECISION-skill-chips.md §6–7 |

Deleted, not hidden: the standalone per-server "bindings" panel from the archived first pass;
registry URL/command/JSON forms survive only inside the New package dialog's URL tab.

## 11. Ruthless v1 scope cut

**In v1**

- Package folder format, manifest validation, loader, gateway mounting on `/pkg/<short>/mcp`.
- Auth kinds `none`, `api_key`, `session_cookie` (Linear only).
- Tools: hand-written `server.ts` **or** OpenAPI-generated; Streamable HTTP only.
- Skills: `always` + `mention`; budgets; allowlist enforcement in the gateway; mirror to Linear.
- Linear package with the 8 tools and 5 skills of §8; Google Classroom as the owner's
  first authored package (proves the authoring loop end to end).
- Settings: Packages page, package card, New package dialog (URL · OpenAPI · Folder);
  automation editor Tools section rows become packages with expandable skills.
- Shared budget object and `paused:budget` run state.

**Not in v1 (and why)**

| Cut | Why |
|---|---|
| OAuth2 broker (authorization code, PKCE, refresh, revocation) | Largest single chunk of Devin's guide (§7–8); nothing in the Linear or owner path needs it this month. API key / pasted token covers Classroom for one user. |
| `trigger`-mode skills | Needs event triggers, which are v2 in MASTER-PLAN §5. |
| Marketplace, sharing, signing, publisher trust tiers | Single-owner product; folder-on-disk is distribution. |
| Per-user installations / run-as identity | One account set per server; Devin's user-vs-org scoping has nothing to scope over. |
| Stdio packages | Linear cannot dial stdio; `mcp/` treats it as hazard. |
| Skill templating, includes, variables | Prose only. A skill that needs data calls a tool. |
| Resources/prompts/sampling from package servers | Tools are enough for direction; revisit when a package proves a need. |
| Enterprise security profiles, network policy UI | Egress allowlist in the manifest is the whole policy. |
| Package-level tests/eval harness | Verification is the existing probe + a run in the browser (AGENTS.md law 2). |
| Any new settings destination beyond renaming "MCP connectors" to "Packages" | Four entries stay four. |

## 12. Server touch points (so the implementation plan can start)

New vertical slice `packages/` under the server slice map (RESTART §3), owning:

| Table | Columns (SQLite) | Notes |
|---|---|---|
| `package` | `id`, `short`, `version`, `dir`, `manifest_json`, `state` (`loaded\|error\|disabled`), `error_text`, `loaded_at` | One row per folder in `packages/` |
| `package_installation` | `id`, `package_id`, `enabled`, `bearer_hash`, `linear_integration_id`, `tool_overrides_json`, `created_at` | `linear_integration_id` from `integrationMcpServerPersonalConnect` |
| `package_connection` | `id`, `installation_id`, `kind`, `state`, `secret_ref`, `fields_json` (non-secret), `checked_at` | `secret_ref` → existing secrets table (LINEAR-CONNECTION D6) |
| `package_skill` | `id`, `package_id`, `slug`, `title`, `mode`, `tools_json`, `chars`, `linear_skill_id`, `mirrored_at`, `mirror_error` | Derived from files on load |
| `automation_attachment` | `automation_id`, `installation_id`, `all_tools`, `tool_ids_json`, `pinned_skill_slugs_json` | Replaces the first pass's per-server bindings |

Core functions (typed, in `src/core/`, called by HTTP routes and the admin MCP facade alike):
`loadPackages()`, `installPackage(id)`, `setConnection(installationId, fields)`,
`probeInstallation(id)`, `mirrorSkills(packageId, accountId)`, `attach(automationId, …)`,
`buildPreamble(runCtx)`, `resolveAllowlist(runCtx)`. Tagged errors: `ManifestInvalid`,
`SkillOverBudget`, `ConnectionMissing`, `EgressDenied`, `BudgetExhausted`, `MirrorFailed`.

Build order: loader + manifest + Linear package tools → gateway mount + V5 connect →
preamble injection in `sendPrompt` → settings Packages page → New package dialog (URL tab
first, OpenAPI second, Folder third) → skills mirror → Google Classroom authored by the owner.
Each arrow is one PR (AGENTS.md "one idea per PR").

## 13. The five open questions that would most change the design, ranked

1. **Does Linear's agent honor our MCP server's `tools/list` per conversation, or does it cache
   the list per integration?** V5 verified invocation, not list freshness. If cached, the
   skill-scoped allowlist (§5.2) cannot vary per run and must become per-*installation*: one
   mounted server per attachment profile instead of one per package. This changes the gateway's
   routing and the attachment table. Probe: connect, call `tools/list`, change the allowlist,
   send a new prompt, observe whether the agent sees the new set.

2. **Is Google Classroom (the owner's first package) acceptable with a pasted token instead of
   OAuth?** If no, the OAuth2 broker moves from v2 to v1 and roughly doubles the server work
   (Devin guide §7–8). If yes, v1 stays as cut.

3. **Should `always` skills be injected by us at all, or should we rely only on mirrored Linear
   AgentSkills?** Injection costs tokens on every turn and only works through our proxy;
   mirroring is free and works in native Linear chat but gives no `always` and no allowlist.
   The spec chooses both. If the owner wants native-Linear-first behavior, injection shrinks to
   a one-line pointer ("use skill /linear-fluency") and the budgets in §5.1 become moot.

4. **One account set per server, or per-user packages later?** The schema keeps installation
   and connection separate (Devin's lesson) but the UI collapses them. If the product will ever
   have a second human, `package_connection` needs `owner_user_id` now, and the automation
   editor needs Devin's run-as logic (§8.2 of its spec). Cheap to add now, expensive later.

5. **Does the tunnel URL for the gateway stay stable enough for installed integrations?**
   `integrationMcpServerPersonalConnect` stores a `serverUrl`. If the tunnel hostname rotates,
   every installation needs re-connect on boot (one mutation each, fine) — unless Linear
   dedupes by URL and leaves stale integrations behind. Answer decides whether we need a stable
   hostname before shipping any package beyond Linear, and whether `linear_integration_id`
   must be re-resolved on every start.
