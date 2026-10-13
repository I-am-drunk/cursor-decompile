# SETTINGS V2 — one linear list of connections (2026-10-13)

> Branch `design-settings-v2`. Interaction doc (GOAL-SYSTEM §1); no implementation. Supersedes
> `SETTINGS-SIMPLIFICATION.md` (plan-devin-mashup) where they differ. Owner directive
> (VISION-BRIEF §4, 2026-10-13): settings is **one clean vertical list**. Each connection is one
> row. Row one: big **Connect Linear Account**. Row two: big **Connect Devin Account**
> (marketplace access). No field clutter. Teams hidden in UI, kept in code.
>
> Evidence labels: VERIFIED > OBSERVED > PROVEN (source) > DOCUMENTED > OWNER > DESIGN. GAP = missing.
> Sources: Devin web 3.10.31 `_work/formatted/IntegrationPageLayout-B3grjLWn.js` (row `U` :112-141,
> header `W` :143-162, manage menu `Y` :273-307), `linear-SXExP7cj.js` (:1269-1295, :2585-2645),
> `en-CsbykFSh.js` strings, `app-initial-KyI81Zcf.js` page header `Rr` :1280-1308, alert `Sr`
> (`app-initial-CmE8mZvd.js` :1419-1461); Cursor S-ACCOUNT pins (UI-EXTRACTION-MAP §3);
> `LINEAR-CONNECTION.md` §2/§6/§7 (plan-linear-connection); `LIVE-MARKETPLACE-ACCESS-2026-10-12.md`
> (devin-decompile, VERIFIED).

## 0. Decisions

| # | Decision | Basis |
|---|---|---|
| V1 | `/settings` is one page, one column, one list. Heading `Connections`. No tabs, no sub-nav, no search. | OWNER; Devin `settings.connections` = `Connections` (PROVEN en) |
| V2 | Every connection is the **same row component** (`ConnectionRow`). Rows differ only in logo, name, status line and the flow that opens inside them. | OWNER "linear layout"; Devin row `U` is already provider-agnostic (PROVEN) |
| V3 | The row's right slot holds exactly **one big button**: `Connect` when disconnected, `Disconnect` when connected. Nothing else sits beside it. `Reconnect` lives in the Disconnect button's overflow (Devin `Y` menu). | OWNER "big Connect/Disconnect"; PROVEN `Y` :273-307 |
| V4 | Multi-step flows (Linear email → code; Devin token) open **inside the row**, below the title line, replacing nothing above. The row grows by the input height only. | SETTINGS-SIMPLIFICATION S4; Devin swaps button → spinner in place (PROVEN :2594) |
| V5 | Devin row = marketplace session. "Connected" means the server holds a valid `devin-session-token$<JWT>` and `GetAccountManagedPlugins` answered 200. | VERIFIED 2026-10-12 |
| V6 | Team mapping, scopes, allowed bots, org gates: not rendered. Team mapping ported behind `capabilities.linearTeams=false`. | SETTINGS-SIMPLIFICATION §3 (unchanged) |
| V7 | Future connections (Google Classroom, …) are new entries in a code registry; zero new UI. | OWNER (VISION §2) |
| V8 | Geometry: Cursor's settings frame for the page, Devin's row for each connection, Devin's button at `lg` for the big button. Numbers in §2. | PROVEN both; mix is the mashup rule (RESTART §2.3) |

## 1. The page

```
Connections                                   ← Cursor section title 20px/28px (S-ACCOUNT)
                                              ← 30px (S-ACCOUNT sections gap)
┌──────────────────────────────────────────────────────────────────────┐
│ [Linear 24]  Connect Linear Account                  [   Connect   ] │  row 1
│              Not connected                                           │
├──────────────────────────────────────────────────────────────────────┤  ← 1px border-secondary divider
│ [Devin 24]   Connect Devin Account                   [   Connect   ] │  row 2
│              Not connected · Marketplace access                      │
└──────────────────────────────────────────────────────────────────────┘
```

One Cursor dashboard section (padding 12px 16px, radius 6px) holding a stack of rows separated
by Devin's `border-border-secondary border-t` divider (PROVEN IntegrationPageLayout :67). The
list is the whole page. Nothing below it. No help text below the fold on first paint.

Order is fixed by the registry (§6): Linear first (it is the brain), Devin second, future
connections after. Rows never reorder themselves by status.

## 2. The row — one component, Devin's geometry

Copied from Devin `U` (PROVEN :112-141) with the right slot promoted to one `lg` button.

