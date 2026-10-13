# Vision audit — NOTES (night of 2026-10-13)

Auditor lane: branch `vision-audit`. Law: `/tmp/goals/VISION-BRIEF.md` + `GOAL-SYSTEM.md`.
One entry per audit. Verdicts: **on-vision** · **drift** · **slop-risk**. Newest at the bottom.
I review; Runner steers. I do not edit other lanes' files.

Reading key for fixes: `FIX →` is the specific change the lane should make. `ASK →` is a
question only the owner can answer; Runner should park it, not guess.

---

## 01 · 01:35 · `vision-connector-packages` b8f5638 — docs/CONNECTOR-PACKAGES.md (520 lines)

**Checked:** thesis, D1–D9, package shape, skills model, auth, pacing, Linear reference package,
authoring UX, settings impact, v1 cut, open questions.

**Verdict: on-vision, with two drift points.**

- On-vision: "connection + tools + skills" is exactly the owner's thesis; Linear is the only brain;
  Devin's {MCP, Skills, Rules, Hooks} shape is the proof; v1 cut is ruthless; open questions are
  ranked and honest. Google Classroom worked example is the right north star.
- **Drift 1 (D8):** renames "MCP connectors" → "Packages" and keeps four settings entries. The
  owner's decision the same night is Devin's Customize order **Plugins · MCPs · Skills · Rules ·
  Hooks · Subagents**, with MCP mattering most. CONNECTORS-PAGE-SPEC C1/C3 already has this. Two
  specs now disagree on the settings nav.
  FIX → CONNECTOR-PACKAGES §10 should defer to CONNECTORS-PAGE-SPEC §1/§3: a package *is* a
  Devin plugin; drop the "Packages" destination name.
- **Drift 2 (D9 "no marketplace"):** written before the live Devin marketplace access was
  verified (devin-decompile 741da31, 23:58). Brief now says "Connect Devin account" exists to use
  that marketplace. The v1 cut table still lists marketplace as out.
  FIX → add one line to §11: "Browsing Devin's marketplace via a connected Devin account is in
  (CONNECTORS-PAGE-SPEC §4.1); *publishing* our packages to it stays v2."
- **Slop-risk, mild:** §7 budget defaults `6 / 12 / 2` and §5.1 char budgets (6,000 / 12,000 /
  24,000) are DECISION numbers with no measurement behind them. Fine for a plan; must not be
  copied into code as if evidenced. Label them "placeholder until measured" in the doc.
- Simplicity test passes: one folder, one manifest, prose skills. Nothing clever.

## 02 · 01:54 · `ref-raycast-animation` 97eb399 — docs/interactions/raycast-animation.md (29 lines)

**Checked:** interaction contract written before the proof; extracted source tree
(`reference/raycast/extracted/`: config.json, cube/glass shaders, glass-scene.js, 4.2 MB total);
`proof-entry.mjs` (imports three.js from `/tmp/raycast-build`); evidence PNG + perf AX dump.

**Verdict: on-vision for the extraction step; drift-risk on the destination.**

- On-vision: doc-before-code is obeyed (29-line contract first, no implementation yet). It
  refuses to invent a light-theme palette or reduced-motion behavior. "Any approximation must be
  labeled and rejected as exact" is precisely the owner's "replicated EXACTLY" demand.
- **Drift-risk 1 — "instant" and "tiny" are not yet in the contract.** The source is a
  three.js WebGL scene (glass transmission, 6 refraction samples, 1024px render target, DPR 2).
  The brief says "re-engineered to be instant (mathematical derivation, tiny package)". The
  contract's optimization stages (strip hydration → specialize dead branches → replace scene
  machinery) are the right order, but no budget is stated. A faithful three.js port is likely
  300–600 KB gz and a first frame well past 100 ms.
  FIX → add a budget block to the contract before proof-2: first visible frame ≤ 50 ms after
  HTML parse; shipped JS ≤ 30 KB gz (no three.js runtime in the final); GPU work per frame
  ≤ 4 ms at 1512×982 DPR 2. State that the end state is a hand-written WebGL program (two
  shaders + one quad/cube) or a pure-CSS derivation, and that three.js is scaffolding only.
- **Drift-risk 2 — two-tone light/dark.** Brief: "Two-toned, adapting to dark/light mode."
  Contract: "no alternate palette has been extracted … do not invent colors." Both are right;
  the gap is unbridged. The source has `color1..3` in config.json.
  ASK → owner: is light mode the same shader with the three config colors remapped (a derived
  palette, labeled DESIGN), or is light mode out of scope until a captured light reference
  exists? Runner should park this rather than let the lane guess.
- **Conflict with LOGIN-PAGE-SPEC (plan-devin-mashup):** that spec offers three invented
  backgrounds (gradient mesh / aurora / constellation) and recommends A. The owner decided
  raycast. LOGIN-PAGE-SPEC §2 and §4 are now dead text. See entry 03.
- Slop check: `proof-entry.mjs` imports from `/tmp/raycast-build/node_modules` — a machine-local
  absolute path. Fine for a scratch proof; must not survive into anything committed as product.

## 03 · 00:12 (landed) · `plan-devin-mashup` 36f8c58 — docs/LOGIN-PAGE-SPEC.md (143 lines)

**Checked:** L1–L6, perf budget, three background options, form table, acceptance.

**Verdict: drift — superseded by the owner's raycast decision.**

- §2 (gradient mesh / aurora / constellation) and §4 (comparison) are **invented** backgrounds.
  The owner decided today: login background = raycast.com load animation, exact. Three invented
  options are precisely the "one-shot design" pattern he rejected.
