# P3 T3 bridge — source compatibility, not live certification

Inspected pinned T3 revision `b85578aab837c33df5431b5387fffd0021d803a6`.
Sources (all under that revision):
- [auth HTTP](https://github.com/I-am-drunk/t3code-fork/blob/b85578aab837c33df5431b5387fffd0021d803a6/apps/server/src/auth/http.ts)
- [RPC and schemas](https://github.com/I-am-drunk/t3code-fork/blob/b85578aab837c33df5431b5387fffd0021d803a6/packages/contracts/src/rpc.ts)
- [orchestration](https://github.com/I-am-drunk/t3code-fork/blob/b85578aab837c33df5431b5387fffd0021d803a6/packages/contracts/src/orchestration.ts)
- [provider/config](https://github.com/I-am-drunk/t3code-fork/blob/b85578aab837c33df5431b5387fffd0021d803a6/packages/contracts/src/server.ts)
- [transport](https://github.com/I-am-drunk/t3code-fork/blob/b85578aab837c33df5431b5387fffd0021d803a6/apps/web/src/rpc/protocol.ts)
- [server version](https://github.com/I-am-drunk/t3code-fork/blob/b85578aab837c33df5431b5387fffd0021d803a6/apps/server/package.json)

The supported server version is **0.0.22**; unsupported versions and malformed
catalogs fail visibly. A matching version is necessary, NOT sufficient proof of
full live compatibility across forks. The original zero-dependency wire client
uses Effect 4.0.0-beta.59 Request/Chunk/Ack/Exit envelopes and JSON serialization,
not fabricated inference methods or JSON-RPC. Protocol types were inspected in
the published Effect package; no vendor source is committed.

Bootstrap credential → `/api/auth/bootstrap/bearer` → server-side bearer →
`/api/auth/ws-token` → `/ws?wsToken=...`. Bearer credentials can also be supplied.
Tokens stay on disk/server; responses expose status only. Credentials require
HTTPS; exact destination hosts must be allowlisted in Settings → MCP Servers.
This policy is stricter than public-only. DNS resolves once and the HTTP/WS
socket uses that address; redirects are refused. No local HTTP credential bypass.

Settings discovers provider instance/model and existing project IDs. The editor
uses only discovered models outside explicit evidence fixtures; model choices
persist on automation definitions. No guessed model or project is substituted.
The provider registry exposes model discovery, streamed turns and unknown-cost
estimates, so a future Linear adapter fits the same boundary.

Runs dispatch one `thread.turn.start` with an idempotent command ID and a new
thread in the selected existing project. Runtime is `approval-required`;
approvals must be handled in the environment. Messages stream into the on-disk
transcript; the browser refreshes it every 1.5 seconds. Cancellation dispatches
`thread.turn.interrupt`. In-process socket recovery replays from the last
sequence and resubscribes without sending another start command. Transport and
provider failures produce failed runs, not fabricated successful text.

69 tests include protocol-shaped bootstrap/model/start/stream/cancel/replay,
version mismatch, revoked credentials, persisted model/transcript, masking and
fragmentation, and denied destinations. These tests are **fixtures**, not a live
T3 certification. No connected T3 environment credentials were provided, and
plugin discovery found no T3 connector; shared T3 PR registration was unavailable.
All work is coordinated through authenticated GitHub instead.

UNVERIFIED: actual deployed server pairing/turn/cancel/reconnect, complete model
option mapping, independent WebSocket conformance, TLS deployment, restart-time
recovery of active runs, provider cost accounting and new panel visual parity.
A process restart does not resume an in-flight remote turn; no start is replayed.
MCP tool execution is not advertised by this adapter. Linear remains unbuilt.
