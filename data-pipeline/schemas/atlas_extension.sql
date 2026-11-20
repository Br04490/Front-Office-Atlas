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
CREATE TABLE IF NOT EXISTS atlas_external_teams (
 pool TEXT NOT NULL, source_provider TEXT NOT NULL, provider_team_id TEXT NOT NULL,
 season TEXT NOT NULL, official_name TEXT NOT NULL, nickname TEXT,
 conference TEXT, conference_source_url TEXT, city TEXT, state_code TEXT,
 campus_region TEXT, nba_affiliate_abbr TEXT, official_site_url TEXT,
 roster_source_url TEXT, coaching_source_url TEXT, logo_url TEXT,
 official_roster_count INTEGER, roster_completeness TEXT NOT NULL DEFAULT 'unverified',
 verified_at TEXT NOT NULL, source_url TEXT NOT NULL, rights_basis TEXT NOT NULL,
 source_sha256 TEXT NOT NULL,
 PRIMARY KEY(pool,source_provider,provider_team_id,season)
);
CREATE INDEX IF NOT EXISTS idx_atlas_external_teams_conference ON atlas_external_teams(pool,season,conference,campus_region);
CREATE TABLE IF NOT EXISTS atlas_external_coaches (
 pool TEXT NOT NULL, source_provider TEXT NOT NULL, provider_team_id TEXT NOT NULL,
 season TEXT NOT NULL, coach_name TEXT NOT NULL, title TEXT NOT NULL,
 interim INTEGER NOT NULL DEFAULT 0, bio_url TEXT NOT NULL,
 photo_url TEXT, photo_rights_basis TEXT,
 verified_at TEXT NOT NULL, source_url TEXT NOT NULL,
 PRIMARY KEY(pool,source_provider,provider_team_id,season),
 FOREIGN KEY(pool,source_provider,provider_team_id,season)
 REFERENCES atlas_external_teams(pool,source_provider,provider_team_id,season)
);
CREATE TABLE IF NOT EXISTS atlas_external_player_bio (
 player_key TEXT PRIMARY KEY, full_name TEXT NOT NULL, date_of_birth TEXT,
 height TEXT, weight TEXT, hometown TEXT, position TEXT, jersey_number TEXT,
 class_or_experience TEXT, previous_school TEXT, bio_url TEXT,
 photo_url TEXT, photo_status TEXT NOT NULL DEFAULT 'pending',
 photo_rights_basis TEXT, verified_at TEXT NOT NULL, source_url TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS atlas_external_memberships (
 player_key TEXT NOT NULL, pool TEXT NOT NULL, source_provider TEXT NOT NULL,
 provider_team_id TEXT NOT NULL, season TEXT NOT NULL,
 membership_status TEXT NOT NULL, two_way_status TEXT,
 assignment_status TEXT, source_url TEXT NOT NULL, verified_at TEXT NOT NULL,
 PRIMARY KEY(player_key,pool,source_provider,provider_team_id,season)
);
CREATE TABLE IF NOT EXISTS atlas_external_player_metrics (
 player_key TEXT NOT NULL, season TEXT NOT NULL, metric_code TEXT NOT NULL,
 metric_value REAL NOT NULL, unit TEXT NOT NULL, games INTEGER,
 source_url TEXT NOT NULL, verified_at TEXT NOT NULL, method TEXT NOT NULL,
 PRIMARY KEY(player_key,season,metric_code,source_url)
);
CREATE TABLE IF NOT EXISTS atlas_external_player_game_logs (
 player_key TEXT NOT NULL, game_id TEXT NOT NULL, game_date TEXT NOT NULL,
 season TEXT NOT NULL, team_id TEXT NOT NULL, opponent_id TEXT NOT NULL,
 stats_json TEXT NOT NULL, source_url TEXT NOT NULL, verified_at TEXT NOT NULL,
 PRIMARY KEY(player_key,game_id,source_url)
);
CREATE TABLE IF NOT EXISTS atlas_external_identity_links (
 player_key TEXT NOT NULL, linked_player_key TEXT NOT NULL,
 match_basis TEXT NOT NULL, source_url TEXT NOT NULL, verified_at TEXT NOT NULL,
 review_status TEXT NOT NULL CHECK(review_status IN ('proposed','verified','rejected')),
 PRIMARY KEY(player_key,linked_player_key)
);
CREATE TABLE IF NOT EXISTS atlas_foundation_people (
 atlas_person_id TEXT PRIMARY KEY, display_name TEXT NOT NULL,
 created_at TEXT NOT NULL, identity_basis TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS atlas_foundation_source_ids (
 atlas_person_id TEXT NOT NULL, provider TEXT NOT NULL, provider_player_id TEXT NOT NULL,
 link_status TEXT NOT NULL, season TEXT NOT NULL, source_url TEXT NOT NULL,
 PRIMARY KEY(provider,provider_player_id,season)
);
CREATE INDEX IF NOT EXISTS idx_atlas_foundation_person_source ON atlas_foundation_source_ids(atlas_person_id,provider,season);
CREATE TABLE IF NOT EXISTS atlas_foundation_teams (
 league TEXT NOT NULL, season TEXT NOT NULL, provider TEXT NOT NULL,
 provider_team_id TEXT NOT NULL, display_name TEXT NOT NULL,
 conference TEXT, source_url TEXT NOT NULL, source_sha256 TEXT NOT NULL,
 updated_at TEXT NOT NULL, PRIMARY KEY(league,season,provider,provider_team_id)
);
CREATE TABLE IF NOT EXISTS atlas_foundation_memberships (
 atlas_person_id TEXT NOT NULL, league TEXT NOT NULL, season TEXT NOT NULL,
 provider TEXT NOT NULL, provider_team_id TEXT NOT NULL, jersey TEXT,
 position TEXT, roster_status TEXT NOT NULL, source_url TEXT NOT NULL,
 source_sha256 TEXT NOT NULL, updated_at TEXT NOT NULL,
 PRIMARY KEY(atlas_person_id,league,season,provider)
);
CREATE INDEX IF NOT EXISTS idx_atlas_foundation_roster ON atlas_foundation_memberships(league,season,provider_team_id);
CREATE TABLE IF NOT EXISTS atlas_foundation_metrics (
 atlas_person_id TEXT NOT NULL, league TEXT NOT NULL, season TEXT NOT NULL,
 provider TEXT NOT NULL, provider_team_id TEXT NOT NULL, metric_code TEXT NOT NULL,
 metric_value REAL NOT NULL, unit TEXT NOT NULL, metric_definition TEXT NOT NULL,
 calculation_method TEXT NOT NULL, source_url TEXT NOT NULL,
 source_sha256 TEXT NOT NULL, updated_at TEXT NOT NULL,
 PRIMARY KEY(atlas_person_id,league,season,provider,metric_code)
);
CREATE INDEX IF NOT EXISTS idx_atlas_foundation_metric_query ON atlas_foundation_metrics(league,season,metric_code,metric_value);
CREATE TABLE IF NOT EXISTS atlas_foundation_sources (
 source_key TEXT PRIMARY KEY, source_url TEXT NOT NULL, source_sha256 TEXT NOT NULL,
 season TEXT NOT NULL, fetched_at TEXT NOT NULL, rights_status TEXT NOT NULL,
 row_count INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS atlas_foundation_import_runs (
 run_id TEXT PRIMARY KEY, started_at TEXT NOT NULL, finished_at TEXT NOT NULL,
 status TEXT NOT NULL, team_count INTEGER NOT NULL, player_count INTEGER NOT NULL,
 metric_count INTEGER NOT NULL, details TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS atlas_player_photos (
 atlas_person_id TEXT NOT NULL, league TEXT NOT NULL, season TEXT NOT NULL,
 provider_player_id TEXT NOT NULL, player_name TEXT NOT NULL, team_id TEXT NOT NULL,
 photo_url TEXT, profile_url TEXT, image_status TEXT NOT NULL,
 identity_status TEXT NOT NULL, usage_permission_status TEXT NOT NULL,
 last_checked TEXT NOT NULL, http_status INTEGER, content_type TEXT,
 width INTEGER, height INTEGER, file_size INTEGER, image_sha256 TEXT,
 source_provider TEXT NOT NULL, note TEXT,
 PRIMARY KEY(atlas_person_id,league,season)
);
CREATE INDEX IF NOT EXISTS idx_atlas_photos_status ON atlas_player_photos(league,season,image_status,usage_permission_status);
