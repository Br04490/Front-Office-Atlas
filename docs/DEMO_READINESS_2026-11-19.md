# Atlas Crystal demo readiness — 2026-11-19

This report covers the local feature branch and local SQLite database. Raw SportsDataverse and user supplied files, photo audit exports, and the database backup are in ignored `.atlas-private/`. They are not in the public GitHub repository. ESPN origin and photo display rights still need review.

## Green — tested locally

- Approved Crystal home, permanent navigation, 30 NBA teams and six modules remain in place. Existing NBA cards and roster actions retain their original paths.
- Local NBA roster: 525 dated identities across 30 teams. The 2026–27 warehouse has 467 players with season metrics and 13,970 metric values. Team result and season tables remain queryable. These are dated source snapshots, not live transaction claims.
- NCAA provider snapshot: 365 Division I team groups, 5,585 ESPN athlete IDs, 179,312 numeric metric values across 4,996 athletes and 37 metric codes. The current site shows 5,584 players because Duke's 14 official roster entries supersede the provider's 15. Provider reported membership is distinct from school verified membership.
- NCAA, grassroots boys and overseas men are queryable from one foundation identity table with bounded, parameterized API filters. Player name, team, position, source ID and multiple numeric metric thresholds are supported. Existing NCAA and G League navigation still works.
- Orlando Magic Team Health uses exact source linked points per game and opponent points per game with rank, percentile, sample and date. Lower opponent scoring ranks higher. Last eight game point margin appears only when eight source games exist.
- Intelligence Lab → Team Fit ranks players from 2026–27 sourced NBA metrics using saved weights and sample thresholds. It keeps a fixed eligible reference population when display filters change. Models persist in this browser, and visible results export as CSV. The score is a statistical ranking, not a trade or medical conclusion.
- Photo audit has one record per current local player registry identity. HTTP content type, file bytes, dimensions and repeated hashes were checked. No non-NBA photo is shown in the public Crystal views while identity and usage rights remain unapproved.
- JavaScript tests: 114 passed. Python tests: 9 passed. JavaScript syntax and `git diff --check` passed. No production build script exists in `package.json`.

## Yellow — partial or internal use

- SportsDataverse/ESPN origin roster and season values are local internal data pending upstream public and commercial reuse review. School by school current roster validation is complete only for Duke (14 athletes and one coach).
- Boys grassroots: 150 user supplied names. Overseas men: 50 user supplied selections. Their provider identity and current team or club status remain unverified, so these are browsing candidates, not certified current rosters.
- Photo registry, 6,310 records: NBA 521 images load / 4 missing; NCAA 5,259 load / 326 missing URLs; grassroots 149 load / 1 missing; overseas 50 returned HTTP 429 and remain unverified; G League 0 current identities. Loaded image bytes do not prove visual identity or permission. Atlas approved display count is zero for the new audit.
- Team DNA supports season metric weights, position and name filters, games threshold, browser saved models and CSV. Its chosen shooting percentage requires at least 20 recorded season three point attempts, or 40 field goal attempts. It does not have a licensed contract filter or a complete Stat Sandbox formula editor across every league.
- Local import scripts are transactional and idempotent. The website reads the warehouse and checks for updates. Automatic external scheduled retrieval, corrected-source reconciliation across all providers and a deployed persistent backend remain pending.
- CSV and XLSX foundation and photo audits are exported locally under `.atlas-private/foundation-exports/`. The private SQLite backup is `.atlas-private/atlas-crystal-2026-11-19-backup.sqlite3` (SHA-256 `D08CB92782F0512462E9AE0109F38C00E4CFA64D0B5966FC539B7200D672FCA7`).

## Red — unavailable

- Current authorized G League roster and statistics: 0.
- NBA player game logs: 0; shot event coordinates: 0; possession backed on/off: 0; verified contract year and cap charge rows: 0. The corresponding charts, financial calculations and Orlando shot review cannot truthfully be completed from the current data.
- NCAA official roster checks for 364 other groups, complete headshot identity review, new photo rights clearance, and current overseas club verification remain open.
- Full Orlando workflow through a multi league formula sandbox, verified shot review, player comparison and exported scouting presentation is incomplete. The working path is Orlando team → Team Health → Team Fit weighted NBA ranking → saved browser model → CSV evidence export.
- The sitewide Ask Atlas natural-language search still uses the NBA roster. NCAA, boys and overseas records have pool directories and the Foundation query API, but the unified cross-league search and physical-attribute filters are not connected. User supplied grassroots/overseas group pages do not certify current team assignments.

## Local reproduction

Run `node server.mjs` and open the local Preview. Run `node --test tests/*.test.mjs` and `data-pipeline/.venv/Scripts/python.exe -m unittest discover -s data-pipeline/tests -q`. With the private files present, run `data-pipeline/.venv/Scripts/python.exe data-pipeline/scripts/import-sdv-2027.py`, `import-user-pools.py`, `export-foundation.py` and `export-player-photos.py` from the repository root. The photo verification script makes source HTTP requests and must respect rate limits; its 429 outcomes are unverified, not broken.
