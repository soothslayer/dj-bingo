#!/usr/bin/env bash
# Deploy DJ Bingo to Cloudflare Pages.
#
# `wrangler pages deploy` uploads everything in the directory it's given, and it
# only skips a hardcoded list (.git, node_modules, .DS_Store, .wrangler). It does
# NOT read .gitignore or .assetsignore — that's a Workers feature, not a Pages one.
# So we stage exactly the files that make up the site and upload only those.

set -euo pipefail
cd "$(dirname "$0")"

STAGE=.deploy
SITE=(index.html cards.html dj.html data js)

rm -rf "$STAGE"
mkdir -p "$STAGE"
for item in "${SITE[@]}"; do
  [ -e "$item" ] || { echo "missing: $item" >&2; exit 1; }
  cp -R "$item" "$STAGE/"
done

echo "Staged $(find "$STAGE" -type f | wc -l | tr -d ' ') files:"
find "$STAGE" -type f | sed "s|^$STAGE/|  |" | sort

npx wrangler pages deploy "$STAGE" --project-name=dj-bingo "$@"
