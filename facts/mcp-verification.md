# P4 MCP management and per-automation registry

The official SDK 1.32.1 is isolated to `mcp/`; root runtime dependencies remain
zero. [Decision and security boundary](../docs/decisions/mcp-sdk.md),
[setup/transports](../mcp/README.md). This is an original MCP server over the
public protocol, not a copy of any vendor client.

## Implemented and exercised

- 24 tools: all requested automation/trigger/run/model/settings operations,
  plus inference pair/status and registry list/save/delete/probe.
- Automation, run and model resources/templates; `create-automation` prompt.
- Official SDK clients connect over stdio and authenticated Streamable HTTP.
- One process shares Store/settings/registry/inference across product UI and
  MCP; no separate scheduler, shadow database or browser dependency for runs.
- Registry CRUD, user/workspace name resolution and explicit-ID precedence;
  per-automation allowlists and ask/auto approval. Defaults grant no tools.
- Five states: connected, disconnected, needs auth, missing, error. A deleted
  registry entry leaves an explicit missing reference, not a tool-less success.
- Real SDK client handshake and tools/list on stdio and Streamable HTTP.
  Commands require explicit enablement, absolute paths, bounded probe time,
  separate process/directory and no inherited secret environment values.
- HTTPS for credentialed destinations, explicit host allowlist, pinned DNS,
  no redirects, bounded response buffers. HTTP server checks bearer and Origin.

`npm run check`: **72 root tests + 6 MCP integration tests**, both strict TS
projects, all existing standard evidence checks and diff checks pass. Tests
cover all management operations/resources/prompts, stale/invalid writes,
secret redaction, complete five-state registry behavior, stdio subprocess and
HTTP clients, isolated command environment and destination/auth failures.
External integration tests use clearly labeled synthetic providers, not T3
live evidence. No real cloud account or remote service was changed.

Computer Use verified local sign-in, the registry save/disconnected state, the
signed-in identity and sign-out back to the gate. Only a disposable local QA
account was used; no real credentials are in captures.
[Login](../artifacts/product/login.png), [registry](../artifacts/product/mcp-registry.png),
[account](../artifacts/product/account.png). These are implementation screenshots,
not reference parity evidence. The final pass also removed remaining provider
catalogue branding and fixed focus-driven rail reveal after toggle/Escape.

## Explicit UNVERIFIED / follow-up list

MCP invocation from automation runs is **not wired**. The production run adapter
rejects MCP-bound runs before dispatch instead of ignoring their tools. OAuth
interactive authorization/refresh, full OS/container command sandboxing,
public TLS deployment, multi-user ACLs and continuously held registry sessions
are not claimed. Connected is the result of a bounded probe, not a retained
connection. The SDK stdio child has the owner's OS privileges.

New registry/binding layout, all unmeasured sidebar animation behavior, alternate
viewports and independent raster parity remain UNVERIFIED. Historical captured
UI facts are preserved, but the old private 60-state raster/measurement suite
was not recaptured for these intentional product/branding changes. T3 live
pairing/turn/cancel/replay remains UNVERIFIED without a real environment.
