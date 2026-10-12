# cursor-decompile

An original reimplementation of the **whole Cursor UI**, targeting verified
behavioral and visual parity. Automations comes first: after capture and
implementation, the sibling
[Linear project](https://github.com/I-am-drunk/linear-loops-decompile) will use
Cursor's exact Automations layout inside its Linear UI.

Only our own code is committed. Reference artifacts remain gitignored;
measured UI facts and observed behavior carry reproducible citations.

| Start here | Purpose |
|---|---|
| [prompt.md](prompt.md) | reusable starter or goal prompt |
| [AGENTS.md](AGENTS.md) | working rules |
| [STATUS.md](STATUS.md) | current state |
| [PLAN.md](PLAN.md) | whole-product roadmap; one thin slice per PR |
| [facts/INDEX.md](facts/INDEX.md) | verified public facts and missing captures |
| [Automations layout](specs/automations-layout.md) | exactness acceptance evidence |
| [Linear contract](specs/linear-as-integration.md) | integrations, inference, and runs |
| [Reset history](docs/archive/2026-10-04.md) | retired queue and review findings |
| [Reading tools](pipeline/README.md) | raw byte/search inspection and regression checks |

Coordination is [issue #1](https://github.com/I-am-drunk/cursor-decompile/issues/1).
Read its tail and open PRs before claiming work. The historical extraction
queue is retired; the current plan starts from verified evidence. Documentation
of features does not prove the geometry of their controls.

## Run the original local Automations implementation

Requires Node **22.18+**. Runtime dependencies: **none**.

```sh
npm ci
npm start
# Open http://127.0.0.1:4317/automations
npm run check
```

`PORT` changes the loopback port; `DATA_FILE` changes the default
`.local/automations.json` store. Definitions persist across restarts.
The sidebar's **Local preview** button opens evidence/scenario links.
List, editing, multiple triggers, per-automation MCP configuration,
model selection, repository context, duplication and deletion work locally.
Actual execution/authentication is deliberately unavailable without an
`ExecutionAdapter` (see `src/store.ts`); no scheduler or fake successful
execution is supplied. Synthetic run states are explicitly labeled.

The first capture covered the upsell and empty Run History. A subsequent
[API/row slice](facts/automations-api-rows.md) added a real failed run and
reachable saved-editor evidence. The populated main list is still gated.
The app is an original, partially evidence-backed implementation—not a claim
of whole-page pixel parity. No captured bundles, fonts, credentials or
account details are served by the local server.

Private comparison workflow: [pipeline/README.md](pipeline/README.md).
Results and remaining deviations: [verification report](facts/automations-verification.md).

`/automations/runs?fixture=observed-failure` displays a labeled,
reference-derived failure fixture without contacting Cursor. Use
**Alt+Shift+E** to export measurements of the current table, menu or summary.

The [saved-editor slice](facts/automations-saved-editor.md) adds measured
tools/MCP menus, the connection catalogue, URL/command/JSON configuration
forms, and the model/parameter picker. Preview its reference-derived fixture
at `/automations/editor-fixture?fixture=saved-editor`. Configuration values
stay in the private local store (0600); API state and copied definitions use
opaque references. No provider is authorized and no configured command runs.
Provider-specific trigger forms and unobserved variants remain unverified.

The [trigger-control follow-up](facts/automations-trigger-verification.md)
adds the measured Add Trigger menu, Scheduled choices and custom-cron popup.
Preview at `/automations/editor-fixture?fixture=saved-editor&controls=triggers`.
Use Enter to stage a local cron edit and Save to persist. Correct invalid
input before dismissing its popup. Execution bindings and provider forms
are not reference-verified;
no scheduler, execution or provider authorization is connected.

The [preset/validation slice](facts/automations-preset-verification.md) adds
hourly/daily/weekly rows, day/time menus, live cron errors and the unsaved guard.
Its fixture lives at
`/automations/editor-fixture?fixture=saved-editor&controls=presets`.
Local schedule metadata persists without executing anything. Displayed reference
dates, local serialization and full runtime scheduling are distinct concerns;
this build still provides no scheduler or connected provider authorization.

The [Linear/unconnected slice](facts/automations-linear-verification.md)
adds nested Linear trigger menus, Requires connection rows and warnings,
and the Linear MCP pre-install disclosure. Preview at
`/automations/editor-fixture?fixture=saved-editor&controls=connections`.
Connect and Add Plugin explain that authorization/installation is unavailable;
they do not contact a provider. The 48-state measured subset passes, not
whole-product pixel parity. Screenshot-only run-filter variants still need
acceptance before closing the captured-state backlog. C-SETTINGS is queued
to open with read-only settings entry/navigation and one unconnected provider panel.
