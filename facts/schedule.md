# Scheduling

Artifact: cursor 3.23.12 · `workbench.anysphere-ui-automations.js`
Rows extracted 2026-10-04. Citations are `names.tsv` symbols plus
`corpus/automations.split.js` line numbers.

Scheduling is cron-only. There is one trigger kind, `cron`, whose entire payload
is a single `expression` string; everything else in this file is client-side
presentation of that one string.

## Trigger payload

| Fact | Value | Label | Citation |
|---|---|---|---|
| draft-state shape | `{kind:"cron", expression:string}` | PROVEN | `createCronTriggerDraftState` L76335 |
| default expression when absent | `""` (empty string) | PROVEN | `createCronTriggerDraftState` L76335 |
| read accessor | `getCronTriggerData` returns `{expression}`, or `{expression:""}` for any non-cron kind | PROVEN | `getCronTriggerData` L76986 |
| write accessor | `updateCronExpression` returns a fresh `{kind:"cron",expression}` | PROVEN | `updateCronExpression` L77465 |
| wire trigger-type discriminator | `cron` | PROVEN | `getRowLabel` L84809, `nQt` L84848 |
| stored zone | expression is always UTC; UI labels it `(UTC)` | PROVEN | `CustomerEvalScheduleControls` L90655, `InlineCronCustomEditor` L77872 |

## Cron grammar the client accepts

Two independent grammars ship. `validateCronExpression` is the lenient gate on
user input; `parseCronSpec` is the strict grammar of the client's own cron
engine (it feeds the next-run preview). Input the validator accepts can still
yield no preview.

| Fact | Value | Label | Citation |
|---|---|---|---|
| validator field count | 5 to 7 inclusive, after stripping a `TZ=`/`CRON_TZ=` prefix and a trailing `#` comment | PROVEN | `validateCronExpression` L76491-76498 |
| validator per-field regex (source is the fact) | `/^(?:(?:\*\|[A-Za-z]{3}\|\d+)(?:-(?:[A-Za-z]{3}\|\d+))?)(?:\/\d+)?(?:,(?:(?:\*\|[A-Za-z]{3}\|\d+)(?:-(?:[A-Za-z]{3}\|\d+))?)(?:\/\d+)?)*$/` | PROVEN | L76489 |
| accepted `@` shorthands | `@yearly`, `@annually`, `@monthly`, `@weekly`, `@daily`, `@midnight`, `@hourly` (Set), plus any token starting `@every` | PROVEN | L76489, `validateCronExpression` L76492 |
| shorthand matching | token is `expr.split(/\s/)[0].toLowerCase()` — case-insensitive, trailing text ignored | PROVEN | `validateCronExpression` L76492 |
| engine field count | 5 → `min hour dom month dow`; 6 → `sec` prepended; 7 → `sec … dow year`; anything else returns null | PROVEN | `parseCronSpec` L76561-76563 |
| engine field ranges | sec 0-59, min 0-59, hour 0-23, dom 1-31, month 1-12, dow 0-7, year 1970-3000 | PROVEN | `parseCronSpec` L76563 |
| dow 7 normalization | `7` is folded to `0` (Sunday) after parsing | PROVEN | `parseCronSpec` L76565 |
| month-name map | `jan:1 feb:2 mar:3 apr:4 may:5 jun:6 jul:7 aug:8 sep:9 oct:10 nov:11 dec:12` | PROVEN | L76533 |
| weekday-name map | `sun:0 mon:1 tue:2 wed:3 thu:4 fri:5 sat:6` | PROVEN | L76535 |
| `@` shorthand expansion table | `@yearly`/`@annually` → `0 0 1 1 *`; `@monthly` → `0 0 1 * *`; `@weekly` → `0 0 * * 0`; `@daily`/`@midnight` → `0 0 * * *`; `@hourly` → `0 * * * *` | PROVEN | L76537 |
| `@every…` in the engine | NOT expanded — `parseCronSpec` returns null, so `@every*` validates but previews nothing | DERIVED | `validateCronExpression` L76492 accepts it; `parseCronSpec` L76556 has no entry |
| field syntax per element | `*`, integer, name, `a-b` range, `*/n` or `a-b/n` or `a/n` step, comma lists; `>2` slash parts or a 3-part range rejected | PROVEN | `parseCronField` L76541-76553 |
| bare value with a step | `a/n` expands from `a` to the field maximum | PROVEN | `parseCronField` L76550 |
| step must be positive | `/n` requires `/^\d+$/` and `n>0` | PROVEN | `parseCronField` L76545 |
| timezone prefix in the engine | `CRON_TZ=`/`TZ=` accepted only when the value is `UTC` or `Etc/UTC`; any other zone returns null | PROVEN | `parseCronSpec` L76557-76559 |
| comment handling | everything from the first `#` is stripped before field splitting (both grammars) | PROVEN | L76496, L76560 |
| numeric-field test regex | `/^\d+$/` (named `Wb`), used by every preset round-tripper | PROVEN | L76455 |
| dom/dow OR semantics | when BOTH dom and dow are restricted, a day matches if EITHER set contains it (Vixie-cron rule); otherwise only the restricted one applies | PROVEN | `cronDayMatches` L76569 |

