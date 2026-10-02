-- ==============================================================================
-- FRONT OFFICE ATLAS - CBA VERSIONING, CONTRACT DATA MODEL & TRADE LAB EXPANSION
-- Migration: 005_cba_versioning_and_trade_lab.sql
-- Additive migration preserving all existing tables and data structures.
-- ==============================================================================

-- 1. CBA Versions Table (Explicit Agreement Versioning & Governance)
CREATE TABLE IF NOT EXISTS cba_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_name TEXT NOT NULL,
    effective_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    opt_out_date DATE,
    status TEXT NOT NULL DEFAULT 'RATIFIED_ACTIVE' CHECK (
        status IN ('RATIFIED_ACTIVE', 'SUPERSEDED', 'PENDING_RATIFICATION', 'FUTURE_CBA_REQUIRED')
    ),
    source_url TEXT NOT NULL DEFAULT 'https://img.nbpa.com/collective-bargaining-agreement-2023.pdf',
    document_version TEXT NOT NULL DEFAULT '2023-2030 Ratified Agreement',
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed ratified 2023 CBA agreement
INSERT INTO cba_versions (id, agreement_name, effective_date, expiration_date, opt_out_date, status, source_url, document_version)
VALUES (
    'cba00000-0000-0000-0000-000000002023',
    '2023 NBA-NBPA Collective Bargaining Agreement',
    '2023-07-01',
    '2030-06-30',
    '2028-12-15',
    'RATIFIED_ACTIVE',
    'https://img.nbpa.com/collective-bargaining-agreement-2023.pdf',
    '2023-2030 Ratified Agreement (Post-Ratification Signed Master)'
) ON CONFLICT DO NOTHING;

-- 2. Cap Thresholds Additive Columns & Verification Status
DO $$
BEGIN
    ALTER TABLE cap_thresholds ADD COLUMN IF NOT EXISTS salary_floor NUMERIC(14, 2);
    ALTER TABLE cap_thresholds ADD COLUMN IF NOT EXISTS cba_era TEXT DEFAULT '2023 CBA';
    ALTER TABLE cap_thresholds ADD COLUMN IF NOT EXISTS cba_version_id UUID REFERENCES cba_versions(id);
    ALTER TABLE cap_thresholds ADD COLUMN IF NOT EXISTS effective_date DATE DEFAULT '2026-07-01';
    ALTER TABLE cap_thresholds ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE cap_thresholds ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
END $$;

-- 3. Contract & Contract Seasons Additive Columns
DO $$
BEGIN
    -- Audit & expand contracts table
    ALTER TABLE contracts ADD COLUMN IF NOT EXISTS bird_rights_status TEXT DEFAULT 'FULL_BIRD';
    ALTER TABLE contracts ADD COLUMN IF NOT EXISTS trade_restriction_status TEXT DEFAULT 'NONE';
    ALTER TABLE contracts ADD COLUMN IF NOT EXISTS free_agency_type TEXT DEFAULT 'UFA';
    ALTER TABLE contracts ADD COLUMN IF NOT EXISTS guaranteed_value NUMERIC(14, 2);
    ALTER TABLE contracts ADD COLUMN IF NOT EXISTS source_url TEXT DEFAULT 'https://data.nba.com/v1/league_operations';
    ALTER TABLE contracts ADD COLUMN IF NOT EXISTS retrieved_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE contracts ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'REPORTED_CURRENT_DATA';

    -- Audit & expand contract_seasons table
    ALTER TABLE contract_seasons ADD COLUMN IF NOT EXISTS base_salary NUMERIC(14, 2);
    ALTER TABLE contract_seasons ADD COLUMN IF NOT EXISTS tax_salary NUMERIC(14, 2);
    ALTER TABLE contract_seasons ADD COLUMN IF NOT EXISTS apron_salary NUMERIC(14, 2);
    ALTER TABLE contract_seasons ADD COLUMN IF NOT EXISTS guaranteed_amount NUMERIC(14, 2);
    ALTER TABLE contract_seasons ADD COLUMN IF NOT EXISTS guarantee_status TEXT DEFAULT 'GUARANTEED';
    ALTER TABLE contract_seasons ADD COLUMN IF NOT EXISTS option_type TEXT DEFAULT 'NONE';
    ALTER TABLE contract_seasons ADD COLUMN IF NOT EXISTS option_deadline DATE;
    ALTER TABLE contract_seasons ADD COLUMN IF NOT EXISTS incentive_type TEXT DEFAULT 'NONE';
    ALTER TABLE contract_seasons ADD COLUMN IF NOT EXISTS likely_incentives NUMERIC(14, 2) DEFAULT 0;
    ALTER TABLE contract_seasons ADD COLUMN IF NOT EXISTS unlikely_incentives NUMERIC(14, 2) DEFAULT 0;
    ALTER TABLE contract_seasons ADD COLUMN IF NOT EXISTS trade_bonus NUMERIC(5, 2) DEFAULT 0;
    ALTER TABLE contract_seasons ADD COLUMN IF NOT EXISTS free_agency_after_season TEXT;
    ALTER TABLE contract_seasons ADD COLUMN IF NOT EXISTS extension_eligibility_date DATE;
    ALTER TABLE contract_seasons ADD COLUMN IF NOT EXISTS notes TEXT;
