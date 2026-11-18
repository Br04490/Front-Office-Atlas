# Test results — 2026-11-18

- `node --test tests/*.test.mjs`: 89 passed, 0 failed. Includes four new deterministic Cap Tower explorer tests.
- `data-pipeline/.venv/Scripts/python.exe -m unittest discover -s data-pipeline/tests -q`: 8 passed.
- `git diff --check`: no whitespace errors.
- Local browser on `http://localhost:3001/`: 17 Houston faces initially, 5 threshold lines, portrait action panel opened, one removal reduced selected faces to 16 without inventing a dollar amount, removing every player produced 0 selected / `$0` / 0%, and Restore All returned 17 faces. The roster container computed `overflow-y: visible`.
- Verified-salary test fixture: 15 players totaled $170,000,000; removing a $20,000,000 player gave $150,000,000; threshold positions and dollar maximum remained unchanged. This fixture is never shipped as live payroll.
- No TypeScript or production build command exists in `package.json`; these gates were unavailable rather than passed.

The user's existing Preview on port 3000 served the previous page version during this audit. Port 3001 was launched from this branch for the verified local UI check.