## Validation copy (every string)

`validateCronExpression` returns `undefined` when valid, otherwise one of:

| Condition | Exact copy | Label | Citation |
|---|---|---|---|
| trimmed input is empty | `Cron expression is required` | PROVEN | L76491 |
| `@…` token not in the shorthand set and not `@every*` | `Invalid cron shorthand: ${token}` | PROVEN | L76492 |
| `TZ=`/`CRON_TZ=` prefix with no space after it | `Cron expression has timezone prefix but no schedule fields` | PROVEN | L76494 |
| field count `<5` or `>7` | `Expected 5-7 fields (min hour day month weekday), got ${n}` | PROVEN | L76497 |
| any field fails the per-field regex | `Invalid field "${field}"` | PROVEN | L76498 |
| custom-editor hint when valid | `5-7 fields or @daily/@hourly` | PROVEN | `InlineCronCustomEditor` L77866 |
| preview empty but expression valid | `No upcoming runs to preview for this expression.` | PROVEN | `InlineCronCustomEditor` L77879 |

### Behavior

The error text is shown in place of the hint, in the same supporting-text slot
(`data-component="cron-menu-supporting-text"`), with text color `red` when
invalid and `quaternary` when valid (L77866-77868). The input carries `aria-invalid` tied to
the same predicate. While invalid, the editor neither commits the expression nor
renders the run preview — the preview hook is deliberately called with `""`.

## Presets

Three separate preset tables exist. They share the four preset `type` values
(`every-hour`, `every-day`, `every-week`, `custom`) but NOT their cron strings.

### Add-trigger menu, "Scheduled" category — labels only, no cron

| Fact | Value | Label | Citation |
|---|---|---|---|
| category id / label / icon | `scheduled` / `Scheduled` / icon `clock`, size `base`, color `secondary` | PROVEN | `buildCategories` L84299 |
| item 1 | label `Hourly`, type `every-hour` | PROVEN | L84302 |
| item 2 | label `Daily`, type `every-day` | PROVEN | L84304 |
| item 3 | label `Weekly`, type `every-week` | PROVEN | L84306 |
| item 4 | label `Custom (cron)`, type `custom` | PROVEN | L84308 |

### Cron strings those menu items create

