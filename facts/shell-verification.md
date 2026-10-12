# P0 shell — 2026-10-12

Owner-directed original shell; not a branded reskin. Computer Use operated
Twilight on the signed-in `/automations` upsell. Click Collapse, drag from blank
content over the rail, move to blank rail, then click Open sidebar. No account
mutations, authorization, or execution. Raw AX/screenshots remain in ignored
`corpus/shell-2026-10-12/`. Owner-requested public captures are cropped to exclude
identity; see [expanded](../artifacts/shell/reference-expanded.png),
[collapsed](../artifacts/shell/reference-collapsed.png),
[drag](../artifacts/shell/reference-drag-over.png), and
[extracted measurements](../artifacts/shell/reference-measurements.json).

OBSERVED: 44px compact / 280px expanded; New Chat, Automations, Codebase icons.
Codebase removal and additional Search/Settings/Profile destinations are
OWNER_REQUIREMENT, not parity. Reference Search/Profile disappear when compact.
The measured clip easing is cubic-bezier(.22,1,.36,1). Instrumented physical
click sampled 41 frames over 652ms: fixed 280px panel, computed duration 0s,
expanded clip from the first 9ms sample. Reduced-motion media query was false.
That does NOT establish normal hover animation duration. Drag selected text,
without observed expansion. Pure hover was unavailable through this API.

DESIGN: transient overlay reveal on pointer, drag and keyboard focus; persistent
44px layout reservation; 180ms width/opacity transitions, reduced-motion opt-out.
Labels never wrap during transition. Sidebar DOM survives content rerenders.
Neutral Workspace naming replaces visible vendor copy. Gear opens settings.

UNVERIFIED: hover duration/delay, full animation/raster parity, touch behavior,
other viewports; local 180ms is explicitly not a measured reference value.
Existing reference snapshots certify historical measured states only, not these
intentional shell/copy changes. Browser runtime import failed (`node:process`
not supported); local interaction QA uses Computer Use instead.
