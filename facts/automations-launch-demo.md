# Automations launch-demo evidence

Cursor's official [launch post](https://cursor.com/blog/automations), published
2026-03-05, embeds a public demo showing the list, editor, and tool controls.
The [manifest](automations-launch-demo.json) pins seven retrieved frames by
URL, requested time, byte count, and SHA-256. Raw media stays in `corpus/`.

These facts are `DOCUMENTED`: they describe the published demo, not a live
product session. The build, recording date, route, account permissions, browser
viewport, device scale, zoom, and theme setting are unknown. Images look light;
each encoded image is 1920x1080.
That is not a CSS viewport measurement. The video includes crops/zooms.
Do not apply these historical labels or positions to the current product
without the [authenticated capture](../specs/automations-layout.md).

## Visible facts

Times are thumbnail request times in seconds. The hash identifies the returned
frame; no frame-accurate decoding or interaction replay is claimed.

| ID | Time | Visible fact | Limit |
|---|---:|---|---|
| D01 | 5 | The empty list places four summary cards above a prompt box, then `Mine` / `All`, a search icon, and a `New` button with a plus icon. Below are `No automations yet` and a two-column `Suggested` card grid. | Empty state only; no populated-row, filter, or search behavior verified. |
| D02 | 10 | A template modal overlays the list. Its sections are `Triggers`, `Prompt`, `Tools`; bottom actions are `Cancel` and `Start Building`. | The suggested Slack template does not prove the blank-new editor layout. |
| D03 | 36 | A saved automation shows an `Active` switch and `Settings` / `Run History` tabs. Visible vertical order: `Triggers`, `Instructions`, `Tools`, then `Environment`. The model control sits at the bottom of the instructions panel. | Only this saved state; environment content is cropped. Switch, save, and persistence behavior are unverified. |
| D04 | 36 | The trigger card has schedule controls, an indented repository/branch line, and `Add Trigger`. The tools card has `Open Pull Request` and `Add Tool or MCP`. | Not evidence of all trigger/tool types. |
| D05 | 51 | With `@s` visible in instructions, an open menu groups `Actions` and `MCP Servers`. Visible actions include `Send to Slack` and `Read Slack Channels`; several named MCP entries follow. | How it was opened, filtering rules, and server-count limits are unverified. |
| D06 | 53 | The same named example contains an inline `@Send to Slack` token. Its tools panel shows `Memories`, `Manage`, `Send to Slack` with `Select Channels`, and `Add Tool or MCP`. | Frames do not prove persistence or execution. |
| D07 | 78 | A repository picker opens beneath `Select a repo` in the trigger card: `Search repositories…`, `Recent`, `All Repositories`, `Add repositories`. | Selection result and current inventory are unverified. |
| D08 | 84 | One tools panel contains `Memories`, `Send to Slack`, `Sentry` with `Authenticate`, and `Datadog` with `Disconnect`; `Add Tool or MCP` is below. A Slack channel picker is open. | Two named service rows are depicted; authentication, maximum cardinality, isolation, and wire configuration remain unverified. |

For the Linear handoff, D03–D08 identify controls to capture in the existing
[integration contract](../specs/linear-as-integration.md). They do not supply
CSS dimensions, model availability, MCP semantics, or runtime parity.

## Reproduce the cited frames

From the repo root, using Python's standard library:

```sh
python3 - <<'PY'
import hashlib, json, pathlib, urllib.request
manifest = json.loads(pathlib.Path('facts/automations-launch-demo.json').read_text())
for frame in manifest['frames']:
    url = manifest['thumbnailEndpoint'] + '?time=' + str(frame['requestedTimeSeconds'])
    data = urllib.request.urlopen(url, timeout=30).read()
    if len(data) != frame['byteLength'] or hashlib.sha256(data).hexdigest() != frame['sha256']:
        raise SystemExit('Reference changed; inspect before updating: ' + frame['file'])
    path = pathlib.Path(frame['file'])
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    print(path)
PY
```

Inspect each image against its row. A passing hash check reproduces the media;
it does not certify the interpretation. The HTML hash records the retrieved
post, whose embedded playback ID links these frames to Cursor's publication.
The live post may change independently of the media. Null manifest fields are
unknown, not defaults; image coordinates cannot stand in for CSS measurements.
