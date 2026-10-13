# ARCHITECTURE — the server (plan, 2026-10-12)

> Planning deliverable (RESTART §6.3a). No implementation. Governs `server/`.
> RESTART §3 chose the shape; this document makes it implementation-ready.
> Companion: [SERVER-SCAFFOLD.md](SERVER-SCAFFOLD.md) (file tree skeleton).
> Evidence: MASTER-PLAN §V1–V10, LINEAR-CONNECTION D1–D7, t3code
> `apps/server/src/{persistence,orchestration-v2}` (read 2026-10-12 from
> `pingdotgg/t3code` main), cal.com "Engineering in 2026 and beyond",
> Linear "Rebuilding delta sync read path".

## 0. Decisions

| # | Decision | Basis |
|---|---|---|
| A1 | One Node ≥22 process, one SQLite file via built-in `node:sqlite` (WAL, `busy_timeout`, `foreign_keys`). No ORM, no driver dependency. | t3code `Sqlite.ts` pragmas; root app has zero runtime deps today |
| A2 | Seven vertical slices under `server/src/features/`. A slice exports only `index.ts`. Cross-slice imports of anything else fail CI. | cal.com `packages/features` + lint-enforced boundary |
| A3 | Every failure crossing a slice boundary is a `TaggedError` subclass with a string `_tag`, a `kind`, and a stable `status`. Route handlers map by `_tag`, never by message. | Effect `Schema.TaggedError` shape (t3code `persistence/Errors.ts`) |
| A4 | Runs are resumable records. A run holds `conversationId` + `syncCursor`; restart re-polls open runs. Linear owns the conversation state. | MASTER-PLAN §2 "Runs are resumable records" |
| A5 | One append-only `events` table with a global `seq` (AUTOINCREMENT). Clients checkpoint on `seq` and replay deltas. No projections, no CRDTs, LWW. | Linear sync log; t3code `001_OrchestrationEvents` shape without the projections |
| A6 | Repository per slice is the only code that knows SQL. Services take repositories by constructor. DTOs validated with zod at HTTP in/out. | cal.com repository + DTO rule |
| A7 | Migrations are numbered TS files, statically imported, run at startup inside one transaction, forward-only. | t3code `Migrations.ts` |
| A8 | Biome for lint+format. Boundary rule enforced by `ci/check-boundaries.mjs` (no plugin dependency) and mirrored in Biome `noRestrictedImports`. | RESTART §3 Biome; cal.com |
| A9 | Scheduler is one `setInterval` tick (30 s) with per-trigger watermarks. Idempotent: compute due set → insert run → advance watermark in one transaction. | MASTER-PLAN §2 "Idempotent triggers" |
| A10 | What we did NOT take from t3code: Effect runtime, event sourcing + projections, command receipts, provider adapters registry. Our brain is Linear; there is one adapter. | RESTART §3 "take the shape, not the event log" |

## 1. Process shape

```
server/src/main.ts            composition root: config → db → repos → services → http → scheduler
  ├─ platform/sqlite.ts       open file, pragmas, run migrations, expose `db`
  ├─ platform/http.ts         node:http router, zod body parsing, error → status mapping
  ├─ platform/clock.ts        injectable now()/setInterval (tests use a fake)
  ├─ platform/secrets.ts      encrypt/decrypt with keychain or 0600 key file (LINEAR-CONNECTION D6)
  └─ features/<slice>/        see §2
```

Request path: `http.ts` → route table (one file per slice, `routes.ts`) → zod parse → service
method → repository → SQLite. Services never import `node:http` or `node:sqlite`. Routes never
import repositories. The scheduler and the webhook receiver are the only non-HTTP entry points
and they call the same `runs` service the routes call (MASTER-PLAN §2 "open abstraction": the
future MCP facade is a third caller of the same services).

Startup order is fixed and total: open db → migrate → `runs.recoverOpenRuns()` → start http →
start scheduler tick. If any step fails the process exits non-zero; no half-started server.

## 2. Slice map

Each slice folder has exactly this shape. Missing files are allowed; extra top-level files are
not.