| Preset | Expression created | Label | Citation |
|---|---|---|---|
| `every-hour` | `newHourlyCronExpression()` → `` `${new Date().getUTCMinutes()} * * * *` `` — current UTC minute, so it is NOT a constant | PROVEN | `newHourlyCronExpression` L76459, dispatcher L76702 |
| `every-day` | `generateCronExpression("every-day",9,0,…)` → 09:00 LOCAL converted to UTC, as `${utcMinute} ${utcHour} * * *` | PROVEN | L76706, `generateCronExpression` L76479 |
| `every-week` | 09:00 local on local Monday (`dayOfWeek:1`) converted to UTC, as `${utcMinute} ${utcHour} * * ${utcDow}` | PROVEN | L76710, L76481 |
| `custom` | seeded `{mode:"monthly",hourLocal:9,minute:0,dayOfWeek:1,dayOfMonth:1}` → `${utcMinute} ${utcHour} ${utcDayOfMonth} * *` | PROVEN | L76714, L76486 |

### Eval-schedule preset buttons — the only table with literal cron strings

Array `oNi`, rendered as a row of toggle buttons.

| # | `type` | Label copy | Cron expression | Label | Citation |
|---|---|---|---|---|---|
| 1 | `off` | `Off` | *(none — clears `enabled`)* | PROVEN | L90599 |
| 2 | `every-hour` | `Hourly` | `0 * * * *` | PROVEN | L90601 |
| 3 | `every-day` | `Daily` | `0 9 * * *` | PROVEN | L90603 |
| 4 | `every-week` | `Weekly` | `0 9 * * 1` | PROVEN | L90605 |
| 5 | `custom` | `Custom` | `0 1 1 * *` | PROVEN | L90607 |

| Fact | Value | Label | Citation |
|---|---|---|---|
| default eval schedule | `{enabled:false, cron:"0 9 * * *"}` | PROVEN | L90590 |
| `Off` behavior | sets `enabled:false` and PRESERVES the existing `cron` | PROVEN | `CustomerEvalScheduleControls` L90643 |
| other presets | set `enabled:true` and `cron: preset.cron ?? current cron` | PROVEN | L90646 |
| which button is pressed | `activeSchedulePreset` = `enabled ? parseScheduleType(cron) : "off"`; drives `pressed` and `variant` (`primary` when active, else `outline`) | PROVEN | `activeSchedulePreset` L90624, L90649 |
| read-only summary | `scheduleSummary` = `enabled ? describeUtcCronSchedule(cron) : "Not scheduled"` | PROVEN | `scheduleSummary` L90626 |
| list-row summary | identical rule in `customerEvalListScheduleLabel` | PROVEN | L91260 |
| editable-row prefix label | `Runs` precedes `InlineCronConfig` | PROVEN | L90666 |
| raw-cron caption | `Cron: ` + expression + ` (UTC)` (shown in both read-only and editable states) | PROVEN | L90655, L90672 |
| list status badge | `Active` when `schedule.enabled`, else `Inactive` | PROVEN | `CustomerEvalScheduleStatus` L91282 |

## Preset classification — `parseScheduleType`

| Input | Result | Label | Citation |
|---|---|---|---|
| `""` or whitespace-only | `every-hour` | PROVEN | L76460 |
| field count ≠ 5 | `custom` | PROVEN | L76461 |
| minute numeric ≤59 and the other four fields all `*` | `every-hour` | PROVEN | `isHourlyCron` L76456, L76461 |
| min+hour numeric, dom/month/dow all `*` | `every-day` | PROVEN | L76461 |
| min+hour numeric, dom/month `*`, dow numeric | `every-week` | PROVEN | L76461 |
| anything else | `custom` | PROVEN | L76461 |

Note the asymmetry: classification accepts ANY numeric minute for `every-hour`,
so `17 * * * *` reads back as `Hourly`, while the preset button writes `0 * * * *`
and the add-trigger menu writes the current UTC minute.

## `InlineCronConfig` — the inline editor shell

Renders one of four layouts chosen by `parseScheduleType(expression)`, and
always ends with a next-run element.

