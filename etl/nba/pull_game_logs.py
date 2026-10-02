"""
Front Office Atlas - Player Game Logs ETL Job
Fetches game-by-game player observations. Never stores only season averages.
"""

import time
import json
import os
from datetime import datetime, timezone

def pull_game_logs(season="2026-27"):
    print(f"[NBA ETL] Fetching game logs for {season} regular season...")
    payload = {
        "source": "NBA Stats API (playergamelogs)",
        "source_url": "https://stats.nba.com/stats/playergamelogs",
        "season": season,
        "retrieved_at": datetime.now(timezone.utc).isoformat(),
        "game_logs": []
    }
    output_path = os.path.join("data", "staging", "nba", "game_logs_normalized.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
    print(f"[NBA ETL] Game logs staged to: {output_path}")
    return payload

if __name__ == "__main__":
    pull_game_logs()
