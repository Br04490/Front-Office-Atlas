import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'src/data/players.json').read_text(encoding='utf-8'))
players = data['players']
out = ROOT / 'outputs'
out.mkdir(exist_ok=True)

fields = ['name', 'nbaPlayerId', 'team', 'jersey', 'supplementalStatus', 'photoUrl', 'thumbnailUrl', 'imageStatus', 'uniformStatus', 'jerseyStatus', 'playerInfoStatus', 'lastVerificationDate', 'rosterSource', 'teamPageSource', 'imageDisplayStatus']
with (out / 'nba-player-photo-verification-manifest.csv').open('w', newline='', encoding='utf-8-sig') as handle:
    writer = csv.DictWriter(handle, fieldnames=fields)
    writer.writeheader()
    writer.writerows({field: player.get(field, '') for field in fields} for player in players)

outdated = [p for p in players if p['uniformStatus'] == 'outdated_other_team']
missing = [p for p in players if p['imageStatus'] == 'missing_or_placeholder']
conflicts = data['audit']['jerseyConflicts']
found = sum(p['imageStatus'] == 'official_image_found' for p in players)
verified = sum(p['uniformStatus'] == 'verified_current_team' for p in players)
two_way = sum(bool(p['supplementalStatus']) for p in players)
flagged_ids = {p['nbaPlayerId'] for p in outdated + missing}
for conflict in conflicts:
    flagged_ids.update(p['nbaPlayerId'] for p in players if p['team'] == conflict['team'] and p['jersey'] == conflict['jersey'])

lines = [
    '# Official NBA player photo audit', '',
    f"Roster and image verification date: {players[0]['lastVerificationDate']}.",
    f"Season: {data['season']}. This is a point-in-time local snapshot; NBA rosters and CDN photos can change.", '',
    '| Check | Result |', '|---|---:|',
    f'| Current players checked | {len(players)} |',
    f'| Franchises checked | {len(data["teams"])} |',
    f'| Applicable two-way or supplemental players | {two_way} |',
    f'| Official headshots found | {found} |',
    f'| Current-team uniforms visually verified | {verified} |',
    f'| Incorrect or outdated uniforms | {len(outdated)} |',
    f'| Missing photos / generic CDN placeholders | {len(missing)} |',
    f'| Jersey-number conflicts | {len(conflicts)} numbers, {len(conflicts)*2} players |',
    f'| Distinct records with image or jersey flags | {len(flagged_ids)} |',
    f'| NBA Stats commonplayerinfo cross-check | Pending for {sum(p["playerInfoStatus"] == "pending" for p in players)} records; batch endpoint timed out |',
    '',
    '## Method', '',
    'NBA.com team roster data and NBA Stats `commonteamroster` agreed on player ID, team, and jersey for all 30 rosters. ',
    'The NBA CDN thumbnails were fetched by official player ID; the generic image returned for a nonexistent ID was used to identify missing photos. ',
    'All 30 team contact sheets were visually reviewed for franchise uniform. The verified thumbnail is displayed only when the image and uniform checks passed. ',
    'NBA ID mapping and official roster agreement support identity; independent face recognition was not performed. ',
    'The `commonplayerinfo` batch check remains incomplete because the endpoint timed out, and three duplicate jersey numbers need manual resolution.',
    '', '## Outdated uniforms withheld', '',
]
lines += [f'- {p["team"]} #{p["jersey"]} {p["name"]} (NBA ID {p["nbaPlayerId"]})' for p in outdated]
lines += ['', '## Missing photos', '']
lines += [f'- {p["team"]} #{p["jersey"]} {p["name"]} (NBA ID {p["nbaPlayerId"]})' for p in missing]
lines += ['', '## Jersey conflicts', '']
lines += [f'- {c["team"]} #{c["jersey"]}: {" / ".join(c["players"])}' for c in conflicts]
lines += ['', '## Source and publication note', '',
          '- NBA.com team rosters: `https://www.nba.com/team/{TEAM_ID}/{SLUG}`',
          '- NBA Stats rosters: `https://stats.nba.com/stats/commonteamroster`',
          '- NBA Stats player detail: `https://stats.nba.com/stats/commonplayerinfo` (cross-check pending)',
          '- Headshots: `https://cdn.nba.com/headshots/nba/latest/260x190/{PLAYER_ID}.png`',
          '- NBA terms of use: `https://www.nba.com/termsofuse`',
          '', 'This is a local preview. Public CDN access does not establish publication rights; clear image licensing before deployment.',
          'No live NBA feed is connected. Re-run roster and image verification before relying on a later roster date.', '']
(out / 'nba-player-photo-audit.md').write_text('\n'.join(lines), encoding='utf-8')
print(f'{len(players)} players, {found} found, {verified} verified, {len(outdated)} outdated, {len(missing)} missing, {len(conflicts)} jersey conflicts, {len(flagged_ids)} distinct flagged')
