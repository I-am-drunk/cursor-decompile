# SETTINGS V2 — one linear list of connections (2026-10-13, pass 3)

> Branch `design-settings-v2`. Interaction doc (GOAL-SYSTEM §1); no implementation. Supersedes
> `SETTINGS-SIMPLIFICATION.md` where they differ. Owner directive (VISION-BRIEF §4): settings is
> **one clean vertical list**. Each connection is one row. Row one: big **Connect Linear
> Account**. Row two: big **Connect Devin Account** (marketplace access). No field clutter.
> Teams hidden in UI, kept in code.
>
> Labels: VERIFIED > OBSERVED > PROVEN (source) > OWNER > DESIGN. GAP = missing evidence.
> Sources (Devin web 3.10.31, `devin-decompile/_work/formatted/`): row `U`
> `IntegrationPageLayout-B3grjLWn.js:112-141`; divider :67; Linear page `linear-SXExP7cj.js`
> :1269-1295, :2585-2645; strings `en-CsbykFSh.js`; text button `app-initial-emSl-pyA.js:347-351`
> (sizes) and `app-initial-52VN2hu9.js:118-131` (variants); page header `app-initial-KyI81Zcf.js
> :1280-1308`. Cursor S-ACCOUNT pins: UI-EXTRACTION-MAP §3. Wire flows: `LINEAR-CONNECTION.md`
> §2/§6/§7; `LIVE-MARKETPLACE-ACCESS-2026-10-12.md` (VERIFIED).

## 0. Decisions

| # | Decision | Basis |
|---|---|---|
| V1 | `/settings` is one page, one list, heading `Connections`. No tabs, sub-nav, search, or help text. | OWNER; Devin `settings.connections` (PROVEN en) |
| V2 | Every connection is the **same row**: logo, label, status line, one big button, flow slot. | OWNER "linear layout"; Devin `U` is provider-agnostic (PROVEN) |
| V3 | The right slot holds **one button**, always: `Connect` → `Disconnect`. No overflow menu, no `Retry`, no `Reconnect` item. Expired and error states turn the one button back into `Connect`. | OWNER "big Connect/Disconnect"; simplicity test 2 |
| V4 | Flows open **inside the row** below the text, one input and one button per step. The row grows by that block only. | SETTINGS-SIMPLIFICATION S4; Devin swaps button → spinner in place (PROVEN :2594) |
| V5 | Devin "connected" = server holds a valid `devin-session-token$<JWT>` and `GetAccountManagedPlugins` returned 200. Captured from the desktop app's cache; no OAuth. | VERIFIED 2026-10-12 |
| V6 | Not rendered: team mapping, scopes, allowed bots, org gates, multi-account stacking. Team mapping ported behind `capabilities.linearTeams=false`. | SETTINGS-SIMPLIFICATION §3 |
| V7 | New connections = one registry entry. Zero new UI. | OWNER (VISION §2) |
| V8 | Page frame is Cursor's; row and button are Devin's, pixel for pixel. | RESTART §2.3 mashup rule |

## 1. The page

```
Connections                                   ← 20px/28px (S-ACCOUNT title)
                                              ← 30px (S-ACCOUNT sections gap)
┌──────────────────────────────────────────────────────────────────────┐
│ [Linear 24]  Connect Linear Account                  [   Connect   ] │
│              Not connected                                           │
├──────────────────────────────────────────────────────────────────────┤  1px border-secondary
│ [Devin 24]   Connect Devin Account                   [   Connect   ] │
│              Not connected                                           │
└──────────────────────────────────────────────────────────────────────┘
```

One Cursor dashboard section (padding 12px 16px, radius 6px) holding rows separated by Devin's
`border-border-secondary border-t` (PROVEN :67). The list is the whole page. Order is registry
order (§6): Linear, Devin, then future rows. Rows never reorder by status.

Removed since pass 1: the `· Marketplace access` suffix (the label already says Devin; what
it is for belongs on the marketplace page, not here).

## 2. The row

Devin `U` (PROVEN :112-141) with the right slot holding one `lg` text button.