| Preset branch | Rendered controls (in order) | Label | Citation |
|---|---|---|---|
| `every-hour` | `NextRunPreview` only — no controls | PROVEN | `InlineCronConfig` L77791 |
| `every-day` | caption `at`, hour dropdown labelled `HH:MM`, caption = local TZ abbreviation, `NextRunPreview` | PROVEN | L77794-77811 |
| `every-week` | caption `on`, weekday dropdown, caption `at`, hour dropdown, caption = local TZ abbreviation, `NextRunPreview` | PROVEN | L77812-77846 |
| `custom` | delegates entirely to `InlineCronCustomEditor` | PROVEN | L77847 |

| Fact | Value | Label | Citation |
|---|---|---|---|
| hour dropdown options | `0…23`, each item rendered as zero-padded hour + `:00` (e.g. `09:00`) | PROVEN | `NBr` L77763, items L77802 |
| hour dropdown trigger label | `HH:MM` from `dailyHourLocal`/`dailyMinuteLocal`, both `padStart(2,"0")` | PROVEN | L77796-77800 |
| weekday dropdown options | `Sunday Monday Tuesday Wednesday Thursday Friday Saturday` (array `tj`, index 0 = Sunday) | PROVEN | L76424, items L77817 |
| weekday trigger label | the selected day name, or `Unknown` when the index is out of range | PROVEN | L77813 |
| selecting an hour (daily) | writes `generateCronExpression("every-day", hour, 0, …)` — minute forced to 0 | PROVEN | L77803 |
| selecting a weekday | preserves `weeklyHourLocal` and the custom minute | PROVEN | L77819 |
| selecting an hour (weekly) | forces `minute:0` | PROVEN | L77830 |

## `InlineCronCustomEditor` — fields, parse, render-back, summary

| Fact | Value | Label | Citation |
|---|---|---|---|
| UI shape | a menu/popover: trigger shows the committed expression as its label; content is `aria-label="Cron expression editor"` | PROVEN | L77855, L77882 |
| the one input field | a single free-text cron field — there are NO per-field inputs | PROVEN | L77864 |
| input section title | `Cron expression (UTC)` | PROVEN | L77872 |
| input placeholder | `0 * * * *` | PROVEN | L77865 |
| input aria-label | `Cron expression` | PROVEN | L77865 |
| local draft state | the input is a local buffer, seeded from the committed expression when the popover opens | PROVEN | L77851, L77861 |
| commit rule | on submit/close, the TRIMMED buffer is pushed up only if valid and different from the committed value; an invalid buffer blocks the popover from closing | PROVEN | L77858, L77860 |
| preview block | `data-component="cron-menu-run-preview"`, list `data-testid="cron-next-runs-list"`, rendered only while valid | PROVEN | L77874 |
| preview row count | 3 (`REi`), each row formatted by `formatNextRunTime`, followed by a literal `…` (U+2026) in `quaternary` | PROVEN | L77765, L77884, `_temp2` L77889 |
| row key | each preview row is keyed by `date.toISOString()` | PROVEN | L77889 |

## Cron string → editor fields (`parseScheduleFromCron`)

Produces the full editor view-model. Default/fallback object:
`{type:"custom", dailyHourLocal:9, dailyMinuteLocal:0, weeklyDay:1,
weeklyHourLocal:9, custom:{mode:"weekly", hourLocal:9, minute:0, dayOfWeek:1,
dayOfMonth:1}}`.

| Input | Resulting `type` / fields | Label | Citation |
|---|---|---|---|
| empty/whitespace | `every-hour` | PROVEN | L76505 |
| field count ≠ 5 | the default object (`custom`) | PROVEN | L76507 |
| `isHourlyCron` match | `every-hour` | PROVEN | L76508 |
| min+hour numeric (hour 0-23, min 0-59), dom/month/dow `*` | `every-day` with `dailyHourLocal`/`dailyMinuteLocal` from `utcDailyCronToLocalWallClock` | PROVEN | L76510-76515 |
| dom numeric, month `*`, dow `*` (all within range) | `custom`, `custom.mode:"monthly"`, fields from `utcMonthlyCronToLocalWallClock` | PROVEN | L76522 |
| dom/month `*`, dow numeric 0-6 | `every-week` + `weeklyDay`/`weeklyHourLocal`, and `custom.mode:"weekly"` | PROVEN | L76527 |
| anything else | `custom` with a best-effort partial mapping (`mode` = `monthly` when dom≠`*` and dow=`*`, else `weekly`; out-of-range values fall back to hour 9 / minute 0 / dow 1 / dom 1) | PROVEN | L76519, L76531 |
| `custom.mode` values | exactly `weekly` and `monthly` — monthly is reachable only through `custom` | PROVEN | L76519, `generateCronExpression` L76483 |

