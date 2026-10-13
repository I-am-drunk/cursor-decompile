# Atsu interaction and motion ledger

Timings below are EXTRACTED source values, not frame-timed browser measurements. Live exercises are recorded separately in evidence/VERIFICATION.md. Unspecified easing/duration is a GAP, not permission to assume a spring. CSS utility defaults: 150ms, cubic-bezier(.4,0,.2,1); ease-out=(0,0,.2,1), ease-in=(.4,0,1,1); custom out-hard=(.4,.44,.05,.96), out-soft=(.33,1,.68,1) (E01,E04).

| Control / trigger | State change and geometry | Timing / easing | Evidence |
|---|---|---|---|
| Standard button hover | slate3 mixed 80% with slate; disabled opacity .7, pointer-events none | color not in base transition; no fade inferred | E07 |
| Standard button press | individual scale .98 | base transition says transform 100ms ease-in-out; does not itself animate individual scale | E07-E08 |
| Header icon hover/press | 40px target, circular slate3 hover, foreground2; active scale .95 | no transition on base header control | nav function Ro, supplementary anchors |
| Poster hover/focus | 2px transparent outline becomes foreground; title becomes foreground2; secondary 30px actions visible | immediate class changes; no duration in component | E18 |
| Poster coarse-pointer press | scale .95; secondary actions always visible | no duration specified here | E18 |
| Section heading hover | chevron translates +2px, brightens | default 150ms, (.4,0,.2,1) | E19 |
| Search open | focus input; black/80 backdrop; page scroll lock helper | backdrop 150ms ease-out; panel visibility has no matching transition declaration | E25-E26 |
| Search keyboard | Cmd/Ctrl+K opens; arrows wrap active result; Enter selects; Escape closes | immediate selection; result scrollIntoView instant/center | E25,E27; nav result component |
| Search request | idle/history, loading, success, no-results, error | prior fetch aborted; no universal debounce claimed | useSearch ve; E50 is 2s miss logging, NOT input debounce |
| Shared spring popover open | scale .04 to 1, transform-origin at trigger center in floating coordinates; opacity 0 to 1 | spring k700/c42; derived duration 344ms; opacity 80ms linear | E34-E36 |
| Shared spring popover close | scale to .04, opacity to 0, pointer-events none | 120ms; scale (.5,0,.75,0), opacity ease-in | E36 |
| Tooltip | scale .95 to 1, opacity 0 to 1; origin follows placement | 150ms; helper does not supply easing explicitly | tooltip JS z |
| Navigation menu | scale .9 to1, opacity0 to1, top origin; 380px wide, 36px trigger | declared150ms ease-out; see cascade note below | nav jf at byte240948 |
| Account menu | scale .9, opacity from 0 | 150ms via Floating UI transition helper | nav byte 232030 |
| Account submenu | scale .95, opacity from 0; hover or keyboard | 50ms opening delay, 150ms transition; easing not explicitly supplied | nav byte 238135, Df |
| Boolean switch | track border/fill becomes accent; thumb shifts by calc(4/6.5*100% + 16.667%); default h20, aspect6.5/4 | 200ms ease-out for color and thumb | E43 |
| Preference toggle hover | nested switch scales 1.05 | 200ms default easing | nav transition-transform near byte 81322 (character index; supplementary anchors resolves bytes) |
| Reveal open | grid 0fr to 1fr; content scale .95/opacity0 to 1 | outer230ms; content160ms delayed70; ease-out | E41-E42 |
| Reveal close | content fades/shrinks; parent then collapses; parent gap canceled by negative margin | content230ms; outer160ms delayed70; unmount230ms | E41-E42 |
| Sort transition | geometry group changes; old/new cells scale .96 with fade | group300ms (.2,0,0,1); cells260ms (.4,0,.2,1) | E12 |
| Reader drawer forward/back | body leaves -24/+24px; new body enters opposite side | 200ms (.4,0,.2,1); header/tabs group200ms | E13 |
| Loading skeleton | fixed poster ratio with opacity pulse | 2s (.4,0,.6,1), infinite | E01; nav eu |

