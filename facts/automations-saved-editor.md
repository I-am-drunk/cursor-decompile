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
