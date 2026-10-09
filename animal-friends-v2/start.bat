@echo off
rem Animal Friends - double-click to play (Windows).
rem Starts a tiny local web server and opens the app in its own window.
rem Close this window to stop it. Needs Python 3 (python.org).

cd /d "%~dp0"
set PORT=8765
set URL=http://localhost:%PORT%/

echo Animal Friends is running at %URL%
echo Close this window to stop it.

start "" msedge --app=%URL% 2>nul || start "" chrome --app=%URL% 2>nul || start "" %URL%

py -3 serve.py %PORT% 2>nul || python serve.py %PORT%
