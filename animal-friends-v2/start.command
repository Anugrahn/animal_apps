#!/bin/bash
# Animal Friends — double-click to play (macOS / Linux).
# Starts a tiny local web server and opens the app in its own window.
# Close this Terminal window to stop it.

cd "$(dirname "$0")" || exit 1
PORT=8765
URL="http://localhost:$PORT/"

echo "Animal Friends is running at $URL"
echo "Close this window to stop it."

( sleep 1
  if [ -d "/Applications/Google Chrome.app" ]; then
    open -na "Google Chrome" --args --app="$URL"
  elif [ -d "/Applications/Microsoft Edge.app" ]; then
    open -na "Microsoft Edge" --args --app="$URL"
  elif command -v xdg-open >/dev/null; then
    xdg-open "$URL"
  else
    open "$URL"
  fi ) &

exec python3 serve.py "$PORT"