`parseCronForDisplay` is the lighter sibling used for row labels; it returns
`{hour, dayOfWeek, minute}` and falls back to `{hour:9, dayOfWeek:1, minute:0}`
on any field-count mismatch.
(`parseCronForDisplay` L76477)

## Editor fields → cron string (`generateCronExpression`)

| Preset | Emitted expression | Label | Citation |
|---|---|---|---|
| `every-hour` | literal `0 * * * *` | PROVEN | L76479 |
| `every-day` | `${utcMinute} ${utcHour} * * *` from `localDailySlotToUtcCronFields` | PROVEN | L76480 |
| `every-week` | `${utcMinute} ${utcHour} * * ${utcDow}` from `localWeeklySlotToUtcCronFields`; minute clamped to 0 unless `custom.minute` is 0-59 | PROVEN | L76482 |
| `custom` + `mode:"weekly"` | `${utcMinute} ${utcHour} * * ${utcDow}` | PROVEN | L76484 |
| `custom` + `mode:"monthly"` | `${utcMinute} ${utcHour} ${utcDayOfMonth} * *` | PROVEN | L76486 |
| monthly day clamp | `dayOfMonth` clamped to `[1, days-in-current-month]` before conversion | PROVEN | `localMonthlySlotToUtcCronFields` L76450 |
| minute granularity | presets only ever emit minute 0 for daily/weekly; sub-hour cadence requires the custom free-text field | DERIVED | all preset call sites pass minute 0 (L77803, L77830) |

## Timezone handling

There is no timezone picker and no stored timezone anywhere in the bundle.