```
features/<slice>/
  index.ts         PUBLIC API — the only importable file from outside the slice
  routes.ts        thin handlers: parse → service → DTO → status (imports index.ts of own slice)
  service.ts       use cases; takes repos + other slices' public APIs via constructor
  repository.ts    all SQL for this slice's tables; returns rows typed as domain records
  schema.ts        zod DTOs (request/response); domain types derived with z.infer
  errors.ts        TaggedError subclasses owned by this slice
  <slice>.test.ts  unit tests against in-memory sqlite (`:memory:` + same migrations)
```

| Slice | Owns (tables) | Public API (`index.ts` exports) | Depends on |
|---|---|---|---|
| `accounts` | `accounts`, `secrets` | `AccountsService { list, get, pickForRun(pin?) , markExpired, health }`, `AccountDto`, `AccountNotFound`, `NoConnectedAccount` | `platform/secrets` |
| `linear-connection` | `connect_attempts` | `LinearConnectionService { startChallenge, completeCode, importCookie }`, `LinearClient { sendPrompt, pollTurn, connectMcp, viewer }`, `LinearAuthExpired`, `LinearRateLimited`, `LinearProtocolError` | `accounts` |
| `automations` | `automations`, `automation_mcp_servers` | `AutomationsService { list, get, create, update, remove, duplicate, setEnabled }`, `AutomationDto`, `AutomationNotFound`, `RevisionConflict`, `InvalidDefinition` | `mcp-registry` (validate refs), `events` |
| `triggers` | `triggers`, `trigger_state` | `TriggersService { listFor, upsert, remove, dueAt(now), advance, webhookLookup }`, `TriggerDto`, `TriggerNotFound`, `WebhookSecretMismatch`, `InvalidCron` | `automations`, `events` |
| `runs` | `runs`, `run_parts` | `RunsService { start, cancel, get, list, recoverOpenRuns }`, `RunExecutor`, `RunDto`, `RunNotFound`, `RunNotActive`, `RunFailed` | `automations`, `accounts`, `linear-connection`, `mcp-registry`, `events` |
| `mcp-registry` | `mcp_servers` | `McpRegistryService { list, save, remove, probe, ensureConnected(account, serverId) }`, `McpServerDto`, `McpServerNotFound`, `McpProbeFailed` | `linear-connection` (V5 connect), existing `mcp/` client code moves here |
| `events` | `events`, `client_checkpoints` | `EventsService { append, since(seq, filter), head }`, `Event`, `EventKind` | nothing (leaf) |

Dependency graph is a DAG: `events` ← everything; `accounts` ← `linear-connection` ← `mcp-registry`;
`automations` ← `triggers` ← `runs`. `runs` is the only slice allowed to depend on five others
because it is the orchestration seam. A new edge requires a one-line entry in
`ci/boundaries.json` (see §4), which makes graph growth visible in review.

**Settings** is not a slice: General preferences are two rows in a `settings` KV table owned by
`platform/`, read through `platform/settings.ts`. Linear connection, MCP connectors and Accounts
settings pages are UI over the three slices above.

## 3. SQLite schema

One file: `$DATA_DIR/automations.sqlite`. Pragmas at open: `journal_mode=WAL`,
`busy_timeout=5000`, `foreign_keys=ON`, `journal_size_limit=33554432`. All ids are UUIDv7
strings (sortable). All timestamps are ISO-8601 UTC text. JSON columns end in `_json` and are
zod-validated on read; a decode failure is a `PersistenceDecodeError`, never a silent default.

```sql
-- accounts (slice: accounts)
CREATE TABLE accounts (
  id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE,
  linear_user_id TEXT NOT NULL, linear_user_account_id TEXT NOT NULL,
  linear_organization_id TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('connected','expired','disabled')),
  last_health_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE secrets (                          -- write-only; D6
  account_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  cipher_text BLOB NOT NULL, key_id TEXT NOT NULL, updated_at TEXT NOT NULL);

-- linear-connection
CREATE TABLE connect_attempts (
  id TEXT PRIMARY KEY, email TEXT NOT NULL, client_id TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('challenged','completed','failed','expired')),
  error TEXT, created_at TEXT NOT NULL, expires_at TEXT NOT NULL);

-- automations
CREATE TABLE automations (
  id TEXT PRIMARY KEY, revision INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 1,
  prompt_json TEXT NOT NULL,                    -- ProseMirror doc (V2 bodyData)
  account_pin TEXT REFERENCES accounts(id) ON DELETE SET NULL,
  model_note TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE automation_mcp_servers (
  automation_id TEXT NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  mcp_server_id TEXT NOT NULL REFERENCES mcp_servers(id) ON DELETE CASCADE,
  PRIMARY KEY (automation_id, mcp_server_id));
```

