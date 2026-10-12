# Automation MCP server

Install once from the repo root:

```sh
npm ci
npm --prefix mcp ci
npm run check
```

`npm --prefix mcp start` speaks MCP on stdio and serves the product UI on port
4317. It replaces `npm start`; do not run both against the same data store.
Logs/errors use stderr. Default data is the root `.local/automations.json`.

For Streamable HTTP, set a strong secret **outside the repository**:

```sh
export MCP_TOKEN="$(node -e 'console.log(require("node:crypto").randomBytes(32).toString("base64url"))')"
npm --prefix mcp run http
```

Connect a local MCP client to `http://127.0.0.1:4318/mcp` with
`Authorization: Bearer <MCP_TOKEN>`. HTTP is loopback-only; no public TLS or OAuth
resource-server deployment is claimed. `PORT`, `MCP_PORT` and `DATA_FILE` override
defaults. Client stdio configuration: command is your absolute Node executable,
args is the absolute path to `mcp/main.ts`; DATA_FILE should be absolute.

The product login protects the browser API. The independent MCP bearer token
(or access to the local stdio process) grants full single-owner administrative
access. Never put tokens in URLs or committed client configuration.

## Surface

24 tools: automation list/get/create/update/delete/duplicate/enable/disable;
trigger add/update/remove; run list/get/trigger/cancel; models list; settings
get/update; inference pair/status; MCP server list/save/delete/probe.
Writes take the current revision to prevent lost updates. Models are discovered,
not fabricated. Registry credentials and environment values are write-only.

Resources use `workspace://automations/{id}`, `workspace://runs/{id}` and
`workspace://models/{id}`. `create-automation(task)` guides model selection,
explicit grants, disabled creation and review before running.

Settings → MCP Servers configures registry entries and destination policy.
From a saved automation, “Manage registry and per-automation MCP grants” opens
its bindings. Defaults grant **no tools** and require approval. Deleting a
server leaves portable references visibly **missing**. Probe results distinguish
connected, disconnected, needs auth, missing and error. Connected means the
last probe's handshake/tool discovery passed; the probe connection is closed.

## Explicit follow-ups

MCP tool invocation during automation runs and OAuth authorization are NOT
implemented. Runs with MCP bindings fail visibly before dispatch; they never
silently run without tools. Registry probes are real, not fake connections.
UI geometry/copy beyond the captured settings frame remains UNVERIFIED.
See [decision](../docs/decisions/mcp-sdk.md) and [verification](../facts/mcp-verification.md).
