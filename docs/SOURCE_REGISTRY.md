# Source registry — verified local status

| Source | Access and purpose | Current local state |
|---|---|---|
| Existing BoxScore Lab season and team CSV snapshots | CC BY 4.0 is noted in warehouse provenance; NBA-origin downstream rights need review | 15 source snapshots, 1,849 player seasons, 150 team seasons and 10,234 team games |
| NBA official salary cap releases | Public league threshold announcements | 2023–24 through 2026–27 thresholds connected; no team payroll data |
| NBA roster and CDN headshots | Official identity and image URL reference | 525 dated NBA identities, 521 image URLs found; uniform and publishing checks separate |
| Authorized contract CSV | `data-pipeline/scripts/import-contract-years.mjs` plus rights manifest | Import ready, 0 rows |
| BALLDONTLIE score polling | Key-gated optional game refresh | Operational adapter, no local BDL game rows |
| SkillCorner official open basketball data | Pinned public research sample | Existing integration preserved; does not populate NBA contract or roster domains |
| Basketball Index, Spotrac, tracking and film providers | Commercial or permission-dependent | Registry slots and authorized imports only; no protected values populated |
| NCAA, high school rankings, EuroLeague and G League | Official roster/standings sources to be evaluated per rights and freshness | No imported player pool yet |

The original [33-entry repository catalog](../data-pipeline/github_repositories_catalog.csv), [50-entry metric registry](../data-pipeline/atlas_metrics_registry.csv), and [source rights catalog](../data-pipeline/data_sources_and_rights.csv) remain untouched. See the individual provenance URLs in warehouse `sourceSnapshots` and `src/data/financial-sources.js`.
