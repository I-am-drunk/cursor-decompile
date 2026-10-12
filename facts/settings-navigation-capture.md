# Settings entry and account/navigation capture — 2026-10-12

OBSERVED via Computer Use in signed-in Twilight at 1270 × 764 CSS px, DPR 2,
light theme, Free account. Six private AX/JSON/PNG triples live in
`reference/settings/navigation-2026-10-12/`. Raw HTML, account identity and
session details remain private. [Property pins](../src/settings/ui-facts.json)
separate EXTRACTED_UI measurements from OBSERVED control attributes.

| Capture | Read-only interaction |
|---|---|
| settings-entry | Automations Run History → User menu; My Settings is present |
| settings-account | My Settings navigates to /dashboard/settings |
| settings-user-menu | Open the dashboard User menu; no account action invoked |
| settings-overview | Escape, then Overview → /dashboard |
| settings-returned | Tab from Overview to Settings, Return → /dashboard/settings |
| settings-dismissed | User menu then Escape; focus returns to User menu |

Sidebar order: Overview, Settings, Integrations, Spending. Settings opens
Privacy followed by Profile. The current profile has its public switch off
and Save disabled. No inputs, settings, consent, sessions or accounts changed.
The captured dashboard menu exposes no team selector on this account. This
is not proof that team settings do not exist; team/admin panels are UNVERIFIED.
The next provider/integration panel is a separate capture slice.

Implementation scope: navigation shell, account Privacy/Profile and overview
preview. Identity is replaced with clearly local values; overview usage is a
reference-derived fixture, not live account data. Other lower settings sections,
team/admin panels and menu submenus are not part of this slice's parity claim.
All account-changing and external actions must remain safe unavailable notices.
