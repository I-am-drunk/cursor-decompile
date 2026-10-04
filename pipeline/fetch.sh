#!/usr/bin/env bash
# Fetch and unpack the Cursor artifact into corpus/ (gitignored).
# Usage: bash pipeline/fetch.sh
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p corpus

API='https://www.cursor.com/api/download?platform=linux-x64&releaseTrack=stable'
curl -fsSL "$API" -o corpus/release.json
VERSION=$(python3 -c 'import json;print(json.load(open("corpus/release.json"))["version"])')
DEB=$(python3 -c 'import json;print(json.load(open("corpus/release.json"))["debUrl"])')
echo "cursor $VERSION"

if [ ! -f "corpus/cursor-$VERSION.deb" ]; then
  curl -fL "$DEB" -o "corpus/cursor-$VERSION.deb"
fi

rm -rf corpus/ext && mkdir -p corpus/ext
dpkg-deb -x "corpus/cursor-$VERSION.deb" corpus/ext

APP=corpus/ext/usr/share/cursor/resources/app
test -f "$APP/out/vs/workbench/workbench.anysphere-ui-automations.js" \
  || { echo "FAIL: automations bundle missing" >&2; exit 1; }

ln -sfn "$(cd "$APP" && pwd)" corpus/app
echo "$VERSION" > corpus/.version
bash pipeline/index.sh
