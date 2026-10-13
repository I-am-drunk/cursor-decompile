# SERVER FROM DEVIN — our server architecture, modelled on Devin's client/server split (2026-10-12)

> Branch `plan-devin-mashup`. Planning deliverable; no implementation. **Supersedes
> `plan-server-architecture` ARCHITECTURE.md (commit 97f6018) where they conflict**; where
> they agree (SQLite, slices, tagged errors, event log) that doc's detail still applies.
> T3 Code is no longer the model; Devin's boundary is.
>
> Evidence: `DEVIN_CLIENT_VS_SERVER_FEASIBILITY_AUDIT.md` (PROVEN boundary), spec §22
> boundary ledger + §22.2 backend ports, Appendix A endpoint matrix, 3.10.31
> `automations/A-changelog-and-data-model.md` + `api/A-http-client-auth-and-route-table.md`,
> `re-server-3.10.48` `{SERVER-API-MAP, CONNECTOR-BACKEND, MARKETPLACE, AUTH-SESSION,
> LIVE-MARKETPLACE-ACCESS}.md` (landing now), MASTER-PLAN §V1–V10 (Linear = brain),
> LINEAR-CONNECTION, LOOP-RUNTIME, CONNECTOR-PACKAGES.

## 0. What Devin's split teaches (PROVEN) and what we take

| Devin fact (audit §0/§2, spec §22.1) | Consequence for us |
|---|---|
| The Automations client is **CRUD + monitoring UI over a REST contract**; zero prompts, scheduler, RRULE evaluator, webhook verifier or session spawner in the client | Our client is the same dumb UI; **every behaviour lives in the server**. No client-side scheduling, polling-as-execution, or local "run adapters" |
| Server owns: scheduler, event ingestion, concurrency, session runtime, sub-agent fan-out, MCP transport + credential injection, preflight sandbox, scratchpad, clustering, metering | We own the same list minus what Linear owns for free (inference, native tools, conversation state) |
| `POST .../trigger` returns 2xx = "accepted", the run appears later in `/events` | Runs are async records; UI never waits on execution |
| Client polls `/events` 5 s while queued/running, 30 s charts; no websockets | We keep polling semantics for the Devin pages **and** serve them from our append-only event log (ARCHITECTURE §7) — same endpoints, cheaper reads |
| OAuth tokens never reach the client; `credential_keys` only | Credential broker rule (CONNECTOR-PACKAGES D6) |
| Local MCP host (Customize) is a separate runtime from cloud MCP installations | We have one runtime (the gateway) but keep the two UIs' contracts |
| Auth: opaque prefixed session token, server-minted, 5-min client re-evaluation (3.10.48 AUTH-SESSION) | Local account session cookie (account-login.md); the token-prefix trick is not needed |

## 1. Process shape (unchanged from ARCHITECTURE §1 except where noted)

One Node ≥22 process, one SQLite file (`node:sqlite`, WAL), vertical slices under
`server/src/features/`, `index.ts`-only public API, tagged errors, numbered migrations, Biome.
Startup: open db → migrate → `runs.recoverOpenRuns()` → mount gateway → http → scheduler tick.

**Changes forced by the Devin model:**

| Area | ARCHITECTURE (T3-derived) | SERVER-FROM-DEVIN (supersedes) |
|---|---|---|
| HTTP shape | our own small route set (`/accounts`, `/automations/:id/runs`, `/events`) | **Devin's endpoint names and payload projections** (§2) so the copied Devin pages call the server unchanged; our extra reads (`/events?since`) stay as additive endpoints |
| Run read model | `runs` + `run_parts` only | plus Devin **events projection** `{event_id, status, created_at, event_type, trigger_id, event_message, event_message_parts[], error_message, devin_session_id → run_id}` served from `runs` (§4) |
| MCP | `mcp-registry` slice (servers table, probe) | **`connectors` slice** = Devin's two systems: `integrations` (Linear) + `mcp` installations/credentials/tools + `plugins` (packages). Gateway mounts package servers (CONNECTOR-PACKAGES §4) |
| Templates | not planned | `GET /automations/templates` server data (Devin §7) |
| Scheduler input | 5-field cron + presets | **RRULE + IANA tz** as Devin stores it (`schedule:*` pseudo-types, RRULE string); cron accepted only through a proven cron→RRULE subset adapter (DEVIN-PORT-MAP §3) |
| Manual run | `POST /automations/:id/runs` | `POST /automations/:id/trigger` with optional `{prompt}` body, `202` (Devin §17.4) |
| Preflight code step | none | **deferred (v2)**; the `code_step` field is accepted and stored but `enabled:false` is enforced until a sandboxed step runner exists (§5) |
| Auth | single local owner cookie | same; Devin's org/enterprise scoping collapses to one workspace |

