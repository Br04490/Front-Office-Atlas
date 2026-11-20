# Measured data coverage — 2026-11-19

Counts are local records, not proof of current roster accuracy or publication rights. They come from `coverage(db)` in `data-pipeline/src/warehouse.mjs` and the checked-in player snapshot.

| Pool / domain | Loaded | Limitation |
|---|---:|---|
| NBA teams in roster snapshot | 30 | 2026-11-15 snapshot |
| NBA player identities | 525 | Current membership needs ongoing refresh |
| NBA players with season metrics in warehouse | 508 | Historical and current seasons mixed |
| NBA player-season rows | 1,849 | Source coverage varies by season |
| NBA metric values | 55,426 | Individual metric coverage varies |
| NBA team-season rows | 150 | Five seasons, 30 teams |
| NBA team-game rows | 10,234 | Does not provide player game logs |
| Player game logs | 0 | Player Trends cannot claim game-by-game coverage |
| Shot events | 0 | No real shot locations to plot |
| Possessions | 0 | No possession-backed on/off |
| Contract-year rows | 0 | No actual live salary fill or cap-room calculation |
| Images with official NBA URL found | 521 / 525 | URL presence does not verify current uniform or publication rights |
| NBA images missing or placeholder | 4 / 525 | Player-specific review needed |
| NCAA D1 provider programs / players | 365 / 5,585 | SportsDataverse ESPN-origin 2027 roster joined to season-specific D1 group IDs; school-by-school verification pending |
| NCAA D1 players visible in current site | 5,584 | Duke's official 14 supersede the provider's 15, leaving one provider-only Duke identity in the local source table for review |
| NCAA D1 provider metric rows / players | 179,312 / 4,996 | Numeric 2026–27 season fields only; 37 distinct metric codes; ESPN-origin publication rights review pending |
| NCAA D1 head coaches / school-verified complete rosters | 1 / 1 | Duke only; no approved NCAA photos and no school-sourced season metrics |
| Boys' grassroots selected players | 150 | User-supplied CSV contained 200 rows; 50 girls' records excluded. Provider identity and current rankings remain unverified |
| Overseas selected men | 50 | User-supplied names and club labels; current club assignments and provider identity remain unverified |
| G League clubs / players | 0 / 0 | Official directory and current rosters pending |

Warehouse source snapshots: 15. Existing catalogs preserved: 33 repository entries and 50 metric registry entries. A source snapshot with zero rows in a domain does not count as populated coverage.

The Duke roster batch and rights manifest are checked in at `data-pipeline/verified-batches/ncaa-duke-2026-27.*`. Server startup imports this batch into a fresh local warehouse and leaves matching records unchanged. Run `node data-pipeline/scripts/audit-phase1-rosters.mjs` to compare each imported roster with its recorded official roster count. This is one verified school, not a complete NCAA directory. The audit currently reports 14 players, one head coach, one complete roster, no missing bios and no identity conflicts.

The five downloaded SportsDataverse CSVs and two user-supplied lists live under ignored `.atlas-private/` folders; they are not committed. The importer preserves SHA-256, source URL, import time, season, provider ID, and a stable Atlas person ID in the existing SQLite warehouse. It rejects sparse or duplicate snapshots and leaves a successful import unchanged when the source hashes match. The 14 Duke official IDs have proposed one-to-one crosswalks based on the same team, player name and jersey, rather than name alone. Provider-reported statistics can be queried locally, but their upstream reuse and public display rights remain under review. The exported CSV and XLSX files are local-only in `.atlas-private/foundation-exports/`.

Photo audit dated 2026-11-19: 6,310 registry identities checked. Image bytes loaded for 521 NBA, 5,259 NCAA and 149 grassroots records. Four NBA and 326 NCAA IDs plus one grassroots entry had no image URL. All 50 overseas candidates returned HTTP 429 and are classified as rate limited, unverified. No new photo has completed visual identity and usage permission review. See [DEMO_READINESS_2026-11-19.md](DEMO_READINESS_2026-11-19.md) for the route and feature audit.