- What survives and is good: §1 performance budget (0 ms main-thread, ≤ 3 layers, reduced-motion,
  `document.hidden` pause, ≤ 4 KB CSS + 3 KB JS), §3 form table (copied Cursor 28px/6px inputs,
  C-BUTTON, `role=alert`), §5 acceptance (CU pass at two viewports, light and dark, DPR 2).
  FIX → rewrite §2 as "Background = raycast animation, see docs/interactions/raycast-animation.md";
  delete §4; keep §1 budget but raise the JS ceiling to the number the raycast lane proves it needs
  (and no higher). Open question 1 in MASHUP-PLAN §8 is answered; strike it.
- Note the §1 budget ("0 ms JS steady state") and the raycast source (WebGL per frame) are in
  direct tension. The raycast lane must reconcile them in its contract, not quietly drop the budget.

## 04 · 00:07 (landed) · `plan-devin-mashup` def9868 — docs/SETTINGS-SIMPLIFICATION.md (123 lines)

**Checked:** S1–S8, card anatomy, in-card connect flow, teams-in-code, multi-account, acceptance.

**Verdict: on-vision. Closest thing to the brief's §4 tonight.**

- One card, one title, one button, one help line. Teams ported verbatim behind a flag that
  removes DOM. Disconnect dialog copied from Devin verbatim. The email-code flow replacing the
  button in place is exactly "no field clutter."
- **Gap, not drift:** the brief adds "Connect Devin Account" (marketplace access) and says
  "Settings layout = linear list: Connect Linear account, Connect Devin account." This spec
  predates that; it only has Linear.
  FIX → add S9: a second card with identical anatomy, title `Connect Devin Account`, status
  line, one `Connect` button; connected state shows the org id from `GetAccountManagedPlugins`.
  Credential = the desktop session token (re-server LIVE-MARKETPLACE-ACCESS); input is one
  masked field, same as the Linear cookie fallback. No scopes list, no explanation paragraph.
- **Watch:** S7 "Connect another account" half-height card is a DESIGN element with no capture.
  Acceptable only if multi-account ships in v1; otherwise delete it from the spec to keep the
  page at exactly two cards.

## 05 · 02:21 · `ref-atsu` bf11753 — reference/atsu/** (Atsu public app + catalog assets)

**Checked:** commit shape (file count, asset vs doc ratio), presence of an index or notes file.

**Verdict: on-vision as a capture; slop-risk if it stays undocumented.**

- Capturing atsu.moe is in the brief's reference list (Cursor, Devin, atsu.moe, raycast.com).
  Raw originals in `reference/` are the right place; this is evidence, not invention.
- **Slop-risk:** a commit of hundreds of binary posters with no `README`/`INDEX.md` naming
  *what* atsu is a reference for (which interaction, which page) is a pile, not evidence.
  Evidence hierarchy needs a locator. Nobody in the morning will know why 365 KB posters matter.
  FIX → one `reference/atsu/INDEX.md`: source URL, capture date, what we intend to copy from
  atsu (my guess from the brief: list/grid polish and poster card motion), and which of our
  surfaces it informs (the automation-projects board?). Until that exists the lane should not
  cite atsu in any interaction doc.
- Size check: binary assets inflate the repo. If the captured tree exceeds ~50 MB, move posters
  to a tarball outside git or keep only the sizes we will measure against.

## 06 · 00:12 (landed) · `plan-devin-mashup` — docs/CONNECTORS-PAGE-SPEC.md (274 lines)

**Checked:** C1–C8, settings nav, Connections page, Customize Plugins/MCPs/Skills tabs, MCP
detail, Add-custom-MCP dialog, packages-as-plugins mapping, server contract summary.

**Verdict: on-vision, one drift, one simplicity flag.**

- On-vision: tab order is the owner's (Plugins · MCPs · Skills · Rules · Hooks · Subagents),
  copied byte-offset-PROVEN from 3.10.48. "Our packages = Devin plugins, no adapter" (§7) is the
  right call and dissolves the CONNECTOR-PACKAGES D8 conflict in the right direction.
  Credentials-never-reach-browser (C7) matches the brief.
- **Drift (C4 / §4.1):** marketplace = public `registry.modelcontextprotocol.io`, with Devin's
  catalog explicitly *not* proxied. The brief says the opposite tonight: we have live access to
  Devin's marketplace and "Connect Devin account" exists to use it.
  FIX → C4 becomes: Available = Devin catalog (`GetAvailableCascadePlugins`, 52 plugins) when a
  Devin account is connected; public registry as the fallback when none is. Same card UI either
  way. Note install writes (`InstallCascadePlugin`) still need owner approval — read-only first.
- **Simplicity flag (C1):** nav is `Linear · Connections · Customize · Accounts · General`.
  Brief §4: "Settings layout = linear list: Connect Linear account, Connect Devin account."
  A separate `Connections` destination that in v1 shows only the Linear row duplicates the
  `Linear` entry. Two doors to one room.
  FIX → drop `Connections` from the v1 nav; its row anatomy stays in code for v2. Nav becomes
  `Accounts (Linear · Devin cards) · Customize · General`, or keep `Linear` as its own entry if
  the owner wants it as the first thing seen. Either is three entries, not five.

## 07 · 00:14 (landed) · `plan-devin-mashup` c30282c — docs/SERVER-FROM-DEVIN.md (192 lines)

**Checked:** §0 lessons table, §1 forced changes, §2 HTTP contract, §3 slice map, §4 events
projection, §5 preflight, §6 gateway, §7 supersession of the T3-derived ARCHITECTURE.md.

**Verdict: on-vision. This is the "Devin's split, not T3" pivot the owner asked for, done cleanly.**

- Client = dumb CRUD over Devin's endpoint names so copied pages call the server unchanged.
  Linear stays the only brain. Supersession table is explicit about what dies from the T3 plan.
