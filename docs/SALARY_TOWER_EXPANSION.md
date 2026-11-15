# Salary Cap Tower and team Trends expansion

## Working experience

Selecting a franchise from Home or the Directory opens its existing portal on **Season Trends**. The original hero, logo, watermark, sidebar, tabs, roster cards, player photos, and six homepage tools are preserved. A new Salary Cap team tab and a shared tower component appear in compact form on Trends and expanded form on Roster / Salary Cap.

Every current player in the November 15, 2026 roster snapshot appears as a selectable face in one shared tower or, for two-way / supplemental players, its linked roster strip. Missing or outdated photos use the existing verified-name placeholder. The current tower is explicitly a **roster index, not a salary-weighted allocation** because player contracts and non-player charges are not connected. No invented contract segment is displayed.

The [NBA's official June 30, 2026 release](https://pr.nba.com/2026-27-salary-cap/) supplies fixed 2026–27 league thresholds: minimum team salary $148.465 million, salary cap $164.961 million, tax level $200.428 million, first apron $209.015 million, and second apron $221.686 million. They are league markers, not claims about any team's payroll. No hard-cap line appears without a verified transaction trigger. Other seasons have no announced values in the adapter and display no threshold figures.

Selecting a face opens a Crystal action menu. Remove changes only a hypothetical roster, opens loss analysis, and offers position-only candidate exploration from the existing NBA player registry. An external candidate added to the hypothetical roster is correspondingly removed from the original team's hypothetical view. Source roster records are never mutated. Undo, Redo, Reset, explicit Save, and Compare operate on the same scenario state. Save writes a local browser copy; it does not execute or approve a transaction. The expanded tower can pass a roster-ID summary into the existing opt-in temporary preparation service.

## Data and calculation boundaries

- `src/data/players.json` is the canonical identity, team, jersey, status, and headshot source. It is a dated snapshot, not a future roster projection.
- `src/data/financial-sources.js` contains only officially announced 2026–27 league thresholds. Contracts and non-player allocations are empty.
- `financialView` keeps cap, tax, cash payroll, and AAV separate. It requires source and verification metadata for each contract amount. An unresolved hypothetical transaction withholds the team total even if source amounts later exist; a waiver never automatically erases guarantees.
- `salaryBands` is a deterministic future-ready layout: band height equals the sum of its player amounts divided by the selected mode's scale, and each player's horizontal area is proportional to its individual amount. Synthetic test fixtures verify the math; no synthetic figures are shown on the site.
- The 2026–27 cap/tax modes show the official cap percentage axis and league lines. Cash and AAV modes use their own total as the scale only when complete verified inputs exist, and do not show cap/apron lines as direct comparisons.
- Five-year selection is functional, but contract expirations, option choices, cap holds, future league thresholds, BRI scenarios, wins, and basketball ratings remain unavailable. Current roster faces shown in later years are explicitly reference identities.
- The CBA adapter reports each missing validation input and links to the [official 2023 NBA–NBPA CBA](https://nbpa.com/cba). There is no live CBA MCP or Opportunity Engine in this repository, so no legality finding, applied provision, or compliant alternative is claimed.
- Loss analysis provides known position and roster-count changes, then identifies missing offense, defense, fit, advanced-metric, and financial evidence. Replacement options are position-only exploration, not recommendations or proof of acquisition feasibility. G League / free-agent status, contracts, paid tracking, medical records, and film are not connected.

## Components and tests

New modules: `SalaryCapTower`, `financialView` / `salaryBands`, `roster-scenario`, `PlayerActionMenu`, `PlayerLossAnalysis`, `ReplacementCandidateDrawer`, and `CBAValidationAdapter`. The existing roster component, player-photo mapping, team portal shell, Scenario Lab, Ask CBA, and temporary preparation service are reused.

Run `node --test tests/*.test.mjs`. Browser checks cover all 30 teams and 525 roster faces, team selection to Trends, compact and expanded towers, player actions, hypothetical removal and candidate addition, season persistence, consent, and no console errors. The existing six homepage tools and original roster cards remain present.
