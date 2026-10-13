# SETTINGS SIMPLIFICATION — Linear connection as ONE big thing (2026-10-12)

> Branch `plan-devin-mashup`. Planning deliverable; no implementation. Owner directive:
> the per-account Linear connection is **one big simple card** — a big "Connect Linear
> Account" title and big Connect / Disconnect buttons, no field clutter. **Teams are hidden in
> the UI but kept in code** for later multi-account use.
>
> Evidence: Devin Linear integration page (`_work/formatted/linear-SXExP7cj.js`, 3.10.31 web
> bundle, PROVEN lines cited), dossier D §2, dossier B §7 lifecycle, Cursor settings geometry
> (S01/S-ACCOUNT, UI-EXTRACTION-MAP §3), Cursor trigger row `Linear · Requires connection ·
> Connect` (A17), LINEAR-CONNECTION.md D1–D8 and §6 (wire flow). Labels per facts/INDEX.md.

## 0. Decisions

| # | Decision | Basis |
|---|---|---|
| S1 | Route `/settings` opens `/settings/connections/linear`. The page is **one card**: title, one-line status, one primary button. Nothing else above the fold. | Owner directive |
| S2 | The card is Devin's connection header component (`En`: `name`, `typeLabel: "Linear workspace"`, manage dropdown with `Reconnect` / `Disconnect`) rendered in Cursor's dashboard section at display size. | PROVEN `linear-SXExP7cj.js:1270-1283` |
| S3 | Copy: title `Connect Linear Account` (OWNER), button `Connect` / `Disconnect` (PROVEN Devin labels :2595, :1289), disconnect dialog verbatim Devin (:1287-1290) with the product name swapped. | PROVEN + OWNER |
| S4 | Email-code flow steps (LINEAR-CONNECTION §6) render **inside the same card** as a single input that replaces the button; never a second section. | Owner "no field clutter" |
| S5 | **Team mapping is kept in code, not rendered.** Devin's `Linear Teams to Devin organizations` row, `Enable Default Mapping` switch, trigger option select and `linear/team-mappings` PUT are ported behind `capabilities.linearTeams=false`. | PROVEN :1316-1340, :203-215, :799; owner "hidden but kept" |
| S6 | Devin's `MCP access included` callout is kept as the one line of help below the button (it is true for us too: the Linear Agent's native tools come with the connection). | PROVEN :2630-2645 |
| S7 | Multiple accounts: the card stacks (one card per account) plus a smaller `Connect another account` card. Round-robin/pinning semantics unchanged from LINEAR-CONNECTION §5. | LINEAR-CONNECTION D5 |
| S8 | Accounts and General pages are untouched Cursor rows (UI-EXTRACTION-MAP §3). | RESTART §2.3 |

## 1. The card (disconnected and connected)

Frame is Cursor's dashboard section (S01): title 20px/28px above, section gap 30px, card
padding 12px 16px. Inside, Devin's connection header `En` at its native geometry, but the
title slot is promoted to the section heading so the card reads as one big thing.

```
┌──────────────────────────────────────────────────────────────┐
│  [Linear logo 32px]  Connect Linear Account                  │  ← section title (20/28)
│                      Not connected                           │  ← status, text-13 secondary
│                                                              │
│                                   [      Connect      ]      │  ← primary, Devin `G variant=primary`
│                                                              │
│  ⓘ MCP access included — This connection gives the agent     │  ← Devin info alert `_e variant=info`
│    native Linear tools, so you don't need to install the     │     (PROVEN :2630-2645), product
│    Linear MCP separately. Learn more about Linear MCP…       │     name swapped
└──────────────────────────────────────────────────────────────┘
```

Connected state replaces the status line with `<email> · <org> · Verified 2h ago`
(LINEAR-CONNECTION §6 row copy) and the button with Devin's manage dropdown (`Cn`:
`Reconnect` while `isReconnecting` spins, `Disconnect` destructive — PROVEN :1278-1283),
rendered as **one big secondary `Disconnect` button** with `Reconnect` in its overflow.
No table, no field rows, no scopes list, no mapping rows.

| Element | Copy | Source |
|---|---|---|
| Title | `Connect Linear Account` (disconnected) / `Linear Account` (connected) | OWNER |
| Type label | `Linear workspace` | PROVEN :1277 |
| Status | `Not connected` · `Connecting…` · `Connected` · `Session expired` · `Could not verify` | Devin pills (CONNECTORS-PAGE-SPEC §4.1 vocabulary) + LINEAR-CONNECTION §7.3 |
| Primary | `Connect` (spinner `motion-safe:animate-spin` while connecting) | PROVEN :2590-2597 |
| Connected actions | `Disconnect` (big) · `Reconnect` (overflow) | PROVEN :1280-1282 |
| Disconnect dialog | `Disconnect Linear` / `Are you sure you want to disconnect your Linear integration? This will remove all Linear functionality from <product>.` / `Disconnect` · `Cancel` | PROVEN :1287-1290 |
| Help alert | `MCP access included` + body + link `Learn more about Linear MCP capabilities` → linear.app/docs/mcp | PROVEN :2634-2644 |

