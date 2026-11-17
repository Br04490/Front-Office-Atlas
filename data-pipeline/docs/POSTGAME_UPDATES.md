# How to make Atlas update after games

1. Keep the score poller on a machine or server that runs continuously, or schedule `scripts/refresh_once.ps1` for 15-minute intervals in Windows Task Scheduler. A laptop that sleeps stops refreshing. BDL free is rate-limited to 5 requests/minute.
2. On `newly_final_games`, queue background work to gather licensed game player stats and official corrections; never assume free BDL provides box scores. Use delayed rechecks for corrections.
3. Export/update a real deployed backend database, not only local SQLite. A static GitHub Pages/HTML UI has no Python runtime. Have the Crystal site query a safe authenticated read-only application endpoint. Store API credentials server-side only.
4. After the warehouse is updated, invalidate cached team/player/lineup metrics and update `data_as_of` tags. Use WebSocket/SSE/polling only if your hosting supports it. Frontend should display independent timestamps for games, box scores, possession detail, contract data, and experimental models.
5. Never copy existing premium metrics by scraping subscriber dashboards. Inputs may be paid or not available, but the UI should still have complete modules with truthful Unavailable and Pending Source placeholders.

## Accurate update time claims

15-minute polling can identify a newly final game during the next poll, but no 15-minute guarantee exists if the machine is asleep, API fails, provider delays final state, or data processing takes time. Scores can refresh before player box scores. Proprietary optical tracking may be delayed or unavailable altogether.

## Permissions

Provider access and allowed data redistribution are separate. NBA.com's Terms Section 9 restrict comprehensive, frequently refreshed NBA stat databases without prior consent. Source licensing reviews must be completed for public and commercial deployments. SportsDataverse source repositories may have their own licenses, but upstream providers can impose additional restrictions.
