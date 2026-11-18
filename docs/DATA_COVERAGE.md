# Measured data coverage — 2026-11-18

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
| NCAA D1 programs / players | 0 / 0 | Official current program list and roster ingestion pending |
| High school ranked prospects | 0 / 100 | Authorized dated ranking source pending |
| EuroLeague selected clubs / players | 0 / 0 | Latest completed official standings and current rosters pending |
| G League clubs / players | 0 / 0 | Official directory and current rosters pending |

Warehouse source snapshots: 15. Existing catalogs preserved: 33 repository entries and 50 metric registry entries. A source snapshot with zero rows in a domain does not count as populated coverage.
