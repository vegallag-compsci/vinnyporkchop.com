"""server.py - tiny API that pings Discord when someone visits the site.

Run:
    pip install -r requirements.txt
    python server.py
"""

import logging
import threading
import time

from flask import Flask, request

from webhooks.discord import build_embed, send_embed

VISIT_COOLDOWN_SECONDS = 60  # one ping per IP per minute, so refresh-spam can't flood the channel

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
_last_ping = {}  # ip -> timestamp of last ping
_lock = threading.Lock()


def _client_ip():
    # Behind a reverse proxy (nginx, Cloudflare...) the real IP is in X-Forwarded-For.
    forwarded = request.headers.get("X-Forwarded-For", "")
    return forwarded.split(",")[0].strip() or request.remote_addr or "unknown"


def _should_ping(ip):
    now = time.time()
    with _lock:
        if now - _last_ping.get(ip, 0) < VISIT_COOLDOWN_SECONDS:
            return False
        _last_ping[ip] = now
        return True


def _notify():
    try:
        send_embed(build_embed(title="hello", description="Someone visited vinnyporkchop.com"))
    except Exception:
        app.logger.exception("Failed to send Discord visit embed")


@app.post("/api/visit")
def visit():
    if _should_ping(_client_ip()):
        # Send in the background so the page's request returns instantly.
        threading.Thread(target=_notify, daemon=True).start()
    return "", 204


if __name__ == "__main__":
    app.run(port=5000)
