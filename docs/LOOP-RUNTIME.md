# LOOP-RUNTIME — automation execution engine on the free Linear agent (plan, 2026-10-12)

> Planning deliverable (RESTART §6.3d). No implementation. Specifies how a saved automation
> becomes a Linear Agent conversation and how that conversation is surfaced as a run.
> Verified anchors: MASTER-PLAN §V1–V7, §V9; `linear-loops-decompile` branch
> `live/mcp-system-capture` (`reference/live-agent-protocol-2026-10-12.md`,
> `reference/live-mcp-system-2026-10-12.md`, `reference/linear_agent_client.py`); corpus facts
> KNOWLEDGE §3/§8 and integration map §1/§2/§4/§6 (branch `in-linear-chat-protocol`).
> Account semantics come from `LINEAR-CONNECTION.md`; run UI contract from
> `DEVIN-PORT-MAP.md` §4. Labels: OBSERVED > SOURCE > DESIGN.

## 0. Decisions

| # | Decision | Basis |
|---|---|---|
| R1 | **A run is one Linear `AiConversation`.** Our `runs.conversationId` is minted client-side (UUID v4) before the send; the server's returned id is authoritative and overwrites it. | OBSERVED: client-minted UUIDs accepted (live-agent-protocol "Send message") |
| R2 | **Transport = `aiConversationSendMessage` + `POST /sync/batch` polling.** No WebSocket in v1. Streaming parts are read from `AiConversationTurn.parts` as they land in sync rows. | OBSERVED: `linear_agent_client.py` poll loop; KNOWLEDGE §8 (zero GraphQL subscriptions) |
| R3 | **Linear is the brain and the tool runtime.** We never run inference and never execute a tool the agent called. MCP servers are attached on the Linear side (V5); the server only ensures the attachment exists. | V1, V5, V6 |
| R4 | Run lifecycle has **8 states** (§1); every transition is written to SQLite before any network call, so a restart resumes from the row alone. | MASTER-PLAN §2 "Runs are resumable records" |
| R5 | **Send is never retried automatically.** A timeout after dispatch is "unknown outcome": reconcile by polling the minted conversationId, never resend. Only pre-dispatch failures retry. | Integration map §6 failure table |
| R6 | Concurrency is **per account**: 1 in-flight send at a time, ≤ 3 open conversations polling, ≥ 2 s poll interval, global ≤ 60 sync requests/min/account. Tunable constants, not logic. | DESIGN from V3 cross-IP replay + public rate-limit shape (KNOWLEDGE §7: 600/h unauth, 1,500–2,500/h per user class; `RATELIMITED` = HTTP 400) |
| R7 | Prompt = ProseMirror doc assembled from **template → trigger payload → skill mentions → MCP hint**; the user's saved prompt body is passed through verbatim as the last paragraph(s). | OBSERVED bodyData shape; V7 skill mention node |
| R8 | **Loop parity target = Linear Loops' run view**, not Devin's event table: ordered activities (prompt/text/toolCall/widget/error/elicitation), status header, cancel, follow-up. Devin's table remains the list projection. | SPECS/loops.md "Run view"; DEVIN-PORT-MAP §4 |
| R9 | Elicitations are **never auto-answered**. A run that hits `awaitingInput` pauses as `waiting` and surfaces the question; the user answers from the run detail. | Integration map §4 (decline payload UNVERIFIED) |

## 1. Run lifecycle

```
                    ┌──────────┐  pick account, build prompt   ┌─────────┐  mutation ok  ┌─────────┐
 trigger fires ───▶ │  queued  │ ─────────────────────────────▶│ sending │──────────────▶│ polling │
                    └──────────┘                               └─────────┘               └─────────┘
                       │ no connected account / disabled           │ pre-dispatch error      │ turn status
                       ▼                                           ▼ (retryable, ≤3)         │
                    ┌──────────┐                               back to queued               ├─ completed ──▶ completed
                    │ skipped  │                                   │ post-dispatch timeout   ├─ awaitingInput ▶ waiting ─(answer)─▶ polling
                    └──────────┘                                   ▼                         ├─ error part / status error ▶ failed
                                                               polling (unknown outcome)     ├─ canceled/interrupted ▶ canceled
                                                                                             └─ deadline (30 min) ▶ failed(timeout)
```

