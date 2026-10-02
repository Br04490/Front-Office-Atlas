-- ==============================================================================
-- FRONT OFFICE ATLAS - INITIAL PRODUCTION SCHEMA
-- Migration: 001_initial_schema.sql
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. SOURCES & AUDIT REGISTRY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY,
    source_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    data_category TEXT NOT NULL,
    authority_level TEXT NOT NULL CHECK (authority_level IN ('OFFICIAL_LEAGUE', 'UNION_CBA', 'PRIMARY_MEDIA', 'ESTIMATED_ANALYTICS')),
    refresh_interval TEXT NOT NULL,
    last_attempt TIMESTAMPTZ,
    last_success TIMESTAMPTZ,
    failure_state TEXT,
    failure_message TEXT,
    field_coverage JSONB NOT NULL DEFAULT '[]'::jsonb,
    license_or_access_notes TEXT,
    status TEXT NOT NULL DEFAULT 'MANUAL' CHECK (status IN ('LIVE', 'STALE', 'ERROR', 'MANUAL', 'UNAVAILABLE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS source_fetches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL,
    records_ingested INTEGER DEFAULT 0,
    response_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. NBA TEAMS & AFFILIATES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    nba_team_id TEXT UNIQUE,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    nickname TEXT NOT NULL,
    abbreviation TEXT UNIQUE NOT NULL,
    conference TEXT NOT NULL CHECK (conference IN ('Eastern', 'Western')),
    division TEXT NOT NULL CHECK (division IN ('Atlantic', 'Central', 'Southeast', 'Northwest', 'Pacific', 'Southwest')),
    primary_color TEXT NOT NULL,
    secondary_color TEXT NOT NULL,
    accent_color TEXT,
    dark_surface TEXT,
    arena TEXT,
    logo_url TEXT,
    affiliate_id UUID,
    affiliate_name TEXT,
    season TEXT NOT NULL DEFAULT '2026-27',
    roster_phase TEXT NOT NULL DEFAULT 'training_camp',
    source_id TEXT REFERENCES sources(id) ON DELETE SET NULL,
    source_url TEXT,
    retrieved_at TIMESTAMPTZ DEFAULT now(),
    published_at TIMESTAMPTZ,
    effective_date DATE DEFAULT '2026-10-01',
    verification_status TEXT NOT NULL DEFAULT 'VERIFIED_CURRENT',
    confidence TEXT DEFAULT 'HIGH',
    preseason_record TEXT DEFAULT '0-0 (Camp)',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    abbreviation TEXT NOT NULL,
    parent_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    parent_team_name TEXT,
    league TEXT NOT NULL DEFAULT 'NBA G League',
    is_independent BOOLEAN NOT NULL DEFAULT false,
    arena TEXT,
    source_id TEXT REFERENCES sources(id) ON DELETE SET NULL,
    effective_date DATE DEFAULT '2026-10-01',
    verification_status TEXT NOT NULL DEFAULT 'VERIFIED_CURRENT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add foreign key constraint for affiliate_id in teams
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_teams_affiliate'
    ) THEN
        ALTER TABLE teams ADD CONSTRAINT fk_teams_affiliate FOREIGN KEY (affiliate_id) REFERENCES affiliates(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 3. PLAYERS & ROSTER MEMBERSHIPS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nba_player_id TEXT UNIQUE,
    full_name TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    jersey_number TEXT,
    position TEXT NOT NULL,
    secondary_position TEXT,
    age INTEGER,
    date_of_birth DATE,
    height TEXT,
    weight TEXT,
    nba_experience TEXT,
    college_or_origin TEXT,
    international_origin TEXT,
    draft_year INTEGER,
    draft_round INTEGER,
    draft_pick INTEGER,
    how_acquired TEXT,
    headshot_url TEXT,
    contract_type TEXT,
    roster_status TEXT NOT NULL DEFAULT 'Active Roster',
    two_way_status BOOLEAN NOT NULL DEFAULT false,
    gleague_assignment_status BOOLEAN NOT NULL DEFAULT false,
    current_salary NUMERIC(14,2),
    current_cap_hit NUMERIC(14,2),
    guaranteed_amount NUMERIC(14,2),
    years_remaining INTEGER,
    free_agency_year INTEGER,
    option_type TEXT,
    extension_eligible BOOLEAN NOT NULL DEFAULT false,
    injury_status TEXT DEFAULT 'Healthy / Available',
    roster_phase TEXT NOT NULL DEFAULT 'training_camp',
    source_id TEXT REFERENCES sources(id) ON DELETE SET NULL,
    source_url TEXT,
    retrieved_at TIMESTAMPTZ DEFAULT now(),
    effective_date DATE DEFAULT '2026-10-01',
    verification_status TEXT NOT NULL DEFAULT 'INCOMPLETE',
    confidence TEXT DEFAULT 'AUDITED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS roster_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    season TEXT NOT NULL DEFAULT '2026-27',
    effective_date DATE NOT NULL DEFAULT '2026-10-01',
    roster_phase TEXT NOT NULL DEFAULT 'training_camp',
    designation TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    source_id TEXT REFERENCES sources(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (team_id, player_id, season, roster_phase)
);

-- ------------------------------------------------------------------------------
-- 4. CONTRACTS, SEASONS, DEAD MONEY, CAP HOLDS & EXCEPTIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    signing_date DATE,
    contract_type TEXT NOT NULL,
    years_total INTEGER NOT NULL DEFAULT 1,
    total_value NUMERIC(14,2),
    total_guaranteed NUMERIC(14,2),
    bird_rights TEXT DEFAULT 'Full Bird Rights',
    trade_restriction TEXT,
    extension_eligible_date DATE,
    source_id TEXT REFERENCES sources(id) ON DELETE SET NULL,
    verification_status TEXT NOT NULL DEFAULT 'INCOMPLETE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contract_seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    season TEXT NOT NULL,
    base_salary NUMERIC(14,2),
    cap_hit NUMERIC(14,2),
    guaranteed NUMERIC(14,2),
    option_type TEXT,
    incentive_likely NUMERIC(14,2) DEFAULT 0,
    incentive_unlikely NUMERIC(14,2) DEFAULT 0,
    guarantee_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (contract_id, season)
);

CREATE TABLE IF NOT EXISTS dead_money (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    player_name TEXT NOT NULL,
    season TEXT NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('WAIVED', 'STRETCHED', 'BUYOUT')),
    source_id TEXT REFERENCES sources(id) ON DELETE SET NULL,
    verification_status TEXT NOT NULL DEFAULT 'INCOMPLETE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cap_holds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    player_name TEXT NOT NULL,
    hold_type TEXT NOT NULL CHECK (hold_type IN ('FREE_AGENT', 'FIRST_ROUND_PICK', 'EXCEPTION')),
    season TEXT NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    source_id TEXT REFERENCES sources(id) ON DELETE SET NULL,
    verification_status TEXT NOT NULL DEFAULT 'INCOMPLETE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('NON_TAXPAYER_MLE', 'TAXPAYER_MLE', 'ROOM_MLE', 'BI_ANNUAL', 'TRADE_EXCEPTION')),
    season TEXT NOT NULL DEFAULT '2026-27',
    total_amount NUMERIC(14,2) NOT NULL,
    used_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    remaining_amount NUMERIC(14,2) NOT NULL,
    expires_at TIMESTAMPTZ,
    hard_cap_consequence BOOLEAN NOT NULL DEFAULT false,
    source_id TEXT REFERENCES sources(id) ON DELETE SET NULL,
    verification_status TEXT NOT NULL DEFAULT 'INCOMPLETE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 5. CAP THRESHOLDS & TEAM CAP SNAPSHOTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cap_thresholds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season TEXT UNIQUE NOT NULL,
    cba_era TEXT NOT NULL CHECK (cba_era IN ('CURRENT CBA', 'CONDITIONAL CBA', 'FUTURE CBA UNKNOWN')),
    status TEXT NOT NULL CHECK (status IN ('VERIFIED_CURRENT', 'SCENARIO')),
    salary_cap NUMERIC(14,2) NOT NULL,
    salary_floor NUMERIC(14,2) NOT NULL,
    luxury_tax NUMERIC(14,2) NOT NULL,
    first_apron NUMERIC(14,2) NOT NULL,
    second_apron NUMERIC(14,2) NOT NULL,
    est_mid_level_nt NUMERIC(14,2),
    est_taxpayer_mle NUMERIC(14,2),
    room_exception NUMERIC(14,2),
    bi_annual_exception NUMERIC(14,2),
    min_salary_veteran NUMERIC(14,2),
    source_id TEXT REFERENCES sources(id) ON DELETE SET NULL,
    effective_date DATE DEFAULT '2026-10-01',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_cap_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    season TEXT NOT NULL DEFAULT '2026-27',
    effective_date DATE NOT NULL DEFAULT '2026-10-01',
    roster_phase TEXT NOT NULL DEFAULT 'training_camp',
    team_salary NUMERIC(14,2),
    apron_team_salary NUMERIC(14,2),
    tax_team_salary NUMERIC(14,2),
    active_payroll NUMERIC(14,2),
    dead_money NUMERIC(14,2),
    cap_holds NUMERIC(14,2),
    salary_floor NUMERIC(14,2) NOT NULL,
    salary_cap NUMERIC(14,2) NOT NULL,
    luxury_tax_threshold NUMERIC(14,2) NOT NULL,
    first_apron NUMERIC(14,2) NOT NULL,
    second_apron NUMERIC(14,2) NOT NULL,
    salary_cap_room NUMERIC(14,2),
    luxury_tax_position NUMERIC(14,2),
    first_apron_room NUMERIC(14,2),
    second_apron_room NUMERIC(14,2),
    nba_roster_count INTEGER NOT NULL DEFAULT 0,
    two_way_count INTEGER NOT NULL DEFAULT 0,
    open_roster_spots INTEGER NOT NULL DEFAULT 15,
    tax_status_label TEXT,
    first_apron_status TEXT NOT NULL DEFAULT 'INCOMPLETE',
    second_apron_status TEXT NOT NULL DEFAULT 'INCOMPLETE',
    verification_status TEXT NOT NULL DEFAULT 'INCOMPLETE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (team_id, season, roster_phase, effective_date)
);

