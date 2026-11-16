# Front Office Atlas Crystal

A local, standalone design preview for an NBA front-office intelligence portal. It uses buildless HTML, CSS, and JavaScript. Live league feeds are **not** connected; empty statistics remain labeled placeholders. The NBA player roster and photo data is a verified snapshot dated November 15, 2026.

## Preview

From this folder, install dependencies with `pnpm install` and run `node server.mjs`, then open [http://localhost:3000](http://localhost:3000). The server serves the existing site and local preparation API on port 3000.

## Structure

- `src/app.js` renders the Home, directory, and six team sections and handles browser-local interaction.
- `src/data/teams.js` contains the 30 franchise records, conference, division, and accent color.
- `src/styles/main.css` contains the Crystal visual system.
- `src/assets/logos/` contains locally served franchise logo files sourced from ESPN's team-logo CDN for this design preview.
- `src/data/players.json` is the shared NBA player, roster, image, and verification record for all 30 teams.
- `src/assets/players/260x190/` contains locally cached NBA thumbnails only for players whose photo showed the current franchise uniform.
- `outputs/nba-player-photo-verification-manifest.csv` and `outputs/nba-player-photo-audit.md` contain the full audit.
- `docs/FEATURE_INVENTORY.md` records visible features and deferred work.
- `docs/EXECUTION_PLANNER_UPGRADE.md` documents the opt-in preparation service, official CBA form reference registry, API, retention, tests, and current limits.
- `docs/SALARY_TOWER_EXPANSION.md` documents the shared team tower, official 2026–27 league thresholds, hypothetical roster scenario state, and financial-data boundaries.
- `src/components/player-profile.js` is the shared NBA-ID profile route for roster, tower, search, and comparison entry points.
- `src/shot-intelligence.js` and `src/components/shot-chart.js` validate and render actual shot events, never synthetic locations.
- `src/data/player-intelligence.json` holds authorized imports. It starts empty; `outputs/player-intelligence-coverage.json` reports actual coverage.

## Current scope

Home, directory, filters, search, all 30 franchise portals, team switching, tabs, and informational toasts are implemented. The six homepage feature cards open six internal workspaces with section navigation. Scenario Lab includes 18 protected templates that create editable local working copies. Team portals include a Team BRI Impact entry that carries franchise context into the BRI workspace.

Workspace forms, uploads, briefing drafts, and scenario arithmetic are local prototypes. Uploads list selected files but do not parse or transmit them. Scenario working copies are saved in browser local storage. Execution Planner can prepare temporary Atlas supporting packets in a local server job after explicit consent and export a real editable PowerPoint. It cannot generate official legal forms or validate CBA transactions. No paid data feed, document submission, or complex cap/trade simulation is connected. Roster and player search use the shared NBA snapshot; statistics, game events, and coaching evidence remain unconnected. Ten outdated-uniform photos and four missing photos use name-and-number placeholders. Three jersey-number conflicts and the NBA Stats `commonplayerinfo` secondary cross-check remain for review.

Franchise selection now opens Season Trends with the compact Salary Cap Tower. Roster and Salary Cap show its expanded view, using the same roster and hypothetical scenario state. The current tower displays all roster faces and official 2026–27 league threshold lines, but no player-sized salary segments or team payroll because verified contract and allocation records are absent. Hypothetical roster changes, position-only replacement exploration, undo/redo, and explicit local scenario Save work without altering the verified roster. CBA and performance outcomes remain unverified.

The player images are for the local preview. NBA terms of use apply; public CDN access does not establish publication rights. Clear rights before public deployment. Re-run verification before treating this snapshot as current on a later date.

No GitHub remote or deployment is configured.

## Player intelligence import

The player profile opens for every player in the dated roster snapshot. Basketball statistics, shot locations, contracts, measurements, twins, relationships, and film currently have **zero connected records**. The profile marks each unavailable field and keeps Player Actions linked to the same NBA ID. Historical season choices do not imply historical data coverage.

To import a permitted JSON export, run `node scripts/import-player-intelligence.mjs <authorized-export.json>`, then `node scripts/report-player-coverage.mjs`. The importer writes `src/data/player-intelligence.json` only after validating rights metadata, canonical NBA IDs, shot coordinates, unique shot events, source URLs, verification dates, metric samples, and any licensed film links. Pass a second output path to test an import without replacing the site dataset.

The export must use `schemaVersion: 1`, a `rights` object with `authorizedForAtlas: true`, `basis`, `sourceUrl`, and `attribution`, plus optional `players`, `shotEvents`, `contracts`, and `leagueZoneBaselines`. Each shot needs `playerId`, 10-digit `gameId`, integer `gameEventId`, ISO `date`, NBA season, `locX` (−250 to 250), `locY` (−47.5 to 422.5), boolean `made`, `shotValue` (2 or 3), `source`, and `verifiedAt`. Player season metrics require a finite `value`, `sample`, `source`, and `verifiedAt`. See the import tests for a valid fixture.

Partial contract imports can populate a player's contract view, but the Salary Cap Tower remains in its labeled player-count mode until every relevant allocation is verified and team/mode/season `allocationCoverage` is explicitly attested complete. The importer never marks that coverage complete. NBA.com statistics and media usage are subject to [NBA terms](https://www.nba.com/termsofuse); this importer does not scrape or download them. No private or licensed provider is connected by default.