| State | Meaning | Terminal | Devin list status (DEVIN-PORT-MAP §4) |
|---|---|---|---|
| `queued` | Row exists; trigger payload + resolved account stored; nothing sent | no | Queued |
| `sending` | Mutation in flight. Written **before** the HTTP call with `conversation_id`, `user_message_id` | no | Running |
| `polling` | Mutation returned `success:true`; `assistant_turn_id`, `first_sync_id` stored; sync/batch loop active | no | Running |
| `waiting` | Assistant turn `awaitingInput` or an `elicitation` part without response | no | Running (badge "Needs input") |
| `completed` | Correlated assistant turn `status:"completed"` | yes | Succeeded |
| `failed` | Turn/conversation `error`, `AiConversationErrorPart`, deadline, or 3 pre-dispatch failures | yes | Failed |
| `canceled` | User cancel confirmed by reconciliation, or turn `canceled`/`interrupted` | yes | Canceled |
| `skipped` | Trigger fired but automation disabled, account not `connected`, or dedupe hit | yes | Skipped |

Rules:
- Every state write is one SQLite transaction and precedes the network action it enables.
  A crash between "wrote `sending`" and "got response" resumes as **polling** against the stored
  `conversation_id`: if sync/batch returns no turn within 60 s of resume, mark `failed(unknown)`;
  never resend (R5).
- `waiting` has its own deadline (24 h) after which the run becomes `failed(no_answer)`;
  the conversation remains continuable from the run detail.
- Terminal rows are immutable except for `follow_up` turns (§8), which create a **new run row**
  with `parent_run_id` and the same `conversation_id`.

## 2. Trigger → prompt templating

The message body is a ProseMirror `doc` (OBSERVED shape). The server builds it in four ordered
blocks; each block is a paragraph list so Linear's own renderer shows it unchanged in the run.

| Block | Source | Content |
|---|---|---|
| 1 Header | runtime | `Automation "<name>" run <shortRunId> · trigger: <kind> · <ISO time>` — one paragraph, lets the user find the conversation inside Linear |
| 2 Trigger payload | trigger | kind-specific fields rendered as `key: value` lines (§2.1); raw webhook body as a fenced `codeBlock` node, truncated at 16 KB with a `[truncated N bytes]` marker |
| 3 Skill mentions | connector packages | one paragraph per injected skill: the V7 mention node `{type:"mention", attrs:{id:<skillId>, label:<title>, kind:"agentSkill"}}` (attrs copied from the captured bodyData; exact attr names are a first-run capture item) |
| 4 User prompt | automation.prompt | the saved ProseMirror doc, nodes appended verbatim; `{{var}}` text tokens substituted (§2.2) |

### 2.1 Trigger payload fields (v1 kinds)

- `schedule`: `scheduled_for`, `fired_at`, `timezone`, `rule` (human form of the schedule).
- `webhook`: `received_at`, `source_ip`, `content_type`, selected headers (allowlist: `X-GitHub-Event`,
  `X-Linear-Event`, `User-Agent`), body (block 2 codeBlock).
- `manual`: `requested_by` (local identity), optional `context` textarea text (Devin "Run now"
  dialog; hidden for recurring schedules per DEVIN-PORT-MAP §4.3).

### 2.2 Variables

`{{trigger.kind}}`, `{{trigger.time}}`, `{{webhook.body.<jsonpath>}}`, `{{run.id}}`,
`{{automation.name}}`. Unknown variable → left verbatim and a `warning` line is written to the
run log; the run still sends. Substitution happens on `text` nodes only; marks are preserved.

### 2.3 Skill injection points for connector packages

A **connector package** = `{id, name, mcpServerUrl?, customHeaders?, skills: [{title, body}]}`
shipped in `src/connectors/*.json`. Enabling a package on an automation (a) ensures its MCP
server is attached on the account (§8) and (b) ensures each skill exists on that account via
`agentSkillCreate(input:{title, body})` (V7), storing `{accountId, packageId, skillId}` in
`account_skills`. Block 3 mentions those ids. Skill bodies are where connector-specific
operating instructions live ("use `search_issues` before `create_issue`…"), so the user's
prompt stays short. Skills are re-created if `agentSkill(id)` returns null at send time.