-- ------------------------------------------------------------------------------
-- 6. TRANSACTIONS, DRAFT ASSETS & INJURY/AVAILABILITY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    player_name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    cba_article TEXT,
    financial_impact TEXT,
    source_id TEXT REFERENCES sources(id) ON DELETE SET NULL,
    verification_status TEXT NOT NULL DEFAULT 'INCOMPLETE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS draft_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL,
    round INTEGER NOT NULL CHECK (round IN (1, 2)),
    original_team_id UUID NOT NULL REFERENCES teams(id),
    current_controller_id UUID NOT NULL REFERENCES teams(id),
    protection TEXT NOT NULL DEFAULT 'Unprotected',
    swap_right TEXT,
    conveyance_terms TEXT,
    obligation TEXT,
    status_type TEXT NOT NULL DEFAULT 'OWNED' CHECK (status_type IN ('OWNED', 'OWED', 'SWAP', 'PROTECTED', 'CONDITIONAL')),
    source_id TEXT REFERENCES sources(id) ON DELETE SET NULL,
    verification_status TEXT NOT NULL DEFAULT 'INCOMPLETE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS injury_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_name TEXT NOT NULL,
    player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('INJURY', 'REST', 'SUSPENSION', 'COACH DECISION', 'G LEAGUE ASSIGNMENT', 'OTHER')),
    date DATE NOT NULL,
    body_area TEXT,
    reason TEXT NOT NULL,
    games_missed INTEGER DEFAULT 0,
    return_date DATE,
    is_current BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    source_id TEXT REFERENCES sources(id) ON DELETE SET NULL,
    verification_status TEXT NOT NULL DEFAULT 'INCOMPLETE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS availability_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('INJURY', 'REST', 'SUSPENSION', 'COACH DECISION', 'G LEAGUE ASSIGNMENT', 'OTHER')),
    date DATE NOT NULL,
    body_area TEXT,
    reason TEXT NOT NULL,
    games_missed INTEGER DEFAULT 0,
    return_date DATE,
    is_current BOOLEAN NOT NULL DEFAULT true,
    source_id TEXT REFERENCES sources(id) ON DELETE SET NULL,
    verification_status TEXT NOT NULL DEFAULT 'INCOMPLETE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 7. G LEAGUE RELATIONSHIPS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gleague_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    active_assignments JSONB DEFAULT '[]'::jsonb,
    recalls JSONB DEFAULT '[]'::jsonb,
    returning_rights JSONB DEFAULT '[]'::jsonb,
    draft_rights JSONB DEFAULT '[]'::jsonb,
    tryout_pool JSONB DEFAULT '[]'::jsonb,
    source_id TEXT REFERENCES sources(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (parent_team_id, affiliate_id)
);