## 2. HTTP contract — Devin's endpoint names, our scope

Base `/api`. All PROVEN Devin paths (spec Appendix A matrix; 3.10.31 changelog) unless marked
ours. Org prefix `{org}/` is dropped (one workspace). Bodies zod-validated both directions.

| Method + path | Devin evidence | Ours |
|---|---|---|
| `GET /automations` · `POST /automations` · `GET/PUT/DELETE /automations/:id` | matrix | kept; PUT carries `revision` (409 on conflict, ours) |
| `GET /automations/templates` · `GET /automations/schemas` | matrix; 3.10.31 schemas catalogue | kept; schemas = our trigger/event schema registry (Linear events, schedule, webhook) |
| `GET /automations/sparklines` · `GET /automations/tags` | matrix | kept (list page needs both) |
| `POST /automations/:id/trigger` `{prompt?}` → 202 | §17.4 | kept (replaces `/runs` POST) |
| `GET /automations/:id/events?page&since&until&status*&include_message` → `{data, total, has_next}` | App. A events | kept; served from `runs` projection (§4) |
| `GET /automations/:id/invocations` · `/issues` · `/consumption` | matrix | **not served** (Issues/Consumption tabs deleted); 404 |
| `POST /automations/:id/reset-monitor` · `/webhook/regenerate-secret` · `POST /automations/webhook/mint-credentials` | matrix; §9.5 | regenerate + mint kept (webhook trigger); reset-monitor dropped |
| `GET/PUT /automations/:id/code-step/config` · `/code-step/state` · `/code-step/runs/:n` | 3.10.31 | accepted, stored, `enabled` forced false (§5) |
| `GET /automations/linear-user-access` | matrix | kept → returns connected accounts |
| `GET /events?since&automationId&runId` · `GET /events/head` | ours (ARCHITECTURE §7) | additive delta read for live run view |
| `GET /runs/:id` · `GET /runs/:id/parts` · `POST /runs/:id/cancel` | ours (LOOP-RUNTIME §4/§5) | run detail replaces Devin `/sessions/:id` |
| `GET /integrations` · `POST /integrations/linear/connect` · `POST .../code` · `DELETE /integrations/linear` · `GET /integrations/linear/config` | dossier A/D; LINEAR-CONNECTION §8 | Connections page |
| `GET /mcp/servers` · `GET /mcp/registry` · `POST /mcp/installations` · `PUT/DELETE /mcp/installations/:id` · `GET .../credentials` · `PUT/DELETE .../credentials/:key` · `POST .../tools/list` · `PUT .../tools/:name` · `POST .../connect` · `.../disconnect` | 3.10.31 mcp dossier; 3.10.48 ACP verbs | CONNECTORS-PAGE-SPEC §8 |
| `GET /plugins` · `POST /plugins/install` · `POST /plugins/remove` · `GET /plugins/:key/assets` · `GET /plugins/manifest` | 3.10.48 `PLUGINS_*` | packages |
| `POST /hooks/:triggerId` | ours | webhook ingress, `X-Webhook-Secret` / bearer / `secret` query (Devin §9.5 accepts all three) |
| `GET /settings` · `PATCH /settings` · `GET /accounts` · `DELETE /accounts/:id` | ours | General, Accounts |

## 3. Slice map (replaces ARCHITECTURE §2 table)

| Slice | Owns (tables) | Public API | Devin counterpart |
|---|---|---|---|
| `accounts` | `accounts`, `secrets`, `linear_team_mappings` | `list, get, pickForRun, markExpired, health, teams` | user/org identity; `linear-user-access` |
| `linear-connection` | `connect_attempts` | `startChallenge, completeCode, importCookie, LinearClient{sendPrompt, pollTurn, connectMcp, viewer}` | `integrations/linear/*` |
| `automations` | `automations`, `automation_attachments` | `list, get, create, update, remove, duplicate, setEnabled, templates, schemas, sparklines, tags` | `automations/*` CRUD + templates/schemas |
| `triggers` | `triggers`, `trigger_state`, `webhook_credentials` | `upsert, dueAt, advance, mintWebhook, regenerateSecret, verify` | RRULE schedule, webhook mint/regenerate |
| `runs` | `runs`, `run_parts` | `start, cancel, get, list, eventsProjection, recoverOpenRuns, RunExecutor` | `trigger`, `events`, session runtime |
| `connectors` | `mcp_installations`, `mcp_credentials`, `mcp_tool_overrides`, `package`, `package_installation`, `package_connection`, `package_skill` | `mcp.*, plugins.*, integrations.list, gateway.mount` | `mcp/*`, Customize plugins, Connections |
| `events` | `events`, `client_checkpoints` | `append, since, head` | (ours) |