## 3. Send and poll (the transport, OBSERVED unless marked)

### 3.1 Send
```json
{ "operationName": "AiConversationSendMessage",
  "variables": { "input": {
    "conversationId": "<minted uuid>", "userMessageId": "<minted uuid>",
    "context": [], "bodyData": { "type": "doc", "content": [ ...blocks §2 ] },
    "resume": true, "fallbackMode": "queue" } } }
```
Response `{success, lastSyncId, aiConversation{id}, userMessage{id}, assistantMessage{id}}`.
Store `assistantMessage.id` as `assistant_turn_id` and `lastSyncId` as `first_sync_id`.
GraphQL `errors[]` on HTTP 200 is a failure (integration map §6). `context` stays empty in v1;
entity context (`issueId` etc.) is a v2 trigger feature.

### 3.2 Poll
```json
POST /sync/batch   accept: text/plain
{ "clientDatabaseId": "<per-account uuid, persisted>", "firstSyncId": <first_sync_id>,
  "requests": [ { "indexedKey": "conversationId", "keyValue": "<conversationId>",
                  "modelName": "AiConversationTurn" } ] }
```
NDJSON rows are `AiConversationTurn` objects `{id, role, status, parts[], ...}`. Correlate on
`id == assistant_turn_id` **and** `role == "assistant"`; other rows are ignored (the user turn,
auto-title activity). The Python client matched only on role+status; correlating on id is the
hardening (DESIGN) so a follow-up turn is never mistaken for the first.
`clientDatabaseId` was a fresh UUID per request in the probe; we persist one per account so the
server sees a stable "device" (DESIGN, harmless either way).

### 3.3 Cadence
- First poll 1.5 s after send, then every 2 s while `parts` are changing, backing off to 5 s
  after 30 s without change, capped at 10 s. Each poll row with a changed `parts` hash is
  appended to the run log (§4).
- Terminal detection: turn `status` in `completed` → `completed`; `error` → `failed`;
  `canceled|interrupted` → `canceled`; `awaitingInput` or an unanswered `elicitation` part →
  `waiting`. `pending|active|waiting` keep polling. A completed `text` part is not a completed
  turn (integration map §2).
- Deadline 30 min from `polling` entry → `failed(timeout)`, then one `aiConversationCancel` (§5).

## 4. Run log: streaming and progress surfacing

Every run has an append-only `run_events` log (SQLite). The UI reads it two ways: the Devin
events table for the list (status/message/time) and the Loops-style activity stream for detail.

| `run_events.kind` | Written when | Payload |
|---|---|---|
| `state` | every lifecycle transition | `{from, to, reason?}` |
| `prompt` | after §2 assembly, before send | the final `bodyData` (so the user sees exactly what was sent) |
| `part` | a poll row changes a part (keyed by `part.id`) | the Linear part verbatim: `text` (phase `answer`), `toolCall` (`name`, `args`, `result?`), `widget` (EntityCard), `reasoning`, `error`, `elicitation`, `ack` |
| `warning` | templating gaps, truncation, backoff, account switch | `{code, message}` |
| `cancel` | user cancel requested / confirmed | `{requestedBy, confirmed}` |
| `follow_up` | §8 continuation sent | `{runId of child}` |

- Parts are **upserted by `part.id`** in a projection table `run_parts(run_id, part_id, type,
  position, body)` so the detail view renders ordered activities without replaying the log;
  `discarded` status deletes the projection row (integration map §2 reducer rules).
- Text parts are stored as ProseMirror docs and rendered with the same renderer as the prompt
  editor; no markdown conversion.
- `toolCall` with `name: InvokeMcpTool` is labeled `<server.name> · <tool.name>` in the stream
  (OBSERVED args shape `{tool:{name}, server:{name,title,integrationId}}`).
- **Progress to the UI**: run list polls 5 s only while any row is `queued|sending|polling|waiting`
  (Devin predicate, DEVIN-PORT-MAP §4.2); run detail polls `run_parts` at 2 s while non-terminal.
  No WebSocket in v1; the poll cadence already matches the sync/batch cadence.
