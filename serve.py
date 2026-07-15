#!/usr/bin/env python3
"""Dev server with caching disabled — mobile Safari otherwise serves stale JS/CSS."""
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

os.chdir(os.path.dirname(os.path.abspath(__file__)))

class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

ThreadingHTTPServer(('', 4242), NoCacheHandler).serve_forever()