| Part | Spec | Source |
|---|---|---|
| Container | `flex min-h-[60px] items-center justify-between gap-[8px] rounded-[6px] px-[12px] py-[10px]`; no hover tint (row body is not clickable) | PROVEN :116 |
| Left | logo `size-6` + column `gap-[2px]`: label `text-13 text-text-primary`, status `text-13 text-text-secondary` | PROVEN :120-131; logo size PROVEN header :1294 |
| Right | `flex shrink-0 items-center gap-1.5`, one child | PROVEN :134 |
| Button | Devin text button `size=lg`: `px-[12px] h-[32px] gap-[5px] text-13 rounded-[6px]`. `variant=primary` for Connect (`bg-bg-accent-neutral text-text-primary-inverse border border-border-secondary-always-black hover:brightness-[.92] data-[pressed]:brightness-[.85]`); `variant=secondary` for Disconnect | PROVEN emSl-pyA :350, 52VN2hu9 :120-121 |
| Button width | `min-w-[112px]` so `Connect` ↔ `Disconnect` does not jitter the column | DESIGN |
| Busy | label → spinner `motion-safe:animate-spin`, button disabled (`disabled:opacity-50`) | PROVEN linear :2594, base :114 |
| Flow slot | below the text column, spans the row, `mt-[10px] flex flex-col gap-[8px]`; mounted only while a flow is open | DESIGN (V4) |

Pass 1 marked the 32px height as GAP. It is now PROVEN (`lg: h-[32px]`, emSl-pyA :350).

## 3. States — one table for every row

Three states. The button has two labels. Everything else is the status line.

| State | Label | Status line | Button |
|---|---|---|---|
| disconnected | `Connect <Provider> Account` | `Not connected` · or `Session expired` · or `Could not verify` (both `text-text-orange`) | `Connect` primary |
| busy | unchanged | `Connecting…` | spinner, disabled |
| connected | `<Provider> Account` | `<identity> · Verified <relative time>` | `Disconnect` secondary |

- Pass 2 had a fourth state, *needs attention*. It was *disconnected* with a different status
  line and the same button, so it is now a status line, not a state.
- Strings `Not connected`, `Connecting…`, `Connect`, `Disconnect` are Devin's (PROVEN en).
  `Session expired` / `Could not verify` are LINEAR-CONNECTION §7.3.
- `Connect` after expiry reruns the provider flow with identity prefilled; the secret is
  replaced in place, same account id (LINEAR-CONNECTION §7.1). No `Reconnect`, no `Retry`:
  transient errors are retried by the health tick (§4), the user sees Connect or Disconnect.
- Loading (first paint): label + skeleton status `h-3.5 w-40` (PROVEN ConnectionsSection
  :785) + disabled `Connect`. No empty state: zero accounts = disconnected rows.

## 4. Row 1 — Linear: email-code flow

`Connect` hides the button and mounts the flow slot. Copy is Linear's own login copy (OBSERVED
2026-10-12). One input, one `md` button per step; `Cancel` is a ghost `md` button beside it.

| Step | Slot content | Server |
|---|---|---|
| Email | `What's your email address?` · input 28px `type=email` autofocus · `Continue` · `Cancel` | `startConnect(email)` |
| Code | `Enter the login code we emailed to <email>` · input `one-time-code` · `Continue with login code` · link `Resend code` (live after 30s) | `completeConnect(attemptId, code)` |
| Org (rare) | one line per workspace `<org>` · `Select` `sm` | `completeConnect(…, orgId)` |
| Done | slot unmounts; row → connected | — |

- Inline error `text-13 text-text-red` under the input: `Code not accepted` · `Code expired,
  request a new one` · `Too many attempts, try again in <n> min` · `Browser step unavailable on
  this host` (LINEAR-CONNECTION §7.3). Error replaces the label gap; row height unchanged.
- Chrome absent on host → link under the email input `Paste a session cookie instead` → masked
  input + `Continue` (LINEAR-CONNECTION §7.1 path B). Hidden otherwise.
- `Esc`/`Cancel` unmounts the slot, restores `Connect`; attempt expires server-side (TTL 15 min).

## 5. Row 2 — Devin: session capture for the marketplace

Connected = the server holds the owner's Devin desktop session token and the account layer
answered. Token `devin-session-token$<JWT>`, sent as `X-Api-Key` and `metadata.apiKey` on
Connect-RPC POSTs to `server.codeium.com`. VERIFIED live 2026-10-12. No OAuth; the token is
read from the desktop app's HTTP cache, or pasted.

`Connect` first tries the cache silently (≤3s, row shows *busy*). Found → verify. Not found →
the slot mounts with the paste step. One step, one input, like Linear's email step.

| Step | Slot content | Server |
|---|---|---|
| (silent) | row *busy* | `captureDevinToken()` reads `~/Library/Application Support/Devin/Cache/Cache_Data/*` for `devin-session-token%24` |
| Paste | `Paste your Devin session token` · masked input autofocus · `Continue` · `Cancel` · note `text-text-secondary`: `Open the Devin desktop app and sign in, then connect again to skip this.` | `connectDevin(token)` |
| Verify | row *busy* | `GetAccountManagedPlugins` 200 → connected; identity = `userId` before the `\|` |

