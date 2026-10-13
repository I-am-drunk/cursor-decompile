# Atsu token extraction

EXTRACTED from index-Bvxf1Wq7.css E01-E06 unless stated otherwise. Full declarations/byte offsets: css-variables.json, theme-rules.json, font-faces.json in reference/atsu/analysis. Utility availability is broader than actual usage.

## Typography

Global family: Geist, sans-serif. Variable normal 100-900, font-display:swap, Latin and Latin-ext WOFF2 in HTML. Serif: Domine, Georgia, serif; mono: platform monospace stack. HTML also defines Atkinson Hyperlegible (200-800), Bevan (400 normal/italic), Coiny (400), Domine (400-700), Jersey 10 (400), Metamorphous (400), Montserrat (100-900 normal/italic), Orbitron (400-900), Anton (400). These support reading/customization, not eleven simultaneous shell faces.

| Token | Font px at 16px root | Line px |
|---|---:|---:|
| xs | 12 | 16 |
| sm | 14 | 20 |
| base | 16 | 24 |
| lg | 18 | 28 |
| xl | 20 | 28 |
| 2xl | 24 | 32 |
| 3xl | 30 | 36 |
| 4xl | 36 | 40 |
| 5xl | 48 | 48 |
| 6xl | 60 | 60 |
| 7xl | 72 | 72 |

Weights: 400,500,600,700. Tracking: -.025em,.025em,.05em. Leading: 1.25,1.375,1.5,1.625. These are defined tokens; the observed home chiefly uses 12/14/24px roles, with 18px search. Font-face preload does not prove use. No font-loading latency or kerning benchmark is claimed. Section headings inherit normal weight.

## Spacing, shape and elevation

Spacing base = 1px. Common distances: 2,4,6,8,10,12,16,18,20,24,32,48px; not a strict 4px or 8px scale. Buttons large/medium/small: x/y padding 16/8,12/6,8/4px; gaps 12,10,8px (E09 and adjacent rules).

Radii sm/md/lg/xl/2xl/max/full = 6/8/12/16/24/999px/50%. Full and max are distinct tokens. Switcher highlight radius is separately 5px (E38).

Button shadow: 0 1px 2px #0000000d. Card: 0 1px 3px #0000001a plus 0 1px 2px -1px #0000001a. Tooltip: 0 0 8px -1px rgba(0,0,0,.3). Dialog shadow-2xl is an overlay utility, not the content default. Exact rules are in the CSS motion/state inventory.

## Color roles

| Role | Classic/slate | Milkshake/light |
|---|---|---|
| canvas | #1d1e20 | #fffafb |
| secondary surface | #282828 | #fdf1f4 |
| control surface | #313234 | #f8e4ea |
| stronger surface | #444 | #e9c6d3 |
| ordinary text | #b8bcc0 | #6b4f5a |
| primary text | #f9f8f6 | #2e2026 |
| tertiary text | #999da0 | #7a606a |
| accent | #8e7ce6 | #c2255c |
| glint | #d8d0ff | #f06595 |
| hairline | #272829 | #f7eaee |
| edge | #424141 | #e3cbd4 |
| strong edge | #525252 | #cfaebc |
| floating edge | #47484a | #dcbfcb |

Manga #8e7ce6, Manhwa #038cfc, Manhua #fc9003, OEL #fc0303, Other #64748b, Novel #0d9488 (E48).

All 17 theme overrides (EXTRACTED; premium light themes not live-selected):

| Theme | Canvas | Text | Accent | CSS byte |
|---|---|---|---|---:|
| slate | #1d1e20 | #b8bcc0 | #8e7ce6 | 246275 |
| midnight | #000 | #b4b8bf | #9b8bff | 246648 |
| dusk | #171a21 | #b3bac9 | #9a86ee | 247021 |
| graphite | #121212 | #c9c9c9 | #9d8bff | 247396 |
| plum | #1c181d | #bcb5c1 | #9d8bf5 | 247772 |
| ash | #1a1816 | #c1bab3 | #9a86ee | 248147 |
| jade | #1a1e1d | #b2bdbb | #9a86ee | 248521 |
| strawberry | #5c1226 | #ffd4de | #2fd07a | 248896 |
| beach | #083539 | #cff5f2 | #4ade5f | 249303 |
| mahogany | #3a1d15 | #ecd0c2 | #f0b35a | 249705 |
| navy | #0f1a33 | #b9c5e0 | #f5c451 | 250082 |
| marine | #0f1a33 | #b9c5e0 | #9a86ee | 250455 |
| milkshake | #fffafb | #6b4f5a | #c2255c | 250804 |
| sky | #f7fbff | #222 | #1864ab | 251479 |
| lime | #fafdf6 | #222 | #237032 | 252142 |
| oatmeal | #f7f1e6 | #4a3b2b | #8a5a2b | 252806 |
| latte | #ecdccf | #45291e | #7f3f25 | 253479 |

DERIVED sRGB contrast on the classic canvas: #f9f8f6 15.72:1; #b8bcc0 8.73:1; #999da0 6.10:1; #8e7ce6 4.91:1; foreground at 50% approximates #6a6d70, 3.20:1. This is a compositing calculation, not a browser pixel measurement; do not copy faint 12px operational metadata blindly.

Typography detail: the global themed rule sets font-optical-sizing:auto, -webkit-font-smoothing:antialiased, and font-style:normal (CSS byte256458). Font smoothing is browser/platform-dependent; it is not a transferable guarantee of identical rasterization.