```sql
-- triggers
CREATE TABLE triggers (
  id TEXT PRIMARY KEY,
  automation_id TEXT NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('cron','webhook','manual')),
  config_json TEXT NOT NULL,        -- cron: {expr, tz, preset?}  webhook: {secret_hash}  manual: {}
  enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX idx_triggers_automation ON triggers(automation_id);
CREATE TABLE trigger_state (                    -- watermark per trigger (A9)
  trigger_id TEXT PRIMARY KEY REFERENCES triggers(id) ON DELETE CASCADE,
  last_fired_at TEXT, next_due_at TEXT, consecutive_failures INTEGER NOT NULL DEFAULT 0);
CREATE INDEX idx_trigger_state_due ON trigger_state(next_due_at);

-- runs
CREATE TABLE runs (
  id TEXT PRIMARY KEY,
  automation_id TEXT NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  automation_revision INTEGER NOT NULL,         -- definition pinned at start
  trigger_id TEXT REFERENCES triggers(id) ON DELETE SET NULL,
  trigger_kind TEXT NOT NULL,                   -- copied; survives trigger deletion
  account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('queued','sent','polling','completed','failed','cancelled')),
  conversation_id TEXT, user_message_id TEXT, assistant_message_id TEXT,
  sync_cursor TEXT,                             -- Linear lastSyncId / part cursor (A4)
  attempt INTEGER NOT NULL DEFAULT 1,
  error_tag TEXT, error_json TEXT,              -- serialized TaggedError on failure
  result_text TEXT,
  created_at TEXT NOT NULL, started_at TEXT, ended_at TEXT);
CREATE INDEX idx_runs_automation_created ON runs(automation_id, created_at DESC);
CREATE INDEX idx_runs_open ON runs(status) WHERE status IN ('queued','sent','polling');
CREATE TABLE run_parts (                        -- Linear turn parts, append-only
  run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  part_type TEXT NOT NULL,                      -- prompt|text|toolCall|widget (V6)
  part_json TEXT NOT NULL, received_at TEXT NOT NULL,
  PRIMARY KEY (run_id, position));
```

```sql
-- mcp-registry
CREATE TABLE mcp_servers (
  id TEXT PRIMARY KEY, revision INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL, url TEXT NOT NULL,
  transport TEXT NOT NULL CHECK (transport IN ('http','stdio')),
  headers_cipher BLOB,                          -- write-only; same key as secrets
  last_probe_json TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE mcp_account_links (                -- V5 personal connect, per account
  mcp_server_id TEXT NOT NULL REFERENCES mcp_servers(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  linear_integration_id TEXT NOT NULL, connected_at TEXT NOT NULL,
  PRIMARY KEY (mcp_server_id, account_id));

-- events (append-only log; A5)
CREATE TABLE events (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,                           -- 'run.started' | 'run.part' | 'automation.updated' ...
  automation_id TEXT, run_id TEXT,
  payload_json TEXT NOT NULL, occurred_at TEXT NOT NULL);
CREATE INDEX idx_events_automation_seq ON events(automation_id, seq);
CREATE INDEX idx_events_run_seq ON events(run_id, seq);
CREATE TABLE client_checkpoints (               -- optional: server-side memory of a client's cursor
  client_id TEXT PRIMARY KEY, last_seq INTEGER NOT NULL, updated_at TEXT NOT NULL);

-- platform
CREATE TABLE settings (key TEXT PRIMARY KEY, value_json TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL);
```

### 3.1 Migrations strategy

- `server/src/platform/migrations/NNN_name.ts` exports `{ version, name, up(db) }`. `up` is
  plain `db.exec(sql)`. No `down`: forward-only, like t3code.
- `platform/migrations/index.ts` statically imports every file into an ordered array. A
  missing or duplicated version number fails a unit test, not production.
