# Visual verification and neutral branding

Verified 2026-10-12 from main `2c37b3d`: Chromium 151, 1270 × 764 CSS px,
DPR 2, light theme. The real application server uses disposable local data and
synthetic identity `visual@example.invalid`. Captures contain our UI only.

| Route/state | Screenshot |
|---|---|
| `/settings` (opens Linear) | [Index](screenshots/settings-index.png) |
| `/settings/linear` | [Linear connection](screenshots/settings-linear.png) |
| `/settings/mcp` | [MCP connectors](screenshots/settings-mcp.png) |
| `/settings/accounts` | [Accounts](screenshots/settings-accounts.png) |
| `/settings/general` | [General](screenshots/settings-general.png) |
| `/chat`, disconnected | [Chat gate](screenshots/chat-disconnected.png) |
| `/automations?state=upgrade`, expanded | [Expanded](screenshots/sidebar-expanded.png) |
| Same route, collapsed | [Rail](screenshots/sidebar-rail.png) |

[Measurements and 157 passing comparisons](screenshots/measurements.json)
come from [the browser check](../../test/browser-visual.mjs). Expected settings
values are read from [existing facts](../../src/settings/ui-facts.json):
`st-side`, `st-title`, `st-privacy-head`, `st-profile`, `st-email-row`,
`st-email-label`, `st-first`. The check compares retained frame/title geometry,
card width, row height/padding/gap, label typography and input geometry.
Original Profile row Y coordinates change when preceding sections are deleted;
the top section now uses the captured Privacy heading position.

Inspected references: [settings capture](../../facts/settings-navigation-capture.md),
[carve source map](../SETTINGS-CARVE.md),
[General predecessor](../../artifacts/settings/reloaded.png),
[expanded shell](../../artifacts/shell/reference-expanded.png),
[compact shell](../../artifacts/shell/reference-collapsed.png), and
[shell measurements](../../artifacts/shell/reference-measurements.json).

## Corrections

- The early server guard returned 404 for `/chat`, despite its later renderer.
  It now serves the authenticated gate and redirects signed-out visitors to
  login. Chat selects New Chat in the sidebar.
- Overlay scrollbars made settings cards 894px wide instead of the captured
  888px. Reserving the captured 6px gutter restores input x=782 and width=418.
  Rows remain 55px, padding 12px/16px, gap 20px, and inputs 28px high.
- Hidden Search consumed rail header space and clipped the reopen control.
  Collapse now removes that space. Restored 26px compact targets, 8px icon/text
  spacing, captured background and bottom Settings placement. Removed
  unsupported hover/focus expansion and motion rules.
- New Chat uses an original paper-plane drawing matching the reference
  silhouette; the bot drawing fills its 14px box more closely.

The supplied settings images are local predecessors, not vendor captures of
these four carved sections. Private `reference/settings` images are absent;
their extracted facts remain available. No original disconnected chat image
is supplied. These checks establish the retained measurements and the
owner-required centered, underlined Linear gate/link, not whole-page raster
identity. Neutral branding, removed Codebase and added Settings remain
intentional adaptations. Font/icon raster parity and connected chat remain
UNVERIFIED. Search and Linear Connect remain disabled pending their own work.

## Branding and validation

The two `cursor-grok-*` model IDs are now `grok-*`; rendered MCP descriptions
use Workspace, and the saved-editor fixture uses a neutral repository name.
Login CSS contained only the standard `cursor` property, no brand copy.

The requested raw grep now finds only unrendered `*-facts.json` citations
after excluding CSS cursor declarations. The regression scans every other
source file, including runtime JSON, HTML, TypeScript and CSS, and rejects
runtime references to evidence filenames. It detects CSS content strings even
beside a cursor declaration on the same line. Original evidence is intact;
the private source checker permits only the explicit model-ID/copy mappings.

Validation: 77 root tests, 6 MCP tests, strict TypeScript in both packages,
748 evidence records, the 157 browser comparisons, gate navigation and
collapse/reopen interaction. Raw reference-source reproduction is unavailable
without the private reference directory. Peer visual review is still required.

Reproduce with Node 22.18+ and an existing Playwright install (no new dependency):

```sh
npm ci
npm --prefix mcp ci
npm run check
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
BROWSER_EXECUTABLE=/absolute/path/to/chrome \
node test/browser-visual.mjs
```

The browser check starts and stops the application automatically and writes
all eight captures here. Normal manual serving remains `npm start`.
