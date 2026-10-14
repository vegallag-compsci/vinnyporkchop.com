"""discord_webhook.py - reusable helpers for sending data to a Discord webhook.

Location: back-end/webhooks/discord.py (.env lives one level up in back-end/)

Setup:
    pip install requests python-dotenv
    Create back-end/.env with:  DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/<id>/<token>
"""

import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
from dotenv import load_dotenv

# Load back-end/.env no matter where the script is run from.
# __file__ = this file's path, so ".env" is resolved relative to back-end/, not the terminal's cwd.
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL")  # None if missing; checked in _post()
MAX_CONTENT_LEN = 2000  # Discord's hard limit for message text

# Embed colors (Discord wants an integer, not a hex string)
COLORS = {"green": 0x2ECC71, "red": 0xE74C3C, "blue": 0x3498DB, "yellow": 0xF1C40F}


def _post(payload, webhook_url=None, files=None, retries=3):
    """Core sender. Every other function funnels through here."""
    url = webhook_url or WEBHOOK_URL
    if not url:
        raise ValueError(
            "DISCORD_WEBHOOK_URL not found. Add it to back-end/.env or pass webhook_url=."
        )

    for _ in range(retries):
        if files:  # file uploads must be multipart, so JSON goes in a form field
            resp = requests.post(
                url, data={"payload_json": json.dumps(payload)}, files=files, timeout=10
            )
        else:
            resp = requests.post(url, json=payload, timeout=10)

        if resp.status_code == 429:  # rate limited: Discord says how long to wait
            time.sleep(resp.json().get("retry_after", 1))
            continue

        resp.raise_for_status()  # raises on any other 4xx/5xx
        return resp

    raise RuntimeError("Still rate limited after retries.")


def _chunk(text, size=MAX_CONTENT_LEN):
    """Split long text into pieces that fit Discord's 2000-char limit."""
    return [text[i : i + size] for i in range(0, len(text), size)] or [""]


def send_message(content, username=None, avatar_url=None, webhook_url=None):
    """Send plain text. Long text is automatically split into multiple messages."""
    for part in _chunk(content):
        payload = {"content": part}
        if username:
            payload["username"] = username  # overrides the webhook's default name
        if avatar_url:
            payload["avatar_url"] = avatar_url
        _post(payload, webhook_url)


def build_embed(title=None, description=None, color="blue", fields=None,
                footer=None, url=None, timestamp=True):
    """Build an embed dict (the rich 'card' style message).

    fields: list of (name, value) or (name, value, inline) tuples.
    """
    embed = {"color": COLORS.get(color, color)}  # accepts a name or a raw int
    if title:
        embed["title"] = title[:256]
    if description:
        embed["description"] = description[:4096]
    if url:
        embed["url"] = url
    if footer:
        embed["footer"] = {"text": footer}
    if timestamp:
        embed["timestamp"] = datetime.now(timezone.utc).isoformat()
    if fields:
        embed["fields"] = [
            {"name": f[0], "value": str(f[1]), "inline": f[2] if len(f) > 2 else False}
            for f in fields
        ]
    return embed


def send_embed(embeds, content=None, username=None, webhook_url=None):
    """Send one embed dict (or a list of up to 10)."""
    if isinstance(embeds, dict):
        embeds = [embeds]
    payload = {"embeds": embeds[:10]}
    if content:
        payload["content"] = content
    if username:
        payload["username"] = username
    _post(payload, webhook_url)


def send_file(path, content=None, webhook_url=None):
    """Upload a file (log, image, csv...) with optional message text."""
    with open(path, "rb") as f:
        data = f.read()  # read bytes up front so retries can reuse them
    files = {"file": (os.path.basename(path), data)}
    _post({"content": content or ""}, webhook_url, files=files)


if __name__ == "__main__":
    send_message("Hello from vinnyporkchop.com!")
    send_embed(
        build_embed(
            title="Job finished",
            description="Nightly backup completed.",
            color="green",
            fields=[("Duration", "42s", True), ("Files", 1280, True)],
            footer="backup-bot",
        )
    )