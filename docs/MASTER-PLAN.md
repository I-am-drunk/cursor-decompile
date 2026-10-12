# MASTER PLAN — the automation product (working name TBD)
> Captured 2026-10-12. Everything below marked VERIFIED was proven live; everything else is a decision to validate.

## 0. What this is
A small, reliable automation server + UI: users connect their **Linear account**, define automations (trigger + prompt + optional MCP tools), and the server runs them **for free** by driving Linear's Agent chat API. UI is carved down from the cursor-decompile shell into an automations-only product.

## 1. Verified foundation (do not re-prove; cite when in doubt)
From linear-loops-decompile `reference/live-agent-protocol-2026-10-12.md` and `reference/live-mcp-system-2026-10-12.md`:
- **V1. Normal Linear Agent chat is FREE** — works at $0.00 AI credits, aiAddonEnabled=false, nothing debits. Only Coding sessions + Loops are metered.
- **V2. Full protocol cracked**: `aiConversationSendMessage` mutation (client-minted UUIDs) → `POST /sync/batch` NDJSON poll until assistant turn `status:"completed"`. Working client: `reference/linear_agent_client.py`.
- **V3. Session**: httpOnly cookie `session:<userAccountId>` (HS256 JWT, no exp claim — long-lived). Replays cross-IP from plain curl. Auth headers: `Linear-Client-Version`, `Linear-Client-ID`, `user`, `userAccount`, `organization`.
- **V4. Multi-turn** works (same conversationId + resume:true; memory verified).
- **V5. MCP end-to-end**: `integrationMcpServerPersonalConnect(serverUrl)` connects ANY MCP server with one mutation, no auth (OAuth dance only if server requires; customHeaders for bearer). Agent emits `InvokeMcpTool{tool:{name},server:{name,integrationId}}`; Linear backend calls your server. Verified with a 60-line test server (get_weather, add_numbers answered from iris).
- **V6. Agent tools**: CreateEntity/Update/Delete/RestoreEntity, StartCodingSession, PromptCodingSession, PostChatMessage, SpawnSubagent (sub-agents), event subscribe/unsubscribe. Turn parts: prompt, text(phase=answer), toolCall, widget(EntityCard).
- **V7. Skills**: AgentSkill{id,title,description,body,icon,color,shared,creator}; `agentSkillCreate` via API; slash-mention or `?skill=<id>` invocation.
- **V8. Signup/login path**: real Chrome + browser captcha solver passes Cloudflare turnstile; headless Camoufox hard-blocked. Magic link binds to requesting browser. Email code also works.
- **V9. Loops (docs)**: a Loop run IS an agent conversation (continuable). Loops are metered — our scheduler + free chat API replicates them at zero cost.
- **V10. Cursor automations (docs)**: triggers = schedule/cron, PR events, Slack, Linear, PagerDuty, webhook; tools = comment on PR, request reviewers, send/read Slack, MCP server, memories; repo scope = none/one/multi. Subscriptions = agent-created watches.

## 2. Product architecture — the small reliable server
**Thesis**: the server is a thin, boring trigger engine. Linear is the inference + tool brain. We never pay for inference.

```
┌─ UI (carved cursor-decompile shell: automations + settings only)
├─ HTTP API (small, one process)
├─ SQLite (single file: accounts, automations, runs, trigger state)
├─ Scheduler (cron tick + webhook receiver + pollers)
└─ Linear backend adapter
     sendPrompt(account, convId?, prompt, context)  → mutation
     awaitAnswer(account, convId, syncCursor)       → sync/batch poll
     ensureMcp(account, serverUrl)                  → connect-if-missing
```

### Principles (from studying T3 Code's architecture)
- **One process, one file DB.** No event sourcing, no projections, no separate web/server split. T3's serve is reliable because it's one long-lived process with a small dependency graph and typed RPC — we take the shape, not the event log.
- **Typed API boundary** (zod schemas on every route; T3 uses Effect schemas — same idea, lighter lib).
- **Runs are resumable records**: a run = {automationId, conversationId, syncCursor, status, startedAt, endedAt, resultText}. Server restart re-polls open runs from syncCursor — crash-safe with zero custom state machines (Linear holds the conversation).
- **Idempotent triggers**: trigger state = last-fired watermark per trigger; tick computes due set, fires once, then advances watermark.
- **Secrets in one place**: Linear session cookies encrypted at rest (OS keychain where available, file-locked otherwise).

### The ONE connection (v1): Linear
Settings → "Connect Linear" starts a **device-style flow**:
1. Server fires the Linear email-login challenge for the user's email (or the user pastes a magic link / session cookie manually — fallback).
2. User pastes the code/link; server completes login in a real-browser profile (Camoufox farm on the host) and captures the `session:` cookie + user/userAccount/org ids.
3. Account record persists the session; health = periodic `viewer` query; session refresh = re-run the flow on 401 (with a headless browser profile per account so minting new sessions is automated where possible).
4. Multiple accounts supported (each = an independent free budget). Per-automation account pinning + round-robin default.
T3-code connection: NOT in v1 (do not build).

