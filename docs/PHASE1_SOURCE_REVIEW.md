# Phase 1 source review — 2026-11-18

This review separates open-source client code from rights to the underlying basketball records, photos, and republication. No NCAA or G League records have been imported into the committed warehouse.

| Source | What was verified | Atlas status |
|---|---|---|
| [ncaapyscraper](https://github.com/fakhar-ud-din/ncaapyscraper) | MIT-licensed scraper code, school roster/coaching functions, weekly release described by its README; latest visible data release dated 2026-11-16. School index lists 977 sites across divisions, not a reconciled 2026–27 men's D1 program list. | Candidate ingestion adapter. Third-party school roster, coach, and photo reuse rights need source review before public import. Independently check school pages and counts. |
| [hoopR](https://github.com/sportsdataverse/hoopR) | MIT-licensed R package with NCAA and G League loaders; release status is reported per producer. Some sources named by the package require subscriptions. | Candidate statistics adapter. Inspect each dataset's original provider, season coverage, and reuse permission before admitting records. |
| [nba_api](https://github.com/swar/nba_api) | Open-source NBA.com client with documented stats endpoints and league parameters. | Candidate G League client only. Endpoint behavior, rate limits, and NBA content rights need verification before bulk imports. |
| [NCAA membership page](https://www.ncaa.org/division-i/member-schools/) | Official membership reference. Institutional membership is not by itself proof that a school sponsored men's basketball in 2026–27. | Reconciliation source for the program list. |
| [Official G League conferences](https://gleague.nba.com/nba-g-league-conferences) | Official current names, conference presentation, and affiliations, including Mexico City without an NBA parent. | Read-only verification reference. Atlas has not duplicated the league directory or its marks. |

Source review gates: current season, official team/program identity, coach title, full listed roster, stable provider IDs, dated source URL, a rights basis covering Atlas use, and a separate photo permission. A failed or uncertain gate is recorded as missing coverage rather than filled with inferred values.
