# Resume instructions

1. Open the existing repository and inspect `git status -sb`, `git log -5 --oneline`, and `git ls-remote origin refs/heads/codex/atlas-complete-data-operations-2026-11-18`. Never reset or overwrite unfinished work.
2. Read `AGENTS.md`, `IMPLEMENTATION_STATE.md`, `DATA_COVERAGE.md`, `KNOWN_BLOCKERS.md`, `SOURCE_REGISTRY.md`, and `TEST_RESULTS.md`.
3. Continue on `codex/atlas-complete-data-operations-2026-11-18`. The first resumed pushed checkpoint is `809c249f8c78b0016add3bb898abf1ccb4fbf81f`; the earlier Crystal Cap Tower base is `66666981286f64f97a797f7ad8320994d1d18f9c`. Verify the remote branch before work.
4. Preserve the approved UI and existing NBA cards. Work in small tested commits, push this feature branch after each completed milestone, and verify the remote SHA. Never merge or force-push.
5. Next independent work: connect authorized NBA contract records through `data-pipeline/scripts/import-contract-years.mjs` with an explicit rights manifest, then build reconciled team-season charge coverage. Until then, salary explorer and Cap Sheet Studio team totals are intentionally unverified for any selected player with a missing charge.
6. Follow with the operational cap-sheet and transaction workflows before expanding analytics. For NCAA, high school, EuroLeague and G League, use dated official identities and approved media rights; do not infer missing rosters or statistics.

Run `node --test tests/*.test.mjs` and `data-pipeline/.venv/Scripts/python.exe -m unittest discover -s data-pipeline/tests -q`. There is no TypeScript or production build script in `package.json` yet.
