# Crystal integration guide

The 17 original starter-kit files are copied unchanged. `schemas/atlas_extension.sql`, the Node importers, and this guide are additive. The original Python score/CSV pipeline remains available; the Node extension supplies one local SQLite warehouse for the existing Crystal Preview. The database and downloaded NBA source files are Git ignored.

## Local snapshot

The current local source CSVs were imported earlier into `src/data/nba360-local.json` and `src/data/nba360-teams-local.json`. On a fresh checkout these ignored files will be absent. To rebuild them, download the permitted dated BoxScore Lab CSVs and run:

```powershell
node scripts/import-boxscorelab.mjs work/nba360-source/2022-23-player-season-totals.csv work/nba360-source/2023-24-player-season-totals.csv work/nba360-source/2024-25-player-season-totals.csv work/nba360-source/2025-26-player-season-totals.csv work/nba360-source/2026-27-player-season-totals.csv
node scripts/import-boxscorelab-teams.mjs 2022-23 2023-24 2024-25 2025-26 2026-27
node data-pipeline/scripts/import-local-snapshot.mjs
node server.mjs
```

The frontend first reads `/api/nba360/snapshot` from the local warehouse. The read-only `/api/nba360/coverage` reports actual row counts. `src/data/player-intelligence.json` remains the tracked empty base and is merged by official NBA player ID. No imported NBA data is included in the public Git repository until NBA-origin downstream publication rights are resolved.

## Game logs and Trends

`csv_templates/nba_game_logs_authorized.csv` is an empty header template. An authorized export requires exact official NBA player and 10-digit game IDs, game date, season, team, opponent, source URL, verification date and an explicit rights manifest. Set `authorizedForAtlas` to `true` only after checking permission. The import refuses inconsistent box-score points, IDs and duplicates:

```powershell
node data-pipeline/scripts/import-game-logs.mjs path/to/authorized.csv path/to/rights-manifest.json
```

The Player Trends tab renders real dated bars for windows of 5, 8, 10, 15 and 20 games when those rows exist. There are currently **zero** licensed player game-log rows. Season totals do not generate synthetic game logs.

## Scores and provider access

The built-in BALLDONTLIE score poller is inactive without `BDL_API_KEY`. With a server-side key it checks today and yesterday in Chicago time at start and every 15 minutes, respects the free tier by making one request per cycle, detects first transition to final, and stores scores idempotently. It does not claim free player box scores, shots, PBP or tracking. Keep the key in the server environment; never put it in HTML or Git.

The original Python starter tests run using Python 3.10+ and `tzdata` on Windows:

```powershell
python -m unittest discover -s data-pipeline/tests -v
python data-pipeline/src/atlas_demo.py sync-bdl --dry-run
```

The original Python demo has its own isolated database and fake fixture. Never import the fake game fixture into the Crystal warehouse. The original CSV templates and schema are preserved without change.

## Source and display limits

The downloaded BoxScore Lab CSVs are published under CC BY 4.0, while their methodology says the underlying statistics came from NBA Stats. The NBA terms place separate restrictions on comprehensive regularly updated public databases. Atlas therefore keeps this snapshot local pending downstream publication rights review. The GitHub code can run with empty data and displays source-dependent unavailable states. For detailed counts see `docs/nba360-coverage-2026-11-16.md`.
