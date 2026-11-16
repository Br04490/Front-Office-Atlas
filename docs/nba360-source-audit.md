# NBA 360 acquisition audit — November 16, 2026

## Connected NBA data

The existing 2026–27 roster snapshot contains 525 player IDs across all 30 teams, with names, teams, positions, jerseys, two-way flags, photo status, and source references. `src/data/player-intelligence.json` currently contains **0** player metric records, **0** shot events, and **0** verified contract seasons. The SkillCorner Liga ACB demonstration is separate and must never populate NBA profiles.

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
- **Partial:** player profile, shot chart, metric, and provider display paths accept sourced values but have no permitted NBA performance import.
- **Awaiting access:** 2026–27 and 2025–26 NBA games, advanced stats, shots, tracking, lineups, contracts, physical measures, and commercial provider metrics.
- **Not implemented:** unrestricted natural-language queries across absent datasets. Atlas must identify missing fields rather than return invented numbers.

The referenced `atlas_nba360_codex_kit.zip` was not attached or present when this audit was made. Inspect its master prompt, data rights, merge helper, and tests before using any contents.
