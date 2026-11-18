# Authorized non-NBA player identity import

Use `node data-pipeline/scripts/import-external-players.mjs <players.json> <rights-manifest.json>` from the repository root. Set `ATLAS_DB_PATH` to use a separate SQLite warehouse. The import is transactional and repeatable for the same source file.

`players.json` is an array of records with `pool` (`NCAA_D1`, `HIGH_SCHOOL_TOP_100`, `EUROLEAGUE`, or `G_LEAGUE`), `providerPlayerId`, `playerName`, `teamId`, `teamName`, `season`, and `rosterStatus`. Top-100 rows also require integer `rank` from 1 through 100. IDs are provider-scoped; Atlas does not merge people across competitions by name.

`rights-manifest.json` requires `authorizedForAtlas: true`, a precise `rightsBasis`, HTTPS `sourceUrl`, ISO `verifiedAt` date, `provider`, and `sourceSha256` matching the exact player JSON bytes. Keep the source's permission evidence outside public Git if it is private. The importer rejects invalid rows, duplicate IDs in a file, changed source hashes for existing identities, and missing rights. A different snapshot needs an explicit reconciliation process before replacing an admitted identity.

The five-pool coverage page counts only admitted identities. This importer does not supply player statistics, team standings, photos, current uniform verification, or cross-league identity matching. No non-NBA dataset has been imported into the committed project.
