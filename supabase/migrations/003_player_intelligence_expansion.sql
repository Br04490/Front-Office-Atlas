-- ==============================================================================
-- FRONT OFFICE ATLAS - PLAYER INTELLIGENCE & ADVANCED SCOUTING EXPANSION
-- Migration: 003_player_intelligence_expansion.sql
-- Additive migration preserving all existing tables and data structures.
-- ==============================================================================

-- 1. Game-Level Player Stats (Preserves game-level observations, never average-only)
CREATE TABLE IF NOT EXISTS game_player_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    nba_player_id TEXT,
    game_id TEXT NOT NULL,
    game_date DATE NOT NULL,
    season TEXT NOT NULL DEFAULT '2026-27',
    season_type TEXT NOT NULL DEFAULT 'Regular Season', -- 'Preseason', 'Regular Season', 'Playoffs'
    team_id UUID REFERENCES teams(id),
    opponent_team_id UUID REFERENCES teams(id),
    opponent_abbrev TEXT NOT NULL,
    is_home BOOLEAN NOT NULL DEFAULT true,
    is_starter BOOLEAN NOT NULL DEFAULT true,
    minutes NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    points INT NOT NULL DEFAULT 0,
    assists INT NOT NULL DEFAULT 0,
    rebounds INT NOT NULL DEFAULT 0,
    offensive_rebounds INT NOT NULL DEFAULT 0,
    defensive_rebounds INT NOT NULL DEFAULT 0,
    steals INT NOT NULL DEFAULT 0,
    blocks INT NOT NULL DEFAULT 0,
    turnovers INT NOT NULL DEFAULT 0,
    fouls INT NOT NULL DEFAULT 0,
    fg_made INT NOT NULL DEFAULT 0,
    fg_attempted INT NOT NULL DEFAULT 0,
    fg_percentage NUMERIC(5, 3),
    three_made INT NOT NULL DEFAULT 0,
    three_attempted INT NOT NULL DEFAULT 0,
    three_percentage NUMERIC(5, 3),
    ft_made INT NOT NULL DEFAULT 0,
    ft_attempted INT NOT NULL DEFAULT 0,
    ft_percentage NUMERIC(5, 3),
    rim_attempts INT NOT NULL DEFAULT 0,
    rim_made INT NOT NULL DEFAULT 0,
    usage_percentage NUMERIC(5, 2),
    true_shooting_percentage NUMERIC(5, 3),
    on_court_net_rating NUMERIC(5, 2),
    off_court_net_rating NUMERIC(5, 2),
    on_off_differential NUMERIC(5, 2),
    offensive_rating NUMERIC(5, 1),
    defensive_rating NUMERIC(5, 1),
    game_status TEXT NOT NULL DEFAULT 'FINAL', -- 'FINAL', 'LIVE', 'DNP_CD', 'DNP_INJURY', 'DNP_REST', 'SUSPENSION'
    dnp_reason TEXT,
    source_id TEXT NOT NULL DEFAULT 'src_nba_official_api',
    source_url TEXT NOT NULL DEFAULT 'https://stats.nba.com',
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    verification_status TEXT NOT NULL DEFAULT 'VERIFIED_CURRENT',
    CONSTRAINT unique_player_game UNIQUE (player_id, game_id)
);

CREATE INDEX IF NOT EXISTS idx_game_player_date ON game_player_stats(player_id, game_date DESC);
CREATE INDEX IF NOT EXISTS idx_game_player_season ON game_player_stats(player_id, season);

