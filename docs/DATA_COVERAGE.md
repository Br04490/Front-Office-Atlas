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
| NCAA D1 programs / players | 1 / 14 | Duke 2026–27 official roster facts, verified 2026-11-18; remaining programs pending |
| NCAA D1 head coaches / complete rosters | 1 / 1 | Duke only; 0 imported player metrics or approved photos |
| High school ranked prospects | 0 / 100 | Authorized dated ranking source pending |
| EuroLeague selected clubs / players | 0 / 0 | Latest completed official standings and current rosters pending |
| G League clubs / players | 0 / 0 | Official directory and current rosters pending |

Warehouse source snapshots: 15. Existing catalogs preserved: 33 repository entries and 50 metric registry entries. A source snapshot with zero rows in a domain does not count as populated coverage.

The Duke roster batch and rights manifest are checked in at `data-pipeline/verified-batches/ncaa-duke-2026-27.*`. Server startup imports this batch into a fresh local warehouse and leaves matching records unchanged. Run `node data-pipeline/scripts/audit-phase1-rosters.mjs` to compare each imported roster with its recorded official roster count. This is one verified school, not a complete NCAA directory. The audit currently reports 14 players, one head coach, one complete roster, no missing bios and no identity conflicts.
