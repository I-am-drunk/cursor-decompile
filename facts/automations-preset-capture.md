# Preset and validation captures — 2026-10-12

OBSERVED in authenticated Twilight on the existing disabled private fixture.
Selections changed only unsaved drafts. No Save, Test, activation or authorization
was invoked. Fresh tabs isolated each preset; the final reopened saved definition
still has only its original annual trigger, Save disabled, and its enabled switch off.

Raw AX/JSON/PNG triples: `reference/automations/presets-2026-10-12/`.
Viewport: 1270 × 764 CSS px, DPR 2; light theme; America/Toronto.
Web build unspecified. Hashes below identify the captured reference.

| State | JSON SHA-256 |
|---|---|
| `baseline-reopened` | `9d548e3a656e3beb3f1b8851ace79b947b60055b98eb1a9d1b56139c2ce08f55` |
| `baseline` | `9ec8fcb8bca542f25bdb4cc04fddc6939dabf458979788099162f564f23720dd` |
| `cron-empty` | `97868676bdd118210c7b499e34cf36d4ce5df50c921f566c51a5b549a0274f3f` |
| `cron-invalid` | `2a22ca453a775bb319b100fa9a2a18c66aad1276ee5392cfd07f9f1b25343a1d` |
| `cron-range` | `385011d76d5dd74e3062e6f2ec7434e9ef5946afc4aaa76deeed77d9a99f4aef` |
| `custom-added` | `6fbd9906a6f89e7a4c99acab01c33c6138613593ddb6376a92fb3bca68639ce8` |
| `custom-popup` | `8195230d48e4c6d711929ee926319baf5e44340f206040f133edaaec76553135` |
| `custom-restored` | `1472321acf62bc10d2581b434b59a881648449e3b75b51feff08de17cc3ea6b5` |
| `daily-added` | `39148d4adba83335e2f350a9aa29bf90192492a5f6ae7a6eb5348b55464e12c0` |
| `daily-selected` | `c0e1a7a0fbf71755927413f18c183fcf6c8b01c5cbafbcf1eb8a1ba115dd0b50` |
| `daily-time` | `beb0ac64238c30da89ba4c4e930f2fd419d64fede16e5ad95e56c1aa4d768869` |
| `hourly-added` | `89ae70eb9817e9cfe9311c653e4e0474fbe8740a867b05eec4c8c1608d30480f` |
| `invalid-escape` | `387d09822dc0af44efa51a4f03591be15b1dccbd6e805c498bc4f5fc73784a1c` |
| `invalid-outside` | `59172fd8059dabb60ea1b98bd8bcbfd90fed59e23104150682982674d6c0a13f` |
| `unsaved-dialog` | `f861427dbc2c78d534489fdb878f9c63d675953c195043eaade245f578b10cb4` |
| `weekly-added` | `7e858d042681422833acfe52524f27f808b4681480b47c277520d7d053e8ab3a` |
| `weekly-days` | `a2f46be3d72b868defcfaa935bcd83eab35800aa1ae91f4df37d79f4448c1abc` |
| `weekly-selected` | `47d953aa80640a2268bd2ffdadd1a0f70c3831241c7eb6ddf89356161dd04a2b` |
| `weekly-time` | `0cddb18b41a604f740e6b83e2bca41d45075db2d830f87b601cd40ac10964fa0` |

Capture checkpoint only; implementation and same-state local verification follow.
`invalid-escape` and `invalid-outside` retain the invalid popup: neither action
dismissed it. The out-of-range expression showed a no-upcoming-runs message,
not a syntax error; this does not establish server acceptance or execution.
