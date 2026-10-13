# Atsu UI principles

Captured 2026-10-13 from https://atsu.moe/. Research only; no product UI implementation.

Atsu feels composed because its content is visually rich while its organizing machinery stays quiet. Repeated proportions, narrow typographic roles, and immediate input response carry the experience. Exceptional motion concentrates in controls that explain a change of state. This interpretation follows the evidence; it is not a claim about the author's intent.

## Evidence convention

Paths are relative to `reference/atsu/`. E01-E50 resolve to files, zero-based UTF-8 byte offsets, exact search needles, and excerpts in [anchors.json](../reference/atsu/analysis/anchors.json). Byte offsets differ from JavaScript string indices. VERIFIED means exercised live; EXTRACTED means found in source; DERIVED means calculated; DESIGN means a proposed application, not an Atsu fact. GAP means unverified.

Start with [capture scope](../reference/atsu/README.md), [structure](ATSU-STRUCTURE.md), [tokens](ATSU-TOKENS.md), [interaction ledger](ATSU-INTERACTIONS.md), and [browser verification](../reference/atsu/evidence/VERIFICATION.md). Machine inventories include library rules; presence does not prove visible use.

## 1. Quiet frame, expressive contents

**Observed:** [home](../reference/atsu/evidence/01-home.jpg) gives almost all saturation and visual complexity to the covers. Header, titles, timestamps, and search share neutral roles. Covers have no enclosing panel or repeated action bar.

**Extracted:** slate surfaces are #1d1e20, #282828, #313234, #444; primary text is #f9f8f6, ordinary text #b8bcc0 (E05). Category badges use compact semantic colors (E48). Cards use image, title, and optional timestamp (E18).

**Why it works:** the eye can distinguish the object from the controls around it. Restrained chrome makes dense content possible.

**DESIGN for Fable:** preserve Cursor's neutral shell. Let automation name, connector identity, and run state carry meaning. A connector logo does not justify coloring the whole card. Do not import manga imagery or poster proportions into task rows.

## 2. Spacing expresses relationships

**Extracted:** 20px desktop outer padding, 16px below 700px (E46); grid gaps 16px horizontal / 32px vertical (E16); title 6px below cover; timestamp 2px below title (E18); heading-to-grid 12px (E19). Home sections use 32px spacing, 48px from the 800px md breakpoint; top padding 24px (index JS, function gO; see structure map). These are literal pixels: E02 defines spacing as 1px.

**Why it works:** 2/6px binds information to an object, 12/16px separates adjacent items, 32/48px separates groups. The rhythm is relational, not a claim that every dimension is divisible by eight.

**DESIGN:** audit the copied Devin list/editor for three distinguishable intervals: within a field, between fields, between sections. Preserve source values until a documented adaptation is approved. Do not multiply Atsu utility suffixes by four.

## 3. Typography separates roles before adding weight

**Extracted:** Geist is the global sans family (E01; HTML font-face inventory). Desktop section headings are 24/32px, inherited weight 400; cover titles 14/20px, two lines; timestamps 12/16px at foreground/50 (E18-E19). Mobile headings reduce to 20/28px; carousel titles to 12/16px with three lines. Display fonts in the bundle are not the shell font palette.

**Why it works:** size, position, and luminance establish rank without bolding everything. A two-line title budget stabilizes scanning while preserving useful names.

**DESIGN:** retain the captured shell font. Use one main label, one supporting description, and one metadata role in automation rows. Document long-name wrapping and full-value inspection. Do not make operational timestamps unreadably faint.

## 4. Surface depth is a small vocabulary

**Extracted:** radii 6/8/12/16/24px (E03); poster radius 12px desktop, 8px carousel; button radius 8px. Ordinary cards have 1px line/20 borders and slate2/50 fill. Popup radius is 16px, line/50 border, shadow-2xl, black/90 backdrop (E44). [Genre popover](../reference/atsu/evidence/08-genres-popover.jpg) floats without moving results.

**Why it works:** outline, radius, and surface distinguish nesting from floating. Most content needs no enclosing panel.

**DESIGN:** use copied Cursor/Devin surface roles consistently. Settings can remain a linear list. Reserve floating treatment for an actual overlay.

## 5. Disclosure preserves the work underneath

**VERIFIED:** navigation overlays the grid; search focuses a panel above a dimmed page; preferences open in a dialog. Escape dismisses search. See captures 02, 04, 05.

**Extracted:** card secondary actions appear on fine-pointer hover/focus and stay visible for coarse pointers (E18). Dialog bodies scroll independently of headers/footers (E44). Mobile uses another popup component at 800px (E45).

**Why it works:** secondary choices do not permanently consume the content's space; opening them preserves context.

**DESIGN:** keep account details and uncommon scheduling options behind the original disclosure patterns. Every hidden action must remain reachable by keyboard and touch. Do not replace Cursor's sidebar with Atsu's navigation menu.

