# LINEAR-CONNECTION — account connection flow (plan, 2026-10-12)

> Planning deliverable (RESTART §6.3d). No implementation. Governs Settings → Linear
> connection and the account registry every run consumes. Evidence labels per
> `facts/INDEX.md`: OBSERVED > EXTRACTED_UI > DOCUMENTED > DESIGN. Verified anchors:
> MASTER-PLAN §V1–V10; `linear-loops-decompile` branch `live/mcp-system-capture`
> (`reference/live-agent-protocol-2026-10-12.md`, `reference/linear_agent_client.py`);
> probe log `facts/linear-chat-live-2026-10-12.md` (branch `live-linear-chat-probes`);
> integration map §3/§7 (branch `in-linear-chat-protocol`). Companion: `LOOP-RUNTIME.md`.

## 0. Decisions

| # | Decision | Basis |
|---|---|---|
| D1 | Credential = httpOnly cookie `session:<userAccountId>` (HS256 JWT `{v:2, sessionId, userAccountId, createdAt, iat}`, no `exp`) + identity triple `{userId, userAccountId, organizationId}`. Nothing else is stored. | V3; live-agent-protocol "Auth model" |
| D2 | Login is **email code**, completed by **our server** against `client-api.linear.app/graphql`. The user's browser never talks to Linear. | V8 "email code also works"; probe E0: challenge HTTP 200 `{success:true, authType:"authToken"}` |
| D3 | The Turnstile `challengeResponse` is the one step that needs a real browser. v1 obtains it from a **host-side headed Chrome profile** the server drives (one profile per attempt, destroyed after). Fallback: user pastes a session cookie. | V8 (real Chrome passes; headless Camoufox hard-blocked) |
| D4 | **No refresh.** Health = periodic `viewer` read. On auth rejection → account `expired`, pinned automations pause, user re-runs the flow. | Integration map §3: no renewal API observed; "never assume a lifetime" |
| D5 | Multiple accounts, each an independent free budget. Automations pin an account or use **round-robin over `connected`** accounts. | MASTER-PLAN §2 "The ONE connection" item 4 |
| D6 | Secrets in one table, AES-256-GCM, key in the macOS keychain or a 0600 key file. Write-only API: the UI never reads a cookie back. | MASTER-PLAN §2 Principles; `facts/account-login.md` storage discipline |
| D7 | UI copies **captured** surfaces only: settings frame/rows (S-ACCOUNT), the trigger row `Linear / Requires connection / Connect` and its auth banner (`facts/automations-linear-capture.md`), and Linear's own code form (`authToken` input, "Continue with login code"). | MASTER-PLAN §6 copy-first |
| D8 | The connect flow never sends a chat message. Verification is a `viewer` read only. | Integration map §7 step 3 |

## 1. Wire protocol

