#!/usr/bin/env bash
# Index the automations bundle: sizes, hashes, and the identifier census.
# Writes corpus/index/*.txt (gitignored). Run after pipeline/fetch.sh.
set -euo pipefail
cd "$(dirname "$0")/.."
B=corpus/app/out/vs/workbench/workbench.anysphere-ui-automations.js
test -f "$B" || { echo "run pipeline/fetch.sh first" >&2; exit 1; }
mkdir -p corpus/index

sha256sum "$B" > corpus/index/hashes.txt
wc -c "$B" >> corpus/index/hashes.txt

g() { LC_ALL=C grep -aoE "$1" "$B" | sort -u; }

# Components, hooks, helpers: Cursor retains original names.
g '"[A-Z][A-Za-z0-9]{3,48}"'        > corpus/index/pascal.txt
g '"use[A-Z][A-Za-z0-9]{2,48}"'     > corpus/index/hooks.txt
g '"automations-[a-z0-9_-]{2,60}"'  > corpus/index/classes.txt
g '"automations_[a-z_]{3,50}"'      > corpus/index/flags.txt
g '"/[a-z0-9:/_-]{3,60}"'           > corpus/index/paths.txt

wc -l corpus/index/*.txt
