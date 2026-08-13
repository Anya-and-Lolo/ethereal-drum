#!/usr/bin/env python3
"""Build the local demo catalogue, serve the app, and watch for song changes."""

from __future__ import annotations

import functools
import http.server
import json
import pathlib
import re
import threading
import time
import webbrowser
from typing import Optional


PROJECT_ROOT = pathlib.Path(__file__).resolve().parent.parent
DEMO_DIRECTORY = PROJECT_ROOT / "demo-songs"
COMMUNITY_DIRECTORY = PROJECT_ROOT / "community-songs"
CATALOG_PATH = PROJECT_ROOT / "app-files" / "demo-catalog.js"


def demo_slug(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "demo-song"


def read_song(path: pathlib.Path, folder: str) -> Optional[dict]:
    try:
        document = json.loads(path.read_text(encoding="utf-8"))
        song = document.get("song", {})
        if not song.get("title") or not song.get("sequence") or not song.get("bpm"):
            raise ValueError("the file does not contain a complete song")
        song["id"] = demo_slug(path.stem)
        song["builtIn"] = True
        song["folder"] = folder
        return song
    except (OSError, ValueError, TypeError, json.JSONDecodeError) as error:
        print(f"Skipped {path.name}: {error}")
        return None


def read_song_folder(directory: pathlib.Path, folder: str) -> list:
    songs = []
    for path in sorted(directory.glob("*.drumsong")):
        song = read_song(path, folder)
        if song:
            songs.append(song)
    return songs


def write_song_catalogs() -> None:
    demo_songs = read_song_folder(DEMO_DIRECTORY, "demo")
    community_songs = read_song_folder(COMMUNITY_DIRECTORY, "community")
    demo_payload = json.dumps(demo_songs, ensure_ascii=False, separators=(",", ":"))
    community_payload = json.dumps(community_songs, ensure_ascii=False, separators=(",", ":"))
    javascript = (
        f"window.ETHEREAL_DEMO_CATALOG_VERSION = '{time.time_ns()}';\n"
        f"window.ETHEREAL_DEMO_SONGS = {demo_payload};\n"
        f"window.ETHEREAL_COMMUNITY_SONGS = {community_payload};\n"
    )
    CATALOG_PATH.write_text(javascript, encoding="utf-8")
    print(f"Song catalogues updated: {len(demo_songs)} demo and {len(community_songs)} community song(s).")


def demo_snapshot() -> tuple:
    result = []
    for directory in (DEMO_DIRECTORY, COMMUNITY_DIRECTORY):
        for path in sorted(directory.glob("*.drumsong")):
            try:
                details = path.stat()
                result.append((directory.name, path.name, details.st_mtime_ns, details.st_size))
            except OSError:
                pass
    return tuple(result)


def main() -> None:
    DEMO_DIRECTORY.mkdir(exist_ok=True)
    COMMUNITY_DIRECTORY.mkdir(exist_ok=True)
    write_song_catalogs()
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(PROJECT_ROOT))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    port = server.server_address[1]
    address = f"http://127.0.0.1:{port}/index.html"
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()

    print()
    print(f"Ethereal Drum Trainer is running at {address}")
    print("Watching the demo-songs and community-songs folders for changes.")
    print("Keep this window open while using the trainer. Press Ctrl+C to stop.")
    print()
    threading.Timer(0.35, lambda: webbrowser.open(address)).start()

    previous = demo_snapshot()
    try:
        while True:
            time.sleep(1)
            current = demo_snapshot()
            if current != previous:
                time.sleep(0.2)
                write_song_catalogs()
                previous = demo_snapshot()
    except KeyboardInterrupt:
        print("\nStopping Ethereal Drum Trainer.")
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