- `summary` on the run row = plain text of the first 280 chars of the last `text` part;
  shown as the Devin event message column.

## 5. Cancellation

- User `Cancel` on a non-terminal run → write `cancel{confirmed:false}`, stop the poll loop for
  that run, call `mutation AiConversationCancel($id: String!) { aiConversationCancel(id: $id)
  { success aiConversation { id } } }` (SOURCE, S3), then **reconcile**: one more sync/batch
  read. Turn `canceled|interrupted` → `canceled` + `cancel{confirmed:true}`. Turn already
  `completed` → `completed` (cancel lost the race; say so in the log). Anything else → keep
  polling up to 60 s, then `canceled` with warning `unconfirmed`. Loss of the cancel response is
  not proof of cancellation (integration map §6).
- `queued` runs cancel locally with no network call → `canceled`.
- `sending` runs cannot be canceled until the mutation returns; the UI disables the button for
  that window (typically < 2 s).
- Disabling an automation cancels its `queued` runs and leaves `polling` runs to finish.
- Server shutdown does **not** cancel anything: open runs resume as `polling` on restart (R4).

## 6. Retry and idempotency

| Phase | Failure | Policy |
|---|---|---|
| Trigger → `queued` | duplicate fire (cron tick replay, webhook redelivery) | `runs.dedupe_key` UNIQUE = `automationId:triggerKind:occurrence` (cron: scheduled instant; webhook: `X-Request-Id`/`X-GitHub-Delivery` or SHA-256 of body+minute; manual: client-supplied uuid). Insert conflict → no new run, HTTP 200 with existing run id |
| `queued` → `sending` | no connected account, MCP ensure fails, skill ensure fails | pre-dispatch: retry at 10 s, 60 s, 300 s (3 attempts) then `failed(pre_dispatch)`; account-missing → `skipped` immediately |
| `sending` | connect/DNS/TLS error **before bytes sent** | retryable with the **same** `conversationId`/`userMessageId` (Linear accepted client-minted ids; a re-send of identical ids is the idempotency key — UNVERIFIED that the server dedupes, so this is used only when the first request provably never left) |
| `sending` | timeout / 5xx **after** request sent | not retried; → `polling` on the minted `conversationId`; no turn in 60 s → `failed(unknown)` |
| `polling` | `RATELIMITED` (HTTP 400) | back off to `X-RateLimit-Requests-Reset`, keep state |
| `polling` | network error | exponential 2 s → 30 s, indefinitely within the 30 min deadline |
| any | auth rejection | `failed(auth)` + trigger account health tick (LINEAR-CONNECTION §4) |

User-initiated **Retry** on a failed run creates a **new run** with a fresh `conversationId`
and `parent_run_id`; it never reuses a conversation that may have partially executed tools.

## 7. Concurrency policy (our pacing reality)

The free agent is one user's chat. Nothing observed says how many concurrent conversations a
user may run; the public API's per-user budgets (KNOWLEDGE §7) are the only published shape.
The policy below is DESIGN, tuned to look like one busy human, and lives in one constants file.

| Knob | Default | Why |
|---|---|---|
| `SEND_CONCURRENCY_PER_ACCOUNT` | 1 | one mutation in flight per identity; sends are serialized through a per-account queue |
| `MIN_SEND_GAP_MS` | 3 000 | a human does not send two prompts in the same second |
| `OPEN_RUNS_PER_ACCOUNT` | 3 | max conversations in `polling` or `waiting` being polled at once; extra runs wait in `queued` |
| `POLL_MIN_INTERVAL_MS` | 2 000 (→ 10 000 backoff) | matches the probe client; backoff per §3.3 |
| `SYNC_REQUESTS_PER_MIN_PER_ACCOUNT` | 60 | hard token bucket across all runs on the account |
| `GRAPHQL_REQUESTS_PER_HOUR_PER_ACCOUNT` | 600 | below the lowest published tier (unauth 600/h); health ticks and MCP/skill ensures count against it |
| `GLOBAL_OPEN_RUNS` | 12 | process-wide cap so a burst of webhooks cannot open hundreds of pollers |
| `RUN_DEADLINE_MS` | 1 800 000 | §3.3 |

