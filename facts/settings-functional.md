# P1 functional settings

Owner-directed `/settings/{account,inference,integrations,mcp,automations}`
uses the captured settings stylesheet and an original functional view. Historical
`/dashboard?fixture=...` previews remain read-only for existing comparison gates.
The shell gear reaches the real settings route, not the evidence preview.

`GET /api/settings` and `PATCH /api/settings` persist validated section updates
atomically to `<DATA_FILE>.settings` (0600). Revision conflicts return 409.
Credentials are write-only; responses carry presence, never values. Blank UI
credential input preserves the secret; API empty-string explicitly clears it.
No connection or authorization is claimed simply because a secret is stored.

Account name/theme preference, T3 URL/name/credential, Linear configuration,
MCP execution/destination policy, and automation defaults survive reload.
Theme rendering, retention cleanup, scheduling, Linear OAuth and live provider
connections are not implemented here. P2 adds identity; P3 adds pairing/models;
P4 adds MCP registry and transport controls. These are not hidden mock successes.

Evidence: settings-store tests exercise every section, revision conflict,
atomic invalid-update rollback, permissions, secret redaction, HTTP routing and
reload. All existing checks retained. New panel layout, copy, connection states,
alternate themes and viewport parity remain **UNVERIFIED**. Only the historical
settings navigation/row stylesheet has prior captured evidence.

Computer Use local QA: changed timezone from UTC to Europe/Paris, Save reported
“Saved to disk”, browser reload retained Europe/Paris. Synthetic local data only.
[Inference panel](../artifacts/settings/inference.png) and
[reloaded defaults](../artifacts/settings/reloaded.png) capture the implementation,
not new reference evidence.
