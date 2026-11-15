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

## Current scope

Home, directory, filters, search, all 30 franchise portals, team switching, tabs, and informational toasts are implemented. The six homepage feature cards open six internal workspaces with section navigation. Scenario Lab includes 18 protected templates that create editable local working copies. Team portals include a Team BRI Impact entry that carries franchise context into the BRI workspace.

Workspace forms, uploads, briefing drafts, and scenario arithmetic are local prototypes. Uploads list selected files but do not parse or transmit them. Scenario working copies are saved in browser local storage. Execution Planner can prepare temporary Atlas supporting packets in a local server job after explicit consent and export a real editable PowerPoint. It cannot generate official legal forms or validate CBA transactions. No paid data feed, document submission, or complex cap/trade simulation is connected. Roster and player search use the shared NBA snapshot; statistics, game events, and coaching evidence remain unconnected. Ten outdated-uniform photos and four missing photos use name-and-number placeholders. Three jersey-number conflicts and the NBA Stats `commonplayerinfo` secondary cross-check remain for review.

The player images are for the local preview. NBA terms of use apply; public CDN access does not establish publication rights. Clear rights before public deployment. Re-run verification before treating this snapshot as current on a later date.

No GitHub remote or deployment is configured.