Dependency DAG: `events` ← all; `accounts` ← `linear-connection` ← `connectors`;
`automations` ← `triggers` ← `runs` (← `connectors`). Enforced by `ci/boundaries.json`.

## 4. Runs → Devin events projection (so the copied detail page works unchanged)

LOOP-RUNTIME §1 has eight run states; Devin's events table shows six statuses (DEVIN-PORT-MAP
§4.1). One pure function `eventsProjection(run): Event` in `features/runs/projection.ts`:

| Run state | `status` | `event_message` | Other fields |
|---|---|---|---|
| `queued` | `queued` | trigger label (`Scheduled · Daily at 09:00`) | `trigger_id`, `event_type` |
| `sending`, `polling` | `running` | first `text(phase=answer)` part so far, else trigger label | `devin_session_id = run_id` |
| `waiting` | `running` | `Needs input: <elicitation title>` | — |
| `completed` | `succeeded` | `result_text` first 200 chars | `event_message_parts[]` with Linear issue links as `resource_url` |
| `failed` | `failed` | `error_json.message` (sanitised) | `error_message` |
| `canceled` | `canceled` | `Canceled by <who>` | — |
| `skipped` | `skipped` | reason (`account expired`, `disabled`, `budget`) | — |

Paging, `since/until`, repeated `status` params and `include_message` are implemented over
`runs` with the index `(automation_id, created_at DESC)`. `total` and `has_next` are exact.
The 5 s client poll stays; the additive `/events?since` stream is what the run detail page
uses for live parts (ARCHITECTURE §7). No websockets, same as Devin.

## 5. Preflight code step — accepted, deferred

Devin 3.10.31+ stores `code_step {enabled, runtime: python|node|bash, timeout_seconds 1–300
(default 60), environment {kind: minimal|snapshot}, secret_names[], source}` on the automation,
with runtime contract files `EVENT_FILE / STATE_FILE / LAST_RUN_FILE / OUTPUT_FILE`, output
`{run:true}` / `{run:false, reason}` / `{items[]}`, limits 10/50 items, 64 KiB state, 256 KiB
source/output, 1 MiB logs (DOCUMENTED public automations guide; PROVEN 3.10.31 changelog).

Decision: the server **stores** `code_step` verbatim (so the Devin editor's Advanced card
round-trips) but rejects `enabled:true` with tagged error `PreflightUnavailable` (422) until a
step runner exists. When built, it is one slice `preflight` with a subprocess sandbox
(Seatbelt on macOS, bwrap on Linux — the recovered Devin CLI sandbox design is the reference,
audit §6), the exact file/limit contract above, and `code_step/runs/:n` served from a
`code_step_runs` table. The Devin UI's `Run now` bypasses preflight (DOCUMENTED); we keep that.

## 6. Gateway (connectors slice) — where Devin's MCP runtime lands in one process

Devin: cloud MCP installations are executed by a REMOTE process manager; the desktop has a
second local host (`_cognition.ai/mcp/*` ACP verbs: list/install/remove/connect/toggle/
disconnect, `listTools`, `oauth/authorize`) backed by mcp-go with SecretStorage token store
and a refresh grant (re-server CONNECTOR-BACKEND, AUTH-SESSION). We have **one** runtime:

- `gateway.mount(installation)` hosts each package's server (CONNECTOR-PACKAGES §3.3) and
  proxies each remote installation at `POST /pkg/<short>/mcp`; the URL is what we pass to
  `integrationMcpServerPersonalConnect` (V5).
