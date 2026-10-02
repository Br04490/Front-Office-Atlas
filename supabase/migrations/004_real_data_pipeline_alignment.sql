-- ==============================================================================
-- FRONT OFFICE ATLAS - REAL DATA BACKBONE & PIPELINE ALIGNMENT
-- Migration: 004_real_data_pipeline_alignment.sql
-- Additive migration preserving all existing tables and data structures.
-- ==============================================================================

-- 1. Two-Way Events Table (Official transactions tracking, never inferred from stats)
CREATE TABLE IF NOT EXISTS two_way_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    nba_player_id TEXT,
    nba_team_id UUID REFERENCES teams(id),
    gleague_team_id UUID REFERENCES affiliates(id),
    event_type TEXT NOT NULL CHECK (
        event_type IN (
            'SIGNED_TWO_WAY',
            'ASSIGNED',
            'RECALLED',
            'CONVERTED',
            'WAIVED',
            'RELEASED',
            'CALL_UP',
            'OTHER'
        )
    ),
    event_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    source_id TEXT NOT NULL DEFAULT 'src_nba_official_transactions',
    source_url TEXT NOT NULL DEFAULT 'https://data.nba.com/v1/league_operations',
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verification_status TEXT NOT NULL DEFAULT 'VERIFIED_CURRENT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_two_way_events_player ON two_way_events(player_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_two_way_events_nba_team ON two_way_events(nba_team_id);

-- 2. Player Progression Snapshots Table (Daily/Game rolling metrics and trendlines)
CREATE TABLE IF NOT EXISTS player_progression_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    nba_player_id TEXT,
    season TEXT NOT NULL DEFAULT '2026-27',
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    games_played INT NOT NULL DEFAULT 0,
    metric_name TEXT NOT NULL, -- 'PPG', 'MPG', 'TS%', 'USG%', 'AST%', 'TOV%', 'RIM_FREQ', 'ON_OFF_NET', etc.
    metric_value NUMERIC(7, 3) NOT NULL,
    rolling_5 NUMERIC(7, 3),
    rolling_10 NUMERIC(7, 3),
    rolling_15 NUMERIC(7, 3),
    season_average NUMERIC(7, 3),
    source TEXT NOT NULL DEFAULT 'Front Office Atlas Ingestion Pipeline',
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_player_progression_metric UNIQUE (player_id, season, snapshot_date, metric_name)
);

CREATE INDEX IF NOT EXISTS idx_progression_player_date ON player_progression_snapshots(player_id, snapshot_date DESC);

-- 3. Contract Market Snapshots Table (Multi-peer cohort contract evaluations)
CREATE TABLE IF NOT EXISTS contract_market_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    season TEXT NOT NULL DEFAULT '2026-27',
    peer_cohort_id UUID REFERENCES peer_cohorts(id),
    highest_salary NUMERIC(14, 2) NOT NULL,
    lowest_salary NUMERIC(14, 2) NOT NULL,
    median_salary NUMERIC(14, 2) NOT NULL,
    median_aav NUMERIC(14, 2) NOT NULL,
    median_cap_hit NUMERIC(14, 2) NOT NULL,
    player_salary NUMERIC(14, 2) NOT NULL,
    salary_percentile INT NOT NULL,
    difference_from_median NUMERIC(14, 2) NOT NULL,
    sample_size INT NOT NULL DEFAULT 0,
    source_date DATE NOT NULL DEFAULT CURRENT_DATE,
    verification_status TEXT NOT NULL DEFAULT 'VERIFIED_CURRENT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_player_cohort_snapshot UNIQUE (player_id, season, peer_cohort_id, source_date)
);

-- 4. Additive columns for game_player_stats to ensure 100% field naming alignment
DO $$
BEGIN
    ALTER TABLE game_player_stats ADD COLUMN IF NOT EXISTS home_away TEXT;
    ALTER TABLE game_player_stats ADD COLUMN IF NOT EXISTS starter BOOLEAN DEFAULT true;
    ALTER TABLE game_player_stats ADD COLUMN IF NOT EXISTS fgm INT DEFAULT 0;
    ALTER TABLE game_player_stats ADD COLUMN IF NOT EXISTS fga INT DEFAULT 0;
    ALTER TABLE game_player_stats ADD COLUMN IF NOT EXISTS fg3m INT DEFAULT 0;
    ALTER TABLE game_player_stats ADD COLUMN IF NOT EXISTS fg3a INT DEFAULT 0;
    ALTER TABLE game_player_stats ADD COLUMN IF NOT EXISTS ftm INT DEFAULT 0;
    ALTER TABLE game_player_stats ADD COLUMN IF NOT EXISTS fta INT DEFAULT 0;
    ALTER TABLE game_player_stats ADD COLUMN IF NOT EXISTS plus_minus INT DEFAULT 0;
    ALTER TABLE game_player_stats ADD COLUMN IF NOT EXISTS rim_makes INT DEFAULT 0;
    ALTER TABLE game_player_stats ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE game_player_stats ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
END $$;

-- 5. Additive columns for player_season_aggregates to ensure 100% field naming alignment
DO $$
BEGIN
    ALTER TABLE player_season_aggregates ADD COLUMN IF NOT EXISTS minutes_per_game NUMERIC(4, 1);
    ALTER TABLE player_season_aggregates ADD COLUMN IF NOT EXISTS points_per_game NUMERIC(4, 1);
    ALTER TABLE player_season_aggregates ADD COLUMN IF NOT EXISTS rebounds_per_game NUMERIC(4, 1);
    ALTER TABLE player_season_aggregates ADD COLUMN IF NOT EXISTS assists_per_game NUMERIC(4, 1);
    ALTER TABLE player_season_aggregates ADD COLUMN IF NOT EXISTS steals_per_game NUMERIC(4, 1);
    ALTER TABLE player_season_aggregates ADD COLUMN IF NOT EXISTS blocks_per_game NUMERIC(4, 1);
    ALTER TABLE player_season_aggregates ADD COLUMN IF NOT EXISTS turnovers_per_game NUMERIC(4, 1);
    ALTER TABLE player_season_aggregates ADD COLUMN IF NOT EXISTS assist_pct NUMERIC(5, 2);
    ALTER TABLE player_season_aggregates ADD COLUMN IF NOT EXISTS turnover_pct NUMERIC(5, 2);
    ALTER TABLE player_season_aggregates ADD COLUMN IF NOT EXISTS three_point_attempt_rate NUMERIC(5, 2);
    ALTER TABLE player_season_aggregates ADD COLUMN IF NOT EXISTS three_point_pct NUMERIC(5, 3);
    ALTER TABLE player_season_aggregates ADD COLUMN IF NOT EXISTS rim_attempt_rate NUMERIC(5, 2);
    ALTER TABLE player_season_aggregates ADD COLUMN IF NOT EXISTS on_off_net_rating NUMERIC(5, 2);
    ALTER TABLE player_season_aggregates ADD COLUMN IF NOT EXISTS last_game_date DATE;
    ALTER TABLE player_season_aggregates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
END $$;

-- Enable RLS and public read access
ALTER TABLE two_way_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_progression_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_market_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on two_way_events" ON two_way_events FOR SELECT USING (true);
CREATE POLICY "Allow public read on player_progression_snapshots" ON player_progression_snapshots FOR SELECT USING (true);
CREATE POLICY "Allow public read on contract_market_snapshots" ON contract_market_snapshots FOR SELECT USING (true);
