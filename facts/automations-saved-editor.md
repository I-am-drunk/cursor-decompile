# Saved editor / MCP evidence — 2026-10-12

Capture checkpoint: authenticated Twilight, existing agent-created private
disabled fixture A. No Test, activation, Add MCP, authorization, or billing
action was submitted. These are observed views, not execution claims.

Raw files remain ignored under `reference/automations/editor-2026-10-12/`.
Each JSON records route, viewport/DPR, language/timezone, DOM and computed
styles; its paired PNG records the visible state. The web build is unknown;
the immutable artifact hashes below are the reference identity.

| State | SHA-256 of `<state>.json` |
|---|---|
| saved-editor | `f3a10d0f590575b93a827ef24d87ee6d655e54e8fb5f57eb41ce449b338aa714` |
| tools-menu | `b7e4ad284d10bac8d0be7e4ca07ad591b513a8fdd2c05df1642afc6c1bf394d5` |
| mcp-menu | `44b53aaf47abdc4067b56cd7823fb0eeab6fe029e62b0a80c0b409db81954925` |
| mcp-browse | `1c0e8f64f7209bf51930e478daa9bbdbb992cd335c87585d27bbb47258c5d701` |
| mcp-url | `04493e213b12c3da66498bf60035a282f54b9c71480895fe1e0a557e0ed7cccc` |
| mcp-command | `86f4b2988d937bd0ecc6882882ebbb787b4682cb279f7f76f74164c531525aad` |

`mcp-command` was verified using keyboard activation of the Command tab;
the initial AX click did not change the form. The current pinned capture
contains Command, Arguments and Environment fields.

OBSERVED: saved-editor sections are Triggers, Agent Instructions, Tools.
New Connection opens Browse MCPs; Custom MCP opens an unsubmitted form.
Local implementation, full catalog/provider authorization, and pixel-perfect
font/icon reproduction remain UNVERIFIED at this checkpoint.

## Additional pinned states and metadata

Model options were inspected in an unsaved draft, then discarded. The stored
fixture was reopened with Save disabled, its enabled switch off, and Composer 2.5.
No reference mutation was saved.

- `mcp-json.json`: `db2ac0f2bef7df78df3bd1047e2b9232d88464aacbf1e9ee62c1a221e8f2d7cb`
- `model-picker.json`: `90fdcd33d8c3993c3cfe190ea5ce69c39f37c38340ee750a33964fea939011dc`
- `model-options.json`: `7f769cee404c23c95568102c622467093ad24e7f9be27cb8b7b22fad9a174e68`

`editor-models.json` derives eight visible models and parameter definitions from
`bodies/0297-f3e88b1079371e22.body` (SHA-256
`f3e88b1079371e22c4a790e507a217aa955e57241676e6b34e8ce74c70b83507`).
`mcp-catalog.json` contains the 363 rendered provider names/descriptions from
`mcp-browse.json`; every entry retains its source element indexes. Provider
logos and vendor code are not copied. Local provider authorization remains
unavailable; local MCP configuration storage is not a claim of real connection.

## Verification of the original implementation

The nine paired states above now have property records in
[`editor-facts.json`](../src/automations/editor-facts.json).
`OBSERVED` in this report means a view was opened on the authenticated fixture;
`EXTRACTED_UI` records pin values extracted from its DOM/computed-style snapshot
or the model-catalogue response. Neither label claims local/remote equivalence.

On 2026-10-12, Computer Use in Twilight exercised all nine local views at the
same 1270 × 764 CSS px, DPR 2 viewport. **434 new measured checks passed**.
All fourteen states, including earlier gate/run baselines, pass **737 checks**;
30 tests and 149 raw-source pins also pass. The local UI build hash is
`a2c71f0703f1c81dfb9a11900941d7a43a7f6ce6bd5f80540e18e7ff60b34c55`.
Reproduction: [pipeline instructions](../pipeline/README.md#saved-editor--mcp-checks).

Original functionality includes draft editing, local model/parameter selection,
per-automation MCP configuration references, URL/command/JSON conversion, and
provider search. Tests cover isolation, persistence, secret-free public state,
transport validation, model filtering and non-execution of stored commands.
No reference fixture was activated or run during this slice.

Visual review confirms the measured panel geometry, not whole-page raster
parity. System-font glyphs/text widths, original icon substitutes (including
provider initials), account identity, focus rings and shadows differ.
New-editor, trigger-editor, populated/authorized MCP states, real provider
authorization and non-default viewport/theme variants remain UNVERIFIED.
The single-server JSON policy, validation messages and local persistence are
DESIGN, not observed Cursor behavior. No vendor implementation is redistributed.