- **Slop-risk:** §2 keeps ~30 endpoints for v1. Several serve pages that are themselves cut
  (sparklines/tags for a list the owner may not want in that form; code-step routes for a
  disabled feature). "Accepted, stored, disabled" preflight (§5) is dead weight in v1.
  FIX → split §2 into "v1 served" and "accepted-but-404" columns, and move code-step to
  the 404 side entirely. A route that exists only to round-trip a hidden Advanced card
  fails simplicity test 2 (does it earn its pixels?). Reinstate when the step runner exists.
- **Consistency:** §6 says Devin's catalog is "not proxied"; see entry 06 FIX. Update together.
- Open question to carry: the automation-projects board (brief, iPhone-home-screen model) has
  **no server concept yet** — no `project`/folder table, no `automation.project_id`. Cheap now,
  a migration later.
  FIX → add `automation_folders` (`id, name, position`) and `automations.folder_id` nullable
  (null = unfiled) to §3 before any schema PR lands.
- **Measured after writing the above:** the atsu tree is **151.9 MB across 1,081 files**
  (posters at 4 sizes each, full JS/CSS bundle, 13 catalog JSON feeds). That is 3× the
  threshold I set one bullet up. Upgrading the verdict on size to **slop-risk**.
  FIX → keep `site/index.html`, `site/assets/*.{js,css}`, `manifest.json`, and ONE poster
  size (`-large.avif`) in git; move the rest to a tarball referenced from `INDEX.md`. Runner
  should ask the lane to rewrite the commit before it merges anywhere.

## 08 · 02:49 · `design-settings-v2` 56311b0 — docs/SETTINGS-V2.md (179 lines)

**Checked:** V1–V8, page diagram, row anatomy, Linear row states + email-code flow, Devin row
states + token-capture flow, shared behaviour, registry for future connections, acceptance.

**Verdict: on-vision. Best doc of the night. Ship it to Runner as the settings source of truth.**

- Matches the brief §4 literally: one page, one column, two rows, one big button per row,
  flows open inside the row, no field clutter, teams behind a flag. Supersedes
  SETTINGS-SIMPLIFICATION explicitly instead of silently (entry 04 FIX is now done).
- "Connect Devin Account" is specified with VERIFIED evidence and reads the token from the
  desktop app cache before asking the user to paste. That is the right default: zero typing.
- Future connections = one registry entry, zero UI (V7). This is the simplicity test passing.
- **Residual DESIGN items to pin, not drift:** big button 32px (Astra capture pending, honestly
  labeled), `min-w-[112px]`, Devin disconnect-dialog body sentence, 150 ms row-height ease.
  FIX → Astra captures one live Devin `Connect` button height; then strike the DESIGN label.
- **One copy nit:** heading `Connections` on a page whose rows say `Connect … Account` is fine,
  but the nav entry that opens it must not also be called `Connections` if the Customize
  destination exists beside it (see entry 06 nav collapse). Decide the nav once.
- **Interaction gap (GOAL-SYSTEM §1 wants hit targets):** no hit-target sizes for the overflow
  chevron (`size-3` glyph = 12px). FIX → state the clickable area (whole secondary button opens
  the menu, or a ≥ 24px trailing zone). Twelve-pixel targets are how sloppiness starts.

## 09 · 22:27 (landed) · `plan-linear-connection` 6e74317 — LINEAR-CONNECTION.md + LOOP-RUNTIME.md (662 lines)

**Checked:** D1–D8 (connection), R1–R9 (runtime), 8-state run lifecycle, prompt templating,
skill injection, elicitation handling.

**Verdict: on-vision. Linear-as-brain is specified from VERIFIED live captures, not guesses.**

- Every decision cites an observed mutation or sync row from linear-loops-decompile. "Never
  resend after dispatch" (R5), "elicitations never auto-answered" (R9), "no refresh, mark
  expired" (D4) are all the boring, exact choices.
- **Slop-risk, mild:** R6 concurrency constants (1 send / ≤ 3 polling / ≥ 2 s / 60 req per min)
  are DESIGN with a note "tunable, not logic". Good labeling; same rule as entry 01: do not
  copy into code as evidenced. Measure on first live run and record.
- **Drift-risk in D3:** Turnstile is solved by a server-driven headed Chrome profile. That is
  a heavy moving part for a login flow the owner wants to feel instant. The cookie-paste
  fallback (D3 path B, SETTINGS-V2 §3.1) is the simpler path.
  ASK → owner: is "paste a session cookie once" acceptable as the *primary* v1 flow, with
  the email-code flow as v2? It removes a Chrome dependency from the server entirely.
- §2.3 defines connector packages as `src/connectors/*.json` with `{title, body}` skills.
  That predates CONNECTOR-PACKAGES.md (folder + frontmatter). FIX → §2.3 points at
  CONNECTOR-PACKAGES §3 and drops its own shape. One package format, one place.

## 10 · 03:00 · linear-loops `re-chat-automations` 008326b — docs/LINEAR-CHAT-AUTOMATIONS.md (301 lines)

**Checked:** entity model (WorkflowDefinition / Draft / AiConversation / LoopExecution), chat
authoring presets, publish boundary, RunLoop tool, run history queries, widget registry.

**Verdict: on-vision as research; one strategic question it raises for the owner.**

- Rigorous: every claim labeled EXTRACTED / VERIFIED / UNVERIFIED with byte-offset citations;
  it refuses to call a draft edit a publish. This is what evidence looks like.
- **Strategic finding:** Linear already has native Loops: definitions, drafts, scheduled runs,
  run history, inbox notifications, EntityCard widgets. Our LOOP-RUNTIME plan drives plain
  chats and keeps run state in our SQLite. Two run systems now exist on the same brain.
  ASK → owner: are our automations *our* records that talk to Linear chat (current plan,
  fully in our control, verified free), or thin wrappers over native Linear Loops (less code,
  but RunLoop dispatch and publish are UNVERIFIED and entitlement is unknown)? The brief says
  "our server is a thin orchestrator"; it does not say which. Runner should not let a lane
  pick silently. Current plan stays the default until the owner answers.