| Part | Spec | Source |
|---|---|---|
| Container | `flex min-h-[60px] items-center justify-between gap-[8px] rounded-[6px] px-[12px] py-[10px]`, `hover:bg-tint-tertiary` only when the row body is clickable (it is not, in v2) | PROVEN `U` :116 |
| Left | logo `size-6` (24px) + text column `gap-[2px]`: label `text-13 text-text-primary font-normal`, status `text-13 text-text-secondary` | PROVEN `U` :120-131, logo size PROVEN `Rr` :1294 |
| Right | `flex shrink-0 items-center gap-1.5` holding **one** button | PROVEN `U` :134 |
| Big button | Devin text button, `size="lg"`: `h-8` (32px) `px-3 text-13 rounded-[6px]`; `variant="primary"` for Connect (`bg-bg-accent-neutral text-text-primary-inverse border border-border-secondary-always-black hover:brightness-[.92] data-[pressed]:brightness-[.85]`); `variant="secondary"` for Disconnect | PROVEN `app-initial-52VN2hu9.js` :120-121; height token GAP → see note |
| Min width | button `min-w-[112px]` so Connect/Disconnect/Reconnect do not shift the column | DESIGN (Devin has no min width; label change would jitter) |
| Disabled | `disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none` | PROVEN base classes :114 |
| Spinner | `motion-safe:animate-spin` icon replaces the label; width held by min-width | PROVEN linear :2594 |
| Flow slot | a second line under the text column, full row width, `mt-[10px] flex flex-col gap-[8px]`; mounted only while a flow is open | DESIGN (V4) |

Big-button note: Devin's text button file was not isolated in `_work/formatted` (icon button
sizes `size-8/7/6` are PROVEN :136-140). Astra: capture one Devin `Connect` button's computed
height from the live web app and pin it here. Until then 32px is DESIGN, matching the icon `lg`.

## 3. Row 1 — Linear

| State | Label | Status line | Button | Source |
|---|---|---|---|---|
| disconnected | `Connect Linear Account` | `Not connected` | `Connect` primary | OWNER; PROVEN en `notConnected`, `connect` |
| connecting | same | `Connecting…` | spinner, disabled | PROVEN en `connecting`; linear :2594 |
| connected | `Linear Account` | `<email> · <workspace> · Verified 2h ago` | `Disconnect` secondary; overflow `Reconnect` | OWNER; LINEAR-CONNECTION §6; PROVEN `Y` |
| expired | `Linear Account` | `Session expired` (text-orange) | `Reconnect` primary | LINEAR-CONNECTION §7.1 |
| error | `Linear Account` | `Could not verify` (text-red) | `Retry` secondary; overflow `Disconnect` | LINEAR-CONNECTION §7.3 |

### 3.1 Email-code flow (opens in the flow slot, button hidden)

Clicking `Connect` hides the big button and mounts the flow slot. Each step is **one input and
one button**, nothing else. Copy is Linear's own login copy (OBSERVED probe E0 / 2026-10-12).

| Step | Flow slot content | Server call |
|---|---|---|
| 1 Email | label `What's your email address?` · input 28px (S-ACCOUNT, autofocus, `type=email`) · `Continue` primary `sm` · `Cancel` ghost | `startConnect(email)` |
| 2 Code | label `Enter the login code we emailed to <email>` · input (`inputmode=numeric`, autocomplete `one-time-code`) · `Continue with login code` · link `Resend code` (disabled 30s, then live) | `completeConnect(attemptId, code)` |
| 3 Org pick (rare) | one line per org: `<org>` · `Select` `sm` | `completeConnect(..., orgId)` |
| 4 Done | slot unmounts; status line → connected row; big `Disconnect` returns | — |

- Inline error, `text-13 text-text-red` under the input, replaces the label's bottom margin:
  `Code not accepted` · `Code expired, request a new one` · `Too many attempts, try again in <n> min`
  · `Browser step unavailable on this host` (LINEAR-CONNECTION §7.3).
- Fallback link under step 1 only when the server reports Chrome absent: `Paste a session cookie
  instead` → one masked input + `Continue` (LINEAR-CONNECTION §7.1 path B).
- `Esc` or `Cancel` unmounts the slot and restores `Connect`. Attempt is abandoned server-side (TTL).
- Row height change is animated `height 150ms ease-out`; `prefers-reduced-motion` → none.

## 4. Row 2 — Devin (marketplace access)

What "connected" means: our server holds the owner's Devin desktop session token
(`devin-session-token$<JWT>`) and uses it as `X-Api-Key` + `metadata.apiKey` on Connect-RPC
POSTs to `server.codeium.com` (`GetAvailableCascadePlugins`, `GetAccountManagedPlugins`).
VERIFIED live 2026-10-12 (LIVE-MARKETPLACE-ACCESS). There is no OAuth; the token is captured.

