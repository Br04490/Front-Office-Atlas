# Test results — 2026-11-18

- `node --test tests/*.test.mjs`: 89 passed, 0 failed. Includes four new deterministic Cap Tower explorer tests.
- `data-pipeline/.venv/Scripts/python.exe -m unittest discover -s data-pipeline/tests -q`: 8 passed.
- `git diff --check`: no whitespace errors.
- Local browser on `http://localhost:3001/`: 17 Houston faces initially, 5 threshold lines, portrait action panel opened, one removal reduced selected faces to 16 without inventing a dollar amount, removing every player produced 0 selected / `$0` / 0%, and Restore All returned 17 faces. The roster container computed `overflow-y: visible`.
- Verified-salary test fixture: 15 players totaled $170,000,000; removing a $20,000,000 player gave $150,000,000; threshold positions and dollar maximum remained unchanged. This fixture is never shipped as live payroll.
- No TypeScript or production build command exists in `package.json`; these gates were unavailable rather than passed.

## Cap Sheet Studio milestone

- Five focused JavaScript tests: all 15 sheet types, shared-model fixture arithmetic, incomplete contracts, scenario treatment, and live pending state passed.
- Local port 3001 preview: Automated Sheets → Cap Sheets rendered 15 sheet choices, actual 2026–27 first-apron value $209,015,000 with source link, and pending team salary. CSV export is wired to the displayed sheet; XLSX and PDF remain pending.

## Contract admission milestone

- Existing contract importer test now checks current roster/team mismatch rejection, duplicate-source rejection even when dollars match, and team-by-team contract coverage accounting.
- Live contract coverage command: 525 roster identities, 0 contract-year rows, 0 priced players; official team salary remains incomplete.

## Five-pool coverage milestone

- Added a test that counts NBA roster identities and image URL presence while keeping four unimported pools at zero.
- Local port 3001 preview Settings view showed 30 NBA teams, 525 roster identities, 508 players with season metrics, 521 NBA image URLs found and 0 contract years; NCAA, high school, EuroLeague and G League each show zero imported identities.

## Transaction review milestone

- Two focused tests: a hypothetical roster change creates a draft and reaches `NEEDS REVIEW` when contracts/CBA/authentication are missing; a changed scenario blocks stale review.
- Local port 3001 preview: Automated Sheets → Review & Approval displays the queue and gives a clear missing-scenario message when no proposal exists.

## Five decision outputs milestone

- `pnpm test`: 99 passed, 0 failed. Eight Python data-pipeline tests passed.
- Two focused tests verify five distinct valid PPTX files and a machine-readable draft/financial/approval manifest, and reject missing evidence.
- HTTP smoke test on port 3002: `POST /api/decision-packages` returned 200, `application/zip`, 41,925 bytes for an explicitly labeled fixture. The home page also returned 200.
- `node --check` passed for the server, new service, and changed frontend modules; `git diff --check` reported no whitespace errors.

## Four-pool identity importer milestone

- `pnpm test`: 101 passed, 0 failed. Python data-pipeline tests: 8 passed.
- Focused tests admit one fictional fixture only in an in-memory database, verify idempotent coverage, and reject missing rights, invalid top-100 rank, duplicate identity and changed source hash.
- JavaScript syntax checks and `git diff --check` passed. No external player data was written to the project warehouse.

## NCAA D1 and G League Phase 1A foundation

- `pnpm test`: 105 passed, 0 failed. Python data-pipeline tests: 8 passed.
- New tests verify NBA numeric source IDs coexist with league-aware canonical keys, campus regions are independent of conference, and the additive external schema opens without NBA data changes.
- JavaScript syntax checks and `git diff --check` passed. No D1 or G League identities, coaches, photos or statistics were imported.

## NCAA D1 and G League roster-batch importer

- `pnpm test`: 107 passed, 0 failed. Python data-pipeline tests: 8 passed.
- Focused fixture tests verify atomic team/player/coach import, campus region, incomplete-roster status, pending photos, distinct player keys, and newer explicit reconciliation that removes stale memberships and coach records. Mexico City cannot be assigned an NBA parent.
- Syntax and whitespace checks passed. Fixture data existed only in an in-memory test warehouse; live Phase 1 coverage remains zero.

The user's existing Preview on port 3000 served the previous page version during this audit. Port 3001 was launched from this branch for the verified local UI check.
