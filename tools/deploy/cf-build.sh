#!/bin/sh
# Cloudflare Pages build (Build command: sh tools/deploy/cf-build.sh, Output: dist).
# Copies the app into dist/, without what a phone doesn't need (design
# references, research, notes, the local server), and adds a fingerprint
# of the app's files to the offline cache's name, so an update always
# reaches installed copies (and a push that changes no app file doesn't
# make phones download anything). Run it locally to try: sh tools/deploy/cf-build.sh
set -e
cd "$(dirname "$0")/../.."
rm -rf dist && mkdir dist
(cd animal-friends-v2 && tar cf - \
  --exclude=./interface --exclude=./docs --exclude='*.md' --exclude=./serve.py \
  --exclude=./start.bat --exclude=./start.command --exclude=.vercelignore --exclude=.DS_Store .) | (cd dist && tar xf -)
if command -v sha1sum >/dev/null; then SUM=sha1sum; else SUM=shasum; fi
cd dist
PRINT=$(find . -type f ! -name sw.js | LC_ALL=C sort | xargs $SUM | $SUM | cut -c1-8)
sed "s/const VERSION = 'af-\([^']*\)';/const VERSION = 'af-\1-$PRINT';/" sw.js > sw.tmp && mv sw.tmp sw.js
echo "dist: $(find . -type f | wc -l | tr -d ' ') files, $(du -sh . | cut -f1), cache $(grep -o "af-[^']*" sw.js | head -1)"