## Switcher: mechanical pass

E37-E40: fine pointer activates on mousedown, coarse on click. Independent springs control left/right edges. Base stiffness260/damping19; leading edge gets 1.5x stiffness. Deformation uses stiffness290/damping15, bulgeX .06, bulgeY .11. Skew gain/max are zero: default motion does not skew.

Frames cap delta at64ms and subdivide into <=20ms steps. Settling snaps at error <.05 and velocity <.5. Duration depends on distance, velocity, and frame sequence. Highlight clip radius is5px. An aria-hidden label layer is clipped with the highlight, so selected text changes color at its moving boundary.

Dragging arms inside the selected region and begins beyond4px. Release selects the nearest center and suppresses the next click. Velocity smooths .6 old + .4 current. Scrollable mode disables drag and uses native smooth scroll. Reduced-motion snaps selection geometry; bulge follows a separate path, so complete suppression is unverified.

## Reveal and popover: timing pass

Reveal opens layout first and delays inner appearance70ms; close fades content first and delays collapse70ms. Both finish by230ms. Reduced-motion removes CSS transitions (E41-E42).

Exact numerical integration of E35 produces344ms and normalized peak1.015, about1.5% overshoot. See analysis/popover-simulation.json. The CSS linear() samples are uniformly spaced. This is a reconstruction of the source recurrence, not a frame capture. E36 supplies a distinct accelerated120ms exit; it is not the opening spring reversed.

## Popup stack and scroll ownership

Desktop popup uses Silk defaults: entering/stepping smooth spring580/60/mass1.35; exit520/44/mass1 (popupStackStyles bytes54167,63286; settings destructured near60200). The integrator determines duration from travel distance and precision; a fixed300ms cannot be inferred from popupStackContext's bookkeeping argument. Dialog body has overflow-y:auto and max-height; surrounding context is dimmed. Stacked desktop panels scale by 1-.05*progress and brightness1-.1*progress; mobile stack additionally translates -24px, scales by1-.08*progress and grows radius16 to24px. See the end of popupStackStyles.

Home carousel stores horizontal scroll in sessionStorage, restores it with snap temporarily disabled, then restores snap next frame (nav Jl before E20). Header sticks at top (nav byte239773). No global smooth-scroll behavior is inferred. Reader drawer and sort transitions are source-only, not exercised in this pass.

## Cascade caveat

The compiled transition-[transform_opacity] rule contains transition-property:transform opacity (CSS byte187715), and matching will-change also uses a space (byte191109). These are not valid comma-separated property lists. The explicit150ms duration/ease-out remain declarations; actual property selection depends on fallback/cascade. Source intent is not a computed-style measurement. Tooltip/account helper styles are separate.

## Browser motion pass: actual cascade and focus

VERIFIED: `evidence/18-motion.json` samples navigation opening in Chrome. The computed transition is **all 150ms cubic-bezier(0,0,.2,1)**. Individual scale interpolates .9→1 with opacity 0→1, reaching the final state around 150ms. Thus the malformed property list discussed above falls back to `all` in this browser; the animation is not absent. The same interpolation persists under `prefers-reduced-motion: reduce`. This result applies to navigation, not every spring or reveal primitive.

VERIFIED: `16-live.json`/`17-replay.json` show the poster outline becoming foreground on hover and on focus after moving the pointer away. Both compute a zero-second transition; geometry is unchanged. The title also brightens immediately. This is a useful distinction: frequent item feedback is immediate, while opening a spatial layer gets a short transition.

Search Escape leaves the form mounted at its original rectangle but sets opacity 0 and pointer-events none (source nav byte76894 and following form declaration; measured `search.closedForm`). Bounding-box visibility alone is not a dismissal test. The input can retain focus after Escape; focus restoration was not established. Do not turn “closes visually” into a claim of a complete accessible dialog lifecycle.

These browser measurements supplement the source ledger. No frame timing is claimed for reader drawers, sort transitions, switcher springs, or premium effects. The default CSS timing is not a global motion token that overrides per-component physics.
