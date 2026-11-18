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

Five-pool coverage milestone pushed and verified at `3e31ceafcd334fcd91fac51fd6af63bf806fedef`. The following transaction-review milestone adds an in-memory case queue to Automated Sheets → Review & Approval. It captures current hypothetical NBA IDs, runs deterministic data checks, records an audit trail, blocks stale scenario revisions, and can offer existing internal preparation documents. It cannot mark a case internally approved or officially confirmed without authenticated approvers, verified CBA rules and complete financial inputs.

Transaction-review milestone pushed and verified at `0035e64be4f09677b422df85d1e29a7d28618cf5`. The next milestone adds five audience-specific editable PowerPoint decks as one ZIP from a reviewed decision title, evidence and source notes. The decks are internal drafts with explicit missing financial and approval states. No NBA transaction, contract, metric or film value is inferred.

Five-decision-output milestone pushed and verified at `79b70a0a051698c3bb96edf499694d5a64b2c584`. The next milestone adds a rights-gated, transactional non-NBA identity importer for NCAA D1, high school top 100, EuroLeague and G League; Settings coverage reads admitted database rows. No outside identities have been admitted without a licensed source file.

Non-NBA identity importer pushed and verified at `b845f0c8237acb5e51983920d1cf3e9cdc9393b4`. The new NCAA D1/G League Phase 1 directive begins with league-aware player keys while preserving NBA numeric source IDs, six campus-based geographic regions, and additive tables for external teams, coaches, player bios, memberships, metrics, game logs and reviewed identity links. Source and access gates are recorded separately; no new source data is claimed.

Phase 1A foundation pushed and verified at `a135a58ff90a5ca38e5012da88391bf28e93de5b`. The next milestone adds a transactional NCAA/G League roster-batch importer with dated official team and player sources, coach-title checks, separate photo rights, roster-count completeness and explicit changed-source reconciliation. The Settings data-health view reports separate team, coach, complete-roster, approved-photo and statistical-player counts from the warehouse. This does not establish any non-NBA records as loaded.

Phase 1 roster-batch importer pushed and verified at `ff334de36bcdd93ba222b0e896d71c44ae65d1ca`. The next milestone audits the pinned ncaapyscraper school catalog: 356 D1 candidates among 977 school rows, below the directive's claimed current population and without proof of men's basketball sponsorship. It remains an audit source, not a loaded directory.

Pinned catalog audit pushed and verified at `28cfa8f6e1c71749bec965667c8956e80190d0f8`. The next milestone exposes admitted Phase 1 teams, coaches, roster memberships, bios, approved photo references and metrics from SQLite through a read-only `/api/phase1/snapshot` endpoint. Empty coverage remains an explicit zero response.

Phase 1 snapshot API pushed and verified at `52a9a1666d2a1ce1f170d698482445de8d8fa515`. The next milestone adds NCAA D1 and G League links to the existing sidebar and source-backed directory/team views. External athletes use the existing player-profile shell with league-specific eligibility/status text. The live warehouse has zero admitted records, so the browser correctly shows an empty state rather than fabricated teams or players.

Phase 1 browsing views pushed and verified at `7aba56a0ca03351fdb237d3c1ca9122cd06329ae`. Subsequent source review found the official G League stats endpoint operational for a prior season but without current player rows, and identified official restrictions on downloading and republishing a comprehensive G League statistics database. No endpoint records were admitted.

See [DATA_COVERAGE.md](DATA_COVERAGE.md), [KNOWN_BLOCKERS.md](KNOWN_BLOCKERS.md), [SOURCE_REGISTRY.md](SOURCE_REGISTRY.md), and [TEST_RESULTS.md](TEST_RESULTS.md). This document describes verified work, not completion of the full directive.
