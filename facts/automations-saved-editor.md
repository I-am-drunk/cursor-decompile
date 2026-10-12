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
