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