END $$;

-- 4. Dead Money Additive Columns
DO $$
BEGIN
    ALTER TABLE dead_money ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'NBA Official Cap Register';
    ALTER TABLE dead_money ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'VERIFIED_CURRENT';
END $$;

-- 5. Trade Scenarios & Items Table (Deterministic Trade Lab Engine Storage)
CREATE TABLE IF NOT EXISTS trade_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    season TEXT NOT NULL DEFAULT '2026-27',
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUCCESS_CONFIRMED', 'FAILED_PROHIBITED', 'INSUFFICIENT_DATA')),
    primary_reason TEXT,
    validation_summary JSONB DEFAULT '{}'::jsonb,
    cba_version_id UUID REFERENCES cba_versions(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trade_scenario_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES trade_scenarios(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id),
    player_id UUID REFERENCES players(id),
    asset_type TEXT NOT NULL CHECK (asset_type IN ('PLAYER', 'DRAFT_PICK', 'CASH', 'TRADE_EXCEPTION')),
    direction TEXT NOT NULL CHECK (direction IN ('OUTGOING', 'INCOMING')),
    financial_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Cap Reconciliation Records Table
CREATE TABLE IF NOT EXISTS cap_reconciliation_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    season TEXT NOT NULL DEFAULT '2026-27',
    as_of_date DATE NOT NULL DEFAULT CURRENT_DATE,
    contracts_sum NUMERIC(14, 2) NOT NULL,
    dead_money_sum NUMERIC(14, 2) NOT NULL DEFAULT 0,
    cap_holds_sum NUMERIC(14, 2) NOT NULL DEFAULT 0,
    exceptions_total NUMERIC(14, 2) NOT NULL DEFAULT 0,
    calculated_team_salary NUMERIC(14, 2) NOT NULL,
    published_official_salary NUMERIC(14, 2) NOT NULL,
    reconciliation_difference NUMERIC(14, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'VERIFIED_RECONCILED' CHECK (
        status IN ('VERIFIED_RECONCILED', 'RECONCILIATION_REQUIRED', 'PENDING_AUDIT')
    ),
    notes TEXT,
    source TEXT NOT NULL DEFAULT 'Official NBA League Operations Cap & Tax Register',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS and public read access
ALTER TABLE cba_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_scenario_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cap_reconciliation_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on cba_versions" ON cba_versions FOR SELECT USING (true);
CREATE POLICY "Allow public read on trade_scenarios" ON trade_scenarios FOR SELECT USING (true);
CREATE POLICY "Allow public read on trade_scenario_items" ON trade_scenario_items FOR SELECT USING (true);
CREATE POLICY "Allow public read on cap_reconciliation_records" ON cap_reconciliation_records FOR SELECT USING (true);