### Automations (v1 scope)
- Trigger kinds: **cron schedule** (preset + custom), **webhook** (per-automation secret URL), **manual "Run now"**. (GitHub/Slack/Linear event triggers = v2 via pollers; subscribe via agent `SubscribeToEvent` is a research item.)
- Action: prompt text (ProseMirror doc), optional context refs, optional MCP servers (auto-connected on the chosen account via V5), optional model note.
- Run lifecycle: queued → sent → polling → completed|failed; result text + turn parts stored; runs list + run detail (reuse captured UI).
- Tools v1: MCP only (Linear built-ins like CreateEntity come free with the agent).

### The open abstraction (v2 seed, design for it now)
The server itself should later be exposable **as an MCP server** ("give Claude in my browser an MCP that makes automations on my server"). Therefore:
- Every automation operation exists as a typed function in `src/core/` (createAutomation, fireRun, getRun, listRuns, upsertMcp) — the HTTP API and the future MCP facade both call these, nothing else.
- Auth boundary in one middleware (token → account set), so the MCP facade inherits it.

## 3. UI carving map (cursor-decompile → this product)
**Keep & harden**: automations list, automation editor, run history + run detail, trigger config (schedule presets/cron editor, webhook), MCP config (connectors list, add-custom-server, per-server tools), model display, sidebar (collapsible), login/connect screens.
**Carve OUT**: Codebases page; every Cursor-branded string/logo/name; "code review"/PR-centric pages not in the automation domain; billing/plan gates; any IDE-specific surfaces. Settings: keep only {Linear connection, MCP connectors, accounts, general}. Everything else deleted, not hidden.
**Polish targets (parity with the original, and Devin where better)**:
- Scheduling dropdown on the automation page → adopt the **Devin** layout (user preference; devin-decompile repo has the spec: DEVIN_AUTOMATIONS_DECOMPILED_SPEC.md + COPY_CATALOG).
- Sidebar compact mode: show compact icons (currently broken).
- Hover/drag states on sidebar pages.
- Animations that differ from the original: fix or delete — no half-working motion.
- Login flow: a real account login feature (Linear connect IS the login for v1).

## 4. Workstreams & agent assignments (max 4 concurrent)
| Agent | Model | Mission |
|---|---|---|
| A — UI: settings carve | gpt-6-astra-ultrafast | Remove everything Cursor-branded/unrelated from Settings; leave {Linear connection, MCP connectors, accounts, general}; delete dead routes; ensure zero broken links |
| B — UI: automations carve+polish | gpt-6-astra-ultrafast | Remove Codebases page + non-automation pages; fix sidebar compact icons + hover states; Devin-style scheduling dropdown (use devin-decompile spec); kill broken animations |
| C — Server architecture | claude-fable-5-1 (effort: high) | Study ~/decompile-hub/t3code apps/server; produce ARCHITECTURE.md: the smallest reliable server implementing §2 (routes, sqlite schema, scheduler, Linear adapter, core facade); then scaffold src/server |
| D — Linear connection | claude-fable-5-1 (effort: high) | Implement the Linear connect flow end-to-end (challenge fire → code/link paste → browser-profile login → session capture → account registry + health check), per §2, with the fallback manual-cookie paste |

Rules for every agent: work in ~/cursor-decompile on a branch; small PRs; never touch `facts/`, `corpus/`, captured evidence; follow AGENTS.md; zod-validate API inputs; no new dependencies without justification in the PR.

## 5. Sequencing
1. (Now) This plan lands; agents A–D launched.
2. A+B merge → UI is automations-only and clean.
3. C scaffolds server; D lands Linear connect → first end-to-end: create automation (cron) → server sends prompt → Linear answers → run record shows result.
4. Webhook trigger; MCP attach per automation (uses V5).
5. v2: event triggers (GitHub/Linear pollers), MCP facade exposure, multi-account rotation.

## 6. UI RULE (owner directive 2026-10-12, supersedes all UI lanes)
**COPY-FIRST, CHISEL-ONLY.** Every pixel, layout, style, and string starts from the CAPTURED original (facts/*.md, artifacts/ screenshots); agents only DELETE. Nothing invented ships — an invented surface is worse than a missing page. Settings copies Cursor's own settings layout (facts/settings-*) chiseled to {Linear connection, MCP connectors, Accounts, General}. No standalone search page — copy Cursor's sidebar top-right search button. The chat page is LINEAR-ONLY and gated: no connection → center-screen "Connect to Linear" with "Linear" underlined in an accent color, routing to the connect page.
