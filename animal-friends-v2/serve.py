"""Serves Animal Friends on this computer: python3 serve.py [port] [--lan]

The plain `python3 -m http.server` keeps only five waiting connections,
and the app now loads many pictures at once, so some were refused and
showed as broken. This is the same server with room for many more.
--lan lets a phone on the same Wi-Fi (or hotspot) open it too."""
import functools, http.server, os, sys

class Server(http.server.ThreadingHTTPServer):
    request_queue_size = 256
    daemon_threads = True

port = int(next((a for a in sys.argv[1:] if a.isdigit()), 8765))
host = '0.0.0.0' if '--lan' in sys.argv else '127.0.0.1'
here = os.path.dirname(os.path.abspath(__file__))
class Handler(http.server.SimpleHTTPRequestHandler):
    # A phone opening this over plain http:// cannot keep an offline copy, so
    # its browser guesses how long files stay fresh, and after an update it
    # could mix old and new files. Ask it to check every time instead (an
    # unchanged file costs only a tiny "not modified" reply).
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

handler = functools.partial(Handler, directory=here)
Handler.extensions_map = dict(http.server.SimpleHTTPRequestHandler.extensions_map, **{'.webp': 'image/webp', '.webmanifest': 'application/manifest+json'})
print(f'Animal Friends is running at http://{host if host != "0.0.0.0" else "localhost"}:{port}/  (close this window to stop it)')
Server((host, port), handler).serve_forever()
