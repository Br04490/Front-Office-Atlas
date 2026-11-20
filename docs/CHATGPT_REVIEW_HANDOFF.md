# Front Office Atlas Crystal — ChatGPT review handoff

Review the **existing Crystal feature branch** at [Br04490/Front-Office-Atlas](https://github.com/Br04490/Front-Office-Atlas/tree/codex/atlas-complete-data-operations-2026-11-18). The default branch is not the current Crystal implementation. The last verified data milestone was commit `5d8deab5fd74d0b8c6dffbda06e29e8770a0a51d`; use the branch HEAD if it is newer.

## Start here

1. Read [AGENTS.md](../AGENTS.md), [implementation state](IMPLEMENTATION_STATE.md), [data coverage](DATA_COVERAGE.md), [known blockers](KNOWN_BLOCKERS.md), [test results](TEST_RESULTS.md) and the [demo readiness report](DEMO_READINESS_2026-11-19.md).
2. Inspect the actual source and tests on this branch. Check the six homepage modules, permanent left navigation, 30 team records, Crystal styling, player cards, Salary Cap Tower, NCAA browsing, Team Health, Team DNA, photo permission gates and API filters.
3. Classify findings as confirmed defects, missing data/rights, or enhancement requests. Cite file paths and line numbers. Do not infer that an empty domain is populated.
4. If an interactive browser is available **on the same computer**, run `node server.mjs` from the repository root and open `http://localhost:3000/`. The existing live development Preview may use port 3004. A remote ChatGPT session cannot reach either `localhost` address.
5. Run `node --test tests/*.test.mjs` and, if the repository's Python environment is available, `data-pipeline/.venv/Scripts/python.exe -m unittest discover -s data-pipeline/tests -q`.

## Data boundary

The public GitHub branch contains source code, tests, the dated NBA roster snapshot and the official Duke roster batch. It **does not** contain the local SportsDataverse CSVs, user-supplied player selections, SQLite warehouse, photo audit exports, or backup; these are ignored under `.atlas-private/` and `data-pipeline/data/`. Those local records require separate source and usage-rights review. A fresh checkout cannot reproduce local NCAA/grassroots/overseas counts until the permitted inputs are supplied and imported.

The local audit reported 365 NCAA Division I provider groups, 5,585 player IDs, 179,312 numeric metric values, 150 user-supplied boys, 50 overseas selections, and 6,310 photo status records. These are **not** all official current-roster or publication-approved records. Current G League identities, NBA shot events, possession-backed on/off and contract years are zero. No new non-NBA photo is approved for public display. See the demo readiness report for the exact Green/Yellow/Red classification.

## Suggested ChatGPT request

> Review the public `codex/atlas-complete-data-operations-2026-11-18` branch of `Br04490/Front-Office-Atlas`. Start with `docs/CHATGPT_REVIEW_HANDOFF.md` and its linked reports, then inspect the code and tests. Preserve the approved Crystal design. Find concrete functional bugs, data-provenance mistakes, misleading claims, rights leaks, and broken navigation. Give each finding a file and line reference, severity, a reproducible check, and a minimal fix. Distinguish code that works in a fresh checkout from features that need the ignored local warehouse. Do not claim the full site or data import is complete.

For a **visual** review in a separate ChatGPT chat, attach screenshots from the local Preview or use ChatGPT on this computer with browser access. The GitHub source link alone supports code review, not direct inspection of the running local page.
