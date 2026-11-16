# NBA 360 acquisition audit — November 16, 2026

## Connected NBA data

The existing 2026–27 roster snapshot contains 525 player IDs across all 30 teams, with names, teams, positions, jerseys, two-way flags, photo status, and source references. It has not yet been independently revalidated against a dated official NBA roster for all 525 records. The tracked `src/data/player-intelligence.json` contains **0** player metric records, **0** shot events, and **0** verified contract seasons. The SkillCorner Liga ACB demonstration is separate and does not populate NBA profiles.

## Local private snapshot imported November 16, 2026

[BoxScore Lab downloads](https://boxscorelab.com/downloads/) publish season totals, standings, and team game results under CC BY 4.0 with attribution. Their [methodology](https://boxscorelab.com/methodology/) says the underlying data comes from NBA Stats. The source CSVs and resulting JSON snapshots are kept in ignored local files and are **not committed to the public repository** pending review of NBA-origin downstream publication rights. This is a dated snapshot, not a live feed or official NBA verification.

| Category | Records loaded locally | Validation and limits |
| --- | ---: | --- |
| 2025–26 player season totals | 441 matched current roster players | Exact unique name joined to current roster ID; 141 source rows did not match the current roster. Historic source team retained. |
| 2026–27 player season totals | 467 matched current roster players | Exact unique name and matching current team required; four source rows had no current roster match. |
| Unique roster players with at least one season | 507 of 525 | Remaining players retain unavailable metric slots. |
| Player metric values | 25,406 across 908 player seasons | Points arithmetic, per-game points, eFG% and TS% checked; minutes per game calculated from source totals. |
| 2026–27 team standings | 30 | Unique teams, W+L=games, win percentage checked. Ratings are source estimates. |
| 2026–27 team game rows | 394 | Point differential and W/L checked; team game and win counts match standings. These are team results, not player box scores. |
| Shot events, contracts, injuries, lineup possessions | 0 | No authorized source imported. |

The import commands are `node scripts/import-boxscorelab.mjs work/nba360-source/2025-26-player-season-totals.csv work/nba360-source/2026-27-player-season-totals.csv` and `node scripts/import-boxscorelab-teams.mjs`. Source CSVs must be downloaded separately from the published download page. The player importer writes `src/data/nba360-local.json`, and the team importer writes `src/data/nba360-teams-local.json`; both are Git ignored. The detailed unmatched-player audit is `work/nba360-source/import-audit.json` and is also ignored.

## Source decisions

| Source | Access and use finding | Atlas status |
| --- | --- | --- |
| [NBA Stats FAQ](https://www.nba.com/stats/help/faq) and [NBA Terms](https://www.nba.com/termsofuse) | The FAQ says statistics are for viewing, not download. The terms restrict a comprehensive, regularly updated NBA statistics database without express consent. `nba_api` documentation is not a data license. | No automated bulk import. Await written authorization or a permitted export. |
| [BALLDONTLIE NBA API](https://docs.balldontlie.io/) and [terms](https://www.balldontlie.io/terms.html) | Its free tier offers teams, players, and games at five requests per minute; player game stats and season averages require paid tiers. A user API key is required. | Awaiting an authorized key. Do not present the provider's data as official NBA data. |
| [SportsDataverse hoopR](https://hoopr.sportsdataverse.org/articles/getting-started-hoopR.html) | The package provides ready-made NBA files, but its code license does not establish downstream rights to ESPN/NBA-origin datasets. | No bulk import pending source rights review. |
| [NBA_Shots_04_25](https://github.com/DomSamangy/NBA_Shots_04_25) and [NBA Data Archive](https://huggingface.co/datasets/cdechoch/nba-data-archive/blob/main/README.md) | Public shot and play-by-play archives exist. Their repository license or mirror claims do not establish an NBA-origin reuse grant for Atlas. | No shot import pending rights review. |
| [SkillCorner open basketball data](https://github.com/SkillCorner/opendata-basketball) | Existing pinned Spanish ACB snapshot is operational under its published open-data terms. | Connected only in the separately labeled ACB explorer. |

## Implementation status

- **Complete:** roster identity queries and count charts by team or position, including jersey and two-way filters, for the loaded snapshot.
- **Local snapshot working:** player profiles show sourced 2025–26 and 2026–27 season metrics; Team Trends shows source-estimated ratings and recent point-margin graph; Games shows 2026–27 team results; Ask Atlas filters available season points, rebounds, assists, minutes, TS%, eFG%, three-point percentage, net rating, and games played.
- **Awaiting access:** player game box scores, shot events, tracking, lineups, contracts, injuries, physical measures, and commercial provider metrics.
- **Not implemented:** unrestricted natural-language queries across absent datasets. Atlas must identify missing fields rather than return invented numbers.

The referenced `atlas_nba360_codex_kit.zip` was not attached or present when this audit was made. Inspect its master prompt, data rights, merge helper, and tests before using any contents.