## 6. Motion follows the cause of the change

**Extracted:** the spring popover scales from the triggering control's center, not an arbitrary screen point (E34-E36). Opening is 344ms by the exact numerical integration, fade 80ms linear; closing is 120ms with cubic-bezier(.5,0,.75,0). This is the shared spring helper, not every menu. The switcher separately animates its leading/trailing edges with stiffness 260, damping 19, leading boost 1.5 (E38).

**Why it works:** motion describes which control produced the new state and which option became active. The moving highlight preserves continuity.

**DESIGN:** use this as a review question for existing copied tabs and disclosures: does movement explain selection, origin, or hierarchy? It is not authorization to add a spring to all shell controls.

## 7. Response starts before decorative motion finishes

**Extracted:** switcher activation is mouse-down on fine pointers and click on coarse pointers (E37). Poster hover prefetches detail data (E18); quick search aborts the previous request. These mechanisms reduce perceived waiting; no latency benchmark was taken.

**DESIGN:** separate input acknowledgement from network completion in run/list/editor specs. Preserve working focus and current content during refresh. Motion must not postpone execution.

## 8. Stable geometry makes loading feel calmer

**Extracted:** cover and skeleton share 215:323 proportions. Home queries start near the viewport with a 200px top / 150% bottom intersection margin; data remains fresh for 5 minutes. Section heights are remembered and reused through content-visibility/contain-intrinsic-size (E21-E22). Empty successful ranked sections disappear; skeletons are not arbitrary spinners.

**Why it works:** the page can reveal content without continually changing its silhouette. This is an implementation strategy, not proof of zero layout shift.

**DESIGN:** preserve row geometry while fetching runs. Distinguish initial loading, empty success, and refresh. Do not erase a failed automation or hide its error because a catalog hides empty sections.

## 9. Adapt the interaction, not just the width

**Extracted:** desktop uses rows of posters; touch/small-screen home uses horizontally scrolling strips, 12px gaps, width clamp(50px,100vw/3 - 28px,300px), and a 400ms long-press canceled by movement beyond 10px (E20 and nav JS adjacent ql/jl). Horizontal scroll positions are restored from sessionStorage. Desktop popups switch to mobile sheets (E45).

**DESIGN:** retain Cursor/Devin behavior as the baseline. If responsive work is approved, specify input method, focus, scroll ownership, and dismissal, not merely a breakpoint. Long-press must not become the sole way to discover an automation action.

## 10. Customize meaning without destabilizing structure

**Extracted:** 17 named theme palettes preserve semantic roles (theme-rules inventory). Saved theme is applied in the HTML before app boot. Home section order and visibility are customizable; drag handles and hide/show controls are separate (E24).

**DESIGN:** connector identity, project grouping, and run states should remain structurally consistent. A project folder can change which automations are shown while keeping the same item grammar. Theme and folder personalization are separate decisions.

## How our automations product applies this

These are DESIGN review criteria, not implementation permission. Cursor remains shell/settings truth; Devin remains list/editor/detail truth.

| Surface | Apply the principle | Concrete review question |
|---|---|---|
| Shell | Quiet neutrals, stable navigation, local state feedback | Can the selected destination be found without every icon gaining an accent? Does collapse preserve the captured Cursor behavior? |
| Automation list / project board | Repeated item grammar, relational spacing, semantic color | Can name, connector, trigger, and last-run state be scanned in the same order? Does a project folder preserve that order? |
| Editor | Clear type roles, section rhythm, staged disclosure | Are related fields closer than separate sections? Are validation, loading, and disabled states documented before code? |
| Run detail | Stable geometry and explicit operational status | Does refresh preserve the user's place? Are failures visible with text and an action rather than hidden by empty-state logic? |
| Settings | Linear groups, one dominant action per account | Are Connect Linear and Connect Devin clear? Are extra fields hidden unless needed by the copied flow? |
| Menus / tabs | Causal motion and immediate acknowledgement | Does motion communicate origin/selection? Can keyboard and reduced-motion users complete the same task? |

## What Fable should not copy blindly

- Poster aspect ratios, badge ribbons, decorative profile fonts, and manga color meanings belong to Atsu's domain.
- Many quiet labels are small or low contrast. That is a visual observation, not an accessibility endorsement.
- The visible genre options had generic accessibility names in Safari's tree; some icon buttons were unnamed. Do not repeat this in an operational tool.
- The bundle contains expressive premium/profile effects and many animation utilities. Their existence is not evidence that ordinary app chrome animates that way.
- The 100ms button transition targets transform, while active styling sets the individual scale property. Do not claim a 100ms press animation without checking the cascade.
- Light themes are marked premium in source. Their tokens are extracted; authenticated theme selection and all premium states were not live-verified.