- No drift in the doc itself. It does not recommend; it maps.

## 11 · 21:41 (landed) · `plan-ui-extraction` aeb5b19 — docs/UI-EXTRACTION-MAP.md (267 lines)

**Checked:** provenance block, shell extraction table, sidebar pixel/motion contract,
settings extraction table, Devin automations file-by-file table.

**Verdict: on-vision. This is the antidote to the sidebar trauma.**

- Sidebar is specified from the captured source constants (280px panel, 43px edge, 150/200 ms
  motion, clip-path insets, exact glyph names) with "do not replace with opacity-only labels or
  squeezed widths" called out. "Never add whole-rail focus/drag expansion" kills the first-pass
  invention by name. Copy-first is enforced row by row with acceptance evidence per file.
- Honest about the missing `corpus/` tree: it bounds its own claims rather than guessing.
- **Stale rows:** §3 still says "exactly four settings destinations: Linear connection, MCP
  connectors, Accounts, General" and plans `McpConnectorsPage.tsx`. SETTINGS-V2 and the
  Customize decision supersede this.
  FIX → §3 header points at SETTINGS-V2 (connections list) and CONNECTORS-PAGE-SPEC §3–§5
  (Customize); keep the row/frame extraction rows, retarget `McpConnectorsPage` to the
  Customize MCPs tab. The extraction evidence is still right; only the destination names moved.
- Nothing clever. Keep as the shell source of truth.

## 12 · 04:40 · `plan-devin-port` 2630d27 (local) / 991d4ae (origin) — docs/DEVIN-PORT-MAP.md (1,268 lines)

**Checked:** §1 authority, §2 inventory (19 feature files), §3 Cursor-gap table, §4 run/event
contract, §5 trigger + RRULE schedule contract, §6 handoff, §7 pinned ledger, Appendix A size.

**Verdict: on-vision as evidence; slop-risk on scope and on the pushed copy.**

- On-vision: every row is EXTRACTED with S-section citations; it refuses to invent (`linear:cycle_end`,
  model picker, cron→RRULE without proof). It resolves the six-minutes-vs-six-hours spec
  contradiction by reading the bundle. "Unknown is not permission to invent" is the brief verbatim.
- **Slop-risk 1 — the pushed branch is truncated.** `origin/plan-devin-port` 991d4ae holds a
  65-line file; the real 1,268-line doc is only in the local worktree commit 2630d27. Same for
  `plan-ui-extraction` (origin 141 lines vs local 267). The two tips have diverged with the same
  message and timestamp. A morning reader on GitHub sees a stub.
  FIX → Runner: `git push --force-with-lease origin 2630d27:plan-devin-port` and
  `aeb5b19:plan-ui-extraction`. Also delete the stray untracked copies of both files sitting in
  the `design-decisions` working tree (`docs/DEVIN-PORT-MAP.md`, `docs/UI-EXTRACTION-MAP.md`).
- **Slop-risk 2 — scope.** §2 inventories Devin's *entire* automations surface: Advanced
  section with ACU/spend limits, security profiles, network allow-lists, child sessions,
  Preflight, Issues triage sheet, consumption charts. The brief's product is "deliberately
  small" and Linear-only. 1,030 lines of Appendix A copy for controls we will cut is a ledger,
  fine; but §3 "port mappings" should not treat all of §2 as the v1 target.
  FIX → add a one-table "v1 keeps / v1 hides / cut" pass over §2 before any component PR.
  My read: keep list, editor (Name · Triggers · Agent · Notifications), detail Events; hide
  Advanced except metadata; cut Issues/Consumption/analytics until a run exists to chart.
- **Design flag (§3 row 1):** a *composed* global Run History page (analytics date controls +
  EventsSection) is an invention, honestly labeled "requires owner plan review." Keep it parked.
  Cursor's captured global Run History (facts/automations-web-capture) is the copy source if
  the owner wants that view; do not compose a third thing.
- Cross-lane contradiction found here, logged as entry 15 (cron vs RRULE).

## 13 · 04:45 · `plan-server-architecture` 97f6018 — docs/ARCHITECTURE.md (416) + SERVER-SCAFFOLD.md (114)

**Checked:** A1–A10 decisions, slice map, schema, scheduler, §9 provenance table; cross-read
against SERVER-FROM-DEVIN §7 supersession table.

**Verdict: superseded — correctly. Do not merge; harvest.**

- This is the T3-derived plan the owner rejected ("kind of slop"). SERVER-FROM-DEVIN c30282c
  already says it supersedes 97f6018 where they conflict. Good: the pivot was explicit.
- What is worth keeping from it (and SERVER-FROM-DEVIN §7 does keep): one Node process, one
  SQLite file, slice-per-folder with `index.ts` as the only public surface, tagged errors,
  resumable runs, `recoverOpenRuns` on boot, FakeClock/FakeLinearClient test harness. These
  are boring and exact. The `check-boundaries.mjs` CI rule is the one piece of discipline
  that stops a mega-PR from smearing across slices.
- What dies: A10 mentions what was not taken from t3code; fine, but A1–A9 still cite t3code
  as the basis. The owner's model is Devin's client/server split. Provenance matters to him.
  FIX → Runner: close the lane. Leave the branch as reference; SERVER-FROM-DEVIN is the only
  server plan. If SCAFFOLD's file tree is reused, re-home it under SERVER-FROM-DEVIN with
  the triggers slice changed to RRULE (see entry 15).

## 14 · 04:50 · devin-decompile `re-desktop-3.10.48` 0cc66a8 + `docs-public-spec-2026-10` b20e607

