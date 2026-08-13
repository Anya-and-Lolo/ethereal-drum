#!/usr/bin/env python3
"""Generate the browser song catalogue from demo-songs and community-songs."""
from __future__ import annotations
import json
import pathlib
import re
import time

ROOT = pathlib.Path(__file__).resolve().parent.parent
DEMO = ROOT / 'demo-songs'
COMMUNITY = ROOT / 'community-songs'
OUTPUT = ROOT / 'app-files' / 'demo-catalog.js'


def slug(value: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', value.lower()).strip('-') or 'song'


def read_folder(directory: pathlib.Path, folder: str) -> list[dict]:
    directory.mkdir(exist_ok=True)
    songs: list[dict] = []
    for path in sorted(directory.glob('*.drumsong')):
        try:
            document = json.loads(path.read_text(encoding='utf-8'))
            song = document.get('song') or {}
            if not song.get('title') or not song.get('sequence') or not song.get('bpm'):
                raise ValueError('missing title, sequence or bpm')
            song = dict(song)
            song['id'] = slug(path.stem)
            song['builtIn'] = True
            song['folder'] = folder
            songs.append(song)
        except Exception as exc:
            raise SystemExit(f'Invalid song file {path}: {exc}') from exc
    return songs


def main() -> None:
    demos = read_folder(DEMO, 'demo')
    community = read_folder(COMMUNITY, 'community')
    payload = (
        f"window.ETHEREAL_DEMO_CATALOG_VERSION = '{time.time_ns()}';\n"
        f"window.ETHEREAL_DEMO_SONGS = {json.dumps(demos, ensure_ascii=False, separators=(',', ':'))};\n"
        f"window.ETHEREAL_COMMUNITY_SONGS = {json.dumps(community, ensure_ascii=False, separators=(',', ':'))};\n"
    )
    OUTPUT.write_text(payload, encoding='utf-8')
    print(f'Built catalogue: {len(demos)} demo, {len(community)} community song(s).')


if __name__ == '__main__':
    main()
