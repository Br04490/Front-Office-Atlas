-- ==============================================================================
-- FRONT OFFICE ATLAS - EXECUTIVE INTELLIGENCE SUITE
-- Migration: 006_executive_intelligence_suite.sql
-- Additive migration preserving all existing tables and data structures.
-- ==============================================================================

-- 1. Draft Assets Additive Columns & Lineage Chain
DO $$
BEGIN
    ALTER TABLE draft_assets ADD COLUMN IF NOT EXISTS draft_year INT;
    ALTER TABLE draft_assets ADD COLUMN IF NOT EXISTS current_owner_team_id UUID REFERENCES teams(id);
    ALTER TABLE draft_assets ADD COLUMN IF NOT EXISTS asset_type TEXT DEFAULT 'OWN_PICK';
    ALTER TABLE draft_assets ADD COLUMN IF NOT EXISTS protection_type TEXT DEFAULT 'NONE';
    ALTER TABLE draft_assets ADD COLUMN IF NOT EXISTS protection_details TEXT;
    ALTER TABLE draft_assets ADD COLUMN IF NOT EXISTS swap_rights BOOLEAN DEFAULT false;
    ALTER TABLE draft_assets ADD COLUMN IF NOT EXISTS swap_partner_team_id UUID REFERENCES teams(id);
    ALTER TABLE draft_assets ADD COLUMN IF NOT EXISTS conveyance_conditions TEXT;
    ALTER TABLE draft_assets ADD COLUMN IF NOT EXISTS rollover_conditions TEXT;
    ALTER TABLE draft_assets ADD COLUMN IF NOT EXISTS extinguishment_conditions TEXT;
    ALTER TABLE draft_assets ADD COLUMN IF NOT EXISTS tradeability_status TEXT DEFAULT 'VERIFIED_TRADEABLE';
    ALTER TABLE draft_assets ADD COLUMN IF NOT EXISTS effective_date DATE DEFAULT '2026-10-01';
    ALTER TABLE draft_assets ADD COLUMN IF NOT EXISTS retrieved_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE draft_assets ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'VERIFIED_CURRENT';
    ALTER TABLE draft_assets ADD COLUMN IF NOT EXISTS notes TEXT;
END $$;

-- 2. Draft Asset History / Lineage Chain Table
CREATE TABLE IF NOT EXISTS draft_asset_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_asset_id UUID REFERENCES draft_assets(id) ON DELETE CASCADE,
    event_date DATE NOT NULL DEFAULT CURRENT_DATE,
    transaction_id TEXT,
    from_team_id UUID REFERENCES teams(id),
    to_team_id UUID REFERENCES teams(id),
    description TEXT NOT NULL,
    protection_terms_applied TEXT,
    cba_rule TEXT,
    source_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Prospects & Rankings Additive Columns
DO $$
BEGIN
    ALTER TABLE prospects ADD COLUMN IF NOT EXISTS external_player_id TEXT;
    ALTER TABLE prospects ADD COLUMN IF NOT EXISTS date_of_birth DATE;
    ALTER TABLE prospects ADD COLUMN IF NOT EXISTS age INT;
    ALTER TABLE prospects ADD COLUMN IF NOT EXISTS wingspan TEXT;
    ALTER TABLE prospects ADD COLUMN IF NOT EXISTS secondary_position TEXT;
    ALTER TABLE prospects ADD COLUMN IF NOT EXISTS current_team TEXT;
    ALTER TABLE prospects ADD COLUMN IF NOT EXISTS league TEXT;
    ALTER TABLE prospects ADD COLUMN IF NOT EXISTS country TEXT;
    ALTER TABLE prospects ADD COLUMN IF NOT EXISTS school_or_club TEXT;
    ALTER TABLE prospects ADD COLUMN IF NOT EXISTS draft_year INT DEFAULT 2027;
    ALTER TABLE prospects ADD COLUMN IF NOT EXISTS draft_eligibility_status TEXT DEFAULT 'DRAFT_ELIGIBLE';
    ALTER TABLE prospects ADD COLUMN IF NOT EXISTS class_year TEXT;
    ALTER TABLE prospects ADD COLUMN IF NOT EXISTS headshot_url TEXT;
    ALTER TABLE prospects ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'NBA Scouting / Official Combine';
    ALTER TABLE prospects ADD COLUMN IF NOT EXISTS retrieved_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE prospects ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'VERIFIED_CURRENT';
