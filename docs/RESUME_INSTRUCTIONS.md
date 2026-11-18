# Resume instructions

1. Open the existing repository and inspect `git status -sb`, `git log -5 --oneline`, and `git ls-remote origin refs/heads/codex/atlas-complete-data-operations-2026-11-18`. Never reset or overwrite unfinished work.
2. Read `AGENTS.md`, `IMPLEMENTATION_STATE.md`, `DATA_COVERAGE.md`, `KNOWN_BLOCKERS.md`, `SOURCE_REGISTRY.md`, and `TEST_RESULTS.md`.
3. Continue on `codex/atlas-complete-data-operations-2026-11-18`. Determine the latest pushed checkpoint from `git ls-remote`; the current verified remote SHA at this documentation update is `0f4dd353ce4c338cf3c805c6525f1c023474e002`. Verify it before work and use the newer remote HEAD after subsequent milestones.
4. Preserve the approved UI and existing NBA cards. Work in small tested commits, push this feature branch after each completed milestone, and verify the remote SHA. Never merge or force-push.
5. Next independent work: connect authorized NBA contract records through `data-pipeline/scripts/import-contract-years.mjs` with an explicit rights manifest, then build reconciled team-season charge coverage. Until then, salary explorer and Cap Sheet Studio team totals are intentionally unverified for any selected player with a missing charge.
6. The latest directive prioritizes NCAA D1 and G League Phase 1 before high school or EuroLeague expansion. NCAA/G League pages, profile shell, batch importer and read-only API are implemented, but live pool counts are zero. Use [PHASE1_SOURCE_REVIEW.md](PHASE1_SOURCE_REVIEW.md) and [ACCESS_NEEDED.md](ACCESS_NEEDED.md) to resolve source rights before importing public records or photos. Do not treat the new schema as populated coverage.

Run `node --test tests/*.test.mjs` and `data-pipeline/.venv/Scripts/python.exe -m unittest discover -s data-pipeline/tests -q`. There is no TypeScript or production build script in `package.json` yet.

For contract diagnostics run `node data-pipeline/scripts/contract-coverage.mjs 2026-27`. It enumerates missing IDs by team and never certifies official team salary from player charges alone.
