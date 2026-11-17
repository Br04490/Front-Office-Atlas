# Crystal full-site audit — November 16, 2026

## Scope and baseline

- Project: existing `front-office-atlas-crystal` working tree, original branch `provider-integration-2026-11-16` at `0193164343fe91c10e03f082bcfb289e52d11f40`. Repair branch: `crystal-repair-2026-11-16`. No change to `main`.
- Live development server: `http://localhost:3000/`. The pre-repair server was an older process and returned 404 for `/api/nba360/coverage`; it was replaced with the current `server.mjs`. The current API returns 200 and the local SQLite warehouse counts below.
- Browser audit: Chromium at 1440 and 390 px. Clicked all six home workspaces, 30 team portals, eight team tabs, ten player tabs, Contract Center and all seven Twins choices. No JavaScript page errors or failed network responses in the final browser passes.
- Before/after screenshots are saved locally under `work/audit-before-*.png`, `work/audit-after-*.png`, `work/audit-contract-after-*.png`, and `work/audit-twins-after-*.png`. The desktop and initial mobile home/profile images were pixel identical before the mobile overflow adjustment. The adjustment retains all controls while clipping only decorative overflow.
- The original 17 starter-kit files were checked against the attached ZIP and remained byte-for-byte unchanged in the previous integration. This repair does not change the 33-repository catalog, 50-metric registry, original importers, original SQL schema, or master prompts.

## Actual data in the local warehouse

| Domain | Records | Source and state |
| --- | ---: | --- |
| Roster identities | 525 across 30 teams | Dated roster snapshot; 17 lack matched season totals. Independently rechecking all identities against current NBA.com is outstanding. |
| Current roster players with season metrics | 508 | Local BoxScore Lab import, joined by exact unique name; this is a known identity risk. |
| Player seasons / metric values | 1,849 / 55,426 | Five seasons, 2022–23 through 2026–27; source reported and explicitly derived values. |
| Team seasons / team game rows | 150 / 10,234 | Five-season BoxScore Lab snapshot; each game has a row for each participating team. |
| Player game logs | 0 | Authorized dated box-score feed required. |
| Shot events | 0 | Authorized player/game/event shot feed required. |
| Possessions, actual on/off, lineup records | 0 | Rights-cleared play-by-play and substitution/lineup reconstruction required. |
| Contract years / non-player charges | 0 / 0 | Authorized contract terms and team allocation attestation required. |
| BDL live games | 0 | Server-side `BDL_API_KEY` absent; free tier supports score polling, not player box scores. |
| NBA tracking, film, injuries, physical measurements | 0 | Provider rights, credentials or dated authorized records required. |