-- ------------------------------------------------------------------------------
-- 8. PROSPECTS & PROSPECT RANKINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS prospects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    projected_draft_year INTEGER NOT NULL,
    position TEXT NOT NULL,
    height TEXT,
    weight TEXT,
    category TEXT NOT NULL CHECK (category IN ('COLLEGE', 'INTERNATIONAL', 'HIGH SCHOOL', 'YOUNGER PUBLIC RANKINGS')),
    current_team_or_school TEXT NOT NULL,
    eligibility_status TEXT NOT NULL DEFAULT 'RANKED PROSPECT' CHECK (eligibility_status IN ('RANKED PROSPECT', 'NBA DRAFT ELIGIBLE')),
    scouting_summary TEXT,
    verification_status TEXT NOT NULL DEFAULT 'INCOMPLETE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prospect_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
    outlet TEXT NOT NULL,
    rank INTEGER NOT NULL,
    published_date DATE NOT NULL,
    source_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 9. CBA RULES & CITATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cba_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_key TEXT UNIQUE NOT NULL,
    agreement_version TEXT NOT NULL DEFAULT '2023-2030 CBA',
    article_number TEXT NOT NULL,
    section TEXT NOT NULL,
    subsection TEXT,
    page TEXT,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    plain_english TEXT NOT NULL,
    restrictions JSONB DEFAULT '[]'::jsonb,
    first_apron_consequences JSONB DEFAULT '[]'::jsonb,
    second_apron_consequences JSONB DEFAULT '[]'::jsonb,
    source_document TEXT DEFAULT 'NBA-NBPA Collective Bargaining Agreement (Ratified 2023)',
    source_url TEXT DEFAULT 'https://nbpa.com/cba',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cba_citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cba_rule_id UUID REFERENCES cba_rules(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    citation_text TEXT NOT NULL,
    source_page TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 10. SCENARIOS & RECOMMENDATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trade_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    teams JSONB NOT NULL DEFAULT '[]'::jsonb,
    assets_by_team JSONB NOT NULL DEFAULT '{}'::jsonb,
    cba_screening_results JSONB NOT NULL DEFAULT '{}'::jsonb,
    salary_deltas JSONB NOT NULL DEFAULT '{}'::jsonb,
    apron_impacts JSONB NOT NULL DEFAULT '{}'::jsonb,
    cba_version TEXT DEFAULT '2023-2030 CBA',
    warnings JSONB DEFAULT '[]'::jsonb,
    verification_status TEXT NOT NULL DEFAULT 'SCENARIO',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    problem TEXT NOT NULL,
    evidence TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    alternatives JSONB DEFAULT '[]'::jsonb,
    financial_cost TEXT NOT NULL,
    basketball_benefit TEXT NOT NULL,
    cba_mechanism TEXT NOT NULL,
    risks JSONB DEFAULT '[]'::jsonb,
    confidence TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (confidence IN ('HIGH', 'MEDIUM', 'LOW')),
    missing_information JSONB DEFAULT '[]'::jsonb,
    next_decision TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 11. INDEXES FOR QUERY OPTIMIZATION
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_teams_slug ON teams(slug);
CREATE INDEX IF NOT EXISTS idx_teams_nba_team_id ON teams(nba_team_id);
CREATE INDEX IF NOT EXISTS idx_teams_conference_division ON teams(conference, division);

CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_nba_player_id ON players(nba_player_id);
CREATE INDEX IF NOT EXISTS idx_players_roster_status ON players(roster_status);
CREATE INDEX IF NOT EXISTS idx_players_effective_date ON players(effective_date);

CREATE INDEX IF NOT EXISTS idx_roster_memberships_team ON roster_memberships(team_id, season, roster_phase);
CREATE INDEX IF NOT EXISTS idx_roster_memberships_player ON roster_memberships(player_id);

CREATE INDEX IF NOT EXISTS idx_contracts_player ON contracts(player_id);
CREATE INDEX IF NOT EXISTS idx_contracts_team ON contracts(team_id);
CREATE INDEX IF NOT EXISTS idx_contract_seasons_contract ON contract_seasons(contract_id, season);

CREATE INDEX IF NOT EXISTS idx_team_cap_snapshots_team_season ON team_cap_snapshots(team_id, season, effective_date);
CREATE INDEX IF NOT EXISTS idx_cap_thresholds_season ON cap_thresholds(season);

CREATE INDEX IF NOT EXISTS idx_draft_assets_year ON draft_assets(year, round);
CREATE INDEX IF NOT EXISTS idx_draft_assets_controller ON draft_assets(current_controller_id);
CREATE INDEX IF NOT EXISTS idx_draft_assets_original ON draft_assets(original_team_id);

CREATE INDEX IF NOT EXISTS idx_injury_events_team_player ON injury_events(team_id, player_id, date);
CREATE INDEX IF NOT EXISTS idx_transactions_team_date ON transactions(team_id, date);
CREATE INDEX IF NOT EXISTS idx_prospects_year_cat ON prospects(projected_draft_year, category);

-- ------------------------------------------------------------------------------
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- Security rule: Public browser clients have READ-ONLY access.
-- Admin / import operations require service_role access.
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    t text;
    tbls text[] := ARRAY[
        'sources', 'source_fetches', 'teams', 'affiliates', 'players',
        'roster_memberships', 'contracts', 'contract_seasons', 'dead_money',
        'cap_holds', 'exceptions', 'cap_thresholds', 'team_cap_snapshots',
        'transactions', 'draft_assets', 'injury_events', 'availability_events',
        'gleague_relationships', 'prospects', 'prospect_rankings', 'cba_rules',
        'cba_citations', 'trade_scenarios', 'recommendations'
    ];
BEGIN
    FOREACH t IN ARRAY tbls LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('DROP POLICY IF EXISTS "Public read-only policy" ON %I;', t);
        EXECUTE format('CREATE POLICY "Public read-only policy" ON %I FOR SELECT TO anon, authenticated USING (true);', t);
        EXECUTE format('DROP POLICY IF EXISTS "Service role full write policy" ON %I;', t);
        EXECUTE format('CREATE POLICY "Service role full write policy" ON %I FOR ALL TO service_role USING (true) WITH CHECK (true);', t);
    END LOOP;
END $$;