Everything is `POST https://client-api.linear.app/graphql`, JSON. Anonymous calls carry
`Linear-Client-Version` (observed `1.81129.0` on login, `1.81135.0` on chat; **config constant**,
refreshed by reading the login page's bundle version at connect time) and `Linear-Client-ID`
(random, persisted per attempt; format observed `b4nv7kmisu7/C`). Authenticated calls add
`user`, `userAccount`, `organization` headers and `Cookie: session:<userAccountId>=<jwt>`.

### 1.1 Challenge (anonymous) — OBSERVED HTTP 200 on 2026-10-12

```graphql
mutation EmailUserAccountAuthChallenge($email: String!, $challengeResponse: String!,
  $clientAuthCode: String, $isDesktop: Boolean, $loginCodeOnly: Boolean) {
  emailUserAccountAuthChallenge(input: { email: $email, challengeResponse: $challengeResponse,
    clientAuthCode: $clientAuthCode, isDesktop: $isDesktop, loginCodeOnly: $loginCodeOnly })
  { success authType }
}
```

Send `loginCodeOnly: true` (we only consume the code; the magic link binds to the requesting
browser per V8 and is useless to a server). The browser observed `loginCodeOnly:false`; the
`true` projection is UNVERIFIED and the first implementation run must record acceptance. If
rejected, send `false` and ignore the link. `challengeResponse` is the Turnstile token from §2.2.
Response `{success:true, authType:"authToken"}`; no `Set-Cookie` on this step.

### 1.2 Completion (anonymous) — SOURCE only (integration map §3, S4)

```graphql
mutation EmailTokenUserAccountAuth($email: String!, $token: String!, $timezone: String!,
  $clientAuthCode: String) {
  emailTokenUserAccountAuth(input: { email: $email, token: $token, timezone: $timezone,
    clientAuthCode: $clientAuthCode })
  { ... on AuthResolverResponse { id email lastUsedOrganizationId
      users { id organization { id } } } }
}
```

The selection set above is a projection of S4's identity payload; the implementation must copy
the exact selection from the captured browser request, not this sketch. What we need from the
response headers: `Set-Cookie: session:<userAccountId>=<jwt>; HttpOnly; ...`. What we need from
the body: `userAccountId` (= `id`), the chosen `userId` and `organizationId`. Workspace choice:
if `users[]` has one entry, take it; if several, the UI shows a workspace picker (copy the
captured settings row style, one row per `organization`) before anything is stored.

### 1.3 Verify (authenticated) — the only read used for health

```graphql
query Viewer { viewer { id name email organization { id name urlKey } } }
```

Rejection mapping (DESIGN): HTTP 401/403, or GraphQL `errors[].extensions.code` in
`{AUTHENTICATION_ERROR, FORBIDDEN}` → `expired`. HTTP 400 with code `RATELIMITED` → not an
auth failure; back off per `X-RateLimit-Requests-Reset` and keep state. Network/5xx → `error`
with sanitized reason, state unchanged. 401 alone cannot distinguish expiry from revocation;
we label both `expired` and let the user reconnect.

## 2. Connection flow (server-driven)

```
 UI (Settings → Linear connection)          Server (src/core/accounts.ts)         Linear
 ─────────────────────────────────          ─────────────────────────────         ──────
 1  Connect → email field → Continue  ───▶  startConnect(email)
                                            ├ mint attemptId, Linear-Client-ID
                                            ├ §2.2 get Turnstile token          ──▶ linear.app/login (headed Chrome)
                                            └ §1.1 challenge                     ──▶ graphql
 2  "Enter the code we emailed"              attempt.state = awaiting_code       ◀── {success,authType}
 3  user pastes 6–8 char code → Continue ─▶  completeConnect(attemptId, code)
                                            └ §1.2 completion                    ──▶ graphql
                                            ├ parse Set-Cookie + identity        ◀── Set-Cookie session:<ua>
                                            ├ (multi-org) → UI picker, resume
                                            ├ §1.3 viewer                        ──▶ graphql (authenticated)
                                            └ encrypt + insert account           ◀── viewer
 4  row flips to Connected · <email> · <org>
```

### 2.1 Attempt record (in-memory + SQLite `connect_attempts`, TTL 15 min)

`{attemptId, email, clientId, turnstileToken?, state: started|awaiting_code|awaiting_org|done|failed,
 createdAt, error?}`. One live attempt per email; a new Connect for the same email cancels the
old one. Codes are never persisted; they pass through `completeConnect` and are dropped.
Attempt rows are deleted on completion or TTL; the `email` column exists only while pending.

### 2.2 Turnstile token acquisition (the browser step)

- The server launches **headed Chrome** (`chrome --user-data-dir=<tmp>/<attemptId>`) on the host,
  navigates to `https://linear.app/login`, clicks "Continue with email", and intercepts the
  outgoing `EmailUserAccountAuthChallenge` request to read `challengeResponse`. It aborts that
  request before it leaves the browser and replays it itself with `loginCodeOnly:true` (§1.1).
- If interception fails (bundle change), fallback A: let the browser's own challenge go out and
  treat its 200 as our challenge (the code is still emailed; `loginCodeOnly:false` just also sends
  a link we ignore). Fallback B (§7.1): manual cookie paste.
- Profile directory is deleted on attempt end. Headless modes are not attempted (V8).
- Host requirement is documented on the settings row as a one-line note when Chrome is absent
  (copy from the captured `Requires connection` treatment, text adapted, no new layout).

## 3. Storage

```sql
CREATE TABLE accounts (
  id              TEXT PRIMARY KEY,          -- our uuid
  user_id         TEXT NOT NULL,             -- Linear userId   (header `user`)
  user_account_id TEXT NOT NULL UNIQUE,      -- Linear userAccountId (header `userAccount`, cookie name)
  organization_id TEXT NOT NULL,             -- Linear organizationId (header `organization`)
  email           TEXT NOT NULL,
  display_name    TEXT,
  org_name        TEXT, org_url_key TEXT,
  client_id       TEXT NOT NULL,             -- Linear-Client-ID minted at connect, reused for life
  client_version  TEXT NOT NULL,             -- Linear-Client-Version observed at connect
  state           TEXT NOT NULL CHECK (state IN ('connected','expired','error','revoked')),
  state_reason    TEXT,                      -- sanitized, never raw upstream body
  connected_at    TEXT NOT NULL, last_verified_at TEXT, last_failure_at TEXT,
  created_at      TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE account_secrets (
  account_id  TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  cookie_ct   BLOB NOT NULL,                 -- AES-256-GCM(session jwt)
  nonce       BLOB NOT NULL, key_id TEXT NOT NULL,
  rotated_at  TEXT NOT NULL
);
```

- Master key: 32 random bytes. macOS: keychain item `<product>/master-key` (generic password,
  this-user ACL). Linux/other: `<dataDir>/master.key` mode 0600 in a 0700 dir. `key_id` lets
  a future rotation re-encrypt rows lazily.
- Decryption happens in exactly one module (`src/core/accounts/secrets.ts`); callers get a
  `Credential` object whose `toString()` throws. Headers are built inside the Linear adapter.
- Logging: redact `Cookie`, `authorization`, `token`, `challengeResponse`, codes, and any body
  from `client-api.linear.app` at the transport layer, not per call site.
- Deleting an account deletes its secret (cascade) and detaches automations (§5).
- `userAccountId` is UNIQUE: reconnecting the same Linear account **replaces** the secret row and
  resets `state` to `connected`; automations pinned to it resume. No duplicate accounts.

## 4. Health, expiry, and session lifetime

- The JWT has no `exp` (OBSERVED). Lifetime is therefore **unknown**, not infinite. We record
  `connected_at` and `last_verified_at` and display "Verified <relative time>"; we never show
  an expiry date.
- **Health tick**: every 6 h per `connected` account, and immediately before the first send of
  any run, run §1.3 `viewer`. Success → `last_verified_at = now`. Rejection per §1 mapping →
  `state = expired`, `last_failure_at = now`, every automation pinned to the account becomes
  `paused_reason = account_expired`; round-robin excludes the account. Network/5xx → `error`
  without pausing anything (the next tick may clear it).
- **No refresh path** (D4). Nothing on the client-api surface renews a session; the only
  observed renewal is a new login. `refreshStateSync` is a model reload, not a credential
  refresh (integration map §3). Any future renewal must be observed live before it is built.
- A run that gets an auth rejection mid-poll marks the run `failed(auth)` and triggers the
  health tick for that account so the state flips without waiting 6 h.
- **Upload credential** (`uploadsSig`, 7-day JWT) is a separate token for attachments; v1 does
  not send attachments and does not store it.

## 5. Multi-account registry

- An account = one Linear user in one organization. The same email in two organizations is
  two accounts (two `userAccountId`s is the common case; if Linear reuses one `userAccountId`
  across orgs the UNIQUE constraint relaxes to `(user_account_id, organization_id)`).
- **Selection** for a run: automation `account_id` pinned → that account or `skipped` if not
  `connected`. Unpinned → round-robin over `connected` accounts ordered by
  `(in_flight_runs ASC, last_used_at ASC)`; the chosen account's id is written on the run row
  so retries and reconciliation stay on one identity.
- **MCP attachments are per account** (V5 connects on a personal integration). Round-robin
  therefore only considers accounts whose `mcp_attachments` cover the automation's MCP set
  (LOOP-RUNTIME §8); if none qualify, the run connects the missing servers first.
- **Default**: the first connected account is the default for new automations; the editor's
  "Run as" selector copies the captured Devin `Run as` row (DEVIN-PORT-MAP `AgentCard`) and
  lists accounts as `<email> · <org>`.
- Deleting an account with pinned automations: UI confirmation copied from the captured
  delete dialog; pinned automations become unpinned (round-robin), not deleted.

## 6. Settings-page flow (copy-first)

Route `/settings` opens **Linear connection** (SETTINGS-CARVE). Frame, heading, rows: S-ACCOUNT
geometry (row padding 12px 16px, gap 20px, min-height 55px, inputs 28px). No new components.

| Step | Row content (left · right) | Source of the pixels |
|---|---|---|
| Disconnected | Linear icon + `Linear` · `Requires connection` · `Connect` button | `facts/automations-linear-capture.md` trigger row (OBSERVED); icon/label/button in the settings row slot |
| Email entry | row expands to the captured email form: `What's your email address?` label, input, `Continue` | Linear's own login form copy (OBSERVED in probe E0); styled with S-ACCOUNT input geometry |
| Code entry | `Enter the login code we emailed to <email>` · input `authToken` · `Continue with login code` · secondary `Resend code` | Linear manual-code form (OBSERVED 2026-10-12 17:50 UTC) |
| Workspace pick (rare) | one row per org: org name · `Select` | S-ACCOUNT stacked rows |
| Connected | icon + `Linear` · `<email> · <org>` · `Verified 2h ago` · `Disconnect` | S-ACCOUNT Email row + Log Out control copy |
| Expired | same row, status `Session expired` + `Reconnect` button; banner above the list `One or more triggers require additional authentication to be used` | captured auth banner (OBSERVED, A17) |
| Error | same row, status `Could not verify` + `Retry` | captured `Retry` control (DEVIN-PORT-MAP editor states) |

- Additional accounts: a second `Connect another account` row under the list, same row anatomy.
  Each account is one row; there is no table (SETTINGS-CARVE prohibits invented tables).
- Chat gate: with zero `connected` accounts, `/chat` renders the center `Connect to Linear`
  gate (MASTER-PLAN §6) linking to `/settings`.
- Automation editor: the captured trigger-row `Requires connection · Connect` appears on any
  Linear-dependent row while the selected account is not `connected`; `Connect` routes to
  `/settings` and back with `?return=` to the editor.
- Strings are stored in `src/settings/copy.ts` with the capture id next to each string.

## 7. Reauth and recovery

### 7.1 Paths, in order of preference

| Situation | Path | Notes |
|---|---|---|
| Account `expired` | **Reconnect** button → §2 flow with the email prefilled; on success the secret row is replaced in place (same `accounts.id`), state → `connected`, paused automations resume on the next tick | No new account row; run history keeps its `account_id` |
| Chrome unavailable or Turnstile interception broken | **Manual session paste**: row expands to a single masked textarea `Paste your Linear session cookie` + `Continue`. Server accepts `session:<ua>=<jwt>` or a bare JWT, derives `userAccountId` from the cookie name or JWT payload, then runs §1.3 `viewer` to obtain `userId`/`organizationId` | Textarea copies the captured MCP "private header" input (SETTINGS-CARVE); value is write-only; help text links to a one-paragraph doc page, not an inline tutorial |
| Account `error` (network/5xx) | `Retry` → one immediate health tick | No credential change |
| User signed out of Linear in their browser | Nothing to do: the server's session is independent (V3 cross-IP replay). If Linear revokes server-side, the next health tick flips `expired` | Documented on the row as `Verified <time>` only |
| Email changed / org left | `viewer` returns a different email or org → state `error` with reason `identity_changed`; user must Disconnect and Connect again | Never silently rewrite identity columns |

### 7.2 Disconnect

`Disconnect` deletes the secret row and sets `state = revoked`, keeps the account row for run
history, unpins automations. It does **not** claim to revoke the upstream session (integration
map §7 step 5); the row says `Disconnected from this server`.

### 7.3 Failure copy (sanitized reasons shown on the row)

`Session expired` · `Could not verify` · `Code not accepted` · `Code expired, request a new one`
· `Too many attempts, try again in <n> min` · `Browser step unavailable on this host`.
Raw upstream errors go to the server log redacted, never to the UI.

## 8. Core API surface (typed functions first, HTTP second — MASTER-PLAN §2 "open abstraction")

```ts
// src/core/accounts.ts — every caller (HTTP, future MCP facade, scheduler) goes through these
startConnect(input: {email: string}): Promise<{attemptId: string; state: 'awaiting_code'}>
completeConnect(input: {attemptId: string; code: string; organizationId?: string})
  : Promise<{accountId: string} | {state: 'awaiting_org'; organizations: {id; name}[]}>
importSession(input: {cookie: string}): Promise<{accountId: string}>          // §7.1 manual paste
verifyAccount(accountId: string): Promise<AccountState>                       // §1.3 + mapping
listAccounts(): Promise<AccountPublic[]>   // never includes secrets; state, email, org, verifiedAt
disconnectAccount(accountId: string): Promise<void>                           // §7.2
deleteAccount(accountId: string): Promise<void>
selectAccountForRun(automationId: string): Promise<AccountId | null>          // §5 round-robin
```

HTTP routes (zod-validated bodies, same-origin write header per `facts/account-login.md`):
`POST /api/linear/connect/start` · `POST /api/linear/connect/complete` ·
`POST /api/linear/import` · `GET /api/linear/accounts` · `POST /api/linear/accounts/:id/verify`
· `POST /api/linear/accounts/:id/disconnect` · `DELETE /api/linear/accounts/:id`.
Rate limit: 5 `connect/start` per email per hour, 10 `connect/complete` per attempt.

The Linear adapter (`src/linear/client.ts`) exposes `graphql(account, op, vars)` and
`syncBatch(account, body)`; it is the only module that reads `account_secrets`, sets headers,
redacts logs, and maps `RATELIMITED`/401. Both this doc and `LOOP-RUNTIME.md` call through it.

## 9. UNVERIFIED items the first implementation run must capture (blockers marked ★)

| # | Item | How it is closed |
|---|---|---|
| ★U1 | `emailTokenUserAccountAuth` exact selection set and the `Set-Cookie` on completion (probe E0 stopped at code entry) | One real login in the headed Chrome profile with request/response capture; redact and store under `facts/linear-login-completion-<date>.md` |
| ★U2 | `loginCodeOnly:true` acceptance | Same run; fall back to `false` if rejected (§1.1) |
| U3 | Turnstile token interception survives a bundle change | Interception keyed on operationName, not chunk hash; fallback A in §2.2 |
| U4 | Session lifetime | Health ticks record `last_verified_at`; the first `expired` observation gives a lower bound; no code depends on it |
| U5 | `viewer` selection set on client-api | Capture from the web app's `Viewer`/`refreshStateSync` request; adjust §1.3 |
| U6 | One `userAccountId` across orgs vs one per org | First multi-org login; §5 constraint choice |
| U7 | `Linear-Client-Version` skew tolerance (1.81129 vs 1.81135 both worked) | Pin to the login-page bundle version at connect; re-read on `error` |

## 10. Implementation order (after owner approval; one PR each)

1. `src/linear/client.ts` adapter + secrets module + `accounts`/`account_secrets` schema +
   `importSession` (manual paste). Tests: encryption round-trip, redaction, header assembly,
   401/RATELIMITED mapping. This alone unblocks LOOP-RUNTIME with a hand-pasted cookie.
2. Settings row states (Disconnected/Connected/Expired/Error) + chat gate wiring, copied from
   captures; CU verification artifact against `facts/automations-linear-capture.md`.
3. `startConnect`/`completeConnect` with headed Chrome Turnstile step; closes U1/U2/U3/U5.
4. Health tick, pause/resume of pinned automations, Reconnect path.
5. Multi-account rows, round-robin selection, `Run as` selector in the editor.
