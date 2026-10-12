# Creation eligibility and real run rows — 2026-10-12

## Observed API result

**Creation is allowed; Cloud Agent execution is plan-restricted.** These are
separate observations, not an inference from the UI upsell.

All requests used the normal endpoints through the signed-in Twilight page.
No credentials were committed, entitlement flags modified, billing changed,
or automatic schedules enabled. HARs may contain session material and must
remain private. Raw responses remain under
`reference/automations/rows-2026-10-12/`.

| ID | Artifact | SHA-256 |
|---|---|---|
| P1 | `creation-probe.json` | `b1f9429c0683cd5211b83b79223fc68e5c4fcc0771e8dd9c05abc0ca7f0471b8` |
| P2 | `creation-second.json` | `182f7786e493e830da281d8b423f5ee8f533bfbae1dc578d4dcdd6916948780c` |
| P3 | `repo-run-probe.json` | `8a9b12170da102d863e5a71d2c75d9a99dab87c071b7555596bc95718f73b9ab` |
| P0 | `run-probe.json` | `b8c5e6b7ccdaeb59b530ab3327d06da6d337764f38f3f77ca3a7af33c8183e6c` |
| S1 | `after-creation-window.png` | `d4cdc062580c71bfc60f35fbf89b3cb896cfb0afb49a5a8ca2ed46f703ce774c` |

- **OBSERVED:** P1/P2 `calls[1]`: `POST /api/automations/create-automation`
  returned 200 twice. The request explicitly used `enabled:false`, private
  user scope, no tool actions, and an annual cron. The later list requests
  returned one and then two definitions. Response `enabled` is omitted:
  the captured protobuf declaration defines it as a default-false boolean.
- **OBSERVED:** after reload, `/automations` still renders the upsell (S1).
  An API-populated list is **not** evidence of visible populated list rows.
- **OBSERVED:** a no-repository test request returned 400 for missing git
  configuration, not for plan eligibility (`run-probe.json`, `calls[0]`).
- **OBSERVED:** P3 adds this public repository as context while leaving the
  automation disabled; the corrected manual test returns 400 and creates one
  real failed run. `JSON.parse(calls[2].response).runs[0].failureDetails.code`
  is `AUTOMATION_RUN_FAILURE_CODE_CLOUD_AGENT_PLAN_RESTRICTED`.

Declaration source: `routes/bodies/0051-036b2cef180b8e55.js`,
SHA-256 `036b2cef180b8e558468683a0605b407482d0320daec94bf72f7110b351c3fcf`.
Byte ranges `[2760,3040)` (Automation enabled field), `[24000,24520)`
(creation request), `[16670,17300)` (workflow), `[63500,64400)`
(test request wrapper). Numeric enums used in the probe come from the same
bundle: private USER scope = 1, PORTAL_WEB creation source = 1.

## Observed UI, after agent-created setup

Run History now has a real failed row. Columns are **Automation, Model,
Triggered, Tools, Status, Duration**, then unlabeled actions. This test shows
Composer 2.5, an em dash for tools, Failed, and `< 1m`. The row menu contains
**View details** and **Edit Automation**.

View details opens a **Run summary** modal without changing the route.
It shows a dated Trigger section, Test run, the plan-restriction title/message,
an Upgrade link, Close, and View Automation. This is a real failed-launch
record, not a simulated successful execution.

Screenshots and computed-style snapshots in the private capture directory
record these states. Property-level pins are added in `ui-facts.json`.
Successful/running runs, tool output, and the populated automation-list UI
remain **UNVERIFIED**; the latter is still hidden by the normal plan gate.

**Further observation:** View Automation successfully opens the saved
definition's `/automations/<id>` editor on this account. The main list remains
gated; that does not imply the saved editor is gated. Captures include the
saved editor, its Add Tool or MCP menu, the empty MCP submenu, Browse MCPs,
the unsubmitted Custom MCP form, and the model picker. No connection was
saved or authorized. These screenshots are evidence for a later editor
parity slice, not a claim that this PR reproduces all those controls.

The current saved-editor model menu also differs from the earlier API
catalog subset. Preserve these separate capture states; do not equate the
old catalog response with the new visible picker.

## Local row implementation

The global run table now matches the observed seven-column structure,
click-to-summary behavior, row menu labels, failure detail, and navigation
to the saved automation. The reference-derived local fixture uses sanitized
IDs and is explicitly labeled; it is not a live local execution.
Automation-list Model/creator ordering, owner search, stable enabled-first
sorting and row actions follow pinned extraction. Its rendered parity,
successful/running run detail and full editor parity
remain UNVERIFIED.

## Deliberately created account data

Two **agent-authored** private test definitions were created:

- `C-AUTOMATIONS TEST 2026-10-12 A - disabled`
- `C-AUTOMATIONS TEST 2026-10-12 B - disabled`

Both remain disabled. A was given the public
`I-am-drunk/cursor-decompile` repository to correct the first test's validation
error; B has no repository. No further execution was attempted after the
explicit plan-restricted failure. IDs and cleanup references stay in the
private probe files. These are not pre-existing user automations.

## Verification and handoff

- 23 tests pass, including timestamp/duration formatting, row semantics,
  summary escaping, creator search and reference-state rejection.
- 67 fact records validate; 66 pinned raw-source locators reproduce.
- Current-build Twilight exports at 1270 × 764 CSS px / DPR 2 pass
  **101 failed-row + 72 summary + 29 menu checks**. The original upsell and
  empty-history checks also pass: **303 measured checks total**.
- Mouse and keyboard row activation, menu selection, Escape focus return,
  View Automation navigation and browser Back were exercised locally.
- The new private HAR has 628 entries and every recorded JS/CSS body.
  `editor-observations.jsonl` preserves the additional read-only editor
  observations; no new MCP connection or authorization was submitted.

Remaining gaps: the main populated automation-list UI is still gated,
successful/running execution cannot be observed on this plan, and full
font/icon pixel parity is not certified. Next: use the now-reachable saved
editor/MCP captures for a separate control-parity slice; a paid-plan reference
is needed for genuine successful-run and populated main-list verification.
