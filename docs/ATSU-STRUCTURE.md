# Atsu structure map

All source references resolve under reference/atsu/site/assets. See analysis/routes.json for each raw declaration and UTF-8 byte offset. This is a React SPA: routes do not imply separate static HTML documents. Source declares protected surfaces; their availability is not verified.

| Family | Routes / responsibility | Evidence |
|---|---|---|
| Discovery | /, /explore, /browse/lists, /browse/continue-reading, /browse/author/:authorSlug | index-C_nrIq9d.js route table; live captures 01, 07 |
| Series | /manga/:mangaId and /novel/:mangaId; gallery, similar, recommendations, moments, download, metadata | E28: route factory J9 |
| Reader | /read/:mangaId/:chapterId; /novel/:mangaId/:chapterId; /offline/:name/:chapter? | E29 |
| Account | /auth, /auth/signup, /auth/login, verify, send-password-reset, reset-password | routes inventory |
| Personal | /profile settings, public-profile, preferences, bookmarks, history, notifications, lists, downloads, blocks, saved content | routes inventory; authentication not exercised |
| Social | /social, /social/community; user /u/:slug with wall/posts/badges/favorites/lists/follows; groups | socialRoutes-B3icArtj.js and route inventory |
| Utility | premium, changelog, PWA/install, privacy, community guidelines, speedtest, playgrounds | route inventory |
| Management | /admin, /admin/master, /mod, /hub | source-only; no access attempted |

Browse aliases redirect into Explore sorting rather than creating distinct layouts. Query parameters hold sorting, filtering, timeframes, and expanded home sections.

## Component ownership

- index-C_nrIq9d.js: route composition, authentication, detail/reader/settings/explore and other major views.
- nav-aGo5QKoI.js: global navigation/search, home sections, poster cards, grid/carousel, preferences, account menus.
- wrapper + wrapperConfig: centered width/padding contract (E46-E47).
- popup + mobilePopup + popupStackContext/Styles: dialog/sheet presentation, dismissal and stacking.
- popoverTransition, switcher, reveal, booleanSwitch, checkbox, select: reusable interaction primitives.
- staticImages: CDN origin, image resolution choice and content classification (E48-E49).

## Layout contract

General pages use a 1200px wrapper; series detail uses 900px. Both share 20px padding, reduced to 16px at <=700px. See index JS functions um/fm, listed in supplementary anchors. Header is sticky, 80px high; below 800px it becomes 60px (E11). Mobile shell reserves bottom navigation and safe-area insets. Ordinary footer spacing includes a 128px spacer; it is not a universal section gap.

Home: top padding 24px, section spacing 32px / 48px at md=800px. Each desktop section contains a title row (minimum 38px), 12px gap, poster grid, and trailing See more / See all actions. The grid uses minmax(0,1fr), 16px column gaps, 32px row gaps (E16-E19).

| Width threshold | Columns | Collapsed rows | Expanded rows |
|---|---:|---:|---:|
| 0 | 2 | 4 | 5 |
| 390px | 3 | 3 | 5 |
| 800px | 4 | 2 | 5 |
| 1000px | 5 | 2 | 5 |
| 1150px | 6 | 2 | 5 |

These grid rules are E17. Home chooses a carousel for touch or <=768px, so the small grid breakpoints are not a claim about the observed mobile home. Card width is (available width - gaps)/column count. At wrapper 1200 with 20px sides and six columns: (1160-80)/6=180px; image height is 180*323/215=270.42px. This is DERIVED geometry, not a browser measurement.

Modal: default width min(500px,100dvw-40px); preferences request 560px. Desktop maximum height 100vh-120px; heading 24px bold, 24px header padding; scrollable body; footer 16px padding with a separator (E44). At <=800px a mobile popup takes over (E45). The 768/799/800 thresholds are intentionally reported separately; source is not one perfectly uniform breakpoint system.

Search: panel width min(600px,100%-32px), top 30px, max-height 100dvh-60px; input height 52px, margin 12px, 48px left/right text inset (E26). This is a task-focused overlay, not a new page layout.
