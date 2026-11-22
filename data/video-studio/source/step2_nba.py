import json, time
import pandas as pd
from pathlib import Path
from nba_api.stats.endpoints import leaguedashplayerstats, leaguedashteamstats, shotchartdetail

OUT = Path("public/data")
SEASON = "2026-27"

print("1/3 Pulling 2026-27 NBA players & advanced metrics...")
base = leaguedashplayerstats.LeagueDashPlayerStats(season=SEASON, per_mode_detailed="PerGame", measure_type_detailed_defense="Base").get_data_frames()[0]
time.sleep(0.8)
adv = leaguedashplayerstats.LeagueDashPlayerStats(season=SEASON, per_mode_detailed="PerGame", measure_type_detailed_defense="Advanced").get_data_frames()[0]
time.sleep(0.8)

players = base.merge(adv[["PLAYER_ID", "OFF_RATING", "DEF_RATING", "NET_RATING", "TS_PCT", "USG_PCT", "PIE"]], on="PLAYER_ID", how="left")
cols = ["PLAYER_ID", "PLAYER_NAME", "TEAM_ID", "TEAM_ABBREVIATION", "AGE", "GP", "MIN", "PTS", "REB", "AST", "STL", "BLK", "TOV", "FG_PCT", "FG3_PCT", "FT_PCT", "OFF_RATING", "DEF_RATING", "NET_RATING", "TS_PCT", "USG_PCT", "PIE"]
players[cols].round(2).to_json(OUT / "nba_players.min.json", orient="records", separators=(",", ":"))

print("2/3 Pulling 30 NBA team ratings...")
teams = leaguedashteamstats.LeagueDashTeamStats(season=SEASON, measure_type_detailed_defense="Advanced").get_data_frames()[0]
time.sleep(0.8)
tcols = ["TEAM_ID", "TEAM_NAME", "GP", "W", "L", "W_PCT", "OFF_RATING", "DEF_RATING", "NET_RATING", "PACE", "TS_PCT"]
teams[tcols].round(2).to_json(OUT / "nba_teams.min.json", orient="records", separators=(",", ":"))

print("3/3 Pulling & compressing 11-zone shot charts...")
shots = shotchartdetail.ShotChartDetail(team_id=0, player_id=0, season_nullable=SEASON, context_measure_simple="FGA").get_data_frames()[0]

def map_zone(r):
    b, a = r["SHOT_ZONE_BASIC"], r["SHOT_ZONE_AREA"]
    if b == "Restricted Area": return "AT THE RIM"
    if b == "In The Paint (Non-RA)": return "PAINT"
    if b == "Mid-Range":
        if "Left Side(" in a: return "LEFT BASELINE MID"
        if "Right Side(" in a: return "RIGHT BASELINE MID"
        if "Left Side Center" in a: return "LEFT ELBOW MID"
        return "RIGHT ELBOW MID"
    if b == "Left Corner 3": return "LEFT CORNER 3"
    if b == "Right Corner 3": return "RIGHT CORNER 3"
    if b == "Above the Break 3":
        if "Left Side Center" in a: return "LEFT WING 3"
        if "Right Side Center" in a: return "RIGHT WING 3"
        return "TOP OF KEY 3"
    return None

shots["ATLAS_ZONE"] = shots.apply(map_zone, axis=1)
shots = shots.dropna(subset=["ATLAS_ZONE"])
zagg = shots.groupby(["PLAYER_ID", "PLAYER_NAME", "TEAM_ABBREVIATION", "ATLAS_ZONE"], as_index=False).agg(FGA=("SHOT_ATTEMPTED_FLAG", "sum"), FGM=("SHOT_MADE_FLAG", "sum"))
zagg["FG_PCT"] = (zagg["FGM"] / zagg["FGA"] * 100).round(1)
zagg.to_json(OUT / "shot_zones.min.json", orient="records", separators=(",", ":"))
print("Step 2 complete!")