**Checked:** re-desktop: cloud 2026-10-13 capture (7 live asset hashes: customize,
PluginManifestEditor, PluginFilesEditor, CreatePluginDialog, managed-plugins, mcp-marketplace
route, linkedPluginNames), verify script. docs-public-spec: PUBLIC-DOC-INCONSISTENCIES (13
items), marketplace-publishing + plugin-SDK public specs.

**Verdict: on-vision as evidence. Two items the product lanes must read tonight.**

- The cloud capture is labeled "Remote runtime, not frozen desktop 3.10.48 source" with
  per-file SHA-256. That is the evidence hierarchy done right; remote web is kept separate
  from the desktop bundle so nobody cites a web class on a desktop surface.
- **Item for CONNECTORS-PAGE-SPEC / CONNECTOR-PACKAGES:** Devin's cloud now has a Create
  Plugin dialog + manifest JSON editor + files editor. That is the authoring UX the owner's
  connector packages need (CONNECTOR-PACKAGES §9). Copy it; do not design one.
  FIX → the connector lane's §9 should cite `CreatePluginDialog-CigB-aT0.js` and
  `PluginManifestEditor-CQyLf8Bc.js` as the copy source and mark its own authoring sketch DESIGN
  until those are traced.
- **Item for the scheduler (entry 15):** INCONSISTENCIES #1 and #13 say Devin's legacy
  schedule is cron, the editor is RRULE, and API RRULE evaluation is UTC while the UI gives
  each schedule its own timezone. Our server plan must pick one and say which.
- INCONSISTENCIES #10: Devin moved the marketplace from Settings → Marketplace into
  Customize. Confirms the owner's tab-order decision is where Devin itself went.
- No drift. Note the lane's own log says the cloud marketplace fetch sends no Devin
  credentials for the upstream registry; the 52-plugin catalog call (741da31) does. Two
  catalogs, two auth models: the product spec must name which one "Available" lists.

## 15 · 04:55 · CROSS-LANE — scheduler format: cron vs RRULE (3 docs disagree)

**Checked:** ARCHITECTURE §3/§6.3 (`kind IN ('cron',…)`, `InvalidCron`, 5-field cron + presets);
SERVER-FROM-DEVIN §1/§7 (RRULE + IANA tz, cron only via proven subset adapter, cron marked
superseded); DEVIN-PORT-MAP §5.2 (all pickers persist `schedule:recurring` + one `rrule`
condition; validator rejects EXDATE/SECONDLY/etc.); devin-decompile INCONSISTENCIES #1/#13
(legacy cron, editor RRULE, API evaluates UTC, UI per-schedule tz).

**Verdict: drift-risk. Decided in prose, not yet in one place.**

- The decision is already made the right way: RRULE + tz, Devin's storage shape, cron only
  as an adapter. Copy-first says store what Devin stores. But SCAFFOLD still names `cron.ts`
  and the Cursor facts (preset capture: "Cron expression (UTC)", 5–7 field hint) are a Cursor
  feature the owner may want to keep.
  FIX → one sentence in SERVER-FROM-DEVIN §1 row "Scheduler input": "v1 UI exposes Devin's
  presets + Visual/RRULE popover only; Cursor's raw-cron input is v2, gated on the adapter
  proof in DEVIN-PORT-MAP §3." Then the Cursor cron row in DEVIN-PORT-MAP §3 is parked, not
  pending. Timezone: store IANA tz per schedule (Devin UI behavior), evaluate in that tz.

## 16 · 04:58 · Lane health (from /tmp/goals/*.log) — not code, but it gates the night

- **astra-atsu EXIT 1** at 03:54: Playwright `ENOSPC` in `/tmp`. Disk now shows 128 GB free,
  so it was a transient `/tmp` fill (likely the 152 MB atsu tree + browser artifacts).
  Runner: restart the lane with the entry-05/07 FIX (write INDEX.md, shrink to one poster size).
- **astra-raycast** (04:26, running): has the live shader programs + geometry; reports the
  scene uses exactly three color inputs (pale cyan / pink / crimson) and **no light-mode
  palette exists**. That confirms entry 02 ASK: two-tone light mode will be DESIGN, not copy.
  The owner must choose; the lane must not pick.
- **fable-login / fable-projects / fable-settings / fable-q45** started 03:50–04:04; nothing
  committed yet. Expect LOGIN-PAGE-V2, AUTOMATION-PROJECTS, DECISION-preflight,
  DECISION-skill-chips. Will audit on landing.

## 17 · 05:10 · `ref-raycast-animation` (uncommitted draft) — docs/RAYCAST-ANIMATION.md + build output

**Checked:** 5-line draft spec in the lane worktree; lane log 04:26–05:07 (direct renderer
readPixels comparison, build sizes).

**Verdict: on-vision on fidelity; drift on "tiny" unless the next pass cuts hard.**

- On-vision: the lane compared the live scene and its direct renderer with `readPixels` and
  reports a match across all 7.68 M output channels at the 30 s state. It discarded a
  shader-preprocessing shortcut because the grain changed. That is "replicated EXACTLY" taken
  seriously. "Do not invent a light palette" is repeated in the draft. Good.
- **Drift: size.** Build output tonight: `proof.js` 544.9 KB, `raw.js` 143.8 KB,
  `raw-library.js` 142.6 KB (pre-gzip). The brief says "tiny package." 144 KB raw is still a
  three.js-shaped bundle (16 refractive cylinders + glass transmission + render target).
  Entry 02 proposed ≤ 30 KB gz and first frame ≤ 50 ms. Neither number appears in the draft.
  FIX → the spec's "Optimization contract" paragraph must carry the budget line and the end
  state: hand-written WebGL (two programs, one cube + instanced cylinders), no three.js runtime.
  `raw.js` is the scaffold; it is not the deliverable. Report gz size and first-frame ms per
  build in the doc.
