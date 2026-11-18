-- Additive Atlas Crystal warehouse. Original atlas_sqlite.sql remains byte-for-byte intact.
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS atlas_source_snapshots (
  source_key TEXT PRIMARY KEY, source_url TEXT NOT NULL, sha256 TEXT NOT NULL,
  as_of_date TEXT NOT NULL, imported_at TEXT NOT NULL, rights_note TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS atlas_player_season_metrics (
  nba_player_id INTEGER NOT NULL, season TEXT NOT NULL, metric_code TEXT NOT NULL,
  value REAL NOT NULL, unit TEXT NOT NULL, source_url TEXT NOT NULL,
  source_field TEXT, source_team TEXT, kind TEXT NOT NULL,
  verified_at TEXT NOT NULL, sample TEXT,
  PRIMARY KEY(nba_player_id,season,metric_code,source_url)
);
CREATE INDEX IF NOT EXISTS idx_atlas_metric_query ON atlas_player_season_metrics(season,metric_code,value);
CREATE TABLE IF NOT EXISTS atlas_team_seasons (
  team_abbr TEXT NOT NULL, season TEXT NOT NULL, wins INTEGER NOT NULL,
  losses INTEGER NOT NULL, games INTEGER NOT NULL, points_per_game REAL NOT NULL,
  opponent_points_per_game REAL NOT NULL, off_rating_est REAL NOT NULL,
  def_rating_est REAL NOT NULL, net_rating_est REAL NOT NULL, pace_est REAL NOT NULL,
  source_url TEXT NOT NULL, verified_at TEXT NOT NULL,
  PRIMARY KEY(team_abbr,season,source_url)
);
CREATE TABLE IF NOT EXISTS atlas_team_games (
  team_abbr TEXT NOT NULL, season TEXT NOT NULL, game_date TEXT NOT NULL,
  opponent_abbr TEXT NOT NULL, home INTEGER NOT NULL, result TEXT NOT NULL,
  points INTEGER NOT NULL, opponent_points INTEGER NOT NULL, point_diff INTEGER NOT NULL,
  rebounds INTEGER NOT NULL, assists INTEGER NOT NULL,
  source_url TEXT NOT NULL, verified_at TEXT NOT NULL,
  PRIMARY KEY(team_abbr,season,game_date,opponent_abbr,source_url)
);
CREATE INDEX IF NOT EXISTS idx_atlas_team_games ON atlas_team_games(team_abbr,season,game_date);
CREATE TABLE IF NOT EXISTS atlas_player_game_logs (
  nba_player_id INTEGER NOT NULL, game_id TEXT NOT NULL, game_date TEXT NOT NULL,
  season TEXT NOT NULL, team_abbr TEXT NOT NULL, opponent_abbr TEXT NOT NULL,
  season_type TEXT NOT NULL, minutes REAL, points INTEGER, rebounds INTEGER,
  assists INTEGER, fgm INTEGER, fga INTEGER, three_made INTEGER,
  three_attempts INTEGER, ftm INTEGER, fta INTEGER, turnovers INTEGER,
  steals INTEGER, blocks INTEGER, ts_pct REAL, efg_pct REAL,
  source_url TEXT NOT NULL, verified_at TEXT NOT NULL, source_sha256 TEXT NOT NULL,
  PRIMARY KEY(nba_player_id,game_id,source_url)
);
CREATE INDEX IF NOT EXISTS idx_atlas_player_logs ON atlas_player_game_logs(nba_player_id,season,game_date);
CREATE TABLE IF NOT EXISTS atlas_bdl_games (
  bdl_game_id INTEGER PRIMARY KEY, game_date TEXT NOT NULL, season_start_year INTEGER,
  home_team_abbr TEXT NOT NULL, away_team_abbr TEXT NOT NULL,
  home_score INTEGER, away_score INTEGER, status TEXT NOT NULL,
  provider_updated_at TEXT, fetched_at TEXT NOT NULL, source_url TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS atlas_contract_years (
  nba_player_id INTEGER NOT NULL, team_abbr TEXT NOT NULL, season TEXT NOT NULL,
  contract_type TEXT NOT NULL, signed_date TEXT, base_salary_usd INTEGER,
  cap_hit_usd INTEGER, cash_paid_usd INTEGER, guaranteed_usd INTEGER,
  likely_incentives_usd INTEGER, unlikely_incentives_usd INTEGER,
  option_type TEXT, option_deadline TEXT, no_trade INTEGER, bird_rights TEXT,
  trade_restriction TEXT, cap_hold_usd INTEGER, dead_money_usd INTEGER,
  source_url TEXT NOT NULL, verified_at TEXT NOT NULL, rights_basis TEXT NOT NULL,
  PRIMARY KEY(nba_player_id,team_abbr,season,source_url)
);
CREATE TABLE IF NOT EXISTS atlas_shot_events (
  nba_player_id INTEGER NOT NULL, season TEXT NOT NULL, game_id TEXT NOT NULL,
  game_event_id INTEGER NOT NULL, game_date TEXT NOT NULL,
  loc_x REAL NOT NULL, loc_y REAL NOT NULL, made INTEGER NOT NULL,
  shot_value INTEGER NOT NULL, shot_distance REAL, shot_type TEXT,
  period INTEGER, opponent_abbr TEXT, source_url TEXT NOT NULL,
  verified_at TEXT NOT NULL, source_sha256 TEXT NOT NULL,
  PRIMARY KEY(nba_player_id,season,game_id,game_event_id,source_url)
);
CREATE INDEX IF NOT EXISTS idx_atlas_shots_player ON atlas_shot_events(nba_player_id,season,game_date);
CREATE TABLE IF NOT EXISTS atlas_possessions (
  game_id TEXT NOT NULL, possession_id INTEGER NOT NULL, season TEXT NOT NULL,
  team_abbr TEXT NOT NULL, side TEXT NOT NULL, points INTEGER NOT NULL,
  on_court_player_ids TEXT NOT NULL, source_url TEXT NOT NULL,
  verified_at TEXT NOT NULL, source_sha256 TEXT NOT NULL,
  PRIMARY KEY(game_id,possession_id,team_abbr,source_url)
);
CREATE INDEX IF NOT EXISTS idx_atlas_possessions_team ON atlas_possessions(team_abbr,season,game_id);
CREATE TABLE IF NOT EXISTS atlas_external_players (
 pool TEXT NOT NULL, source_provider TEXT NOT NULL, provider_player_id TEXT NOT NULL,
 player_name TEXT NOT NULL, team_id TEXT NOT NULL, team_name TEXT NOT NULL,
 season TEXT NOT NULL, roster_status TEXT NOT NULL, rank_number INTEGER,
 source_url TEXT NOT NULL, verified_at TEXT NOT NULL, rights_basis TEXT NOT NULL,
 source_sha256 TEXT NOT NULL,
 PRIMARY KEY(pool,source_provider,provider_player_id,season)
);
CREATE INDEX IF NOT EXISTS idx_atlas_external_pool ON atlas_external_players(pool,season,team_id);
