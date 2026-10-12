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

Current reference access exposed the upsell and empty Run History, not the
editor. See [capture scope and gaps](facts/automations-web-capture.md).
The app is an original, partially evidence-backed implementation—not a claim
of whole-page pixel parity. No captured bundles, fonts, credentials or
account details are served by the local server.

Private comparison workflow: [pipeline/README.md](pipeline/README.md).
