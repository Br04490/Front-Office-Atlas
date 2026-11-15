# Official NBA player photo audit

Roster and image verification date: 2026-11-15.
Season: 2026-27. This is a point-in-time local snapshot; NBA rosters and CDN photos can change.

| Check | Result |
|---|---:|
| Current players checked | 525 |
| Franchises checked | 30 |
| Applicable two-way or supplemental players | 90 |
| Official headshots found | 521 |
| Current-team uniforms visually verified | 511 |
| Incorrect or outdated uniforms | 10 |
| Missing photos / generic CDN placeholders | 4 |
| Jersey-number conflicts | 3 numbers, 6 players |
| Distinct records with image or jersey flags | 19 |
| NBA Stats commonplayerinfo cross-check | Pending for 525 records; batch endpoint timed out |

## Method

NBA.com team roster data and NBA Stats `commonteamroster` agreed on player ID, team, and jersey for all 30 rosters. 
The NBA CDN thumbnails were fetched by official player ID; the generic image returned for a nonexistent ID was used to identify missing photos. 
All 30 team contact sheets were visually reviewed for franchise uniform. The verified thumbnail is displayed only when the image and uniform checks passed. 
NBA ID mapping and official roster agreement support identity; independent face recognition was not performed. 
The `commonplayerinfo` batch check remains incomplete because the endpoint timed out, and three duplicate jersey numbers need manual resolution.

## Outdated uniforms withheld

- CHI #15 Jordan Hawkins (NBA ID 1641722)
- CHA #17 Dennis Schröder (NBA ID 203471)
- DET #13 Isaac Jones (NBA ID 1642403)
- LAL #20 Carson Cooper (NBA ID 1643721)
- NYK #1 Dalton Knecht (NBA ID 1642261)
- MIN #22 Johni Broome (NBA ID 1641780)
- PHX #2 Drew Timme (NBA ID 1631166)
- DAL #1 Walter Clayton Jr. (NBA ID 1642383)
- TOR #9 Kevin McCullar Jr. (NBA ID 1641755)
- UTA #0 Kobe Bufkin (NBA ID 1641723)

## Missing photos

- ATL #13 Henri Veesaar (NBA ID 1643539)
- BOS #20 Dillon Mitchell (NBA ID 1641759)
- MEM #5 Richie Saunders (NBA ID 1643563)
- NYK #14 Jaden Akins (NBA ID 1643022)

## Jersey conflicts

- ATL #00: RayJ Dennis / Keshon Gilbert
- CHI #7: Orlando Robinson / Buddy Hield
- TOR #9: RJ Barrett / Kevin McCullar Jr.

## Source and publication note

- NBA.com team rosters: `https://www.nba.com/team/{TEAM_ID}/{SLUG}`
- NBA Stats rosters: `https://stats.nba.com/stats/commonteamroster`
- NBA Stats player detail: `https://stats.nba.com/stats/commonplayerinfo` (cross-check pending)
- Headshots: `https://cdn.nba.com/headshots/nba/latest/260x190/{PLAYER_ID}.png`
- NBA terms of use: `https://www.nba.com/termsofuse`

This is a local preview. Public CDN access does not establish publication rights; clear image licensing before deployment.
No live NBA feed is connected. Re-run roster and image verification before relying on a later roster date.
