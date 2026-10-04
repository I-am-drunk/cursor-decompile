#!/usr/bin/env bash
# Build the name -> line map for the split bundle.
#
# Cursor ships a name-registration helper, `i(fn,"OriginalName")`, after every
# function it defines, so the artifact carries its own symbol table. This emits
# corpus/index/names.tsv (NAME <tab> LINE) which is how you find anything here:
#   grep -P '^McpActionForm\t' corpus/index/names.tsv
# then read that line in corpus/automations.split.js.
set -euo pipefail
cd "$(dirname "$0")/.."
S=corpus/automations.split.js
test -f "$S" || { echo "run: node pipeline/split.mjs corpus/app/out/vs/workbench/workbench.anysphere-ui-automations.js $S" >&2; exit 1; }
mkdir -p corpus/index
LC_ALL=C grep -aonE '[^A-Za-z0-9_$]i\([A-Za-z0-9_$.]+,"[A-Za-z0-9_$]+"\)' "$S" \
  | sed -E 's/^([0-9]+):.*,"([A-Za-z0-9_$]+)"\)$/\2\t\1/' \
  | sort -u -k1,1 > corpus/index/names.tsv
echo "names: $(wc -l < corpus/index/names.tsv) symbols mapped"
