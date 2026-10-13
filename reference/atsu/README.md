# Atsu reference capture

Captured 2026-10-13 on `ref-atsu`. Start with [UI principles](../../docs/ATSU-UI-PRINCIPLES.md), [structure](../../docs/ATSU-STRUCTURE.md), [tokens](../../docs/ATSU-TOKENS.md), and [interactions](../../docs/ATSU-INTERACTIONS.md).

## Scope and provenance

This is a finite capture of the public SPA, discoverable static dependencies, and representative anonymous catalog data. It is not a copy of the service database or authenticated state. Every dynamically generated image, user page, reader chapter, and future API response cannot be covered by this capture.

- `site/`: 173 successful responses: original HTML, 97 JavaScript responses, three CSS files, 35 WOFF2 fonts and images/icons. `manifest.json` records URLs, content types, lengths and SHA-256 hashes. Original bytes are preserved for citations.
- `data/` and `cdn/`: 12 home-section JSON responses and 892 referenced cover variants. `data-manifest.json` records 904 responses with hashes.
- `replay/`: additional anonymous responses captured through local browsing; `.url` files identify requests.
- `analysis/`: variables, fonts, themes, routes, timings, state rules, byte anchors and spring reconstruction.
- `evidence/`: earlier Safari screenshots 01–15, plus reproducible Chrome live/local desktop/mobile captures and computed-style measurements 16–18. See [verification](evidence/VERIFICATION.md).

Four candidate URLs failed: `/assets/.css` and `/assets/.gif.mp4` returned 403; `/assets/image.png` and `/assets/moment.avif` returned 404. Broad literal extraction found these; they are not necessarily executable dependencies. Two PNG URLs (`/apple-touch-icon-57x57.png`, `/apple_splash.png`) returned HTML, not valid images. [audit.json](analysis/audit.json) enumerates these exceptions.

All same-origin static app assets requested in the home pass (`evidence/16-live.json`) exist locally. Infrastructure `/cdn-cgi/speculation` and telemetry `/z/api/send` are outside the app mirror. Authenticated/private/premium behavior and reader content remain source-only where documented. No credentials were used.

## Reproduce

Run `python3 reference/atsu/tools/audit.py` to verify hashes and source anchors. Run `python3 reference/atsu/tools/serve.py` for http://127.0.0.1:8973/.

Replay preserves stored source bytes. At response time it rewrites the CDN origin in `staticImages-CHo2Ao-l.js` to the local proxy. Uncached anonymous GETs require network and are archived; writes are unsupported. Therefore replay is not a fully offline backend. Missing static files currently fall back to SPA HTML; use manifests and network measurements to diagnose assets rather than assuming HTTP 200 means success.

Set `ATSU_PLAYWRIGHT` to an installed Playwright `index.mjs`, then run `node reference/atsu/tools/browser-pass.mjs`. It uses Chrome in a fresh anonymous context. Set `ATSU_URL=http://127.0.0.1:8973/ ATSU_PREFIX=17-replay` for local comparison. `motion-pass.mjs` samples live navigation animation with normal and reduced motion.

`mirror.py` and `capture-data.py` document acquisition. Running them refreshes original bytes/manifests and invalidates old offsets; use a separate capture directory for another deployment. This research makes no product UI changes and opens no PR.