- **Slop-risk:** the 5-line spec is a stub for a task whose brief asks for technique, exact
  colors, geometry, timing, easing, the minimal math, and an optimization plan. The evidence
  exists in `reference/raycast/extracted/` and the lane's log; it has not been written down.
  FIX → before the proof lands, expand RAYCAST-ANIMATION.md to the six sections the goal
  lists. A doc that only points at the contract file is not a spec; fable-login is blocked on
  it right now.
- Note for fable-login: the animation is a WebGL cube behind 16 refractive cylinders. Any
  scrim/contrast decision for the form must be made against that, not against a gradient.

## 18 · 05:20 · `design-settings-v2` 951df4e→a697aa4 — SETTINGS-V2.md passes 2–5 + interactions pointer

**Checked:** full pass-1→pass-5 diff; §9 pass log; new `docs/interactions/settings-connections.md`.

**Verdict: on-vision. The iteration the owner asked for, each pass simpler than the last.**

- Five states → four → three. Overflow menu, `Reconnect`, `Retry` deleted: the right slot
  holds one button that says `Connect` or `Disconnect`, in every state. Expired/unverifiable
  is just *disconnected* with a different status line. That is simplicity test 1 and 2 passing
  in the same stroke. `· Marketplace access` suffix removed: copy chiselled, not padded.
- Devin's "Looking for…" step deleted; the silent cache read is the ordinary busy spinner,
  then paste shows directly. One step, one input, same shape as the Linear email step. Good.
- Button height now PROVEN from source (`app-initial-emSl-pyA.js:347-351`), closing entry 08's
  DESIGN flag. Every flow button is one size (`md`). Pass history moved out of the body into §9.
- The interactions pointer file is the right size: it exists so GOAL-SYSTEM §1 resolves and
  explicitly refuses to duplicate. No second source of truth created.
- **Residual DESIGN, honestly labeled:** `min-w-[112px]`, Devin disconnect-dialog body
  sentence, 150 ms slot height ease, flow-slot `mt-[10px]`. Fine as long as they stay labeled.
- **One ASK still open from entry 09:** the Linear flow leads with email-code (server-driven
  Chrome for Turnstile) and shows cookie-paste only when Chrome is absent. If the owner picks
  cookie-paste as primary, §4 inverts: paste first, email-code as the alternate link.
- **One nit:** §5 says identity = `userId` before the `|`, §8 says the status line shows
  "email". Decide which string the connected Devin row shows; one word, one place.
- Lane exited cleanly at 04:48 ("parked"). Nothing left to send back. This is the doc to
  hand Astra for the first implementation PR once the nav decision (entry 06) is made.

## 19 · 05:30 · `ref-atsu` a5584c5→f1372bc — ATSU-UI-PRINCIPLES / TOKENS / INTERACTIONS / STRUCTURE + README + live verification

**Checked:** seven principles, token tables (type, spacing, radii, two color themes), 25-row
interaction ledger, switcher spring reconstruction, README scope, evidence 16–18 (live Chrome
+ local replay + computed styles), tree size after the new commits.

**Verdict: on-vision as reference. Entry 05's "pile, not evidence" is answered. Size still open.**

- README now exists and says exactly what atsu is for: a reference for restraint (quiet frame,
  expressive contents), relational spacing (2/6 · 12/16 · 32/48), typography by role not weight,
  motion that explains its cause. Every claim has a byte anchor (E01–E50) and the live pass is
  reproducible. This is the locator I asked for.
- The "DESIGN for Fable" lines are the right shape: each one is a *review question* for the
  copied Cursor/Devin surfaces, and each ends with a "do not" (no manga proportions in rows,
  no spring on every control, do not replace Cursor's sidebar). That is atsu used as taste,
  not as a donor. SETTINGS-V2 already cites "ATSU §2/§8" correctly.
- **Slop-risk, unchanged: 161 MB in git (1,104 files; grew 10 MB with 10 PNG screenshots).**
  Nothing in the three docs needs 892 cover variants at four sizes. Entry 07 FIX stands:
  keep `site/`, `manifest.json`, `analysis/`, `evidence/` and ONE poster size; tarball the rest.
  FIX → Runner: have the lane rewrite before merge. Downscale the 1.1 MB PNGs to JPEG or
  keep only the 16-live set.
- **One caution for fable-projects:** the spring switcher (k700/c42, 344 ms derived) is the
  most seductive thing in the ledger. The board's folder-open should copy iOS, not atsu.
  Atsu motion is a review question, not a parts bin. The doc itself says so; hold it to that.

## 20 · 05:40 · Lane health — the three flagship Fable design lanes are producing nothing

**Checked:** `/tmp/goals/watcher.log`, `fable-{login,projects,q45}.log` sizes and contents,
process table, lane worktrees (`/tmp/wt-login`, `/tmp/wt-proj`, main checkout on
`design-decisions`).

**Verdict: slop-risk for the night, not for any doc. Runner must look at this before anything else.**

- `fable-login` has died three times (04:04, 04:38, 05:17; exit 1; uptimes 161 s, 2,047 s,
  2,311 s). `fable-projects` and `fable-q45` died once each at 04:49 after ~58 min. In every
  case the lane log holds only its `START` line (32–37 bytes). No file in any of the three
  worktrees has changed; no commit; `design-login` and `design-projects` are still at main.
- Compare: `fable-settings` on the same runner produced five committed passes and parked clean
  at 04:48. So the runner works; these three goals are dying without writing anything.
- These are the brief's two highest-value unstarted items (login around raycast; the
  automation-projects board) plus the two owner-delegated decisions. Two hours of wall clock
  with zero output is the one thing that makes the morning read "nothing happened."
  **Root cause (from the lane transcripts in `~/.claude/projects/-Users-irene-cursor-decompile/`):**
  all three sessions ran 35–66 tool calls (reads, searches, fetches), made **zero Write/Edit
  calls**, then ended on a synthetic API error: `chain exceeded 300s wall-clock budget after
  6–8 chunks (upstream degraded) — retry the request` (login 05:17, q45 04:49) and
  `risk-refused` (projects 04:49). The gateway killed the turn; `claude -p` exits 1 and prints
  nothing because output arrives only at the end.
  FIX → Runner, two parts. (a) Resilience: run lanes with `--output-format stream-json` so
  partial work is visible; on `upstream degraded` relaunch immediately with `--resume` of the
  same session id instead of a cold start with escalation counters. (b) Behaviour: these goals
  say "think slowly, iterate 5 passes" and the lanes obeyed by reading for 40 minutes before
  writing a line. Add one sentence to each goal: *write a 30-line skeleton of the doc and
  commit it within the first 10 minutes, then iterate.* fable-settings did exactly that
  (pass 1 at 02:49) and survived. A committed skeleton is also what the next relaunch resumes
  from. The `risk-refused` on fable-projects: see entry 23 (false positive on a plain repo read).