-- 2. Player Season Aggregates (2024-25, 2025-26, 2026-27 Live)
CREATE TABLE IF NOT EXISTS player_season_aggregates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    nba_player_id TEXT,
    season TEXT NOT NULL,
    season_phase TEXT NOT NULL DEFAULT 'Regular Season',
    games_played INT NOT NULL DEFAULT 0,
    games_started INT NOT NULL DEFAULT 0,
    mpg NUMERIC(4, 1) NOT NULL DEFAULT 0.0,
    ppg NUMERIC(4, 1) NOT NULL DEFAULT 0.0,
    apg NUMERIC(4, 1) NOT NULL DEFAULT 0.0,
    rpg NUMERIC(4, 1) NOT NULL DEFAULT 0.0,
    spg NUMERIC(4, 1) NOT NULL DEFAULT 0.0,
    bpg NUMERIC(4, 1) NOT NULL DEFAULT 0.0,
    topg NUMERIC(4, 1) NOT NULL DEFAULT 0.0,
    fg_pct NUMERIC(5, 3) NOT NULL DEFAULT 0.0,
    three_pct NUMERIC(5, 3) NOT NULL DEFAULT 0.0,
    ft_pct NUMERIC(5, 3) NOT NULL DEFAULT 0.0,
    ts_pct NUMERIC(5, 3) NOT NULL DEFAULT 0.0,
    usg_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    ast_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    tov_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    rim_freq NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    rim_fg_pct NUMERIC(5, 3) NOT NULL DEFAULT 0.0,
    on_off_net NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    ortg NUMERIC(5, 1) NOT NULL DEFAULT 0.0,
    drtg NUMERIC(5, 1) NOT NULL DEFAULT 0.0,
    net_rating NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    is_live_season BOOLEAN NOT NULL DEFAULT false,
    last_recalculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verification_status TEXT NOT NULL DEFAULT 'CALCULATED',
    CONSTRAINT unique_player_season_agg UNIQUE (player_id, season, season_phase)
);

-- 3. Contract Market Benchmark & Peer Cohorts
CREATE TABLE IF NOT EXISTS peer_cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cohort_name TEXT NOT NULL,
    position_category TEXT NOT NULL,
    age_min INT NOT NULL DEFAULT 19,
    age_max INT NOT NULL DEFAULT 38,
    mpg_min NUMERIC(4, 1) NOT NULL DEFAULT 15.0,
    role_description TEXT NOT NULL,
    median_salary NUMERIC(14, 2) NOT NULL,
    median_aav NUMERIC(14, 2) NOT NULL,
    highest_paid_salary NUMERIC(14, 2) NOT NULL,
    highest_paid_player TEXT NOT NULL,
    lowest_paid_salary NUMERIC(14, 2) NOT NULL,
    lowest_paid_player TEXT NOT NULL,
    cohort_size INT NOT NULL DEFAULT 0,
    effective_season TEXT NOT NULL DEFAULT '2026-27',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contract_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    cohort_id UUID REFERENCES peer_cohorts(id),
    current_salary NUMERIC(14, 2) NOT NULL,
    median_salary NUMERIC(14, 2) NOT NULL,
    diff_from_median NUMERIC(14, 2) NOT NULL,
    salary_percentile INT NOT NULL,
    production_percentile INT NOT NULL,
    value_quadrant TEXT NOT NULL, -- 'HIGH_PROD_LOW_COST', 'HIGH_PROD_HIGH_COST', 'LOW_PROD_LOW_COST', 'LOW_PROD_HIGH_COST'
    modeled_estimate_salary NUMERIC(14, 2), -- Explicitly labeled as modeled, never treated as verified fact
    data_label TEXT NOT NULL DEFAULT 'OBSERVED CONTRACT MARKET DATA',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Two-Way Command Center Tracking
CREATE TABLE IF NOT EXISTS two_way_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    nba_player_id TEXT,
    player_name TEXT NOT NULL,
    nba_team_id UUID REFERENCES teams(id),
    affiliate_id UUID REFERENCES affiliates(id),
    contract_status TEXT NOT NULL DEFAULT 'TWO_WAY', -- 'TWO_WAY', 'CONVERTED_STANDARD', 'ASSIGNMENT', 'WAIVED'
    nba_games_played INT NOT NULL DEFAULT 0,
    nba_active_list_days INT NOT NULL DEFAULT 0,
    max_active_list_days INT NOT NULL DEFAULT 50, -- 50-game NBA active list limit under 2023 CBA
    gleague_games_played INT NOT NULL DEFAULT 0,
    current_location TEXT NOT NULL DEFAULT 'NBA_ACTIVE', -- 'NBA_ACTIVE', 'GLEAGUE_ASSIGNED', 'TRAVEL'
    recent_assignment_date DATE,
    recent_recall_date DATE,
    conversion_eligible BOOLEAN NOT NULL DEFAULT true,
    source_url TEXT NOT NULL DEFAULT 'https://data.nba.com/v1/league_operations',
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    verification_status TEXT NOT NULL DEFAULT 'VERIFIED_CURRENT',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Offensive Scouting & Shot Geography Profiles
CREATE TABLE IF NOT EXISTS scouting_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    season TEXT NOT NULL DEFAULT '2026-27',
    rim_attempt_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    paint_non_rim_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    short_midrange_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    long_midrange_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    corner_three_share NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    above_break_three_share NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    rim_efficiency_pct NUMERIC(5, 3),
    paint_efficiency_pct NUMERIC(5, 3),
    corner_three_efficiency_pct NUMERIC(5, 3),
    above_break_three_efficiency_pct NUMERIC(5, 3),
    league_percentiles JSONB NOT NULL DEFAULT '{}'::jsonb,
    skill_grades JSONB NOT NULL DEFAULT '{}'::jsonb, -- Finishing, Shooting, Playmaking, Ball Security, Rebounding, Defense
    offensive_identity_summary TEXT,
    defensive_gameplan_keys JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_id TEXT NOT NULL DEFAULT 'src_scouting_verified',
    verification_status TEXT NOT NULL DEFAULT 'CALCULATED',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Team Business & Valuation (Sportico / Business & Money)
