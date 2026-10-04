# facts/INDEX.md — the work queue

One row = one file = one PR. Claim on issue **#1** before branching.

Artifact: `workbench.anysphere-ui-automations.js` (8.85 MB), Cursor 3.23.12.
The automations surface is its own bundle and retains original identifier
names, so these rows are extraction, not inference.

| Row | File | Scope | Status |
|---|---|---|---|
| F-LIST | `list-view.md` | The automations list: `AutomationsListHeader`, `AutomationRowActions`, `AutomationRowActionMenuItem`, `AutomationsCompactSearchInput`, "All Automations" / "Add Automation" / "Automation filters", filter vocabulary, row status badges, empty states (`automations-action-icon-empty`) | open |
| F-DETAIL | `detail-view.md` | The automation detail/editor page: section order and every section component — `AutomationSection`, `ActionsSection`, `PromptsSection`, `MemoriesSection`, `EnvironmentSection`, `MarkdownSection`, `ParameterSection`, `BooleanParameterSection`, `EnumParameterSection` | open |
| F-TRIGGER | `triggers.md` | Trigger model: `AddTriggerMenu`, `SingleTriggerCard`, `MultiTriggerForm`, `TriggerRow`, `HoverOptionsTriggerRow`, `isDuplicateTriggerMcp`, the trigger-type catalog, per-type option forms | open |
| F-MCP | `mcp.md` | **The headline feature — MCP per automation.** `McpActionForm`, `McpActionRow`, `McpServerSubmenu`, `McpStatusBadge`, `buildMcpPluginByServerName`, `createMcpActionDraftState`, `findAvailableMcpServerForAction`, `isMcpServerMissing`, `matchMcpServersByAuthRefs`, `normalizeMcpUrl`, `resolveMcpServerStatusTarget`, `resolveNamedMcpLogo`, `sortMcpServersByName`, `getHumanReadableMcpError`, `onSetupMcp`, `resolveTemplateMcpActionsForPrefill` | open |
| F-ACTIONS | `actions.md` | Non-MCP actions: `SlackActionForm`, `hasSlackMcpAction`, `MicrosoftTeamsActionForm`, `PrCommentActionForm`, `AddToolMenu`, the action-kind registry | open |
| F-PROMPT | `prompts.md` | Prompt config: `AutomationPromptEditorCard`, `AutomationPromptTextarea`, `ChainPromptConfigRow`, `ChainPromptModelPicker`, `PromptModelPicker`, `PromptRunModeMenu`, chaining semantics (`automations_chain_prompts`) | open |
| F-SCHEDULE | `schedule.md` | Scheduling: `InlineCronCustomEditor`, cron grammar and presets, the single `rrule` reference, timezone handling, validation copy | open |
| F-RUNS | `runs.md` | Run surfaces: `AutomationRunSummaryDialog`, `AutomationRunSummaryBody`, `automationRunViewModelEquals`, "Automation failed", run status lattice | open |
| F-WEBHOOK | `webhook.md` | `WebhookConfigPanel`, generate/copy affordances, the allowlist tokenized input (`automations-allowlist-token*`) | open |
| F-SCOPE | `scope-and-env.md` | `applyDefaultAutomationScopeToDraft`, org-scoped triggers (`automations_org_scoped_triggers_ui`), `EnvironmentSection`, repo/branch pickers (`SharedRepositoryPicker`, `SharedBranchPicker`, `HeaderBranchPicker`, the `automations-branch-picker-*` family) | open |
| F-TEMPLATE | `templates.md` | `TemplateCard`, `TemplateGallerySectionView`, prefill paths, suggested categories | open |
| F-FLAGS | `flags.md` | The 10 `automations_*` feature flags: what each gates, and which branch ships on by default | open |
| F-LAYOUT | `layout.md` | **What the Linear project consumes.** Page skeleton, `PageHeader`, content containers (`automations-content-container`, `automations-detail-content`), caption/stack primitives, the spacing and radius scale, light/dark token flow | open |
| F-LINEAR | `linear-trigger.md` | `automations_linear_status_trigger_filter` — Cursor's own Linear integration, which is the shape our integration should match | open |

## Fact-file format

```markdown
# <area>

Artifact: cursor 3.23.12 · `workbench.anysphere-ui-automations.js`

| Fact | Value | Label | Citation |
|---|---|---|---|
| list header label | `All Automations` | PROVEN | identifier `AutomationsListHeader` |
```

Behavior that needs more than a table row goes in `specs/<area>.md` and links
back to the fact rows it rests on.
