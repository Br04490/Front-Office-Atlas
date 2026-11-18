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

See [DATA_COVERAGE.md](DATA_COVERAGE.md), [KNOWN_BLOCKERS.md](KNOWN_BLOCKERS.md), [SOURCE_REGISTRY.md](SOURCE_REGISTRY.md), and [TEST_RESULTS.md](TEST_RESULTS.md). This document describes verified work, not completion of the full directive.
