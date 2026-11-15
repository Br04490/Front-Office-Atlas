# Front Office Atlas Crystal

A local, standalone design preview for an NBA front-office intelligence portal. It uses buildless HTML, CSS, and JavaScript. League feeds are **not** connected; all empty values and player slots are labeled placeholders.

## Preview

From this folder, run `node server.mjs` and open [http://localhost:3000](http://localhost:3000). The server serves the root `index.html` and local assets on port 3000.

## Structure

- `src/app.js` renders the Home, directory, and six team sections and handles browser-local interaction.
- `src/data/teams.js` contains the 30 franchise records, conference, division, and accent color.
- `src/styles/main.css` contains the Crystal visual system.
- `src/assets/logos/` contains locally served franchise logo files sourced from ESPN's team-logo CDN for this design preview.
- `docs/FEATURE_INVENTORY.md` records visible features and deferred work.

## Current scope

Home, directory, filters, search, all 30 franchise portals, team switching, tabs, and informational toasts are implemented. The six homepage feature cards open six internal workspaces with section navigation. Scenario Lab includes 18 protected templates that create editable local working copies. Team portals include a Team BRI Impact entry that carries franchise context into the BRI workspace.

Workspace forms, uploads, briefing drafts, and scenario arithmetic are local prototypes. Uploads list selected files but do not parse or transmit them. Scenario working copies are saved in browser local storage. No official CBA engine, paid data feed, player search index, document submission, or complex cap/trade simulation is connected. Roster identities, statistics, game events, and coaching evidence still await verified sources. Player photo cards remain reserved for a later phase.

No GitHub remote or deployment is configured.
