import json, re, unicodedata
import numpy as np
import pandas as pd
from pathlib import Path

OUT = Path("public/data")
SC_DIR = Path("data/skillcorner")

def norm(name):
    if not isinstance(name, str): return ""
    s = unicodedata.normalize("NFKD", name).encode("ASCII", "ignore").decode("utf-8")
    return re.sub(r"[^a-z0-9]", "", re.sub(r"\b(jr|sr|ii|iii|iv)\b\.?", "", s.lower()))

def load_j(p, d): return json.loads(p.read_text(encoding="utf-8")) if p.exists() else d

nba = load_j(OUT / "nba_players.min.json", [])
gl = load_j(OUT / "gleague_players.min.json", [])
teams = load_j(OUT / "nba_teams.min.json", [])
zones = load_j(OUT / "shot_zones.min.json", [])
contracts = load_j(OUT / "nba_contracts.min.json", [])

sc_by_key = {}
for csv_f in SC_DIR.rglob("*.csv"):
    try:
        df = pd.read_csv(csv_f).head(500).round(3)
        for r in df.to_dict(orient="records"):
            pn = r.get("player_name") or r.get("player") or r.get("name")
            k = norm(str(pn)) if pn else ""
            if k: sc_by_key.setdefault(k, {}).update({c: v for c, v in r.items() if isinstance(v, (int, float)) and not pd.isna(v)})
    except Exception:
        pass

c_map = {norm(c["player"]): {"team": c["team"], "years": c["years"], "guaranteed": c["guaranteed"], "cap_26_27": c["years"].get("2026-27", 0)} for c in contracts if norm(c.get("player"))}
ZONES = ["AT THE RIM", "PAINT", "LEFT BASELINE MID", "RIGHT BASELINE MID", "LEFT ELBOW MID", "RIGHT ELBOW MID", "LEFT CORNER 3", "RIGHT CORNER 3", "LEFT WING 3", "RIGHT WING 3", "TOP OF KEY 3"]
z_map = {}
for z in zones:
    z_map.setdefault(str(z["PLAYER_ID"]), {})[z["ATLAS_ZONE"]] = {"fga": z["FGA"], "fgm": z["FGM"], "pct": z["FG_PCT"]}

unified, seen = [], set()
for p in nba:
    pid, k = str(p["PLAYER_ID"]), norm(p["PLAYER_NAME"])
    seen.add(k)
    zm = z_map.get(pid, {})
    unified.append({
        "id": pid, "key": k, "name": p["PLAYER_NAME"], "league": "NBA", "team": p["TEAM_ABBREVIATION"],
        "age": p.get("AGE", 0), "gp": p.get("GP", 0), "min": p.get("MIN", 0),
        "stats": {x.lower(): p.get(x, 0) for x in ["PTS","REB","AST","STL","BLK","TOV","FG_PCT","FG3_PCT","FT_PCT","OFF_RATING","DEF_RATING","NET_RATING","TS_PCT","USG_PCT","PIE"]},
        "contract": c_map.get(k, {"team": p["TEAM_ABBREVIATION"], "years": {}, "guaranteed": 0, "cap_26_27": 0}),
        "zones": zm, "zone_vec": [round(zm.get(zn, {}).get("pct", 0.0) / 100.0, 3) for zn in ZONES],
        "tracking": sc_by_key.get(k, {})
    })

for g in gl:
    k = norm(g["PLAYER_NAME"])
    if k in seen:
        for u in unified:
            if u["key"] == k:
                u["gleague_stats"] = {x.lower(): g.get(x, 0) for x in ["TEAM_ABBREVIATION","GP","MIN","PTS","REB","AST","STL","BLK"]}
        continue
    unified.append({
        "id": f"GL_{g['PLAYER_ID']}", "key": k, "name": g["PLAYER_NAME"], "league": "G-LEAGUE", "team": g["TEAM_ABBREVIATION"],
        "age": g.get("AGE", 0), "gp": g.get("GP", 0), "min": g.get("MIN", 0),
        "stats": {x.lower(): g.get(x, 0) for x in ["PTS","REB","AST","STL","BLK","FG_PCT","FG3_PCT"]},
        "contract": {"team": g["TEAM_ABBREVIATION"], "years": {"2026-27": 578577}, "guaranteed": 0, "cap_26_27": 578577},
        "zones": {}, "zone_vec": [0.0]*11, "tracking": sc_by_key.get(k, {})
    })

SKEYS = ["pts", "reb", "ast", "stl", "blk", "fg3_pct", "ts_pct", "usg_pct", "net_rtg"]
mat = np.array([[float(u["stats"].get(k, 0) or 0) for k in SKEYS] for u in unified], dtype=float)
stds = np.where(mat.std(axis=0) == 0, 1.0, mat.std(axis=0))
zmat = (mat - mat.mean(axis=0)) / stds
for i, u in enumerate(unified): u["vec"] = [round(float(v), 3) for v in zmat[i]]

with open(OUT / "atlas_graph.min.json", "w", encoding="utf-8") as f:
    json.dump({"meta": {"season": "2026-27", "stat_keys": SKEYS, "zone_order": ZONES, "count": len(unified)}, "teams": teams, "players": unified}, f, separators=(",", ":"))
print(f"Connected graph saved: {len(unified)} players ready!")
