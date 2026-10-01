import { Player, PlayerContract } from '../types';

/**
 * Verified Roster Registry
 * Empty by default as mandated by front-office accuracy protocol:
 * "Do NOT fabricate NBA player names, contracts, salaries, injuries, draft picks,
 * CBA rules, or roster information."
 * When verified data is connected via Supabase/API, records populated here
 * or from API will render automatically in TeamPage and TradeLab without redesign.
 */
export const VERIFIED_ROSTER_REGISTRY: Record<string, Player[]> = {};

/**
 * Architectural Schema Specimen
 * Used strictly for UI verification of the PlayerCard and PlayerDetailDrawer
 * without fabricating current NBA player facts.
 */
export const ARCHITECTURAL_SCHEMA_SPECIMEN: Player = {
  player_id: 'specimen_001',
  nba_player_id: null,
  full_name: 'Architectural Specimen',
  first_name: 'Architectural',
  last_name: 'Specimen',
  team_id: 'houston-rockets',
  jersey_number: '00',
  position: 'Guard / Wing',
  secondary_position: 'Wing',
  age: 23,
  date_of_birth: null,
  height: '6-6',
  weight: '215 lbs',
  nba_experience: '3 Years',
  college: 'NCAA Division I (Pending Verification)',
  international_origin: null,
  draft_year: 2023,
  draft_round: 1,
  draft_pick: 4,
  how_acquired: 'Draft Rights',
  headshot_url: null, // Tests the team-colored avatar fallback
  contract_type: 'Rookie Scale (Standard NBA)',
  roster_status: 'Active Roster',
  two_way_status: false,
  gleague_assignment_status: false,
  current_salary: 8500000,
  current_cap_hit: 8500000,
  guaranteed_amount: 8500000,
  years_remaining: 2,
  free_agency_year: 2027,
  option_type: 'Team Option (2026-27)',
  extension_eligible: true,
  injury_status: 'Healthy / Available',
  data_status: 'VERIFICATION REQUIRED',
  source_url: 'https://nbpa.com/cba',
  retrieved_at: '2026-10-01 12:00:00 UTC',
};

export const ARCHITECTURAL_SPECIMEN_CONTRACT: PlayerContract = {
  contract_id: 'c_specimen_001',
  player_id: 'specimen_001',
  signing_date: '2023-07-03',
  contract_type: 'Rookie Scale Extension Eligible',
  years_total: 4,
  total_value: 34000000,
  total_guaranteed: 25500000,
  seasons: [
    { season: '2024-25', base_salary: 7600000, cap_hit: 7600000, guaranteed: 7600000 },
    { season: '2025-26', base_salary: 8000000, cap_hit: 8000000, guaranteed: 8000000 },
    { season: '2026-27', base_salary: 8500000, cap_hit: 8500000, guaranteed: 8500000, option_type: 'Team Option' },
    { season: '2027-28', base_salary: 9900000, cap_hit: 9900000, guaranteed: 0, option_type: 'Qualifying Offer' },
  ],
  decision_dates: [
    { label: 'Team Option Exercise Deadline', date: 'October 31, 2026', description: 'Deadline to exercise 4th-year team option for 2027-28 season.' },
    { label: 'Rookie Scale Extension Deadline', date: 'October 19, 2026', description: 'Window closes for rookie scale veteran extension prior to start of regular season.' },
  ],
  bird_rights: 'Full Bird Rights',
  trade_restriction: null,
  extension_eligible_date: 'July 6, 2026',
  source_id: 'src_front_office_contracts',
  data_status: 'VERIFICATION REQUIRED',
};