- Until this is fixed the STATE "gaps" list is not shrinking, whatever the other lanes do.

## 21 · 05:50 · devin-decompile `re-server-3.10.48` 70b9509/15c3052/741da31 — MARKETPLACE.md + CONNECTOR-BACKEND.md

**Checked:** registry request proof (Go disassembly: no Devin credential on the upstream
`registry.modelcontextprotocol.io` fetch), the separate `CascadePluginsService` RPC table,
account-managed plugins, the "Practical options" verdict table, ACP lifecycle RPCs.

**Verdict: on-vision evidence; one recommendation in it drifts from the owner's decision.**

- "Marketplace" is three things in Devin, and the evidence now separates them cleanly:
  (1) upstream MCP registry, public, no auth; (2) Windsurf/Devin plugin catalog via
  `GetAvailableCascadePlugins`, 52 plugins, needs the session token (VERIFIED live 741da31);
  (3) account-managed plugin manifests via `GetAccountManagedPlugins`, same token.
  The owner's "Connect Devin account = marketplace access" means (2) and (3). SETTINGS-V2 V5
  already defines connected as (3) answering 200. Good.
- **Drift in the doc's own verdict table:** "Independent implementation: Recommended" (build
  around the public registry). That was the lane's judgment before the live-access proof, and
  it is the opposite of what the owner decided. Research may recommend; the product spec must
  not inherit this line by accident. CONNECTORS-PAGE-SPEC C4 currently *does* match this
  recommendation, which is exactly entry 06's drift.
  FIX → CONNECTORS-PAGE-SPEC C4: Available = (2) when a Devin account is connected, with
  (1) as the no-account fallback. Same card. Install writes (`InstallCascadePlugin`) read-only
  until the owner says otherwise. The re-server lane should add one line under "Practical
  options": "Owner decision 2026-10-13: proxy with the owner's own session; independent
  implementation is the fallback."
- The ACP MCP lifecycle table (`installServer/removeServer/connectServer/toggleServer/
  disconnectServer`) is the server contract our Customize → MCPs tab needs. CONNECTORS-PAGE-SPEC
  §5 should cite it by name rather than inventing verbs.
- No slop: every claim has a byte offset; "no live requests were made" is stated where true.

## 22 · 05:55 · `plan-devin-mashup` 0f73ebf/f1b8501 — docs/MASHUP-PLAN.md (236 lines)

**Checked:** §0 one-rule, §1 decisions, §2 routes, §3 page-by-page composition, §4 seams,
§5 deleted list, §6 build order, §8 owner questions, §9 changelog.

**Verdict: on-vision as the composition map. §8 is now four-fifths answered; the doc does not know.**

- On-vision: "Cursor shell, Devin pages, Cursor tokens always" is the mashup rule stated
  once and applied per row. §5 "Deleted, not hidden" is the right instinct: Slack, ACU spend,
  security profiles, Consumption/Issues tabs, Pylon, `Improve with Devin` all go. Build order
  = one PR per arrow. Sidebar is never touched by Devin pages.
- **Stale by the owner's decisions last night:** Q1 login (answered: raycast), Q2 tab order
  (answered: desktop), Q4 preflight and Q5 skill chips (delegated to fable-q45, in flight).
  Q3 global run history (a DESIGN composition) is the only one still truly open.
  FIX → §8 shrinks to Q3 plus a pointer to the two DECISION docs when they land; §3.9 points
  at LOGIN-PAGE-V2; §9 changelog gets a 2026-10-13 row for the four decisions.
- **Drift carried from entry 06:** §9 row 23:47 says "marketplace = public registry, not
  Devin's token-gated catalog." Flip with C4.
- **Missing surface:** the automation-projects board has no route in §2 and no row in §3.
  The brief calls it the global run view's context. FIX → add `/automations` board mode (or
  `/projects`) as a §2 row marked DESIGN-pending-spec, so the build order knows it exists.

## 23 · 05:55 · Follow-up to 20 — what the dead fable-projects session was doing when refused

**Checked:** last three tool calls before the `risk-refused` synthetic error in session
48ee4aef (fable-projects, died 04:49).

- It was reading Devin's own decompiled spec (`DEVIN_AUTOMATIONS_DECOMPILED_SPEC.md` lines
  320–379 and 1217–1240) and the i18n catalog via Bash `sed`/`python3`. Nothing about iOS.
  The refusal landed on an ordinary read of a repo we own. So this was a gateway-side false
  positive, not the lane fetching something it should not have. Entry 20's iOS guess is wrong;
  striking it.