| State | Label | Status line | Button |
|---|---|---|---|
| disconnected | `Connect Devin Account` | `Not connected · Marketplace access` | `Connect` primary |
| connecting | same | `Connecting…` | spinner, disabled |
| connected | `Devin Account` | `<email> · Verified 2h ago` (email from `GetAccountManagedPlugins.userId`, before the `|`) | `Disconnect` secondary; overflow `Reconnect` |
| expired | `Devin Account` | `Session expired` | `Reconnect` primary |
| error | `Devin Account` | `Could not verify` | `Retry` secondary; overflow `Disconnect` |

### 4.1 Connect flow (flow slot)

| Step | Flow slot content | Server call |
|---|---|---|
| 1 Auto | `Looking for the Devin desktop app…` + spinner (≤3s). Server reads the token from `~/Library/Application Support/Devin/Cache/Cache_Data/*` (URL-decoded `devin-session-token%24`). Found → step 3. | `captureDevinToken()` |
| 2 Paste | label `Paste your Devin session token` · masked input · `Continue` · ghost `Cancel`. Shown only when step 1 finds nothing, with the one-line note `Open the Devin desktop app and sign in, then try again.` | `connectDevin(token)` |
| 3 Verify | status `Connecting…`; server calls `GetAccountManagedPlugins`; 200 → connected, else inline `Token not accepted` | — |

- Errors inline, same place as Linear: `Token not accepted` · `Devin app not found on this host`
  · `Could not reach Devin`.
- Health tick reuses `GetAccountManagedPlugins`; a 401 flips `expired`. Interval and copy
  identical to Linear (LINEAR-CONNECTION §4) so the two rows behave as one system.
- Write verbs (`InstallCascadePlugin`, `AddUserManagedPlugin`) are never called from settings.
  They belong to the marketplace page. This row only proves the session.

## 5. Shared behaviour (both rows)

- **Disconnect dialog** (Devin `At`, PROVEN linear :1286-1293): title `Disconnect Linear` /
  `Disconnect Devin`; body `Are you sure you want to disconnect your Linear integration? This
  will remove all Linear functionality from <product>.` (Devin row: `…your Devin account? The
  marketplace will be unavailable until you reconnect.` DESIGN, same sentence shape);
  buttons `Disconnect` destructive · `Cancel`. Confirm → `state=revoked`, row returns to
  disconnected, run history kept (LINEAR-CONNECTION §7.2).
- **Overflow**: Devin `Y` menu (`align=end`) opened from the chevron glyph inside the big
  secondary button (`ml-1 size-3`, PROVEN :269). Items: `Reconnect` (spinner while
  `isReconnecting`), `Disconnect` destructive. Only in connected/error states.
- **Loading** (first paint, accounts query pending): both rows render with label + a skeleton
  status line `h-3.5 w-40` (PROVEN ConnectionsSection :785) and a disabled `Connect`. No spinner.
- **Empty**: there is no empty state. Zero connected accounts = two disconnected rows.
- **Keyboard**: `Tab` lands on the big button; `Enter` opens the flow; `Esc` cancels it.
  Focus ring `focus-ring-inset` (PROVEN `W` :147).
- **Return**: `?return=<path>` after connect navigates back (automation editor's
  `Requires connection · Connect` row, LINEAR-CONNECTION §6).
- **Hidden in code**: `features/linear-connection/teams/*` behind `capabilities.linearTeams`
  (SETTINGS-SIMPLIFICATION §3 verbatim). Multi-account stacking (S7) is also kept in code; UI
  renders only the first account per provider until the owner asks for more.

## 6. Future connections

Adding Google Classroom (or anything) = one registry entry, zero UI work:

```ts
// features/settings/connections/registry.ts
{ id: 'google-classroom', label: 'Google Classroom',
  connectLabel: 'Connect Google Classroom Account', logo: ClassroomLogo,
  flow: oauthRedirectFlow('/connect/google-classroom'),   // or emailCodeFlow / tokenFlow
  health: () => classroom.verify(), statusHint: undefined }
```

The row component renders it identically: 24px logo, label, status line, one big button, flow
slot. The flow module decides what fills the slot (redirect flows show `Waiting for browser…`
+ `Cancel`). Rows append in registry order after Devin. A connector package (CONNECTOR-PACKAGES)
that ships a connection registers here from its manifest.

## 7. Acceptance (pass 1)

- `/settings` renders heading `Connections` and exactly two rows; no other interactive element.
- Each row has exactly one button in its right slot in every state.
- Linear: email → code → connected inside the row; row grows by one input block; no layout
  shift outside the row. Error copy from §3.1 appears inline.
- Devin: auto-capture or paste → `GetAccountManagedPlugins` 200 → connected; email on status line.
- Disconnect dialog copy matches §5; confirm returns the row to disconnected.
- `capabilities.linearTeams=false`: no team DOM.
- Geometry pins: heading 20/28, section padding 12px 16px, row min-height 60px, logo 24px,
  button 32px (pending Astra capture), input 28px/radius 6px.
