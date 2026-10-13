# SERVER-SCAFFOLD — file tree skeleton (plan, 2026-10-12)

> Planning deliverable. Companion to [ARCHITECTURE.md](ARCHITECTURE.md). Nothing here exists
> yet; implementation PRs create these files one slice per PR, in the order of §2. Line
> budgets are targets that make review possible, not hard limits.

## 1. Tree

```
server/
  package.json                 "type":"module"; deps: zod. devDeps: typescript, @biomejs/biome
  tsconfig.json                extends root; include src/**, test/**
  biome.json                   formatter + linter; noRestrictedImports mirror of ci/boundaries
  src/
    main.ts                    composition root (~60 lines). Only file that imports node:http + sqlite + every index.ts
    config.ts                  env → typed Config {dataDir, port, linearClientVersion, tickMs}
    platform/
      sqlite.ts                openDatabase(path|':memory:') → pragmas → migrate → Db
      migrations/
        index.ts               ordered static import list + runMigrations(db)
        001_init.ts            every table in ARCHITECTURE §3 (one migration at v1)
      http.ts                  createServer(routes): method+path match, json body, error→status
      errors.ts                TaggedError base, PersistenceSqlError, PersistenceDecodeError, isTagged()
      clock.ts                 Clock {now(), every(ms, fn)}; FakeClock for tests
      secrets.ts               SecretBox {seal, open}; keychain (darwin) or 0600 file key
      settings.ts              KV read/write over `settings` table
      ids.ts                   uuidv7()
      log.ts                   structured line logger (JSON to stderr)
```
```
    features/
      events/                  leaf slice; lands first
        index.ts  service.ts  repository.ts  schema.ts  errors.ts  routes.ts  events.test.ts
      accounts/
        index.ts  service.ts  repository.ts  schema.ts  errors.ts  routes.ts  accounts.test.ts
      linear-connection/
        index.ts  service.ts  repository.ts  schema.ts  errors.ts  routes.ts
        linear-client.ts       sendPrompt / pollTurn / connectMcp / viewer (MASTER-PLAN V2, V5)
        linear-wire.ts         GraphQL documents + zod decoders for responses (LINEAR-CONNECTION §1)
        challenge.ts           headed-Chrome Turnstile step (D3); isolated so tests can stub it
        linear-connection.test.ts  linear-client.test.ts (fixture NDJSON from live captures)
      automations/
        index.ts  service.ts  repository.ts  schema.ts  errors.ts  routes.ts  automations.test.ts
      triggers/
        index.ts  service.ts  repository.ts  schema.ts  errors.ts  routes.ts
        cron.ts                5-field cron + presets (hourly/daily/weekly) → nextDue(after, tz)
        webhook.ts             secret hashing + constant-time compare
        triggers.test.ts  cron.test.ts
      runs/
        index.ts  service.ts  repository.ts  schema.ts  errors.ts  routes.ts
        executor.ts            RunExecutor state machine (ARCHITECTURE §6)
        scheduler.ts           tick loop: triggers.dueAt → runs.start → triggers.advance
        runs.test.ts  executor.test.ts  scheduler.test.ts
      mcp-registry/
        index.ts  service.ts  repository.ts  schema.ts  errors.ts  routes.ts
        client.ts  http.ts  pinned-fetch.ts   moved from ../mcp/ (probe transport, allowlist policy)
        mcp-registry.test.ts
  test/
    harness.ts                 openDatabase(':memory:') + FakeClock + FakeLinearClient + wire(main)
    e2e.run-lifecycle.test.ts  create automation → cron tick → run completes from fixture turn
```

## 2. Landing order (one PR each, each green and boundary-checked)

| PR | Creates | Done when |
|---|---|---|
| S1 | `server/` package, `platform/*`, `001_init`, `ci/check-boundaries.mjs` + test, Biome config | `npm run check` passes on an empty feature tree; boundary fixture test red/green |
| S2 | `features/events` | append + since(seq) + head; 410 on stale cursor; unit tests |
| S3 | `features/accounts` + `platform/secrets` | create/list/markExpired; cookie never readable via API |
| S4 | `features/linear-connection` (client + wire + decoders) | `sendPrompt`/`pollTurn` replay recorded NDJSON fixtures; challenge step stubbed |
| S5 | `features/mcp-registry` (move `mcp/` transport in) | existing `mcp/test/*` pass from the new location; `ensureConnected` against fixture |
| S6 | `features/automations` | CRUD with revision conflicts; MCP ref validation |
| S7 | `features/triggers` + `cron.ts` | due-set computation deterministic under FakeClock; webhook secret compare |
| S8 | `features/runs` executor + scheduler + `recoverOpenRuns` | e2e: cron tick → run → fixture turn → completed; kill mid-poll → resume |
| S9 | HTTP routes for all slices + `main.ts` wiring | Playwright journey create-automation → view-run against served app |

Rule from RESTART §5: each PR carries a browser verification artifact where it has a UI
surface (S9 only) and ≥80% coverage on changed lines (all).

## 3. CI additions (`ci/check-src.sh`)

```sh
node ci/check-boundaries.mjs server/src ci/boundaries.json
./node_modules/.bin/biome ci server
./node_modules/.bin/tsc -p server --noEmit
node --test server/src/**/*.test.ts server/test/*.test.ts
! grep -rn 'new Error(' server/src/features   # tagged errors only (ARCHITECTURE §5)
```

## 4. `ci/boundaries.json` (the dependency DAG, reviewed like code)

```json
{
  "events": [],
  "accounts": [],
  "linear-connection": ["accounts"],
  "mcp-registry": ["linear-connection", "accounts"],
  "automations": ["mcp-registry", "events"],
  "triggers": ["automations", "events"],
  "runs": ["automations", "triggers", "accounts", "linear-connection", "mcp-registry", "events"]
}
```

`check-boundaries.mjs` reads this map. An import from slice A to slice B's `index.ts` passes
only if `B ∈ map[A]`. Adding an edge is a one-line diff that CodeRabbit and the reviewer see.
Cycles are rejected by a topological sort at check time.

## 5. Explicitly not scaffolded (v1)

- No `queue`, `jobs`, or `locks` tables; the executor loop and SQLite transactions suffice.
- No projections or read models; `runs` + `run_parts` are the read model.
- No websocket server; the UI polls `GET /events?since=` (ARCHITECTURE §8).
- No provider adapter registry; `linear-client.ts` is the only brain. T3 Connect stays parked.
- No `down` migrations.