- Of the three relaunched sessions (04:49/05:17), after ~60 min: projects 49 tool calls,
  q45 43, login 32. **Still zero Write/Edit calls across all three.** The relaunch is
  repeating the same read-everything-first pattern that died last time.
  FIX stands (entry 20b): the goal text must demand a committed skeleton in the first ten
  minutes. Reading for an hour before writing a line is not "thinking slowly"; it is the
  one-shot pattern with a longer fuse.

## 24 · 06:00 · Lane health + raycast draft, second look

- **fable-q45 died again** 05:52 (uptime 3,758 s), same error: `chain exceeded 300s wall-clock
  budget after 7 chunks (upstream degraded)`. 43 tool calls, zero writes. Relaunched at
  escalation 8 with the same prompt. Three deaths, zero bytes of output tonight from this goal.
- **fable-projects is hung, not working.** Its transcript stopped at 05:38:58; the process is
  alive (etime 1 h 09) with one socket open to the gateway on port 8787 and nothing else.
  That is a request the gateway never answered. The runner only notices death, not silence.
  (06:00 update: it died at 06:00:02 with the same `300s wall-clock budget` error after a
  21-minute silent request; 52 tool calls, zero writes. Relaunched at escalation 8.)
  FIX → Runner: add a transcript-mtime watchdog (no transcript write in 10 min → kill and
  resume with `--resume <session>`). Together with entry 20b this is the whole fix.
- **ref-raycast-animation draft grew 5 → 22 lines**: an evidence map (claim IDs C/G/W/S/Q/F/H/L
  with byte ranges into the immutable chunks) and an honest status line: "proof remains under
  verification. Do not claim pixel identity across states yet. Refraction discrepancies are
  recorded below." That is the right posture after entry 17. Still no budget line; still
  three.js-sized builds. Verdict unchanged: on-vision on fidelity, size budget missing.

## 25 · 06:12 · `ref-raycast-animation` draft, 38 lines — technique, geometry, colors, theme check

**Checked:** §Technique (three.js r186 + R3F, cube color field → half-float target → 16 glass
cylinders; camera FOV 35°, z 16.54; cube 7³ at z −9; group rotation .73 rad), §Colors
(#f4feff / #ff7a98 / #b80232, unused #ff162a; clear #07090a vs CSS #07080a), theme check.

**Verdict: on-vision and now evidence-grade. The light-mode ASK is closed by evidence.**

- Every number cites a claim ID with byte offsets. The 1-unit mismatch between canvas clear
  and CSS grey is recorded rather than smoothed over. This is what "exact" looks like.
- **Two-tone decided by evidence:** both emulated OS color schemes return identical values,
  classes and body background (`evidence/theme-check.json`). Raycast has no light palette.
  The brief's "two-toned, adapting to dark/light mode" therefore cannot be copied; it is a
  DESIGN item for fable-login. The draft says exactly that ("would require a separate design
  decision"). ASK → owner: ship login dark-only in v1 (exact copy), or accept one derived light
  palette labeled DESIGN? Default until answered: dark-only. Do not invent.
- Still missing: the budget line (entry 17). The draft now has enough geometry to state the
  hand-written end state: one cube program, one glass program, 16 instanced cylinders, one
  half-float target. Write the KB/ms targets next to that sentence.

## 26 · 06:18 · `ref-raycast-animation` draft, 58 lines — color math, transmission math, first perf numbers

**Checked:** §Color math (H/D/R cosine field, two-segment lerp over color3→color2→color1,
`pow(color, 3)`, no sRGB decode, CSS-pixel resolution uniform even at DPR 2), §Transmission
(roughness .35, blur 2.88, IOR 1.5, chromatic aberration 3; six samples × RGB = 18 fetches per
fragment, hash grain seeded per pixel), lane log 06:14 perf trace.

**Verdict: on-vision. This is the "mathematical derivation" the brief asked for, written down.**

- The cube field is four lines of trig and one lerp. That is small enough to hand-write in a
  fragment shader with no library. The glass pass is the only expensive part and the doc now
  names exactly why (18 texture fetches per visible glass fragment, DPR 2, half-float target).
- **First "instant" evidence, from the lane log, not yet in the doc:**
  live raycast.com: ParseHTML 17 ms, parseOnBackground 81 ms, EvaluateScript 226 ms.
  proof: parseOnBackground 7.8 ms, ParseHTML 0.4 ms. That is the order-of-magnitude the owner
  wants. FIX → put this table in the doc with method (Chrome trace, which machine, DPR), and
  add gz bytes next to it. Then the budget line (entry 17) writes itself from measured numbers
  rather than from my guess.
- The CSS-pixel resolution quirk ("preserve this") is the kind of detail that makes a copy
  pixel-same instead of nearly-same. Keep it in the contract as a MUST.
- Nothing invented. The lane still refuses a light palette. Fable-login can design against
  this doc now; it no longer needs to wait for the proof to be "done".

## 27 · 06:20 · Lane health — fable-login now shows the same hang signature

- Session 2d8057f0 (fable-login, relaunched 05:17): transcript last written 06:09:41; at
  06:19 the process is alive (etime 1 h 01) with two gateway sockets open and no transcript
  movement for ten minutes. Identical to fable-projects before it died at 06:00 (entry 24).
  Expect `300s wall-clock budget` exit within the half hour. 40 tool calls, zero writes.
- fable-projects (123910be) and fable-q45 (bbdb6f3c), relaunched 06:00 / 05:52: 18 tool calls
  each at 06:18, zero writes. Same read-first pattern, 20 minutes in.
- Nothing new to audit from them. The FIX in entries 20/24 (resume + transcript-mtime
  watchdog + "commit a skeleton in 10 minutes") is still the only lever.
