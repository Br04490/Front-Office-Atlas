# FRONT OFFICE ATLAS — FREE DATA + BASKETBALL INDEX-STYLE RESEARCH KIT

**Updated November 16, 2026.** This kit is standalone and does **not** change the Crystal website. It uses only the Python standard library and SQLite for the starter pipeline. All NBA performance metrics are empty until verified, authorized source data is imported.

## What works now

- Free BALLDONTLIE API **teams, players and games/scores only**. Requires an account and `BDL_API_KEY`; the free tier does *not* include per-player game box scores. Poll current/previous Central-time dates; run from a persistent host or Windows Task Scheduler. The full NBA season cannot be populated from the free endpoint alone.
- Idempotent game ingestion with source-scoped IDs and final-game transitions (a final game triggers a list of changed game IDs).
- Manual authorized CSV import for player game box scores, contracts and custom analytics. Calculates eFG% and TS% from compatible raw box totals; does not claim to calculate true zTS, LEBRON, EPM, DARKO, Hawkeye command, or other inaccessible metrics.
- Data schema covering teams, players, games, box scores, contracts, metric provenance and player-ID crosswalk. Exported CSV snapshots and coverage counts. Eight tests, including strict contract usage status.
- A catalog of **33** curated public GitHub repositories and **50** named metrics grouped by use in Atlas.

## How to start on Windows

Install Python 3.10 or newer; from this folder run:

```powershell
python src/atlas_demo.py init
python src/atlas_demo.py sync-bdl --dry-run
python -m unittest discover -s tests -v
```

To test without any account (FAKE game fixture, not a real NBA game):

```powershell
python src/atlas_demo.py sync-bdl --fixture fixtures/FAKE_bdl_games.json
python src/atlas_demo.py status
python src/atlas_demo.py export
```

**Delete `data/atlas_demo.sqlite3` after testing** to remove the fake fixture before importing actual data. Export will create `exports/`.

Register for a BALLDONTLIE free key at https://app.balldontlie.io/ and on Windows PowerShell:

```powershell
$env:BDL_API_KEY = 'your-actual-key'
python src/atlas_demo.py sync-bdl-teams
python src/atlas_demo.py sync-bdl-players --team-id 11  # Example: replace ID with provider team ID
python src/atlas_demo.py sync-bdl --days 1
python src/atlas_demo.py export
```

Store the key as an environment variable, server secret or GitHub Actions secret, not in HTML or GitHub commits. The API supports only 5 calls/minute on free tier: respect limits. The player command fetches one page for the specified team and labels roster status UNVERIFIED, because the active-player endpoint is paid; do not show it as an authoritative current roster.

Import licensed data:

```powershell
python src/atlas_demo.py import-csv boxscores csv_templates/player_game_boxscores.csv
python src/atlas_demo.py import-csv contracts csv_templates/contracts_authorized.csv
python src/atlas_demo.py import-csv metrics csv_templates/custom_metrics.csv
```

Those provided CSVs are **headers only**. A user or authorized connector must supply actual rows. `source_provider`, `source_url`, and data classification are mandatory. Use `bdl:<id>` and `nba:<id>` IDs rather than guessing cross-source identities.

## Postgame updates

The free source provides scores; run `sync-bdl` periodically from a machine/server that remains on. When game status changes to final the command reports `newly_final_games`, which Codex can wire to approved downstream job workers. Default `--days 1` covers local today and yesterday. Example Windows Task Scheduler: trigger every 15 minutes, action `python` with arguments `<absolute-path>\src\atlas_demo.py sync-bdl --days 1`, start-in directory the kit root. Do not assume a static GitHub Pages/HTML site can run this Python code; deploy a backend or add a safe read-only API/cache.

* 15-minute polling is not instant. True near-game-end updates require persistent backend/webhook infrastructure and a provider whose plan supports those events. Game player stats may appear later than final score. Free webhook cap of 100/month is not an all-season plan. A manually opened page won't update until the frontend requests fresh data.
* NBA.com terms Section 9 limit comprehensive regularly updated commercial/public use without consent. Free library code or an accessible web page does not grant those rights. Verify NBA, ESPN, third-party, provider and team marks/portrait usage before a public demo. This kit makes **no Spotrac scraper**. Instead it provides an authorized contract import schema.

## File map

- `github_repositories_catalog.csv`: prioritized **research candidates** with fit and code/data rights separately tracked.
- `data_sources_and_rights.csv`: every provider/tier and safe default status.
- `atlas_metrics_registry.csv`: metrics catalog, including deliberate unavailable/proprietary slots.
- `schemas/atlas_sqlite.sql`: database schema for local demo.
- `src/atlas_demo.py`: runnable free score poller and import/export.
- `csv_templates/`: CSV headers for importing licensed data.
- `fixtures/`: synthetic sample only (not production data).
- `tests/`: eight automated tests.
- `CODEX_IMPLEMENTATION_PROMPT.md`: copy/paste integration instructions preserving Crystal.

## Important engineering limitations

This is a **working starter pipeline, not a fully populated NBA database or live deployed service**. It has not been connected to the Crystal repository, because the approved Crystal repo is not accessible in this session. We have not fetched real provider data without your own account key. The repository catalog contains candidates, not dependencies preinstalled or validated production models; many GitHub projects do not declare a clear software license. Methods and model metrics must be evaluated, tested, and independently named. An independent RAPM is not BBall Index's LEBRON.

For game-to-player identity mapping, do not treat BDL IDs as NBA IDs. Implement confirmed provider crosswalks before joining datasets. Historical and current season mixes must be flagged explicitly.
