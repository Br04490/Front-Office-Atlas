# Resume instructions

1. Open the existing repository and inspect `git status -sb`, `git log -5 --oneline`, and `git ls-remote origin refs/heads/codex/atlas-complete-data-operations-2026-11-18`. Never reset or overwrite unfinished work.
2. Read `AGENTS.md`, `IMPLEMENTATION_STATE.md`, `DATA_COVERAGE.md`, `KNOWN_BLOCKERS.md`, `SOURCE_REGISTRY.md`, and `TEST_RESULTS.md`.
3. Continue on `codex/atlas-complete-data-operations-2026-11-18`. The latest verified pushed checkpoint before the five-decision-output update is `0035e64be4f09677b422df85d1e29a7d28618cf5`. Verify the remote branch before work.
4. Preserve the approved UI and existing NBA cards. Work in small tested commits, push this feature branch after each completed milestone, and verify the remote SHA. Never merge or force-push.
5. Next independent work: connect authorized NBA contract records through `data-pipeline/scripts/import-contract-years.mjs` with an explicit rights manifest, then build reconciled team-season charge coverage. Until then, salary explorer and Cap Sheet Studio team totals are intentionally unverified for any selected player with a missing charge.
6. Follow with the operational cap-sheet and transaction workflows before expanding analytics. Five decision formats now export as an internal-draft ZIP; PDF/DOCX generation, authenticated approval, and verified financial narratives remain pending. For NCAA, high school, EuroLeague and G League, use dated official identities and approved media rights; do not infer missing rosters or statistics.

Run `node --test tests/*.test.mjs` and `data-pipeline/.venv/Scripts/python.exe -m unittest discover -s data-pipeline/tests -q`. There is no TypeScript or production build script in `package.json` yet.

For contract diagnostics run `node data-pipeline/scripts/contract-coverage.mjs 2026-27`. It enumerates missing IDs by team and never certifies official team salary from player charges alone.