- The scheduler tick computes the due set, inserts `queued` rows (dedupe §6), and a per-account
  worker drains its queue respecting the knobs. Fairness across automations on one account is
  FIFO by `queued_at`.
- On `RATELIMITED` from any call, the account's bucket is drained until `X-RateLimit-Requests-Reset`;
  runs stay in their state; a `warning{rate_limited}` is logged on each affected run.
- Accounts multiply budget linearly (D5 in LINEAR-CONNECTION). Unpinned automations spread over
  accounts by `in_flight_runs ASC`.
- Adaptive guard: two `RATELIMITED` responses within 10 min halve `OPEN_RUNS_PER_ACCOUNT` and
  `SYNC_REQUESTS_PER_MIN_PER_ACCOUNT` for that account for 1 h; the settings row shows
  `Pacing reduced` (copy reuses the captured warning banner).
- Observability: `GET /api/runs/pacing` returns per-account counters; shown nowhere in the UI
  except that banner (no invented dashboards).

## 8. MCP tool attachment per automation

An automation stores `mcp_servers: [{registryId}]` (the MCP connectors registry from
`facts/mcp-verification.md`: URL, optional one private header). Attachment is **on the Linear
side, per account** (V5), so the runtime keeps a join table
`mcp_attachments(account_id, registry_id, integration_id, server_url_hash, attached_at, state)`.

`ensureMcp(account, registryEntry)` runs in `queued → sending` (before the prompt is sent):

1. Lookup `(account_id, registry_id)`; if present and `server_url_hash` matches → done.
2. Else `mutation IntegrationMcpServerPersonalConnect($serverUrl: String!, $customHeaders:
   [McpServerCustomHeaderInput!]) { integrationMcpServerPersonalConnect(serverUrl: $serverUrl,
   customHeaders: $customHeaders) { integration { id } lastSyncId } }` (OBSERVED without
   headers; `customHeaders` shape SOURCE from the bundle). Store `integration.id`.
3. If the server needs OAuth (`discoverMcpOAuth` → `needs-auth`), the run is `skipped` with
   reason `mcp_needs_auth` and the connectors page shows the captured `needs auth` state
   (`facts/mcp-verification.md` five states). OAuth completion is a v2 item; v1 supports
   no-auth and bearer-header servers only.
4. URL or header change in the registry → `server_url_hash` mismatch → reconnect via step 2 and
   keep the old integration (disconnect API `reconnectMcpIntegration` is a v2 item).

Prompt coupling: block 3 (§2) adds one paragraph `Tools available: <server names>` only when
`mcp_servers` is non-empty, so the agent routes to the right server (OBSERVED: natural-language
routing across tools works). Tool calls appear as `InvokeMcpTool` parts in the run log (§4);
the server never calls the MCP server itself for a run.

Account selection consequence (LINEAR-CONNECTION §5): with unpinned automations, prefer
accounts already attached to all required servers; otherwise attach on the chosen account.
The number of personal integrations per account is uncapped as far as observed.

### 8.1 Follow-up (continuation)

From run detail, `Send follow-up` creates a child run (`parent_run_id`, same `conversation_id`,
new `user_message_id`), sends with `resume:true` (V4 multi-turn), and polls its own assistant
turn id. Child runs appear in the list as separate rows linked to the parent. Answering an
elicitation on a `waiting` run uses `aiConversationSendElicitationResponses` with exactly one
`{elicitationId, <data wrapper>}` (SOURCE S6); decline is not offered until a decline payload is
observed live.

## 9. Loop parity — preserved vs exceeded

Linear's Loop (`WorkflowDefinition`, KNOWLEDGE §3) is the reference. Metered on their side; ours
rides the free chat substrate (V1, V9). Column 3 says what we do about each Loop property.

