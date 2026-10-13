# DECISION — Skill chips on the chat composer

Status: pass 3. Branch `design-decisions`. Owner delegated 2026-10-13.
Question: should `/chat` show removable chips for attached connector-package skills (cf.
Cursor @-mention pills, Devin playbook pills, Linear skill mentions)?

**Answer: no removable chips in v1.** The composer shows **one inline mention token per skill
the user typed**, exactly as Cursor renders `@Send to Slack` in its instructions editor. Skills
that are active because of a package attachment (`always` mode) are **not** chipped; they are
listed once in the conversation header's package line. Removable chip rows above the composer
are rejected. §7 specifies the mention token.

## 1. What a chip would represent

CONNECTOR-PACKAGES §5.3 gives a skill three ways to be live in a chat turn:

| Mode | How it became active | Who decided |
|---|---|---|
| `always` | the package is attached to this conversation | the package author |
| `mention` | the user typed `/<skill-slug>` in the prompt | the user, this turn |
| `trigger` | v2, automations only | n/a in chat |

So a "chip" would be one of two very different things. For an `always` skill it is a **status
indicator** of something the user did not do and cannot undo without detaching the package.
For a `mention` skill it is a **representation of text the user already typed**. The question
collapses to: do we show the first kind at all, and how do we render the second.

## 2. What the references do

| Product | Surface | What is shown | Removable? | Evidence |
|---|---|---|---|---|
| Cursor automations | instructions editor | inline token `@Send to Slack` inside the prose; `@` opens a menu grouped `Actions` / `MCP Servers` | yes, as text (backspace) | OBSERVED `facts/automations-launch-demo.md` D05, D06 |
| Cursor automations | tools panel | the referenced tool appears as a row (`Send to Slack` · `Select Channels`) | row-level, not chip | OBSERVED D06, D08 |
| Devin sessions | composer | playbook attached by `!macro` shows a **blue pill** plus an inline editor for the playbook body | yes | DOCUMENTED `creating-playbooks.md` (pill tip, macros) |
| Devin sessions | prompt text | skills referenced as `@skills:name` inline in the message; otherwise auto-invoked by the model with no UI | text only | DOCUMENTED `skills.md` §Mention a skill |
| Linear agent chat | composer | skill invoked by slash-mention or `?skill=<id>`; `AgentSkill{title, icon, color}` is rendered by Linear | Linear's rendering | VERIFIED MASTER-PLAN V7 |

Pattern: **every reference renders the user's own invocation inline, where they typed it.**
None of them shows a separate row of chips for things the system attached silently. Devin's
blue pill is the closest to a chip, and it exists because a playbook is a *document the user
edits before sending*, which our skills are not (prose is fixed by the package author).

## 3. What Linear already supports

- `AgentSkill` is a first-class object with `title, description, body, icon, color`
  (VERIFIED schema). Our packages mirror skills into Linear at install (CONNECTOR-PACKAGES D5),
  so in **native Linear chat** the user already gets Linear's own slash-mention UI for free.
- In **our** chat page the conversation is proxied: we build the prompt and inject skill bodies
  as a preamble (§5.4). Linear never sees a "skill" on the wire; it sees text. So any chip in
  our UI is purely ours, and whatever it shows must match what the preamble actually contained.
- `AgentSession.availableSkills` exists on coding sessions (KNOWLEDGE §5), not on chat
  conversations. There is no Linear field for "skills active on this turn" to read back.

## 4. Clarity vs clutter for a solo power user

The owner is the only user. He authors the packages, so he knows what `always` skills a
package carries. Facts that bear on the call:

- **He can already see what the agent was told.** Our chat is a proxied Linear conversation;
  the injected preamble is one fenced block per skill headed `## Skill: <title>` (§5.4). It is
  visible in the conversation, in the first turn, in his own words' order. A chip would restate
  what the transcript already shows.