END $$;

-- 4. Injury Events & Availability Events Preservation Tables
CREATE TABLE IF NOT EXISTS injury_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id),
    event_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reported_status TEXT NOT NULL,
    public_reason TEXT NOT NULL,
    body_area TEXT,
    reported_injury_text TEXT,
    source_id TEXT NOT NULL DEFAULT 'src_nba_injury_report',
    source_url TEXT,
    published_at TIMESTAMPTZ,
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verification_status TEXT NOT NULL DEFAULT 'VERIFIED_CURRENT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS availability_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    game_id TEXT,
    game_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL,
    minutes_played NUMERIC(4, 1),
    starter BOOLEAN DEFAULT false,
    public_reason TEXT,
    source TEXT NOT NULL DEFAULT 'NBA Official Box Score & Game Log',
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Source Conflicts Tracking Table
CREATE TABLE IF NOT EXISTS source_conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL, -- 'PLAYER', 'CONTRACT', 'DRAFT_ASSET', 'INJURY'
    entity_id TEXT NOT NULL,
    field_name TEXT NOT NULL,
    value_a TEXT NOT NULL,
    source_a TEXT NOT NULL,
    value_b TEXT NOT NULL,
    source_b TEXT NOT NULL,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolution_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (resolution_status IN ('PENDING', 'RESOLVED', 'FLAGGED_UNRESOLVABLE')),
    resolved_value TEXT,
    resolution_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Data Audit Log Table
CREATE TABLE IF NOT EXISTS data_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    job TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE', 'VERIFY', 'RECONCILE')),
    old_value JSONB,
    new_value JSONB,
    source TEXT NOT NULL,
    actor_or_process TEXT NOT NULL,
    notes TEXT
);

-- 7. Decision Calendar Events Table
CREATE TABLE IF NOT EXISTS decision_calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    draft_asset_id UUID REFERENCES draft_assets(id) ON DELETE SET NULL,
    event_date DATE NOT NULL,
    category TEXT NOT NULL CHECK (
        category IN (
            'CONTRACT_GUARANTEE',
            'OPTION_DEADLINE',
            'EXTENSION_DATE',
            'FREE_AGENCY',
            'TRADE_ELIGIBILITY',
            'TRADE_RESTRICTION',
            'EXCEPTION_EXPIRATION',
            'DRAFT_DEADLINE',
            'DRAFT_PICK_CONVEYANCE',
            'ROSTER_CUT_DATE',
            'TWO_WAY_DECISION',
            'G_LEAGUE_DECISION'
        )
    ),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    potential_impact TEXT NOT NULL,
    cba_citation TEXT,
    source TEXT NOT NULL DEFAULT 'Official NBA Operations Master Schedule',
    verification_status TEXT NOT NULL DEFAULT 'VERIFIED_CURRENT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Additive fields for recommendations table
DO $$
BEGIN
    ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS basketball_reasoning TEXT;
    ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS financial_impact TEXT;
    ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS cba_mechanism TEXT;
    ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS risk TEXT;
    ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS alternative_action TEXT;
    ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS missing_information TEXT;
    ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS data_snapshot JSONB;
END $$;

-- Enable RLS and public read policies
ALTER TABLE draft_asset_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE injury_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on draft_asset_history" ON draft_asset_history FOR SELECT USING (true);
CREATE POLICY "Allow public read on injury_events" ON injury_events FOR SELECT USING (true);
CREATE POLICY "Allow public read on availability_events" ON availability_events FOR SELECT USING (true);
CREATE POLICY "Allow public read on source_conflicts" ON source_conflicts FOR SELECT USING (true);
CREATE POLICY "Allow public read on data_audit_log" ON data_audit_log FOR SELECT USING (true);
CREATE POLICY "Allow public read on decision_calendar_events" ON decision_calendar_events FOR SELECT USING (true);
