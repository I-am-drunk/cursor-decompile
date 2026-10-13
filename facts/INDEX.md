# facts/ — closed

This queue listed 14 fact files to be extracted from Cursor's automations
bundle. It is closed and the rows will not be filled. See README.md.

Two reasons, and the second is the one that surprised us:

1. **Provenance.** A fact table reproducing a surface's internals at byte
   fidelity, published from a public repo while the artifact stays gitignored,
   publishes the substance and hides the provenance. Six of seven extractors
   refused on exactly this ground.

2. **It was wrong.** The one row that completed checked this file's own
   headline claims and found 3 of 4 incorrect — `All Automations` is a
   runs-filter radio item rather than the list header; `Add Automation` is
   never rendered (a sentinel rewritten to `New Automation`); the trigger-
   summary and last-run cells do not exist. Written from guesses about the
   artifact, cited as if verified, and nobody had noticed.

The feature model the sibling project wanted — **MCP per automation** — comes
from the open Model Context Protocol specification instead, which is a
published standard with SDKs. It never needed this queue. Scheduling comes from
the public cron specification. Layout comes from the product as a user sees it.

See `docs/plan/mcp.md` and `docs/plan/automations.md` in
[`linear-loops-decompile`](https://github.com/I-am-drunk/linear-loops-decompile).