- **He typed the mention.** A `mention` skill is live because he wrote `/triage` in the
  composer. A chip that duplicates his own text is the clutter he objects to ("every element
  earns its pixels", GOAL-SYSTEM §5.2).
- **Removable chips imply a model that does not exist.** Removing an `always` chip would have
  to either detach the package (a destructive, out-of-place action in a composer) or silently
  suppress one skill for one turn, a per-turn override the package system has no concept of
  (§5.3 has no "suppressed" state). Either is invented behaviour.
- **MCP-first.** His stated priority is tools (MCP) over skills. The thing he most wants to
  know in a chat is which **package** is attached, because that determines which tools exist.
  Skills ride on the package. One package line answers the real question; skill chips answer
  a question he did not ask.
- **Where chips earn pixels:** in the automation editor's Tools section, where he *pins*
  skills to a run (§10 row "Automation editor → Tools"). That is a selection UI with real
  state, already specified, and not this decision.

## 5. Options

| Option | What ships | Pros | Cons |
|---|---|---|---|
| **A. Nothing** | plain text composer; `/slug` stays raw text | zero pixels | user cannot tell a typo from a real skill until the agent answers; Cursor does not do this |
| **B. Inline mention token + package line** | `/slug` autocompletes to one inline token (Cursor `@Send to Slack` shape); conversation header lists attached packages with `N skills` | copies the Cursor original exactly; the only new state is "token or not" | no list of `always` skills on the composer |
| **C. Removable chip row above composer** (CONNECTOR-PACKAGES §10 proposal) | one chip per active skill, `always` and `mention`, with ✕ | everything visible | invented component; ✕ on `always` has no defined semantics; duplicates typed text; nothing captured renders it |
| **D. Devin blue pill** | one pill per mentioned skill with inline body editor | matches Devin | our skill bodies are not user-editable; a pill with no edit action is a chip (C) |

## 6. Recommendation: B

Build the inline mention token and the header package line; reject the chip row.

1. **Simplicity test 3.** The captured Cursor editor renders a referenced capability as an
   inline `@` token (D06). That is the only captured composer shape we have. Copy it with `/`
   as the trigger character, matching Linear's slash-mention so the muscle memory is shared.
2. **Test 2.** The token earns its pixels: it confirms the slug resolved and gives a hover
   target for the skill's Linear-generated description. A chip row restates it.
3. **No invented semantics.** The only "remove" is backspace on the token, which is exactly
   what removing text means. `always` skills are never shown as removable because they are
   not removable.
4. **MCP-first.** The header line names the package first (`Linear · 8 tools · 5 skills`),
   which is the thing he actually cares about; skills are a count until hovered.
5. **Reversible.** If the owner later wants `always` skills visible per turn, the header
   line's `5 skills` becomes a popover list. Still no chips.

## 7. Interaction spec — inline skill mention token + header package line

Source of every pixel: Cursor's captured instructions editor token `@Send to Slack` and its
`@` menu (OBSERVED D05, D06). Deltas from the capture are marked DESIGN.

### 7.1 Trigger and menu

| Step | Behaviour | Source |
|---|---|---|
| Type `/` at the start of a word | menu opens anchored below the caret; items are skills from packages attached to this conversation, grouped by package name (Cursor groups `Actions` / `MCP Servers`; we group by package) | D05, group names DESIGN |
| Keep typing | filters by title and slug, case-insensitive prefix, then substring | Cursor filtering unverified; DESIGN |
| Row anatomy | skill icon (Linear `AgentSkill.icon`, 16px), title, right-aligned package short name in secondary text | D05 rows; icon source V7 |
| Empty filter | menu closes; `/text` stays raw | DESIGN |
| ↑ ↓ Enter / click | selects; Esc closes | standard |
| No packages attached | `/` does nothing; no menu, no empty state | DESIGN, avoids an empty popover |

### 7.2 The token

| Property | Value | Source |
|---|---|---|
| Shape | inline, flows with text; one line; `/` + skill title (`/Triage new issues`) | D06 `@Send to Slack`; `/` DESIGN (Linear slash-mention) |
| Fill / text | same accent-tinted background and accent text Cursor uses for the `@` token; exact hex and radius are taken from the authenticated editor capture, not the demo frames | D06 shows shape only; measure in `facts/automations-saved-editor.md` pass |
| Padding | 0 2px, radius 4px, font = composer body font | DESIGN until measured |
| Leading icon | none; the skill icon is in the menu row and the hover card only | D06 token has no icon |
| Hover (300 ms delay) | card: icon · title · package name · Linear `AgentSkill.description` (or "No description yet" while Linear has not generated one) · `N tools` | DESIGN; copy from V7 fields |
| Click | places caret after the token; does not open the menu | D06 behaviour unverified; DESIGN |
| Backspace at token end | deletes the whole token in one keystroke (atomic) | Cursor behaviour unverified; standard token editor behaviour |
| Serialisation | stored as `/<slug>`; rendered as token when the slug resolves to a skill in an attached package | §5.3 `mention` contract |
| Unresolved slug | plain text, no token, no error; the agent will see literal text | DESIGN; mirrors Devin `@skills:` text behaviour |
| Max per message | unlimited in the editor; §5.3 cap (24,000 chars) applies at send and drops `always` first, so mentions always survive | §5.3 |

### 7.3 Header package line

Lives in the conversation header, right of the title, where the Cursor shell shows the model
label on a conversation (OBSERVED C-SHELL capture; exact slot confirmed at carve time).

| State | Copy | Source |
|---|---|---|
| One package | `Linear · 8 tools · 5 skills` | counts from package card §10 row |
| Several | `Linear, Classroom · 14 tools · 9 skills` | DESIGN |
| Connection missing | `Classroom · Requires connection` in warning colour, click → package card | A17 pill copy |
| None attached | line hidden | DESIGN |
| Hover on `5 skills` | popover listing skills: icon · title · mode badge (`always` / `mention`) | §10 Skills list anatomy |
| Click | → `/settings/packages/<id>` | §10 |

Nothing in the header is removable. Attaching or detaching a package happens in the package
card, exactly as §10 defines today.

### 7.4 States, timings, empty/error/loading

| State | Behaviour | Source |
|---|---|---|
| Menu open | opens on the keystroke, no animation; closes on Esc, click-out, or selection | D05 shows a static open menu; no motion captured, so none |
| Menu loading | skills are already in memory (package list loads with the page); no spinner | DESIGN, avoids a loading state |
| Menu empty after filter | closes; nothing rendered | §7.1 |
| Package detached while token present | token falls back to plain text on next render; no toast | DESIGN, same path as unresolved slug |
| Skill over budget at send | the send still goes; run log line `Skill <title> dropped: over budget`, shown in the transcript as a system line | §5.3 |
| Keyboard only | `/` → type → ↓/↑ → Enter; token is one caret stop | standard |
| Hit targets | menu row 34px high (Devin MCP selector row height, §10 table); token hover target = token box | Devin §11.2 row height |

## 8. Open questions (none block the decision)

1. Trigger character: `/` (Linear) vs `@` (Cursor). `/` is chosen so the same keystroke works
   in native Linear chat and here. Change to `@` only if the authenticated Cursor capture
   shows `@` also reserved for files or tools in the chat composer.
2. Exact token colour, radius and font come from the authenticated editor capture
   (`facts/automations-saved-editor.md` has no mention token yet). Until measured: DESIGN.
3. Whether the header slot already holds a model label in the carved shell; if yes the
   package line goes to its right, separated by the same dot.

## 9. Evidence

- OBSERVED: `facts/automations-launch-demo.md` D05 (`@` menu grouped Actions / MCP Servers),
  D06 (inline `@Send to Slack` token), D08 (tools panel rows).
- DOCUMENTED: Devin `product-guides/skills.md` §Mention a skill (`@skills:name`, one active
  skill at a time, auto-invocation); `creating-playbooks.md` §Macros, blue-pill tip.
- VERIFIED: Linear `AgentSkill{title, description, body, icon, color}` schema and
  `agentSkill*` public ops (`linear-loops-decompile/extracts/linear-official/AGENT-API.md`,
  `schema.graphql` 1361ff); MASTER-PLAN V7 slash-mention / `?skill=<id>`.
- Prior positions: CONNECTOR-PACKAGES §5.4 ("chat UI shows a skill chip per active skill"),
  §10 row "Chat page" (DESIGN, needs owner acceptance), MASHUP-PLAN §3.8 and §8 Q5.
- Supersedes: this decision replaces the §5.4 / §10 chip sentences; CONNECTOR-PACKAGES is
  edited to point here.