- Runner: `BEGIN IMMEDIATE` → for each migration with `version > max(schema_migrations)`
  run `up` and insert the row → `COMMIT`. One transaction for the whole batch; a failure rolls
  everything back and the process exits.
- Schema changes to live tables use the SQLite 12-step recipe (create new → copy → drop →
  rename) inside the migration; never `ALTER` that silently loses a constraint.
- Tests build every database from the migration list, never from a schema dump, so the
  migration path is exercised on every test run.
- Data repairs (like t3code's `Canonicalize*`/`Backfill*`) are ordinary migrations with a test.

### 3.2 Retention

`events` and `run_parts` grow unbounded by design (cheap to write). A nightly job in `events`
deletes `events` older than 30 days whose `run_id` is terminal, and deletes `run_parts` for
runs older than 90 days, keeping `runs.result_text`. Clients whose checkpoint predates the
oldest retained `seq` receive `410 CheckpointTooOld` and re-bootstrap (Linear's full-bootstrap
case). Both windows are `settings` keys.

## 4. Public-API-per-slice rule and enforcement

**Rule.** Code outside `features/<slice>/` may import only `features/<slice>/index.ts`.
Inside a slice, files import each other freely. `platform/*` imports no slice. `main.ts`
imports every `index.ts` and wires constructors. `index.ts` re-exports services, DTO types,
zod schemas, and error classes — never repositories, never SQL.

**Enforcement, two layers, zero plugins:**

1. `ci/check-boundaries.mjs` (run by `ci/check-src.sh` before `tsc`). It walks
   `server/src/**/*.ts`, parses `import ... from '...'` and `import('...')` with a regex over
   static specifiers, resolves relative paths, and fails with file:line when:
   - a file under `features/A/` imports `features/B/<anything but index.ts>`;
   - a file under `platform/` imports `features/`;
   - an edge `A → B` is not listed in `ci/boundaries.json` (`{"runs":["automations","accounts",...]}`);
   - a slice folder contains a top-level file not in the allowed set (§2).
   Dynamic imports with non-literal specifiers are rejected outright.
2. Biome `linter.rules.style.noRestrictedImports` with the pattern
   `"**/features/*/!(index).ts"` for editor feedback. Biome is the mirror; the script is the gate.

**Test.** `ci/check-boundaries.test.mjs` feeds the checker a fixture tree with one of each
violation and asserts each is reported. The checker itself is ~80 lines and has no deps.

**DTOs.** Repositories return domain records (`Run`), services return domain records, routes
convert to `RunDto` via `schema.ts` and `zod.parse` the *response* too ("better to fail than
return something wrong"). Database row shape never reaches the client; a column rename is a
repository-only change.

## 5. Error taxonomy (tagged errors)

One base class in `platform/errors.ts`; every slice subclasses it in its own `errors.ts`.
No `throw new Error(string)` anywhere under `features/` (Biome `noThrowLiteral` + a grep in
`check-src.sh` for `new Error(` under `server/src/features`).

```ts
export abstract class TaggedError<Tag extends string> extends Error {
  abstract readonly _tag: Tag;
  abstract readonly kind: 'not_found' | 'conflict' | 'invalid' | 'auth' | 'upstream' | 'rate_limited' | 'persistence' | 'internal';
  readonly status: number;        // derived from kind: 404 409 400 401 502 429 500 500
  readonly retryable: boolean;    // upstream + rate_limited + persistence(sql busy) = true
  readonly context: Record<string, string | number>;   // ids only, never secrets
  toJSON(): { _tag; kind; message; context }           // stored in runs.error_json
}
```

| Slice | `_tag` | kind | When |
|---|---|---|---|
| platform | `PersistenceSqlError` | persistence | SQLITE_* raised; `operation` in context |
| platform | `PersistenceDecodeError` | persistence | `_json` column fails zod |
| platform | `ValidationError` | invalid | request body fails zod; `issues` summarized |
| accounts | `AccountNotFound` | not_found | |
| accounts | `NoConnectedAccount` | conflict | run needs an account; none `connected` |
| linear-connection | `LinearAuthExpired` | auth | 401 from client-api → marks account `expired` (D4) |
| linear-connection | `LinearRateLimited` | rate_limited | 429; `retryAfterMs` in context |
| linear-connection | `LinearProtocolError` | upstream | unexpected GraphQL/sync shape; `operation` |
| linear-connection | `ChallengeFailed` | upstream | Turnstile/challenge mutation rejected (D3) |
| automations | `AutomationNotFound`, `RevisionConflict`, `InvalidDefinition` | not_found / conflict / invalid | optimistic concurrency on `revision` |
| triggers | `TriggerNotFound`, `InvalidCron`, `WebhookSecretMismatch` | not_found / invalid / auth | |
| runs | `RunNotFound`, `RunNotActive`, `RunFailed` | not_found / conflict / upstream | `RunFailed.cause` wraps the tagged error that ended the run |
| mcp-registry | `McpServerNotFound`, `McpProbeFailed`, `McpConnectFailed` | not_found / upstream / upstream | V5 connect mutation failed |
| events | `CheckpointTooOld` | conflict (410) | client `since` < oldest retained `seq` |

Rules: services return normally or throw a `TaggedError`; `http.ts` catches, logs `_tag` +
`context`, and writes `{error: err.toJSON()}` with `err.status`. Anything that is not a
`TaggedError` is a defect: logged with stack, answered `500 {error:{_tag:'Internal'}}`, and
counted. Retries happen in exactly one place (`RunExecutor`, §6) and only when `retryable`.

## 6. Run executor: trigger → conversation with Linear Agent → checkpointed run log

A run is a conversation with Linear's Agent (free, V1). Linear holds the authoritative
conversation; our `runs` row is a resumable pointer into it plus a local copy of the parts
for the UI. There is one state machine, in `features/runs/executor.ts`:

```
queued ──send──▶ sent ──first part──▶ polling ──turn completed──▶ completed
   │               │                     │
   │               └──retryable error────┤──non-retryable / attempts>3──▶ failed
   └──cancel───────────────────────────────┴──cancel (AiConversationCancel)──▶ cancelled
```

Every arrow is one SQL transaction that (a) updates `runs`, (b) appends to `run_parts` if a
part arrived, (c) appends one `events` row. The transaction is the checkpoint. If the
process dies between arrows, the row still says exactly where to resume.

### 6.1 Steps

1. **Enqueue** (`RunsService.start(automationId, triggerId, kind)`). Load the automation,
   pin `automation_revision`, pick an account (`accounts.pickForRun(pin)`: pinned, else
   round-robin over `connected`; none → `NoConnectedAccount`, run is created as `failed`
   so the UI shows why). Insert `runs` row `queued`; event `run.queued`. Return immediately.
2. **Send** (executor picks up `queued`). For each MCP server on the automation,
   `mcp.ensureConnected(account, serverId)` (V5; cached in `mcp_account_links`). Mint
   `conversationId`, `userMessageId`, `assistantMessageId` (client-minted UUIDs, V2). Call
   `linear.sendPrompt({account, conversationId, bodyData: prompt_json, resume:false})`.
   Persist ids + `sync_cursor = response.lastSyncId`; status `sent`; event `run.sent`.
3. **Poll** (`linear.pollTurn({account, conversationId, assistantMessageId, cursor})`):
   `POST /sync/batch` NDJSON (V2). Each returned part is appended to `run_parts` at the next
   `position`, `sync_cursor` advances, status `polling`, event `run.part` with the part
   payload. Poll interval: 1 s for the first 30 s, then 3 s, capped at the automation-level
   timeout (default 15 min, a `settings` key) → `RunFailed(cause: RunTimedOut)`.
4. **Complete** when the assistant turn reports `status:"completed"`. `result_text` is the
   concatenation of `text(phase=answer)` parts. Status `completed`; event `run.completed`.

### 6.2 Recovery, retry, cancel

- **Recovery on boot** (`recoverOpenRuns`): select `runs WHERE status IN ('queued','sent','polling')`
  (partial index). `queued` rows re-enter step 2. `sent`/`polling` rows re-enter step 3 from
  their stored `sync_cursor`; parts already in `run_parts` are not re-appended (position is
  the dedup key, `INSERT OR IGNORE`). No custom replay machinery: Linear holds the truth.
- **Retry**: only `retryable` tagged errors (`LinearRateLimited`, `LinearProtocolError` with
  a transport cause, `PersistenceSqlError` busy). Backoff 2 s, 10 s, 60 s; `attempt` column
  increments; after 3 attempts → `failed` with `error_json` = last error. `LinearAuthExpired`
  is never retried: it marks the account `expired` (D4), fails the run, and every automation
  pinned to that account stops being scheduled (`triggers.dueAt` skips them, UI shows banner).
- **Cancel** (`RunsService.cancel`): allowed in `queued|sent|polling`; otherwise `RunNotActive`.
  If a `conversation_id` exists, call `AiConversationCancel` best-effort, then mark
  `cancelled`, event `run.cancelled`. Parts received so far are kept.
- **Concurrency**: the executor is a single async loop in one process. It drains `queued` with
  at most `settings.maxConcurrentRuns` (default 4) in flight and polls all `polling` runs on
  a shared timer. There is no worker pool, no queue table, no lock table: one process, one
  loop, SQLite transactions for atomicity.

### 6.3 Scheduler and webhook receiver

- **Tick** every `config.tickMs` (30 s): `triggers.dueAt(now)` returns enabled cron triggers
  whose `next_due_at <= now` on enabled automations with a usable account. For each, in one
  transaction: `runs.start(...)` + `triggers.advance(triggerId, nextDue(now))`. A crash
  between tick and commit fires nothing twice because the watermark and the run row commit
  together. Missed windows (server was down) fire **once**, not once per missed slot.
- **Cron** supports the captured presets (hourly, daily at time, weekly on days at time) and
  a 5-field expression with an IANA `tz`. `nextDue` is pure and tested against a table.
- **Webhook**: `POST /hooks/:triggerId` with header `X-Automation-Secret`. Constant-time
  compare against `config_json.secret_hash`; mismatch → `WebhookSecretMismatch` (401, no body
  echo). Match → `runs.start(automationId, triggerId, 'webhook')`, respond `202 {runId}`.
  Payload is stored as the first `run_parts` row (`part_type:'prompt'`) and appended to the
  prompt as context.
- **Manual**: `POST /automations/:id/runs` → `runs.start(..., 'manual')`, `202 {runId}`.

## 7. Event log: checkpoint + delta replay (Linear's lesson, our size)

Linear's sync engine stores an immutable action log and serves clients deltas after a
`lastSyncId`. Their 2025 rewrite exists because *serving* the log at their scale got
expensive. At our scale (one user, one process, thousands of events) the naive design is the
correct one; we keep the shape so the UI gets live-updating run history without websockets.

- **Write**: every state change in `automations`, `triggers`, `runs` appends exactly one
  `events` row inside the same transaction as the change. `kind` is a closed union
  (`automation.created|updated|deleted`, `trigger.upserted|removed`,
  `run.queued|sent|part|completed|failed|cancelled`, `account.state`). Payload is the DTO
  after the change (LWW: the latest event for an id wins, no merging).
- **Read**: `GET /events?since=<seq>&automationId=<id?>&runId=<id?>` returns
  `{events:[...], head:<seq>}` ordered by `seq`, max 500 rows; the client stores `head` and
  asks again. Empty result → client backs off 1 s → 5 s. `since` older than the oldest
  retained row → `410 CheckpointTooOld`; the client re-bootstraps via the list endpoints.
- **Bootstrap**: client calls `GET /events/head` first, then the list endpoints, then starts
  the delta loop from that head. Anything that happened between head and the list reads is
  replayed harmlessly because every payload is a full DTO.
- **Run detail live view**: `run.part` events carry the part; the detail page appends them
  in `position` order. No separate streaming endpoint.
- **Not built**: per-client subscriptions, server-side filtering beyond the two ids, binary
  encodings, compaction beyond §3.2 retention. If a second client type (the MCP facade)
  needs more, it also reads `events` through `EventsService.since`.

## 8. HTTP API (thin routes, one file per slice)

All bodies and responses are zod-validated. Auth: one middleware in `platform/http.ts` reads
the workspace session cookie and attaches the actor; v1 has a single local owner, so the
middleware is a seam, not a feature (MASTER-PLAN §2 "Auth boundary in one middleware").

| Method + path | Slice | Returns |
|---|---|---|
| `GET /accounts` · `POST /accounts/:id/health` · `DELETE /accounts/:id` | accounts | `AccountDto[]`, never a cookie |
| `POST /linear/connect` `{email}` · `POST /linear/connect/:attemptId/code` `{code}` · `POST /linear/import-cookie` | linear-connection | `ConnectAttemptDto` / `AccountDto` |
| `GET/POST /automations` · `GET/PATCH/DELETE /automations/:id` · `POST /automations/:id/duplicate` · `POST /automations/:id/runs` | automations, runs | `AutomationDto`; `202 {runId}` |
| `GET/PUT /automations/:id/triggers` · `DELETE /automations/:id/triggers/:tid` | triggers | `TriggerDto[]` |
| `POST /hooks/:triggerId` | triggers → runs | `202 {runId}` |
| `GET /runs?automationId&status&limit&before` · `GET /runs/:id` · `GET /runs/:id/parts` · `POST /runs/:id/cancel` | runs | `RunDto`, `RunPartDto[]` |
| `GET/POST /mcp-servers` · `PATCH/DELETE /mcp-servers/:id` · `POST /mcp-servers/:id/probe` | mcp-registry | `McpServerDto` (headers write-only) |
| `GET /events?since&automationId&runId` · `GET /events/head` | events | §7 |
| `GET /settings` · `PATCH /settings` | platform | General preferences only |

`PATCH` on automations, triggers and mcp-servers requires `revision`; mismatch → `409
RevisionConflict`. Listing endpoints use keyset pagination on `(created_at, id)`.

## 9. What was taken from each reference, and what was left

| Reference | Taken | Left out, and why |
|---|---|---|
| cal.com `packages/features` | Slice folder = domain; `index.ts` as the only public surface; lint-enforced boundary; repositories are the only SQL-aware code; zod DTOs on both directions; thin routes; 80% coverage on changed lines | DI container, caching proxies, decorators, API versioning: a single-user local server has one implementation per interface and no public API contract to version |
| t3code `persistence/` | WAL + `busy_timeout` + `journal_size_limit` pragmas; numbered migrations statically imported and run at startup; `TaggedError` with `operation` + `correlation` context; `AUTOINCREMENT` sequence as the global cursor; `node:sqlite` | Effect runtime and layers (one process, no fiber supervision needed); `effect/sql` client (template-tag SQL over a driver we already have) |
| t3code `orchestration-v2/` | Pin the definition revision on the run; terminal-state finalization in one place; recovery-on-boot from persisted state; checkpoint = transaction, not a service | `EventStore` + `ProjectionStore` split, command receipts, `EffectOutbox`/`EffectWorker`, provider adapter registry, context handoff: 40+ services exist because t3code drives many local agents with streaming; we drive one remote agent whose state Linear already persists |
| Linear delta sync | Immutable append-only log; integer checkpoint; delta replay; full-DTO payloads so replay is idempotent (LWW); explicit "too old → re-bootstrap" | turbopuffer index, late enrichment, permission filtering, binary/zstd framing: scale problems we do not have |
| Replit Agent discipline (RESTART §3) | Checkpoint before every mutation (each state arrow is one transaction); smallest task per run | Isolated working copies and human review gate: v1 runs have no filesystem side effects; Linear's agent tools act inside Linear |

## 10. Verification plan for the implementation PRs

- Every slice ships with tests against `:memory:` SQLite built from the real migration list.
- `FakeLinearClient` replays NDJSON fixtures recorded from the live probe (MASTER-PLAN V2).
  No test talks to `client-api.linear.app`.
- `executor.test.ts` kills the loop between every state arrow and asserts `recoverOpenRuns`
  resumes to the same terminal state with identical `run_parts`.
- `scheduler.test.ts` advances `FakeClock` across a downtime gap and asserts exactly one run
  per trigger.
- `check-boundaries.test.mjs` is red before `ci/boundaries.json` lists an edge and green after.
- Playwright critical journeys (RESTART §4) exercise create-automation and view-run against
  the served server; the run completes from a fixture turn, so the journey is deterministic.
