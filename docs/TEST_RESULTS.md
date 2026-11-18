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

The user's existing Preview on port 3000 served the previous page version during this audit. Port 3001 was launched from this branch for the verified local UI check.
