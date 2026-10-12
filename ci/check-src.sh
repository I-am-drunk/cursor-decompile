#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
./node_modules/.bin/tsc --noEmit
node --test pipeline/read.test.mjs test/*.test.ts test/*.test.mjs
node pipeline/check-evidence.mjs
git diff --check
if [ "${1:-}" = "--reference" ]; then
  node pipeline/check-evidence.mjs "${REFERENCE_DIR:-reference/automations}"
  node pipeline/compare-ui.mjs artifacts/upgrade-measurements.json
  node pipeline/compare-ui.mjs artifacts/runs-measurements.json
  node pipeline/compare-ui.mjs artifacts/failed-run-list-measurements.json
  node pipeline/compare-ui.mjs artifacts/failed-run-summary-measurements.json
  node pipeline/compare-ui.mjs artifacts/failed-run-menu-measurements.json
  for state in saved-editor tools-menu mcp-menu mcp-browse mcp-url mcp-command mcp-json model-picker model-options; do
    node pipeline/compare-ui.mjs "artifacts/$state-measurements.json"
  done
  for state in trigger-baseline add-trigger scheduled-submenu schedule-picker trigger-dismissed; do
    node pipeline/compare-ui.mjs "artifacts/$state-measurements.json"
  done
fi
