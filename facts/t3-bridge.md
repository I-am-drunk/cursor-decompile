# P3 T3 bridge — 0.0.45 compatibility

Inspected official T3 tag `v0.0.45`, revision
`6c8fed35dded9ff71c5b46807125457acbb76be6` (2026-10-12).
Sources (all under that revision):
- [auth routes](https://github.com/pingdotgg/t3code/blob/6c8fed35dded9ff71c5b46807125457acbb76be6/packages/contracts/src/environmentHttp.ts#L427-L445)
- [token exchange schema](https://github.com/pingdotgg/t3code/blob/6c8fed35dded9ff71c5b46807125457acbb76be6/packages/contracts/src/auth.ts#L186-L211)
- [turn/bootstrap schema](https://github.com/pingdotgg/t3code/blob/6c8fed35dded9ff71c5b46807125457acbb76be6/packages/contracts/src/orchestration.ts#L1292-L1359)
- [provider/config](https://github.com/pingdotgg/t3code/blob/6c8fed35dded9ff71c5b46807125457acbb76be6/packages/contracts/src/server.ts)

The supported server version is **0.0.45**; unsupported versions and malformed
catalogs fail visibly. A matching version is necessary, NOT sufficient proof of
full live compatibility across forks. The original zero-dependency wire client
uses Effect Request/Chunk/Ack/Exit envelopes and JSON serialization,
not fabricated inference methods or JSON-RPC. See the owner-supplied
`/tmp/T3-PROTOCOL-NOTES.md` and `/tmp/t3client-working.py`; those private inputs
are not committed or required for the ordinary test suite.

DOCUMENTED: bootstrap credential → form-encoded `/oauth/token` exchange →
server-side bearer → `/api/auth/websocket-ticket` →
`/ws?orchestrationProtocol=2&wsTicket=...`. Bearers can also be supplied.
A fresh ticket is minted for every connection, including reconnects.
Every RPC Request retains `headers:[]`; streams retain Chunk acknowledgements.
The old 0.0.22 `/api/auth/bootstrap/bearer` and `/api/auth/ws-token` paths are
not fallback routes. Unsupported responses fail before opening a socket.
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

75 app/reader tests and 6 MCP tests pass. Fixtures cover form encoding,
bootstrap validation, fresh tickets, version rejection, instance selection,
turn bootstrap, stream/cancel/replay, disk transcripts and destination policy.
These tests are **fixtures**, not live turn certification.
The private source gate reproduces all 745 pins. Served UI content is unchanged
from main (`buildHash` remains `f81a8c43…`). The available older UI measurements
carry `4a04a331…`; the comparator correctly rejects them as stale, on main too.
They were not rewritten or counted as fresh 3,676-check visual acceptance.

OBSERVED on 2026-10-12 at 17:57:32 UTC: the production `T3Bridge`, HTTP and
WebSocket transports paired twice with the local 0.0.45 server using the
owner-supplied scoped bearer. Both model/project discovery and reconnect
succeeded (26 models, 13 projects); no project/thread/turn mutation was sent.
Private harness and redacted result: `corpus/t3-045/{probe.mjs,result.json}`.
A temporary loopback TLS proxy forwarded to `127.0.0.1:3773`, with its test
CA explicitly trusted only by the probe process. No TLS validation or
credential destination policy was disabled. Direct HTTP pairing remains
denied; this is not certification of a production TLS deployment.

UNVERIFIED: live bootstrap exchange, turn/cancel/stream recovery, complete model
option mapping, independent WebSocket conformance, TLS deployment, restart-time
recovery of active runs, provider cost accounting and new panel visual parity.
A process restart does not resume an in-flight remote turn; no start is replayed.
MCP tool execution is not advertised by this adapter. Linear remains unbuilt.
Username-owned projects and unique automation folders, connector skill bundles,
and runtime MCP invocation remain separate owner requirements, not completed here.
