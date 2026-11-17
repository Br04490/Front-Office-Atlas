PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS teams(
 team_key TEXT PRIMARY KEY,source_provider TEXT NOT NULL,external_id TEXT NOT NULL,
 abbreviation TEXT,full_name TEXT,conference TEXT,division TEXT,last_seen TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS players(
 player_key TEXT PRIMARY KEY,source_provider TEXT NOT NULL,external_id TEXT NOT NULL,
 first_name TEXT,last_name TEXT,position TEXT,height TEXT,weight TEXT,jersey_number TEXT,
 college TEXT,country TEXT,draft_year INTEGER,draft_round INTEGER,draft_number INTEGER,
 provider_team_key TEXT,roster_status TEXT NOT NULL DEFAULT 'unverified',last_seen TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_players_team ON players(provider_team_key);
CREATE TABLE IF NOT EXISTS games(
 game_key TEXT PRIMARY KEY,source_provider TEXT NOT NULL,external_id TEXT NOT NULL,
 game_date TEXT,season_start_year INTEGER,season_type TEXT,status_state TEXT NOT NULL,
 status_text TEXT,home_team_key TEXT,away_team_key TEXT,home_score INTEGER,away_score INTEGER,
 tipoff_utc TEXT,source_url TEXT,updated_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_games_date ON games(game_date);
CREATE INDEX IF NOT EXISTS idx_games_teams ON games(home_team_key,away_team_key);
CREATE TABLE IF NOT EXISTS player_game_stats(
 game_key TEXT NOT NULL,player_key TEXT NOT NULL,team_key TEXT NOT NULL,
 source_provider TEXT NOT NULL,source_url TEXT NOT NULL,minutes TEXT,pts REAL,fgm REAL,fga REAL,
 fg3m REAL,fg3a REAL,ftm REAL,fta REAL,oreb REAL,dreb REAL,reb REAL,ast REAL,stl REAL,
 blk REAL,tov REAL,pf REAL,plus_minus REAL,efg_pct REAL,ts_pct REAL,collected_at TEXT,
 PRIMARY KEY(game_key,player_key,source_provider));
CREATE INDEX IF NOT EXISTS idx_player_game_player ON player_game_stats(player_key,game_key);
CREATE TABLE IF NOT EXISTS contracts(
 player_key TEXT NOT NULL,team_key TEXT NOT NULL,season TEXT NOT NULL,salary_usd REAL,
 guaranteed_usd REAL,option_type TEXT,contract_type TEXT,source_provider TEXT NOT NULL,
 source_url TEXT NOT NULL,as_of_date TEXT NOT NULL,usage_permission TEXT NOT NULL,
 PRIMARY KEY(player_key,team_key,season,source_provider));
CREATE TABLE IF NOT EXISTS metric_values(
 entity_key TEXT NOT NULL,season TEXT NOT NULL,metric_code TEXT NOT NULL,
 metric_value REAL,unit TEXT,sample_size INTEGER,method_version TEXT,
 source_provider TEXT NOT NULL,source_url TEXT NOT NULL,as_of_date TEXT NOT NULL,
 data_status TEXT NOT NULL CHECK(data_status IN ('verified','derived','experimental','unavailable')),
 PRIMARY KEY(entity_key,season,metric_code,source_provider));
CREATE TABLE IF NOT EXISTS player_identity_map(
 canonical_nba_player_id TEXT NOT NULL,source_provider TEXT NOT NULL,
 provider_player_id TEXT NOT NULL,verified_on TEXT NOT NULL,
 PRIMARY KEY(source_provider,provider_player_id));
CREATE TABLE IF NOT EXISTS source_access(
 source_provider TEXT PRIMARY KEY,allowed_use TEXT,license_url TEXT,
 checked_at TEXT,commercial_ok INTEGER DEFAULT 0,notes TEXT);
