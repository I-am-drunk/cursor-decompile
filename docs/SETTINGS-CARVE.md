# Settings correction — not ready to ship

The owner superseded the prior index/table design with copy-first, chisel-only.
`/settings` opens Linear connection, with exactly four navigation entries:
Linear connection, MCP connectors, Accounts, General. No index cards, Profile
button, account tables, connection-request simulation or responsive redesign.

## Source mapping

- Frame, typography, section heading, card and rows: the original
  [settings capture](../facts/settings-navigation-capture.md) and
  [property pins](../src/settings/ui-facts.json), especially `st-title`,
  `st-profile-head`, `st-profile`, `st-email-row`, `st-first` and `st-save`.
  Row padding is 12px 16px, gap 20px, minimum height 55px; inputs are 28px.
  Deleting preceding sections moves retained rows upward without new spacing.
- General's three retained preference labels/fields: owner-selected
  [reloaded screenshot](../artifacts/settings/reloaded.png). As
  [the original report](../facts/settings-functional.md) explains, this image
  is a local implementation capture, not independent vendor evidence.
- Accounts: captured Email row and Log Out copy; runtime local identity.
- Linear: Linear / Requires connection / Connect copy from
  [the connection capture](../facts/automations-linear-capture.md). The four
  section names are OWNER_REQUIREMENT, not captured vendor headings.
- MCP: No MCP servers configured / New Connection copy; the
  [saved-editor custom MCP form](../facts/automations-saved-editor.md) is reused
  directly. The invented registry fields, permissions and bindings panels are
  removed. Registry APIs remain available. The adapter saves URL/command,
  arguments, environment and one private header; multiple headers fail visibly.
- Shell: [expanded capture](../artifacts/shell/reference-expanded.png) supports
  top-right search placement. Standalone `/search`, Profile and Local preview
  destinations are removed. The existing sidebar's other geometry is unchanged.
- Chat: center placement, Connect to Linear and underlined accent Linear are
  OWNER_REQUIREMENT. The title inherits existing 20px/28px typography and the
  accent uses captured settings link color #055180. This is an adaptation,
  not certification against an original chat empty-state capture.

## Remaining acceptance blockers

Search-open behavior and the connected chat/empty-state captures are absent
from the supplied files. The private `reference/settings` directory is also
absent. Requested their locations; no substitute interaction was invented.
Search is disabled pending that evidence. Linear Connect is disabled because
this branch has no account registry, OAuth flow or connected chat runtime.
`/chat` consequently renders only the disconnected gate, and saved intent or
credentials never count as an authenticated account. Connected chat remains
unimplemented. These disabled states are limitations, not captured behavior.

The strict repository-wide `cursor` scan is not green: historical evidence
metadata, catalogue text/IDs, source-reader paths, CSS properties and MCP
pagination protocol keys remain outside the listed exception directories.
The correction is not eligible for shipping or a ready PR until the owner
acceptance checks, missing interactions and peer review are complete.

## Audit and validation

Audited the 19 files in 4909bca and the correction diff. Removed the invented
index, account tables, Linear intent adapter, live stylesheet, custom registry
form, permission panel, binding form and stale grants link. Prior deletions
of dashboard pages, inference UI and obsolete routes remain. Schemas and
server-side stores remain compatible. Tests now assert the reduced UI/routes.

Node 24: strict TypeScript, 71 root tests, 6 MCP tests and metadata validation
pass. Chromium at 1270x764 checks all four sections, visible local links,
55px rows, 12px/16px padding, 20px gap and 28px inputs, saved timezone reload,
custom MCP dialog/create/reload, search 404, centered gate/link and logout.
Local screenshots are ignored under `artifacts/correction/`; they are not new
reference captures. Raw source and whole-page pixel parity remain unverified.