| Loop property (SOURCE) | Ours | Verdict |
|---|---|---|
| Run = `AiConversation` with `initialSource:workflow`, `isWorkflowRun` | Run = `AiConversation` from `directChat` with the §2 header paragraph | **Parity** in behavior; the `workflow` source flag is never sent (UNVERIFIED acceptance; integration map §4) |
| Trigger: Schedule (structured `{type, interval, hour, timezone, daysOfWeek}`) | Schedule via the Devin RRULE editor (DEVIN-PORT-MAP §5.2), run server-side by our cron tick | **Parity** (same expressiveness, different serializer) |
| Trigger: entity events (Issue/Project/… × 12 events, activationMode, conditions) | v1: none. v2: pollers + optional agent `SubscribeToEvent` (V6, research) | **Gap, deliberate** (MASTER-PLAN §2 v1 scope) |
| Trigger: Chat (@mention in a channel) | not planned | **Gap** |
| Trigger: webhook / manual | webhook URL per automation + Run now | **Exceeds** (Loops have no inbound webhook) |
| Prompt (ProseMirror doc), skills by mention | same doc, plus variables and connector-package skill injection (§2) | **Exceeds** |
| Activities / capabilities list; trusted sources; code access | agent built-ins come free (V6); MCP per automation (§8); no coding sessions (metered) | **Parity minus coding** |
| MCP on Loops (`workflowDefinitionMcpApprovalUpdate`, approval model) | personal MCP attach per account; no approval model (upstream tools act under the session, advertised in UI) | **Parity, weaker policy** |
| Run view: ordered activities, status header, cancel, follow-up | §4 projection, §5 cancel, §8.1 follow-up | **Parity** |
| Elicitations (`awaitingInput`) | `waiting` state + answer from run detail | **Parity** (decline pending) |
| Drafts + publish | editor saves directly (Devin model) | **Gap, accepted** |
| Usage/cost per run (`loopRunStats`, `freeLoopCreditUsd`) | cost is `known:false`, always; we show duration and part counts only | **Exceeds on price ($0), gap on accounting** |
| Notifications (`agentAutomationFailedToRun` …) | run-list status only in v1 | **Gap** (v2: local notifications) |
| Multi-account budget spread | §7 | **Exceeds** |
| Sub-agents (`SpawnSubagent`) | appear as parts; sub-conversations not polled separately in v1 | **Parity-lite** |

Net: every Loop a user could define with Schedule or manual triggers runs here for free with
the same agent, same tools, same run transcript. Entity-event Loops are the v2 line.

## 10. Storage (additions to the server schema)

```sql
CREATE TABLE runs (
  id                TEXT PRIMARY KEY,
  automation_id     TEXT NOT NULL REFERENCES automations(id),
  account_id        TEXT REFERENCES accounts(id),           -- chosen at queued→sending
  parent_run_id     TEXT REFERENCES runs(id),               -- follow-up / retry lineage
  state             TEXT NOT NULL CHECK (state IN ('queued','sending','polling','waiting',
                                                   'completed','failed','canceled','skipped')),
  state_reason      TEXT,                                   -- timeout|auth|unknown|pre_dispatch|…
  trigger_kind      TEXT NOT NULL,                          -- schedule|webhook|manual
  trigger_payload   TEXT NOT NULL,                          -- JSON, redacted headers
  dedupe_key        TEXT NOT NULL UNIQUE,
  conversation_id   TEXT NOT NULL,                          -- minted before send
  user_message_id   TEXT NOT NULL,
  assistant_turn_id TEXT, first_sync_id INTEGER,
  summary           TEXT,
  queued_at TEXT NOT NULL, sent_at TEXT, ended_at TEXT, deadline_at TEXT
);
CREATE INDEX runs_open ON runs(account_id, state) WHERE state IN ('sending','polling','waiting');
CREATE TABLE run_events (
  id INTEGER PRIMARY KEY, run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  at TEXT NOT NULL, kind TEXT NOT NULL, payload TEXT NOT NULL );
CREATE TABLE run_parts (
  run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  part_id TEXT NOT NULL, type TEXT NOT NULL, position INTEGER NOT NULL, body TEXT NOT NULL,
  PRIMARY KEY (run_id, part_id) );
CREATE TABLE mcp_attachments (
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  registry_id TEXT NOT NULL, integration_id TEXT NOT NULL, server_url_hash TEXT NOT NULL,
  attached_at TEXT NOT NULL, state TEXT NOT NULL, PRIMARY KEY (account_id, registry_id) );
CREATE TABLE account_skills (
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  package_id TEXT NOT NULL, skill_id TEXT NOT NULL, body_hash TEXT NOT NULL,
  PRIMARY KEY (account_id, package_id) );
```
Retention: `run_events` older than 90 days are deleted nightly; `runs` and `run_parts` are kept.

