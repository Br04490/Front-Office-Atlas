# Implementation state — 2026-11-18

Repository: `Br04490/Front-Office-Atlas`. Active feature branch: `codex/atlas-complete-data-operations-2026-11-18`, created from pushed Crystal Cap Tower commit `66666981286f64f97a797f7ad8320994d1d18f9c`. `main` and the protected Crystal baseline have not been changed by this branch.

## Implemented before this checkpoint

- Approved Crystal shell, permanent left navigation, six homepage modules, 30 team identities and logos, NBA roster cards, player profiles, Ask Atlas, existing scenario engine, team/player views and existing warehouse.
- Canonical NBA roster snapshot: 525 players, 30 franchises. The roster snapshot is dated 2026-11-15; it is not a claim of live transaction accuracy on later dates.
- Local NBA warehouse: 508 players with at least one season statistic, 1,849 player-season records, 55,426 metric values, 150 team-season records, 10,234 team-game records. The local data carries source and rights notes; downstream publication rights remain subject to review.
- League cap thresholds for 2023–24 through 2026–27 and a source-aware Cap Tower. Existing licensed contract importer and CSV template are present.
- Current targeted Cap Tower work: a reversible player salary explorer, a separate official CBA mode, fixed dollar scale, larger threshold labels, all faces visible without internal scrolling. Fixture tests cover remove, empty, undo, restore and missing data. The live tower still has no verified salary fill because there are zero contract-year rows.

## Checkpoint status

The first resume milestone is the repository audit and preservation of the unfinished Cap Tower changes. Tests and local port 3001 preview checks passed for the explorer's unpriced state. A production build or TypeScript check is not available: `package.json` has `start` and `test` only and the application is JavaScript.

First resumed milestone pushed and verified at `809c249f8c78b0016add3bb898abf1ccb4fbf81f` on the active feature branch. The next milestone adds the Cap Sheet Studio to the existing Automated Sheets workspace. It offers 15 worksheet views through the shared financial model and scenario state, with source-backed league thresholds, explicit missing charges, original/scenario columns and CSV export. It does not claim complete payroll or legally valid transactions while contract coverage is zero. XLSX formula and PDF exports remain pending.

Cap Sheet Studio milestone pushed and verified at `4ece8af2a03c2c13f1c04619bc37246842b9f06e`. The subsequent contract-admission milestone tightens current-team identity validation and blocks unreconciled duplicate sources. `node data-pipeline/scripts/contract-coverage.mjs 2026-27` reports missing cap charges by franchise; on the current local database it finds 525 roster identities and 0 contract rows.

Contract-admission milestone pushed and verified at `9a558d4c4ea7c4697f1b289fce3f29ba925d9fbb`. The next milestone extends the existing Settings data-health page into a five-pool coverage view. It reads actual local NBA warehouse and roster counts while showing zero imported NCAA, high school, EuroLeague and G League records.

See [DATA_COVERAGE.md](DATA_COVERAGE.md), [KNOWN_BLOCKERS.md](KNOWN_BLOCKERS.md), [SOURCE_REGISTRY.md](SOURCE_REGISTRY.md), and [TEST_RESULTS.md](TEST_RESULTS.md). This document describes verified work, not completion of the full directive.