CREATE TABLE IF NOT EXISTS team_business_valuations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    team_slug TEXT NOT NULL,
    current_franchise_valuation NUMERIC(15, 2) NOT NULL, -- e.g. 4,400,000,000
    one_year_change_pct NUMERIC(5, 2),
    annual_revenue NUMERIC(14, 2),
    operating_income NUMERIC(14, 2),
    debt_to_value_pct NUMERIC(5, 2),
    arena_status TEXT, -- 'Owner-Operated', 'Tenant Lease'
    valuation_multiple NUMERIC(5, 2),
    source_attribution TEXT NOT NULL DEFAULT 'Sportico NBA Valuations (Manual / Reported Source)',
    source_url TEXT NOT NULL DEFAULT 'https://www.sportico.com',
    published_date DATE,
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reporting_type TEXT NOT NULL DEFAULT 'MANUAL / REPORTED SOURCE', -- Mandatory front-office disclosure
    methodology_notes TEXT NOT NULL DEFAULT 'Enterprise value inclusive of real estate holdings, arena operations, and regional sports networks as audited by financial reporters.',
    CONSTRAINT unique_team_valuation_year UNIQUE (team_id, published_date)
);

-- 7. Derived Video & Computer Vision Tracking (Future Architecture)
CREATE TABLE IF NOT EXISTS derived_tracking_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id TEXT NOT NULL,
    possession_id TEXT NOT NULL,
    player_id UUID REFERENCES players(id),
    video_source TEXT NOT NULL,
    frame_number INT NOT NULL,
    timestamp_seconds NUMERIC(8, 3) NOT NULL,
    x_court_coordinate NUMERIC(6, 2) NOT NULL, -- Feet on 94x50 court
    y_court_coordinate NUMERIC(6, 2) NOT NULL,
    speed_mph NUMERIC(5, 2),
    distance_traveled_feet NUMERIC(6, 2),
    nearest_defender_distance NUMERIC(5, 2),
    confidence_score NUMERIC(4, 3) NOT NULL,
    model_version TEXT NOT NULL DEFAULT 'yolo_court_homography_v1.2',
    review_status TEXT NOT NULL DEFAULT 'UNAUDITED',
    data_label TEXT NOT NULL DEFAULT 'DERIVED TRACKING' -- Mandatory distinction from official NBA tracking
);

-- Enable RLS with public read policies
ALTER TABLE game_player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_season_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_way_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE scouting_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_business_valuations ENABLE ROW LEVEL SECURITY;
ALTER TABLE derived_tracking_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on game_player_stats" ON game_player_stats FOR SELECT USING (true);
CREATE POLICY "Allow public read on player_season_aggregates" ON player_season_aggregates FOR SELECT USING (true);
CREATE POLICY "Allow public read on peer_cohorts" ON peer_cohorts FOR SELECT USING (true);
CREATE POLICY "Allow public read on contract_benchmarks" ON contract_benchmarks FOR SELECT USING (true);
CREATE POLICY "Allow public read on two_way_tracking" ON two_way_tracking FOR SELECT USING (true);
CREATE POLICY "Allow public read on scouting_profiles" ON scouting_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public read on team_business_valuations" ON team_business_valuations FOR SELECT USING (true);
CREATE POLICY "Allow public read on derived_tracking_points" ON derived_tracking_points FOR SELECT USING (true);