## 11. Core API surface (typed functions; HTTP and the future MCP facade both call these)

```ts
// src/core/runs.ts
fireRun(input: {automationId; trigger: TriggerPayload; dedupeKey: string}): Promise<{runId; deduped: boolean}>
cancelRun(runId: string): Promise<RunState>                       // §5
retryRun(runId: string): Promise<{runId}>                          // §6, new conversation
followUp(runId: string, body: ProseMirrorDoc): Promise<{runId}>    // §8.1
answerElicitation(runId: string, elicitationId: string, data: ElicitationData): Promise<RunState>
getRun(runId: string): Promise<RunDetail>                          // row + run_parts projection
listRuns(q: {automationId?; states?; since?; until?; page}): Promise<Page<RunRow>>   // Devin table
// src/core/runtime/worker.ts (one per account, started by the scheduler)
drainQueue(accountId): void · pollOpenRuns(accountId): void · resumeOpenRuns(): void  // at boot
// src/core/mcp.ts
ensureMcp(accountId, registryId): Promise<integrationId>           // §8
ensureSkills(accountId, packageId): Promise<skillId[]>             // §2.3
```

HTTP: `POST /api/automations/:id/run` (manual, body `{context?, requestId}`) ·
`POST /api/hooks/:automationId/:secret` (webhook) · `GET /api/runs` · `GET /api/runs/:id` ·
`POST /api/runs/:id/cancel` · `POST /api/runs/:id/retry` · `POST /api/runs/:id/follow-up` ·
`POST /api/runs/:id/elicitation`. All bodies zod-validated; same-origin write header.

## 12. UNVERIFIED items the first implementation run must capture (blockers marked ★)

| # | Item | How it is closed |
|---|---|---|
| ★V1 | Correlating on `assistant_turn_id` in sync/batch rows (probe matched role+status only) | First live run logs the full NDJSON; confirm `id` equals `assistantMessage.id` |
| ★V2 | Skill mention node attrs in `bodyData` (V7 says "slash-mention inserts a mention node") | Capture one skill-mention send from the web app; pin attrs in `src/linear/prompt.ts` |
| V3 | Server-side dedupe of a re-sent identical `conversationId`/`userMessageId` | Not relied upon (§6); observe opportunistically |
| V4 | Rate-limit shape on `client-api` (public docs cover `api.linear.app`) | Record headers on every response for the first week; tune §7 knobs |
| V5 | Concurrent open conversations per account tolerated | Start at 3 (§7); raise only after a week without `RATELIMITED` |
| V6 | `customHeaders` acceptance on `integrationMcpServerPersonalConnect` | First bearer-auth connector; else v1 ships no-auth servers only |
| V7 | Elicitation decline payload | Not offered until observed (R9) |
| V8 | `awaitingInput` turn status vs `elicitation` part without response | Treat either as `waiting`; refine after first observation |
| V9 | Sub-agent conversations (`SpawnSubagent`) visibility via the parent's turn rows | Observe; v2 may poll child conversations |

## 13. Implementation order (after owner approval; one PR each)

1. `runs`/`run_events`/`run_parts` schema + `fireRun` + per-account worker with manual trigger
   only, using an account imported by cookie paste (LINEAR-CONNECTION §10 step 1). Tests: state
   transitions written before network, crash-resume from `sending`, dedupe conflict, terminal
   detection on fixture NDJSON. Closes V1.
2. Run list + run detail wired to the Devin projections (DEVIN-PORT-MAP §4); CU artifact.
3. Cron trigger via the existing scheduler tick; webhook trigger with secret URL and dedupe.
4. Cancel + reconcile; Retry; follow-up; elicitation answer (`waiting`).
5. `ensureMcp` + `mcp_attachments`; InvokeMcpTool labeling in the stream. Closes V6.
6. Connector packages + `ensureSkills` + block-3 mentions. Closes V2.
7. Pacing knobs, `RATELIMITED` handling, adaptive guard, `Pacing reduced` banner. Closes V4/V5.
