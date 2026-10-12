# Settings product carve

This slice implements agent A of [MASTER-PLAN.md](MASTER-PLAN.md), section 4.
The `/settings` index and navigation contain exactly Linear connection,
MCP connectors, Accounts and General, at `/settings/linear`, `/settings/mcp`,
`/settings/accounts` and `/settings/general`.

The old dashboard, privacy/profile preview, subscription upsell, download
promotion, spending panel and T3 settings component are deleted. Their page
and module URLs return 404. Workspace entry links point to the new routes.
The existing backend settings storage/API keys remain compatible with the
server and MCP management package; they are not additional settings pages.

## Working controls and backend handoff

- Linear: Connect Linear persists a connection request in the existing
  `integrations.linearEnabled` field. Cancel persists the inverse. Neither
  action authenticates with Linear. The empty account table never presents
  a request or stored legacy credential as an authenticated identity.
  Agent D replaces `src/settings/linear-ui.ts` with its real account/flow
  adapter once its API is available; no speculative API is called today.
- MCP: existing registry list, add/edit/delete, connection test and scoped
  automation bindings remain functional. The add-custom-server form saves
  through `/api/mcp-servers`; permissions remain under an expandable panel.
- Accounts: empty Linear account table plus the actual local session identity
  and working sign-out. Multiple Linear accounts require agent D's registry.
- General: validated display name, timezone, retention and concurrency values
  persist through `/api/settings`. Scheduling and retention remain deferred
  to the server lane and are described as saved defaults in the UI.

No runtime dependencies added. The original settings frame, colors, spacing,
cards and controls are reused. New panels and responsive geometry are
**UNVERIFIED** against a reference; historical captured metadata is retained
unchanged and is not evidence of parity for these replacement panels.

## Validation

Node 24: `npm run check` passes strict TypeScript, 71 app/reader tests,
6 MCP tests, existing metadata validation and diff whitespace checks.
The route test follows the served browser import graph, exercises all four
settings pages and the index, and checks deleted pages/assets return 404.

A local Chromium smoke test used an isolated temporary data directory:
index has four entries; all four pages render; profile and timezone persist;
Linear request/cancel survives reload; custom MCP creation, reload and deletion
work; Accounts shows the current identity and signs out. No browser exceptions.
Desktop 1270×764 and mobile 390×844 checked; no mobile horizontal overflow.
Temporary screenshots are outside the repository, not captured evidence.

Branding audit: no brand names in the replacement settings UI. A literal
repository-wide case-insensitive search is not a product-branding test:
CSS uses `cursor`, MCP pagination uses `cursor`/`nextCursor`, and reference
readers/captured metadata retain source names and URLs. The automation lane
owns remaining catalog/runtime branding outside these settings components.
