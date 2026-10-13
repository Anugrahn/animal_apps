"""Serves Animal Friends on this computer: python3 serve.py [port] [--lan]

The plain `python3 -m http.server` keeps only five waiting connections,
and the app now loads many pictures at once, so some were refused and
showed as broken. This is the same server with room for many more.
--lan lets a phone on the same Wi-Fi (or hotspot) open it too.
Only the app is served: no folder listings, and not the design references
(interface/), the research (docs/), the notes (*.md) or hidden files."""
import functools, http.server, os, sys, urllib.parse

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

    def send_head(self):
        path = urllib.parse.unquote(self.path.split('?', 1)[0].split('#', 1)[0])
        parts = [p for p in path.split('/') if p]
        hidden = any(p.startswith('.') for p in parts) or (parts and parts[0] in ('interface', 'docs'))
        if hidden or path.lower().endswith('.md') or (path.endswith('/') and path != '/'):
            self.send_error(404)
            return None
        return super().send_head()

handler = functools.partial(Handler, directory=here)
Handler.extensions_map = dict(http.server.SimpleHTTPRequestHandler.extensions_map, **{'.webp': 'image/webp', '.webmanifest': 'application/manifest+json'})
print(f'Animal Friends is running at http://localhost:{port}/  (close this window to stop it)')
if host == '0.0.0.0':
    import socket
    try:   # the address other devices use: the one a route out would leave from
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.connect(('10.255.255.255', 1)); ip = s.getsockname()[0]; s.close()
    except OSError:
        ip = 'THIS-COMPUTER-IP'
    print(f'On a phone on the same Wi-Fi, open http://{ip}:{port}/')
    print('(Over plain http the phone cannot install it, keep an offline copy or use the microphone.)')
Server((host, port), handler).serve_forever()
