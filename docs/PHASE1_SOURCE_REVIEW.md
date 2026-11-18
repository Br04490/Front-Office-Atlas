# Phase 1 source review — 2026-11-18

This review separates open-source client code from rights to the underlying basketball records, photos, and republication. No NCAA or G League records have been imported into the committed warehouse.

| Source | What was verified | Atlas status |
|---|---|---|
| [ncaapyscraper](https://github.com/fakhar-ud-din/ncaapyscraper) | MIT-licensed scraper code, school roster/coaching functions, weekly release described by its README; latest visible data release dated 2026-11-16. School index lists 977 sites across divisions, not a reconciled 2026–27 men's D1 program list. | Candidate ingestion adapter. Third-party school roster, coach, and photo reuse rights need source review before public import. Independently check school pages and counts. |
| [hoopR](https://github.com/sportsdataverse/hoopR) | MIT-licensed R package with NCAA and G League loaders; release status is reported per producer. Some sources named by the package require subscriptions. | Candidate statistics adapter. Inspect each dataset's original provider, season coverage, and reuse permission before admitting records. |
| [nba_api](https://github.com/swar/nba_api) | Open-source NBA.com client with documented stats endpoints and league parameters. | Candidate G League client only. Endpoint behavior, rate limits, and NBA content rights need verification before bulk imports. |
| [NCAA membership page](https://www.ncaa.org/division-i/member-schools/) | Official membership reference. Institutional membership is not by itself proof that a school sponsored men's basketball in 2026–27. | Reconciliation source for the program list. |
| [Official G League conferences](https://gleague.nba.com/nba-g-league-conferences) | Official current names, conference presentation, and affiliations, including Mexico City without an NBA parent. | Read-only verification reference. Atlas has not duplicated the league directory or its marks. |
| [Official G League Stats FAQ](https://stats.gleague.nba.com/help/faq/) and [NBA Terms of Use](https://www.nba.com/termsofuse) | The FAQ says G League stats are not available for download even for personal or academic use. NBA terms require express prior consent for a comprehensive, regularly updated database of NBA/WNBA/G League statistics. | No API rows copied into Atlas pending applicable authorization. |

Source review gates: current season, official team/program identity, coach title, full listed roster, stable provider IDs, dated source URL, a rights basis covering Atlas use, and a separate photo permission. A failed or uncertain gate is recorded as missing coverage rather than filled with inferred values.

## Pinned school-catalog audit

`node data-pipeline/scripts/audit-ncaa-school-catalog.mjs` reads only the pinned [schools.csv](https://github.com/fakhar-ud-din/ncaapyscraper/blob/09212ce41fed51eec5170f82d138100039473b53/ncaapyscraper/schools.csv) catalog and reports its hash. On 2026-11-18 it had 977 school rows, 356 unique Division I **candidates**, all with a conference and mappable campus state. SHA-256: `666e47e92acef780a014e98c6ad5e52f3efbbfbbe822c5ab088aa708315db43c`. The file is multi-sport and its 356 D1 rows cannot establish a complete 2026–27 men's basketball program directory. No candidate was admitted as a verified program.

## G League endpoint smoke check

A single read-only `LeagueDashPlayerStats` request to the official G League stats endpoint with `LeagueID=20`, `MeasureType=Base`, `PerMode=Totals` and `SeasonType=Regular Season` returned HTTP 200 with 69 fields and **zero** 2026–27 player rows on 2026-11-18. The same request for 2025–26 returned 526 rows. No response records were saved or imported. Endpoint availability does not override the official download and database-use restrictions above.
