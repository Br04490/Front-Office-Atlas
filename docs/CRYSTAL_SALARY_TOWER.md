# Crystal Salary Cap Tower — implementation and coverage

Verified 2026-11-16. The approved site layout and existing modules remain in place. The expanded Salary Cap tab uses the supplied three-column reference: league summary and historical bars, a tall threshold tower with clickable player portraits, and cap rules and legend. The compact tower used elsewhere remains available.

## Live records

- Current roster reference: 525 NBA player identities across 30 teams. All members of a selected team appear as clickable portraits, including two-way or supplemental players.
- Verified player contract-year records connected to the tower: **0**. Verified non-player salary allocations: **0**. Team hard-cap trigger records: **0**. No live team salary, cap percentage, tax liability, apron position, individual salary share, or contract years remaining is reported.
- Official NBA league thresholds: five values for each of 2023–24, 2024–25, 2025–26 and 2026–27. The 2025–26 and 2026–27 season controls use these exact dollar amounts. Later seasons have no fabricated levels.
- The historical chart uses these 4 official league seasons and labels them as league thresholds. It does not call them historical team spending.
- A selected season outside 2026–27 retains the current roster only as a clearly labeled identity reference, not a claim of historical or future team membership.

## Accounting and interaction

The cap tower positions its five threshold lines on one absolute-dollar axis. A colored team spending fill appears only after every standard player has a sourced amount in the selected accounting mode and the team-season-mode has explicit complete non-player allocation coverage. No such live team exists yet. Cash payroll and AAV never reuse a cap-dollar axis. Hard-cap status requires a team-specific verified trigger.

Portraits remain in a separate, labeled roster index so every face is visible while unpriced. Once priced, identical amounts share a row; optional 2% grouping is disclosed and preserves exact individual charges and totals. Portraits open the existing profile. The Team, Season, Roster, Salary View, Grouping, historical metric and threshold explanation controls work. Existing hypothetical remove, add, swap, undo, redo and compare flows remain connected; a roster action alone never claims cap relief.

The complete-contract fixture in automated tests checks grouped salary math, cap shares, absolute threshold placement and team total. Fixture values are not shipped as live facts.

## Sources

- [2023–24 NBA thresholds](https://pr.nba.com/nba-salary-cap-for-2023-24-season-set-at-136-021-million/)
- [2024–25 NBA thresholds](https://pr.nba.com/2024-25-nba-season-salary-cap/)
- [2025–26 NBA thresholds](https://pr.nba.com/nba-salary-cap-2025-26-season)
- [2026–27 NBA thresholds](https://pr.nba.com/2026-27-salary-cap/)
- [NBA CBA overview](https://cms.nba.com/wp-content/uploads/sites/4/2024/11/2024-25-CBA-101.pdf)

The supplied image is a visual reference. Its example team total and individual salary figures were not copied as data.

## Verification

- JavaScript: `node --test tests/*.test.mjs` — 85 passed.
- Python: `data-pipeline/.venv/Scripts/python.exe -m unittest discover -s data-pipeline/tests -q` — 8 passed.
- Browser: checked 30 team selectors, portrait counts, threshold popover, historical metric, cash mode, 2025–26 season, player profile navigation, and 1440/1024/768/390 viewport widths. No browser errors or failed responses in that pass.
- This static frontend has no separate build script in `package.json`.

Contract and allocation imports with publication rights are still required before the live tower can show actual team payroll. The runtime requires complete coverage to avoid presenting partial totals as complete.
