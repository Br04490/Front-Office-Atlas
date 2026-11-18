# Known blockers — 2026-11-18

- **NBA contracts:** `atlas_contract_years` has 0 records. The authorized CSV importer exists, but no licensed current contract file or rights manifest has been supplied. Publicly viewable Spotrac data is not assumed reusable. No salary figures are fabricated.
- **Team cap accounting:** Complete team salary requires reconciled player cap hits, dead money, holds, incomplete roster charges and a team-season attestation. A visual removal is not an official waiver or cap-room calculation.
- **Game-level analytics:** 0 player game logs, 0 shot events and 0 possessions in the local warehouse. Player Trends, shot maps and on/off require those inputs.
- **Non-NBA pools:** No authorized current D1, high school ranking, EuroLeague or G League identity dataset has been imported. Their player counts remain zero rather than demo filler.
- **Media:** 521 NBA image URLs were found, but uniform verification and publication rights are separate checks. No other-league photo rights have been established.
- **Operational releases:** Approval workflows and internal transaction documents must remain private and clearly unofficial. Provider credentials and protected team data need server-side authentication and team isolation before external use.
- **Build gate:** This repository has JavaScript tests but no `build` or TypeScript script. That absence is reported rather than represented as a passing build.