See `docs/nba360-coverage-2026-11-16.md` for the 30-team, five-season matrix and counts by metric. Local source CSVs and SQLite remain Git ignored pending NBA-origin downstream rights review. [BoxScore Lab downloads](https://boxscorelab.com/downloads/) publish under CC BY 4.0, while its [methodology](https://boxscorelab.com/methodology/) identifies NBA Stats upstream; [NBA terms](https://www.nba.com/termsofuse) need separate review before a public comprehensive feed.

## Feature audit and repair status

| Route or control | Component | Condition after repair | Missing source or known gap | Console / network |
| --- | --- | --- | --- | --- |
| Home, six feature cards, sidebar, league directory | `src/app.js` | **WORKING WITH REAL ROSTER DATA**. All six workspaces and 30 teams navigate. | Homepage still describes some modules as preview. | None in final pass. |
| Automated Sheets, Ask CBA, BRI Calculator, Execution Planner, Intelligence Lab, Scenario Lab | `src/workspaces.js` | **WORKING BUT INCOMPLETE**. All six open; section counts 8, 7, 8, 6, 12, 8. Existing document preparation, query and scenario controls preserved. | CBA eligibility, automated legal paperwork and authoritative BRI require sourced inputs and review. | None in navigation pass. |
| Team portal roster | `src/components/roster.js` | **WORKING WITH REAL ROSTER DATA**. All 30 portals and headshot/placeholder rules load. | 525 identities require a dated independent refresh. | None. |
| Team Season Trends and recent game graph | `src/nba360-team-views.js` | **WORKING WITH REAL DATA**. All 30 portals show sourced standings and team games. Recent markers now open the selected game record. | Ratings are source estimates; scoring runs and possession detail require event feed. | None. |
| Games & Box Scores | `src/nba360-team-views.js` | **WORKING BUT INCOMPLETE**. Team result rows are clickable and show source-backed scores, rebound and assist totals where present. | Player game boxes 0; no game/event ID in team CSV. | None. |
| Roster Salary Cap Tower and five-year path | `src/components/salary-cap-tower.js`, `src/financial-model.js` | **WORKING BUT INCOMPLETE**. Official league thresholds, equal roster faces, hypothetical edits and year controls work. Payroll now requires explicit non-player allocation coverage before declaring a complete total. | Contract years 0, non-player charges 0, future thresholds unavailable. Cap/tax/cash/AAV remain distinct. | None. |
| Contract Center | `src/components/contract-center.js`, `data-pipeline/src/warehouse.mjs` | **WORKING BUT INCOMPLETE**. New real navigation target and league table with name, team, season, cap and option filters. All 525 roster players have a linked profile; partial contract rows are retained by API, with separate base, cap, cash, guarantee, incentives, options and rights fields. Ask CBA remains separate. | 0 authorized actual contract rows, tax-specific and full AAV inputs absent; expiration/exception search and full CBA accounting still pending. | None. |
| Player overview and Advanced Stats | `src/components/player-profile.js` | **WORKING WITH REAL DATA** for 508 players with matched seasons. Season label now reflects selection; derived metric labels show source context. | 17 roster players have no matched season; premium and unsupported metrics remain unavailable. | None. |
| Player Trends | `src/components/player-trends.js` | **BLOCKED BY SOURCE ACCESS**. Windows, custom dates, season type, opponent, box-score shooting percentages and chart logic pass controlled fixture tests. | 0 genuine player game logs, so no real bars. Home/away and plus/minus remain unavailable in the current importer. | None. |
| Player On / Off, team Lineups and Possessions | `src/components/onoff-workspace.js`, `src/onoff-calculator.js` | **BLOCKED BY SOURCE ACCESS**. Possession calculator is tested and refuses box-score proxies. | 0 real possessions or substitutions, so no actual ratings or lineup drilldowns. | None. |
| Player Shot Charts | `src/components/shot-chart.js`, `data-pipeline/src/shot-import.mjs` | **BLOCKED BY SOURCE ACCESS**. Real-event validator and marker/zone/hex functions pass fixture tests. Empty state explicitly says no authorized events. | 0 actual NBA shot events; tracking filters and league baselines unavailable. | None. |
| Twins & Compare | `src/twins-engine.js`, `src/components/twins-workspace.js` | **WORKING BUT INCOMPLETE**. Statistical mode uses real season data. Seven modes now each invoke a distinct strategy and return a documented score only with required evidence; fixture tests cover each. Top 3/5/10 and physical/age tolerances are exposed. | Physical, age, role and contract modes have no live inputs. Cross-season and customizable weights remain pending. | None. |
| Physical, Intel, Film | `src/components/player-profile.js` | **BLOCKED BY SOURCE ACCESS**. No measurements, relationships or licensed film are invented. | Authorized dated records and playback rights needed. | None. |
| Global search and Ask Atlas | `src/provider-explorer.js`, `src/atlas-query-engine.js` | **WORKING WITH REAL ROSTER AND SEASON DATA**. Existing name/team/season queries and microphone access preserved. | Not every metric family can be queried without source rows. Browser voice support depends on its speech API and mic permissions. | None in navigation pass. |
| Settings data health | `src/components/data-health.js`, `services/nba360.mjs` | **WORKING WITH REAL DATA**. API counts and source import dates appear in the existing Settings view. Frontend rechecks warehouse version on focus and every minute, then updates active views. | Last attempted import and next permitted refresh are not persisted; deployment needs a durable backend. | None. |

## Remaining priorities

1. Obtain and review rights for dated player game logs, shot events, play-by-play/substitutions, and comprehensive contracts; then use the existing validated importers. Do not display controlled fixture rows as NBA records.
2. Replace exact-name season joins with a licensed NBA player-ID source/crosswalk. Revalidate all 525 roster identities and 30 team lists against dated official rosters.
3. Add a production database and persisted per-provider refresh attempts, corrections, failures and next permitted poll; the current SQLite server is for local development.
4. Extend Contract Center with sourced full-contract terms, expiration/options/exception filters and reconciled tax/AAV and non-player charge coverage. Complete Player Trends splits and Twins multi-season windows after data arrives.
