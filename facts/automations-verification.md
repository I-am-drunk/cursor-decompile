# Local Automations verification — 2026-10-12

Latest: the [Linear/unconnected follow-up](automations-linear-verification.md)
passes 47 tests, 456 source pins, and 2,157 measured checks across 48 states.
The foundation results below are historical, not the current coverage total.

## Reproduced checks

- Strict TypeScript and 18 automated tests: reader, validation, persistence,
  concurrent revision conflicts, configuration isolation, execution boundary,
  HTTP protections, escaping, view states and negative comparison fixtures.
- 25 evidence records validated; 24 pinned raw-source locators reproduced.
- Real Twilight browser exports at 1270 × 764 CSS px, DPR 2:
  **30 upgrade-state checks + 71 empty Run History checks, no mismatches**.
  This covers the selected geometry, copy, typography sizes and corner radii,
  not every pixel or every interaction.
- Private exports: `artifacts/upgrade-measurements.json` (07:14:30 UTC),
  `artifacts/runs-measurements.json` (07:14:32 UTC), matching screenshots.
  UI build SHA-256:
  `fbfd1177ee7d5fc059d9dc0d9db24f1cd82b287c3492704a4bfdb9d8803bbb05`.

## Local browser interactions exercised

Create with empty name → validation; fill name/prompt; add a schedule;
configure an MCP URL without sending a request to that server; search/select
a model; select two repositories; activate and save; reload persisted values.
Run Test without an adapter reports that no run was started.
These are tests of our implementation, **not observations of gated Cursor UI**.

## Deliberate exclusions and remaining gaps

- No proprietary font, logo, icon artwork or vendor runtime is redistributed.
  System-font glyphs, original icons, sidebar account copy and cursor overlays
  differ from the screenshots. Whole-page pixel parity is not claimed.
- At the foundation checkpoint the editor and populated list appeared gated.
  [API-created disabled fixtures](automations-api-rows.md) subsequently exposed
  the saved editor; [nine editor states](automations-saved-editor.md) are now
  measured. The populated main list and unrecorded editor variants remain open.
- Trigger forms cover a subset of types. The managed-agent overview, template
  gallery, complete run-filter hierarchy and full model catalog are not rebuilt.
- MCP connection/authentication, execution, real run streaming and provider
  integration require the sibling runtime adapter. Fixture runs are labeled.
- Alternate viewport/theme parity and independent peer acceptance remain open.

Run `sh ci/check-src.sh --reference` to reproduce the private measured subset.
Hosted CI is not enabled; see the template and permission note in
[pipeline/README.md](../pipeline/README.md).
