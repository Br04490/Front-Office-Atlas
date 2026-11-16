# Atlas Metric Studio — Codex handoff seed

This file is a **metadata seed and design specification**, not a working API integration, NBA dataset, or validated model.

- `atlas_metric_registry_seed.json`: provider statuses, official Basketball Index category taxonomy, eleven user-provided experimental metric concepts, formula dependencies and quality rules.
- The six SCE/OBG/PCOE/DVMS/RDPP/TWPE equations and UNI/UNI-WAR are taken from `complete_basketball_analytics_thread.md`; all are **research versions**.
- `z(...)` requires an explicit season/league/position comparison cohort. `ridge_prior_centered(...)` is a model interface, not something to calculate with a simple formula parser.
- Do not copy any proprietary vendor metrics without access and reuse permissions.
- Start integrating SkillCorner's official ACB basketball open-data repo for a meaningful demonstration; observe source limits and attribution.
- Never apply ACB percentiles directly to NBA player ranking without explicit cross-league calibration.
- Keep the existing Atlas Crystal appearance and its six primary sections unchanged.

Sources (verify permissions again during implementation):
https://github.com/SkillCorner/opendata-basketball
https://github.com/SkillCorner/opendata-basketball/blob/main/docs/aggregates_columns.md
https://www.bball-index.com/
https://skillcorner.com/sports/basketball
https://www.nba.com/stats/help/glossary
https://dunksandthrees.com/about/epm
