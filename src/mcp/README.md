# Dependency-free registry boundary

The app owns the registry, settings APIs and per-automation grants. The optional
SDK-enabled `mcp/main.ts` entrypoint injects `SdkMcpClient`, but the root app does
not import the SDK. Admin here means the sole authenticated deployment owner.
No untrusted member role or public multi-user deployment is implemented.
