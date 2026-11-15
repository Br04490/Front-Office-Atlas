"""Audit NBA CDN thumbnails without treating its generic silhouette as a photo."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from hashlib import sha256
from pathlib import Path
import json
import time
import urllib.request

root = Path(__file__).resolve().parents[1]
manifest_path = root / 'src' / 'data' / 'players.json'
cache = root.parent / 'work' / 'atlas-headshots'
cache.mkdir(parents=True, exist_ok=True)
data = json.loads(manifest_path.read_text(encoding='utf-8'))

def download(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=18) as response:
                return response.read()
        except Exception:
            if attempt == 2:
                raise
            time.sleep(attempt + 1)

missing = download('https://cdn.nba.com/headshots/nba/latest/260x190/999999999.png')
missing_hash = sha256(missing).hexdigest()

def check(player):
    try:
        content = download(player['thumbnailUrl'])
        digest = sha256(content).hexdigest()
        valid = content.startswith(b'\x89PNG\r\n\x1a\n')
        status = 'official_image_found' if valid and digest != missing_hash else 'missing_or_placeholder'
        if status == 'official_image_found':
            (cache / f"{player['nbaPlayerId']}.png").write_bytes(content)
        return player['nbaPlayerId'], status, digest, len(content), None
    except Exception as exc:
        return player['nbaPlayerId'], 'fetch_error', None, None, str(exc)

by_id = {p['nbaPlayerId']: p for p in data['players']}
errors = []
with ThreadPoolExecutor(max_workers=8) as executor:
    futures = [executor.submit(check, p) for p in data['players']]
    for done, future in enumerate(as_completed(futures), 1):
        player_id, status, digest, size, error = future.result()
        player = by_id[player_id]
        player['imageStatus'] = status
        player['imageSha256'] = digest
        player['imageBytes'] = size
        if error:
            errors.append({'id': player_id, 'error': error})
        if done % 50 == 0:
            print(f'Checked {done}/{len(futures)}', flush=True)
            data['audit']['headshotErrors'] = errors
            manifest_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

data['audit']['headshotErrors'] = errors
data['imageCheckedAt'] = datetime.now(timezone.utc).isoformat()
manifest_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(json.dumps({'total': len(data['players']), 'found': sum(p['imageStatus'] == 'official_image_found' for p in data['players']), 'missing': sum(p['imageStatus'] == 'missing_or_placeholder' for p in data['players']), 'errors': len(errors)}, indent=2))