- Pass 2 showed a `Looking for the Devin desktop app…` step and hid paste behind a link. The
  lookup is under 3s, so it is the ordinary busy spinner; paste is shown directly, one click less.
- Inline errors, same place as Linear: `Token not accepted` · `Could not reach Devin`.
- Health tick reuses `GetAccountManagedPlugins`; 401 → `Session expired`. Same interval as
  Linear (LINEAR-CONNECTION §4) so both rows behave as one system.
- Write verbs (`InstallCascadePlugin`, `AddUserManagedPlugin`) are never called from settings.
  This row only proves the session; the marketplace page spends it.

## 6. Shared behaviour

- **Disconnect dialog** (Devin `At`, PROVEN linear :1286-1293). Title `Disconnect Linear` /
  `Disconnect Devin`. Body, Linear: `Are you sure you want to disconnect your Linear integration?
  This will remove all Linear functionality from <product>.` (verbatim, product name swapped).
  Devin: `Are you sure you want to disconnect your Devin account? The marketplace will be
  unavailable until you connect again.` (DESIGN, same sentence shape). Buttons `Disconnect`
  destructive · `Cancel`. Confirm → `state=revoked`, row → disconnected, run history kept
  (LINEAR-CONNECTION §7.2).
- **Loading**: first paint renders both rows with label, skeleton status `h-3.5 w-40` (PROVEN
  ConnectionsSection :785) and a disabled `Connect`. Row silhouette never changes between
  loading and loaded (ATSU §8).
- **Empty**: none. Zero accounts = disconnected rows.
- **Keyboard**: `Tab` reaches the one button; `Enter` opens the flow; `Esc` cancels it; focus
  ring `focus-ring-inset` (PROVEN `W` :147). Autofocus lands in the slot's input on mount.
- **Motion**: slot mount/unmount animates row height `150ms ease-out`; nothing else moves.
  `prefers-reduced-motion` → no transition. The button swap (Connect ↔ Disconnect) is a plain
  re-render; `min-w-[112px]` keeps the column still.
- **Return**: `?return=<path>` after connect navigates back (editor's `Requires connection ·
  Connect` row, LINEAR-CONNECTION §6).
- **Hidden in code**: `features/linear-connection/teams/*` behind `capabilities.linearTeams`
  (SETTINGS-SIMPLIFICATION §3 verbatim, flag deletes the DOM). Multi-account stacking is also
  code-only; the UI renders the first account per provider.

## 7. Future connections

A new connection is one registry entry. No new UI.

```ts
// features/settings/connections/registry.ts
{ id: 'google-classroom', label: 'Google Classroom', logo: ClassroomLogo,
  flow: redirectFlow('/connect/google-classroom'),   // or emailCodeFlow | tokenFlow
  verify: () => classroom.me() }
```

The row renders it identically: 24px logo, `Connect Google Classroom Account`, `Not connected`,
one `Connect`. The flow module fills the slot (redirect flows show `Waiting for browser…` ·
`Cancel`). Rows append in registry order after Devin. A connector package
(CONNECTOR-PACKAGES.md) that needs an account registers here from its manifest; packages that
need none never appear on this page.

## 8. Acceptance

- `/settings` renders heading `Connections` and two rows. No other interactive element.
- Every row has exactly one button in its right slot in every state; it reads `Connect` or
  `Disconnect`, nothing else.
- Linear: email → code → connected inside the row; nothing outside the row moves.
- Devin: find-or-paste → `GetAccountManagedPlugins` 200 → connected with email on the status line.
- Disconnect dialog copy matches §6; confirm returns the row to disconnected.
- `capabilities.linearTeams=false`: no team DOM.
- Pins: heading 20/28, section padding 12px 16px, row min-height 60px, logo 24px, button
  32px, input 28px, radius 6px, divider 1px `border-secondary`.

## 9. Pass log

| Pass | Change |
|---|---|
| 1 | Linear list, two rows, Devin geometry, five states, overflow menu with Reconnect |
| 2 | Five states → four. Overflow menu, `Reconnect`, `Retry` deleted: one button, two labels. Devin paste step hidden behind a link. `· Marketplace access` suffix removed. Button height PROVEN. |
| 3 | Four states → three: *needs attention* folded into *disconnected* as a status line. Devin `Looking for…` step deleted; cache lookup is the ordinary busy spinner, paste shown directly. |
