# Evidence index

Public behavior checked 2026-10-05; launch-demo evidence added 2026-10-07.
`DOCUMENTED` means the public source says or visibly depicts the statement;
it does not certify an authenticated UI layout.

| Label | Meaning |
|---|---|
| DOCUMENTED | supported by a public specification, official documentation, or official demo |
| OBSERVED | reproduced in the product with route, state, and capture citation |
| EXTRACTED_UI | measured UI value with a reproducible reference-corpus locator |
| OWNER_REQUIREMENT | requested product behavior; not a vendor fact |
| DESIGN | our proposed interface or implementation choice |
| UNVERIFIED | missing or insufficient evidence; cannot be called parity |

| ID | Fact | Label | Source / locator |
|---|---|---|---|
| A01 | Automations run cloud agents on schedules or events | DOCUMENTED | [Automations](https://cursor.com/docs/cloud-agent/automations), introduction |
| A02 | More than one trigger is allowed; any trigger fires a run | DOCUMENTED | [Triggers](https://cursor.com/docs/cloud-agent/automations#triggers) |
| A03 | Setup chooses a trigger, prompt, optional tools, repository context, then saves and activates | DOCUMENTED | [Getting started](https://cursor.com/docs/cloud-agent/automations#getting-started); workflow steps, not geometric section order |
| A04 | An automation can connect an MCP server; connection grants all that server's tools | DOCUMENTED | [MCP server](https://cursor.com/docs/cloud-agent/automations#mcp-server) |
| A05 | The model is selectable for an automation | DOCUMENTED | [Model](https://cursor.com/docs/cloud-agent/automations#model) |
| A06 | Repository context can be none, single, or multi-repo | DOCUMENTED | [Repositories](https://cursor.com/docs/cloud-agent/automations#repositories) |
| A07 | Linear trigger kinds include issue created, status changed, and end of cycle | DOCUMENTED | [Linear triggers](https://cursor.com/docs/cloud-agent/automations#linear-triggers) |
| A08 | Webhook URL and authentication API key are generated after saving | DOCUMENTED | [Webhook triggers](https://cursor.com/docs/cloud-agent/automations#webhook-triggers) |
| A09 | The 2026-03-05 launch demo depicts list, editor, action/MCP menu, and server rows | DOCUMENTED | [D01–D08 and pinned frames](automations-launch-demo.md); historical media, not current authenticated UI |
| A10 | Cursor 3.23.12 desktop list controls, columns, actions, empty state and layout | EXTRACTED_UI | [DL01–DL35](automations-desktop-list.md); pinned raw artifacts, not authenticated or current web parity |
| L01 | Linear supports OAuth2 and PKCE for integrations | DOCUMENTED | [OAuth2](https://linear.app/developers/oauth-2-0-authentication), PKCE |
| L02 | Linear data-change webhooks support issues and cycles | DOCUMENTED | [Webhooks](https://linear.app/developers/webhooks), supported models; not proof of a dedicated end-of-cycle event |
| V01 | Current Automations page geometry, fonts, copy, section order, responsive states | UNVERIFIED | no authenticated state capture; A09 only establishes historical appearances; see [capture requirements](../specs/automations-layout.md) |
| V02 | Chained-prompt controls and exact MCP configuration cardinality | UNVERIFIED | not settled by the public facts above; do not reuse old INDEX assertions |
| O01 | Whole-Cursor exact UI; exact Cursor Automations layout in Linear Loops | OWNER_REQUIREMENT | owner directive 2026-10-05; [contract](../specs/linear-as-integration.md) |
| O02 | Linear account connection and selectable inference including T3 Code Connect | OWNER_REQUIREMENT | owner directive 2026-10-05; provider capabilities require implementation evidence |

The [old queue](../docs/archive/2026-10-04.md) is historical, not a source.
Capture UI facts for the current plan; do not promote old guessed labels or
internal component names into verified public behavior.
