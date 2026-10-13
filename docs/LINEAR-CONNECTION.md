# LINEAR-CONNECTION — account connection flow (plan, 2026-10-12)

> Planning deliverable (RESTART §6.3d). No implementation. Governs the Settings →
> Linear connection slice. Evidence labels per `facts/INDEX.md`: OBSERVED > EXTRACTED_UI >
> DOCUMENTED > DESIGN; nothing invented ships. MASTER-PLAN §V3 and §V8 are the verified
> anchors; the probe worktree (`linear-loops-decompile` branch `live-linear-chat-probes`,
> `facts/linear-chat-live-2026-10-12.md`) is the live login observation.

## 0. Decisions (read these, then the detail)

| # | Decision | Basis |
|---|---|---|
| D1 | The connection credential is the httpOnly cookie `session:<userAccountId>` plus the identity triple `{userId, userAccountId, organizationId}`. Nothing else is stored. | V3 (replays cross-IP from curl; HS256 JWT, no `exp`) |
| D2 | Login is **email code**, completed by **our server** against `client-api.linear.app/graphql`. The user's browser never talks to Linear. | V8 "email code also works"; probe challenge accepted HTTP 200 `{success:true, authType:"authToken"}` |
| D3 | The Turnstile `challengeResponse` is the one step that needs a real browser. v1 obtains it from a **host-side headed Chrome profile** the server drives (one per connect attempt, destroyed after). Manual fallback: user pastes a session cookie. | V8 (real Chrome + browser solver passes; headless Camoufox hard-blocked) |
| D4 | No "refresh". Health = periodic `viewer` read. On 401 → account state `expired`, every automation pinned to it pauses, user re-runs the connect flow. | Integration map §7: no renewal API observed; "never assume a lifetime" |
| D5 | Multiple accounts, each an independent free budget. Automations pin an account or use **round-robin over `connected`** accounts. | MASTER-PLAN §2 "The ONE connection" item 4 |
| D6 | Secrets live in one table, encrypted with a key held in the OS keychain (macOS) or a 0600 key file (Linux fallback). Write-only API: the UI never reads a cookie back. | MASTER-PLAN §2 Principles; `facts/account-login.md` storage discipline |
| D7 | UI copies the **captured** surfaces only: the trigger row `Linear / Status changed / Requires connection / Connect` and the banner `One or more triggers require additional authentication to be used` (A17), the settings frame/rows (S01). The code-entry step copies Linear's own captured form (`authToken` input, "Continue with login code"). | copy-first, chisel-only (MASTER-PLAN §6) |

## 1. Wire protocol (what the server sends)

Endpoint for everything: `POST https://client-api.linear.app/graphql`, JSON, with headers
`Linear-Client-Version: 1.81129.0` (observed on login 2026-10-12; make it a config constant,
not a literal) and `Linear-Client-ID: <random persisted per connect attempt>` (the client
sends Logger's random browser-suffixed id, never a user id). Authenticated calls add
`user`, `userAccount`, `organization` headers and `Cookie: session:<userAccountId>=<jwt>`.

### 1.1 Challenge (anonymous)

```graphql
mutation EmailUserAccountAuthChallenge($email: String!, $challengeResponse: String!,
  $clientAuthCode: String, $isDesktop: Boolean, $loginCodeOnly: Boolean) {
  emailUserAccountAuthChallenge(input: { email: $email, challengeResponse: $challengeResponse,
    clientAuthCode: $clientAuthCode, isDesktop: $isDesktop, loginCodeOnly: $loginCodeOnly })
  { success authType }
}
```
