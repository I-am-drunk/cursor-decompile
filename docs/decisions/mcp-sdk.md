# Decision: isolated official MCP SDK dependency

Owner-authorized exception, 2026-10-12: `mcp/` depends on exactly
`@modelcontextprotocol/sdk` **1.32.1**, the official TypeScript SDK published by
Anthropic (MIT). Registry metadata and installed package manifest identify
`modelcontextprotocol/typescript-sdk`; package-lock records tarball integrity.
No similarly named package or vendor implementation is used.

The root app still has zero runtime dependencies. The SDK and its transitive
runtime dependencies belong only to `mcp/package.json` and its lockfile.
No node_modules, downloaded source, bundles or credentials are committed.
The root app's registry model/API/UI have no SDK dependency; the SDK-enabled
entrypoint injects a server-side client into the same domain services.

Use SDK Server/Client and official stdio/Streamable HTTP transports. Low-level
request handlers keep tool schemas dependency-neutral. We do not add a second
scheduler. The product HTTP app and MCP transports share a single Store,
SettingsStore, registry and inference engine in one process. The product port
prevents accidentally starting another default writer while it is running.
Do not run independent instances against the same DATA_FILE on different ports.

The SDK merges a default child environment. We explicitly blank all its default
inherited values and overlay only admin-supplied environment values. Stdio
requires an absolute executable, explicit execution opt-in, a fresh working
directory, bounded buffers, a ten-second probe timeout, and cleanup. This is
process/environment isolation, **not an OS/container security sandbox**.

Network policy is stricter than the sibling minimum: every destination must be
explicitly allowlisted, including public hosts. DNS is resolved once; requests
use a pinned lookup and preserve TLS hostname checks. Redirects are refused.
Credentials require HTTPS. Unauthenticated loopback HTTP also requires opt-in.