- Verbs map 1:1 onto Devin's ACP names as HTTP (`connect`, `disconnect`, `toggle` → `PUT
  .../enabled`, `tools/list`, `tools/:name`), so the 3.10.48 UI state machine is unchanged.
- Credentials: write-only table, redaction at the transport layer, `credential_keys` read-back.
- OAuth (v2): authorization-code + PKCE + dynamic registration + refresh grant, exactly the
  mcp-go behaviours recovered (default endpoints `/authorize`, `/token`, `/register`; keep old
  refresh token when the response omits one; `expires_in` → `expires_at`).
- Marketplace: proxy `registry.modelcontextprotocol.io/v0.1` (MARKETPLACE.md recommendation).
  Devin's own 52-plugin catalog (`GetAvailableCascadePlugins`, LIVE 2026-10-12) requires a
  Devin session token and is **not** proxied; its template shape `{title,id,link,description,
  remote{serverUrl}|local{command,args,env}, installationCount, trustLevel, readme}` is the
  model for our own package catalog JSON if we ever publish one.

## 7. Supersession table — ARCHITECTURE.md (T3-derived) vs this document

| Topic | ARCHITECTURE.md 97f6018 | Here | Status |
|---|---|---|---|
| Process, SQLite, slices, tagged errors, migrations, Biome, boundary CI | §0 A1–A3, A6–A8 | unchanged | **kept** |
| Runs as resumable records; recovery on boot; executor loop | §6 | unchanged; projection added (§4) | kept + extended |
| Event log + delta read | §7 | unchanged, now additive beside Devin's `/events` paging | kept |
| HTTP route names | §8 (`/automations/:id/runs`, `/mcp-servers`) | Devin names (§2) | **superseded** |
| Scheduler input | cron presets + 5-field | RRULE + tz, Devin pseudo-types; cron via proven subset adapter | **superseded** |
| MCP slice | `mcp-registry` (servers + probe) | `connectors` (integrations + mcp + plugins + gateway) | **superseded** |
| Templates, schemas, sparklines, tags | absent | served (§2) | added |
| Webhook secret | `X-Automation-Secret` header only | Devin's three carriers (`X-Webhook-Secret`, bearer, `secret` query), minted credentials shown once | **superseded** |
| Manual run | `POST /automations/:id/runs` | `POST /automations/:id/trigger {prompt?}` | **superseded** |
| Preflight | absent | stored, disabled (§5) | added |
| What was taken from t3code (§9 of that doc) | pragmas, migrations shape, TaggedError shape, AUTOINCREMENT cursor | still true; t3code is a code-shape reference only, not the architecture model | reclassified |
| SERVER-SCAFFOLD.md file tree | `features/mcp-registry/` | rename to `features/connectors/` with `gateway.ts`, `mcp/`, `plugins/`, `integrations/` subfolders; everything else stands | amended |

Rule for implementers: when the two documents disagree, this one wins; when this one is
silent, ARCHITECTURE.md applies; when both are silent, Devin's recovered contract applies
before anything T3-shaped.

## 8. Build order and verification

Each arrow is one PR (AGENTS.md "one idea per PR"):

platform + migrations + `events` → `accounts` + `linear-connection` (email-code flow, health)
→ `automations` CRUD with Devin payload shape + templates/schemas → `triggers` (RRULE + tz,
webhook mint) → `runs` executor + events projection → `connectors/mcp` (installations,
credentials, tools, gateway mount, V5 connect) → `connectors/plugins` (package loader,
skills, mirror) → `connectors/integrations` list → `/events?since` delta read → preflight
(stored/disabled) → owner-authored package end to end.

Verification carries over from ARCHITECTURE §10 (in-memory SQLite per slice, `FakeLinearClient`
NDJSON fixtures, executor kill-between-arrows test, scheduler downtime test, boundary CI) plus:

- `projection.test.ts`: every LOOP-RUNTIME state maps to exactly one Devin status; unknown
  states throw, never become `succeeded`.
- Contract tests replay the Devin pages' recorded requests (query keys, `include_message`,
  repeated `status`, no-body `trigger`) against the server and assert the response projections
  the 3.8.20 spec Appendix A lists.
- Gateway tests: `tools/list` reflects allowlist changes per installation; credential values
  never appear in any response body or log line.

## 9. `[3.10.48]` changelog for this document

| When | Landed | Change here |
|---|---|---|
| 2026-10-12 23:47 | re-server `CONNECTOR-BACKEND.md` ACP verb table, registry installer | §6 verb mapping; §2 `connect/disconnect/tools` routes |
| 23:49 | re-server `AUTH-SESSION.md` MCP token store + refresh grant | §6 OAuth v2 behaviours pinned to recovered mcp-go semantics |
| 23:58 | re-server `LIVE-MARKETPLACE-ACCESS-2026-10-12.md` | §6 marketplace decision: public registry proxied, Devin catalog not; template shape recorded |
| open | native outbound call sites, remote webview API capture, Automations remote assets | §2 rows stay on 3.8.20/3.10.31 evidence until the comparison pass lands |
