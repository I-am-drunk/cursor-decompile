# Automations web capture — 2026-10-12

Captured through signed-in **Twilight 1.24t / Firefox 157** using its Network
panel, not an unauthenticated downloader. Raw files live in ignored
`reference/automations/`; never publish these HARs (they contain account data).
The browser viewport was **1270 × 764 CSS px, DPR 2**, light theme.

## Observed, not inferred

- `/automations`: Free account; “Upgrade to unlock Automations” upsell.
  `twilight/dom-measurements.json` and `twilight/upgrade-window.png`.
- `/automations/new`: ordinary navigation redirects to `/automations`.
  Its downloaded editor chunks are extraction evidence, not an observed editor.
- `/automations/runs`: accessible “Run History”, Mine/Team (Team selected),
  four zero-valued metrics and “No Runs Yet”.
  `twilight/runs-measurements.json` and `twilight/runs-window.png`.
- Filter runs → Status offers Running, Failed, Succeeded, Skipped.
  Selecting Succeeded sets `?status=succeeded`. Search expands to
  “Search runs...”. Screenshots: `runs-filter-window.png`,
  `runs-status-window.png`, `runs-filtered-window.png`.
- Desktop fallback: Cursor **3.18.9**, build
  `2ba48ff3f7514cc4643c52ca9f7b3173d9b66130`, also shows an upgrade gate.
  Desktop screenshots/HAR/version are separate; not web parity evidence.

## Resource coverage and limits

The initial web HAR has 313 entries; the multi-route HAR has 650 entries,
including 504 JS requests (165 unique URLs) and 25 CSS requests (13 unique URLs).
All recorded JS/CSS response bodies are present. These are bounded capture
windows, not a claim to include future polling or every product state.
`routes/inventory.json` pins each URL/method/status/body/hash; its
`network-shapes.json` records observed JSON shapes without scalar values.
The desktop HAR exports only 32 requests (24 bodies), despite the panel
showing 56; it does **not** contain every desktop resource. Desktop computed
styles were not captured after DevTools' paste-safety warning.

## Extracted current-web facts

The package's [ui-facts.json](../src/automations/ui-facts.json) pins original
SHA-256 and byte ranges or DOM element indexes. In particular:

- Current downloaded editor: editable name, Create/Save, active toggle,
  triggers before prompts/tools, Add Trigger and Add Tool or MCP.
- Tool menu: Built-in → Memories, MCP → MCP Server, integration tools.
- Portal content: 72rem maximum width, 3rem inline padding; section stacks
  use declared spacing tokens. These are declarations, not computed editor
  geometry. Account gates and active variants remain unobserved.

## Explicit gaps

Populated list, current editor screenshots, live MCP authorization, model
selection persistence on Cursor, successful/failed real runs, alternate
viewports/themes and icon/font raster parity remain **UNVERIFIED**.
Our local adapter, validation, persistence and fixture scenarios are **DESIGN**,
not captured Cursor network behavior. There is no second execution scheduler.
The custom font and vendor implementation are not redistributed.

See the [verification report](automations-verification.md) for measured local
comparisons, exercised interactions and explicit implementation omissions.