| Fact | Value | Label | Citation |
|---|---|---|---|
| stored zone | UTC, always; the cron string is the only persisted scheduling state | PROVEN | `parseCronSpec` L76557 rejects any non-UTC prefix; captions say `(UTC)` at L90655 |
| timezone picker | none exists — no zone list, no IANA name set, no selector component | PROVEN | exhaustive search: the only `timeZone` option sites are L76597 and L90542, both caller-supplied formatter options |
| displayed zone | the BROWSER/OS local zone, resolved at render time | PROVEN | `getLocalTimezoneAbbreviation` L72460 |
| zone label source | `Intl.DateTimeFormat("en-US",{timeZoneName:"short"})`, taking the `timeZoneName` part | PROVEN | L72453 |
| zone label fallback | on throw or missing part: `` `UTC${sign}${hours}${minutes?":MM":""}` `` from `Date.getTimezoneOffset()` | PROVEN | L72458 |
| conversion direction | editor fields are LOCAL wall-clock; they are converted to UTC on write and back to local on read, via a scratch `Date` (so conversion uses TODAY's DST offset) | PROVEN | `localDailySlotToUtcCronFields` L76433, `utcDailyCronToLocalWallClock` L76437, and the weekly/monthly pairs L76441/76445/76450/76455 |
| evaluation zone (client preview) | strictly UTC — every field comparison uses `getUTC*` | PROVEN | `computeNextRunAfter` L76588, `cronDayMatches` L76569 |
| evaluation zone (server) | not in the client | REMOTE | the client persists only a UTC cron string and shows `(UTC)`; it never sends a zone |

### Behavior (DST)

Because conversion builds a `Date` seeded from `new Date()` and only mutates the
time-of-day, a cron generated in winter encodes the winter UTC offset. The UTC
expression does not shift at a DST boundary, so the local wall-clock run time
moves by an hour. The weekly converter additionally advances to the next
occurrence of the chosen weekday (`(target - current + 7) % 7`) before
converting, which is what lets the UTC day-of-week differ from the local one.

## Next-run preview

The client computes next-run times locally; it does not ask the server.

| Fact | Value | Label | Citation |
|---|---|---|---|
| engine | `parseCronSpec` → field Sets, then `computeNextRunAfter` steps a UTC cursor forward | PROVEN | L76567, L76588 |
| step granularity | +1s when a seconds field is present, else +1min (with sub-unit zeroing) | PROVEN | `computeNextRunAfter` L76589 |
| search horizon | current UTC year + 5; returns null past it | PROVEN | L76590 |
| iteration cap | 5,000,000 steps | PROVEN | L76590 |
| skip strategy | on a mismatch it jumps the cursor to the start of the next year / month / day / hour / minute rather than stepping linearly | PROVEN | L76590 |
| batch API | `getNextRunTimes(expr,{count,from})` — `count` clamped at `>=0`, `from` defaults to now, stops early when the engine returns null | PROVEN | `getNextRunTimes` L76593 |
| format | `Intl.DateTimeFormat(locale,{weekday:"short",month:"short",day:"numeric",hour:"numeric",minute:"2-digit",timeZoneName:"short"})`, optional `timeZone` override | PROVEN | `formatNextRunTime` L76604 |
| format fallback | `date.toUTCString()` on throw | PROVEN | L76607 |
| inline label copy | `Next run ` + formatted time, `size:"md"`, `color:"tertiary"`, `data-testid="cron-next-run-preview"` | PROVEN | `NextRunLabel` L77779 |
| label when no run | renders `null` (nothing) | PROVEN | `NextRunLabel` L77777 |
| inline preview count | 1 | PROVEN | `NextRunPreview` L77785 |
| live refresh | a timer re-ticks at `min(msUntilFirstRun + 500, 6h)`, clamped to 0 when already past; 6h = `360*60*1000` | PROVEN | `useNextRunTimes` L77767-77772, `MEi` L77765 |

## Human-readable summary phrasings

Four independent summary builders exist. A reimplementation needs all four —
they are used in different surfaces and do not agree.

### `getTriggerLabel` / `getDraftTriggerLabel` (trigger cards, saved + draft)

| Preset | Template | Label | Citation |
|---|---|---|---|
| `every-hour` | `Every hour` | PROVEN | L77093 / L100525 |
| `every-day` | `` `Every day at ${HH}:${MM} ${TZABBR}` `` | PROVEN | L77093 / L100525 |
| `every-week` | `` `Every ${WeekdayLongName} at ${HH}:${MM} ${TZABBR}` `` | PROVEN | L77094 / L100526 |
| `custom` | `Custom schedule` | PROVEN | L77094 / L100526 |

Hour and minute are local wall-clock, zero-padded to 2; `TZABBR` is
`getLocalTimezoneAbbreviation()`; the weekday comes from the long-name array.

### `getRowLabel` (trigger row, cron kind only)

| Preset | Template | Label | Citation |
|---|---|---|---|
| `every-hour` | `Every hour` | PROVEN | L84810 |
| `every-day` | `Every day` (no time, no zone) | PROVEN | L84810 |
| `every-week` | `Every week` (no day, no time) | PROVEN | L84810 |
| `custom` | `Custom schedule` | PROVEN | L84811 |

### `formatCronHuman` (run surfaces; 12-hour clock)

| Pattern matched | Template | Label | Citation |
|---|---|---|---|
| field count ≠ 5 | returns the raw expression unchanged | PROVEN | L98360 |
| `0 * * * *` | `Every hour` | PROVEN | L98361 |
| `0 H * * *` | `` `Every day at ${h12}${AM\|PM} ${TZABBR}` `` | PROVEN | L98363 |
| `0 H * * 1-5` | `` `Weekdays at ${h12}${AM\|PM} ${TZABBR}` `` | PROVEN | L98366 |
| `0 H * * D` (D = 0-6) | `` `Every ${WeekdayShortName} at ${h12}${AM\|PM} ${TZABBR}` `` | PROVEN | L98371 |
| `0 */N * * *` | `Every hour` when N=1, else `` `Every ${N} hours` `` | PROVEN | L98373 |
| no match | the raw expression | PROVEN | L98374 |

| Fact | Value | Label | Citation |
|---|---|---|---|
| short weekday array | `Sun Mon Tue Wed Thu Fri Sat` | PROVEN | L98358 |
| 12-hour formula | `hourLocal % 12 \|\| 12`, suffix `PM` when `hourLocal >= 12` else `AM`; no space before the suffix | PROVEN | L98362 |

### `describeUtcCronSchedule` (eval summaries; sentence fragments)

| Pattern matched | Template | Label | Citation |
|---|---|---|---|
| field count ≠ 5 | `on a custom schedule` | PROVEN | L90532 |
| `*/N * * * *` with N ≤ 59 | `every minute` when N=1, else `` `every ${N} minutes` `` | PROVEN | L90534 |
| minute 0-59, all other fields `*` | `every hour` | PROVEN | L90535 |
| min+hour numeric, dom/month `*`, parseable dow set, one distinct local time, day count = dow-set size | all 7 days → `` `every day at ${time}` ``; else `` `on ${weekdayPhrase} at ${time}` `` | PROVEN | L90557 |
| same shape but the times/days disagree across occurrences | `` `next on ${WeekdayLongName} at ${time}` `` | PROVEN | L90556 |
| any other shape, unparseable dow, or an `Intl` throw | `on a custom schedule` | PROVEN | L90536, L90539, L90549, L90554 |

| Fact | Value | Label | Citation |
|---|---|---|---|
| dow selection grammar | `*` → all of 0-6; else comma list of `/^(\d)(?:-(\d))?$/`; rejects values >7 or a reversed range; `7` folded to `0` | PROVEN | `parseCronDayOfWeekSelection` L90526 |
| weekday phrase: Mon-Fri set | exactly `weekdays` | PROVEN | `describeEnglishWeekdays` L90527 |
| weekday phrase: 3+ contiguous days | `` `${FirstDay}s–${LastDay}s` `` with an EN DASH (U+2013), days pluralized by appending `s` | PROVEN | L90529 |
| weekday phrase: otherwise | `Intl.ListFormat("en-US")` over pluralized long day names (e.g. `Mondays and Thursdays`) | PROVEN | L90529 |
| time format | `Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"2-digit"})`, optional `timeZone` option; the weekday formatter is a second `Intl.DateTimeFormat("en-US",{weekday:"long"})` | PROVEN | L90543-90546 |
| how days are discovered | it calls the real cron engine for `dowSet.size` runs and reads back the weekday/time of each — the phrasing is derived from computed next-run times, not from the cron fields | PROVEN | L90537-90539, L90550 |

## rrule

| Fact | Value | Label | Citation |
|---|---|---|---|
| rrule / RFC 5545 recurrence | NOT present. The bundle has zero genuine rrule references | PROVEN | exhaustive search below |
| the apparent lowercase hit | the substring inside the filename literal `.cursorrules`, in an unrelated file-icon map | PROVEN | L18242 |
| the apparent camelCase hits | the substring inside the TextMate-grammar identifiers `createCaptureRule`, `registerRule`, `getCompiledRuleId` | PROVEN | L21304, L21306, L21479 |
| recurrence vocabulary | no `RRULE`, `DTSTART`, `FREQ=`, `BYDAY`, or `BYMONTH` token exists anywhere in the bundle | PROVEN | word-boundary search returns nothing |

Scheduling is cron-only; there is no iCalendar recurrence path to reproduce.
