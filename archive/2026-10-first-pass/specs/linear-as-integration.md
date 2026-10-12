# Cursor Automations → Linear contract

| Responsibility | Owner / evidence |
|---|---|
| page shell, navigation, settings appearance | Linear project; exact Linear UI, owner requirement |
| automation list/editor/run layout | this repo; exact Cursor UI, [capture contract](automations-layout.md) |
| trigger, MCP, model, repository behaviors | [A02–A08](../facts/INDEX.md); missing UI details stay UNVERIFIED |
| schedules, execution, persistence, run lifecycle | sibling execution runtime; shared through adapters |
| Linear sign-in and events/tools | one integration adapter; [L01–L02](../facts/INDEX.md) |
| selectable inference, including T3 Code Connect | sibling provider adapter; owner requirement, not a documented Cursor capability |

## Proposed boundary (`DESIGN`)

These are our own interface names, not Cursor wire fields or extracted internals.
The sibling runtime's existing contracts remain canonical; adapt at this boundary.

| Interface | Input → output |
|---|---|
| Automation store | definition `{id, name, prompt, triggers, toolBindings, inference, repositoryContext}` ↔ persisted definition |
| Trigger adapter | provider subscription/event → `{automationId, triggerId, eventId, occurredAt, context}` |
| Tool binding resolver | automation's selected `{providerId, connectionId, configurationRef}` → callable tools for that run |
| Inference adapter | `{providerId, modelId, configurationRef}` + instructions/context/tools → execution output/events |
| Run adapter | definition + trigger envelope → run reference; stream/read/cancel use sibling run contracts |
| Connection adapter | provider + workspace/account → connect/status/disconnect reference |

The automation owns its tool-binding selection and inference selection. Connection
records can be shared; credentials stay behind opaque references. Editing one
automation must not change another's bindings. MCP authorization follows the
[open protocol](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization).
Public A04 proves server access, not an exact server-count limit or per-tool picker.

Linear appears alongside other integrations. Its OAuth connection enables the
user's workspace/account; its trigger adapter normalizes verified Linear events,
and its tool adapter supplies only configured capabilities. Issue-created and
status-changed can map to documented issue changes. End-of-cycle needs verified
cycle-completion semantics; L02 alone does not prove that event. Avoid importing
Cursor's separate delegation integration as an undocumented automation contract.

## Handoff acceptance

| Check | Required result |
|---|---|
| UI | exact Cursor layout facts map to Linear's shell; no substituted layout |
| isolation | automation A's MCP/model edits leave B unchanged |
| interoperability | selected trigger/tool/provider bindings reach the shared runtime |
| Linear | real OAuth account connection and scoped event/tool flow are demonstrated |
| inference | configured provider/model is used; T3 Code Connect availability/errors are explicit |
| runs | actual sibling run lifecycle is displayed; no second scheduler or invented statuses |

This reset supplies the plan and interface contract. It does not claim that
runtime integration, account sign-in, or exact UI has already been implemented.