## 2. Connect flow — stays inside the card

LINEAR-CONNECTION §2/§6 wire flow, re-skinned so each step **replaces the button area**;
the card never grows a second section. Steps and copy (Linear's own login copy, OBSERVED):

| Step | Card body (replaces the button) | Source |
|---|---|---|
| 1 Email | label `What's your email address?` · 28px input · `Continue` | Linear login form (probe E0) |
| 2 Code | `Enter the login code we emailed to <email>` · input · `Continue with login code` · link `Resend code` | Linear manual-code form |
| 3 Org pick (rare) | one row per org `<org> · Select` | S-ACCOUNT stacked rows |
| 4 Done | status flips to `Connected · <email> · <org>`; button becomes `Disconnect` | LINEAR-CONNECTION §6 |
| Fallback | link `Paste a session cookie instead` → one masked textarea + `Continue` | LINEAR-CONNECTION §7.1 |
| Errors | inline under the input: `Code not accepted` · `Code expired, request a new one` · `Too many attempts, try again in <n> min` · `Browser step unavailable on this host` | LINEAR-CONNECTION §7.3 |

Devin precedent for "flow inside the row": its connect buttons swap to a spinner in place
(PROVEN :2594) and its callback return re-checks status (dossier B §7). We do the same with
server-driven steps instead of an OAuth redirect.

## 3. Teams — hidden in the UI, kept in code

Devin's Linear page has a second block, `Linear Teams to Devin organizations`, with
description `Choose where Devin sessions created from Linear should appear in-app`, a warning
`No Linear Team to Devin Organization mapping configured…`, a `Configure`/`View` button that
opens the mapping editor, an `Enable Default Mapping` switch (`default-mapping-toggle`), and a
per-mapping trigger select with options `All new issues` · `On Status "<name>"` (one per
workflow state of type backlog/unstarted/triage) · `Direct mentions only` (PROVEN
`linear-SXExP7cj.js:196-222, 790-812, 1300-1345`; dossier D §2.2). Backing calls: `GET
{org}/integrations/linear/config`, `GET linear/workflow_states`, `PUT linear/team-mappings`.

| We keep (code) | We render (UI) | Why |
|---|---|---|
| `features/linear-connection/teams/TeamMappingSection.tsx` — verbatim port of `sr` (:1300-1345), `In` trigger select (:196-222), default-mapping switch (:790-812) | nothing; mounted only when `capabilities.linearTeams === true` (default `false`) | owner: hidden now, needed for multi-account later |
| `linear_team_mappings` table: `account_id, team_id, team_name, trigger_option ('all_new_issues' \| state name \| 'direct_mentions'), is_default` | — | same column vocabulary as Devin's select values so the UI drops in unchanged |
| `GET /accounts/:id/linear/teams` (viewer → teams query), `PUT /accounts/:id/linear/team-mappings` | — | thin routes over the table; no behaviour in v1 |
| Run executor reads `is_default` team when a skill/automation needs a team and none is pinned | — | first consumer when multi-account lands |

Rule: the flag deletes the component from the DOM, not `display:none`. Tests assert the
section is absent by default and renders Devin's copy verbatim when the flag is on.

## 4. Multiple accounts (S7)

One §1 card per `connected|expired|error` account, stacked with the S01 30px section gap, then
a half-height card `Connect another account` with a secondary `Connect` button (same `En`
header, no status line). Expired accounts show status `Session expired` and the big button
reads `Reconnect` (LINEAR-CONNECTION §7.1: replaces the secret in place, same account id).
Round-robin, pinning (`Run as` in the editor, MASHUP-PLAN §3.3) and the `Disconnect`
semantics (`state=revoked`, unpin automations, keep run history) are LINEAR-CONNECTION §5/§7.2.

## 5. What is deleted from both donors on this page

Devin: scopes list, `Devin scoping triggers`, `Allowed bots`, playbook triggers, team mapping
UI (kept in code, §3), org/enterprise permission gates. Cursor: Integrations page cards,
Privacy/Profile rows (they live on Accounts), any provider other than Linear.

## 6. Acceptance

- `/settings` lands on the Linear card; the card contains exactly one button above the fold.
- Email → code → connected round trip inside the card, no layout jump greater than the input
  height; failure copy from §2 table appears inline.
- Disconnect dialog copy matches Devin verbatim with the product name swapped.
- `capabilities.linearTeams=false`: no team DOM; `=true`: Devin section renders with the
  three trigger options and the default-mapping switch.
- Geometry pins: section title 20/28, card padding 12px 16px, input 28px/6px, 1270×764.
