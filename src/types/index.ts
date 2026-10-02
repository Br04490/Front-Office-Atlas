/**
 * Front Office Atlas - NBA Front-Office Intelligence Data Models
 * Supports future Supabase/PostgreSQL schema mappings and API connectors.
 * Context date: October 1, 2026 (2026-27 Preseason / Training Camp)
 */

export type Conference = 'Eastern' | 'Western';

export type Division = 
  | 'Atlantic' 
  | 'Central' 
  | 'Southeast' 
  | 'Northwest' 
  | 'Pacific' 
  | 'Southwest';

export type EvidenceStatus = 
  | 'VERIFIED_CURRENT'
  | 'REPORTED_CURRENT'
  | 'CALCULATED'
  | 'SCENARIO'
  | 'INCOMPLETE'
  | 'UNAVAILABLE'
  | 'VERIFICATION REQUIRED'
  | 'SOURCE PENDING'
  | 'DATA NOT CONNECTED'
  | 'VERIFIED CURRENT DATA'
  | 'REPORTED CURRENT DATA'
  | 'CALCULATED ESTIMATE'
  | 'CALCULATED ESTIMATE / SCENARIO'
  | 'INCOMPLETE / UNAVAILABLE';

// Backward compatibility alias
export type EvidenceState = EvidenceStatus | string;

export type RosterPhase = 
  | 'training_camp'
  | 'preseason'
  | 'opening_night'
  | 'regular_season'
  | 'postseason'
  | 'offseason';

export type RosterDesignation = 
  | 'NBA STANDARD'
  | 'TWO-WAY'
  | 'EXHIBIT 10'
  | 'CAMP'
  | 'NON-GUARANTEED'
  | 'PARTIALLY GUARANTEED'
  | 'TEAM OPTION'
  | 'PLAYER OPTION'
  | 'ROOKIE SCALE'
  | 'EXTENSION ELIGIBLE'
  | 'G LEAGUE ASSIGNMENT'
  | 'DEAD MONEY';

export type SourceStatus = 'LIVE' | 'STALE' | 'ERROR' | 'MANUAL' | 'UNAVAILABLE';

export type AuthorityLevel = 
  | 'OFFICIAL_LEAGUE' 
  | 'UNION_CBA' 
  | 'PRIMARY_MEDIA' 
  | 'ESTIMATED_ANALYTICS';

export type AvailabilityCategory = 
  | 'INJURY' 
  | 'REST' 
  | 'SUSPENSION' 
  | 'COACH DECISION' 
  | 'G LEAGUE ASSIGNMENT' 
  | 'OTHER';

export type ProspectCategory = 
  | 'COLLEGE' 
  | 'INTERNATIONAL' 
  | 'HIGH SCHOOL' 
  | 'YOUNGER PUBLIC RANKINGS';

export type ProspectEligibility = 'RANKED PROSPECT' | 'NBA DRAFT ELIGIBLE';

export type CbaAnswerState = 'YES' | 'NO' | 'CONDITIONAL' | 'INSUFFICIENT INFORMATION';

export type CbaRuleStatus = 'PASS' | 'FAIL' | 'CONDITIONAL' | 'INSUFFICIENT DATA';

export type CbaEraStatus = 'CURRENT CBA' | 'CONDITIONAL CBA' | 'FUTURE CBA UNKNOWN';

// --------------------------------------------------
// Provenance / Evidence Envelope
// --------------------------------------------------
export interface EvidenceEnvelope<T> {
  value: T;
  status: EvidenceStatus;
  source_id: string;
  source_url: string;
  retrieved_at: string;
  published_at?: string;
  effective_date: string;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW' | 'AUDITED';
  raw_value?: string | number | null;
  normalization_method?: string;
}

// --------------------------------------------------
// Core Entities
// --------------------------------------------------

export interface TeamColors {
  primary: string;
  secondary: string;
  accent: string;
  darkSurface: string;
}

export interface Team {
  id: string;
  slug: string;
  nba_team_id?: string;
  name: string;
  city: string;
  nickname: string;
  abbreviation: string;
  conference: Conference;
  division: Division;
  colors: TeamColors;
  arena: string;
  logo_url?: string;
  affiliateId: string | null;
  affiliateName: string;
  season: string;
  roster_phase: RosterPhase;
  dataStatus: EvidenceStatus;
  lastUpdated: string;
  retrieved_at: string;
  effective_date: string;
  verificationSource: string;
  preseason_record?: string;
}

export interface Affiliate {
  id: string;
  name: string;
  city: string;
  abbreviation: string;
  parentTeamId: string | null;
  parentTeamName: string | null;
  league: string;
  isIndependent: boolean;
  arena: string;
  dataStatus: EvidenceStatus;
  effective_date?: string;
}

export interface Player {
  player_id: string;
  nba_player_id: string | null;
  full_name: string;
  first_name: string;
  last_name: string;
  team_id: string;
  jersey_number: string;
  position: string;
  secondary_position?: string;
  age: number | null;
  date_of_birth: string | null;
  height: string;
  weight: string;
  nba_experience: string;
  college: string | null;
  international_origin: string | null;
  draft_year: number | null;
  draft_round: number | null;
  draft_pick: number | null;
  how_acquired: string;
  headshot_url: string | null;
  contract_type: string;
  roster_status: string;
  two_way_status: boolean;
  gleague_assignment_status: boolean;
  current_salary: number | null;
  current_cap_hit: number | null;
  guaranteed_amount: number | null;
  years_remaining: number | null;
  free_agency_year: number | null;
  option_type: string | null;
  extension_eligible: boolean;
  injury_status: string | null;
  data_status: EvidenceStatus;
  source_url: string | null;
  retrieved_at: string | null;
  effective_date?: string;
  roster_phase?: RosterPhase;
}

export interface ContractSeason {
  season: string;
  base_salary: number | null;
  cap_hit: number | null;
  guaranteed: number | null;
  option_type?: string | null;
  incentive_likely?: number | null;
  incentive_unlikely?: number | null;
  guarantee_date?: string | null;
}

export interface PlayerContract {
  contract_id: string;
  player_id: string;
  signing_date: string | null;
  contract_type: string;
  years_total: number;
  total_value: number | null;
  total_guaranteed: number | null;
  seasons: ContractSeason[];
  decision_dates: { label: string; date: string; description: string }[];
  bird_rights: string;
  trade_restriction: string | null;
  extension_eligible_date: string | null;
  source_id: string;
  data_status: EvidenceStatus;
}

export interface DeadMoney {
  id: string;
  team_id: string;
  player_name: string;
  season: string;
  amount: number;
  type: 'WAIVED' | 'STRETCHED' | 'BUYOUT';
  source_id: string;
  data_status: EvidenceStatus;
}

export interface CapHold {
  id: string;
  team_id: string;
  player_name: string;
  hold_type: 'FREE_AGENT' | 'FIRST_ROUND_PICK' | 'EXCEPTION';
  season: string;
  amount: number;
  source_id: string;
  data_status: EvidenceStatus;
}

export interface Exception {
  id: string;
  team_id: string;
  type: 'NON_TAXPAYER_MLE' | 'TAXPAYER_MLE' | 'ROOM_MLE' | 'BI_ANNUAL' | 'TRADE_EXCEPTION';
  total_amount: number;
  used_amount: number;
  remaining_amount: number;
  expires_at: string;
  hard_cap_consequence: boolean;
  source_id: string;
  data_status: EvidenceStatus;
}

export interface TeamCapSnapshot {
  team_id: string;
  season: string;
  effective_date: string;
  roster_phase: RosterPhase;
  // Crucial distinction: TEAM SALARY, APRON TEAM SALARY, and TAX TEAM SALARY are separate
  team_salary: number | null;
  apron_team_salary: number | null;
  tax_team_salary: number | null;
  active_payroll: number | null;
  dead_money: number | null;
  cap_holds: number | null;
  salary_floor: number;
  salary_cap: number;
  luxury_tax_threshold: number;
  first_apron: number;
  second_apron: number;
  salary_cap_room: number | null;
  luxury_tax_position: number | null;
  first_apron_room: number | null;
  second_apron_room: number | null;
  nba_roster_count: number;
  two_way_count: number;
  open_roster_spots: number;
  data_status: EvidenceStatus;
  tax_status_label: string;
  first_apron_status: 'BELOW' | 'ABOVE' | 'HARD_CAPPED' | 'INCOMPLETE';
  second_apron_status: 'BELOW' | 'ABOVE' | 'INCOMPLETE';
}

export interface CapThreshold {
  season: string;
  cba_era: CbaEraStatus;
  status: 'VERIFIED_CURRENT' | 'SCENARIO';
  verification_status: ThresholdVerificationStatus;
  salary_floor: number;
  salary_cap: number;
  luxury_tax: number;
  first_apron: number;
  second_apron: number;
  est_mid_level_nt: number;
  est_taxpayer_mle: number;
  room_exception: number;
  bi_annual_exception: number;
  min_salary_veteran: number;
  source_id: string;
  effective_date: string;
  notes: string;
}

export interface Transaction {
  id: string;
  date: string;
  team_id: string;
  player_id?: string;
  player_name: string;
  type: 
    | 'DRAFTED'
    | 'SIGNED'
    | 'EXTENDED'
    | 'TRADED'
    | 'WAIVED'
    | 'ASSIGNED'
    | 'RECALLED'
    | 'CONVERTED'
    | 'OPTION_DECISION';
  description: string;
  cba_article?: string;
  financial_impact?: string;
  source_id: string;
  data_status: EvidenceStatus;
}

export type DraftAssetType = 
  | 'OWN_PICK' 
  | 'INCOMING_PICK' 
  | 'OUTGOING_PICK' 
  | 'SWAP_RIGHT' 
  | 'CONDITIONAL_PICK' 
  | 'DRAFT_RIGHTS' 
  | 'UNKNOWN';

export type DraftTradeabilityStatus = 
  | 'VERIFIED_TRADEABLE' 
  | 'RESTRICTED' 
  | 'CONDITIONAL' 
  | 'ENCUMBERED' 
  | 'UNKNOWN';

export interface DraftAssetHistoryItem {
  date: string;
  transaction_id?: string;
  from_team_id: string;
  from_team_name?: string;
  to_team_id: string;
  to_team_name?: string;
  description: string;
  protection_terms_applied?: string;
  cba_rule?: string;
  source_url?: string;
}

export interface DraftAsset {
  id: string;
  year: number;
  draft_year?: number;
  round: 1 | 2;
  original_team_id: string;
  original_team_name?: string;
  current_controller_id: string;
  current_owner_team_id?: string;
  current_owner_team_name?: string;
  asset_type?: DraftAssetType;
  protection?: string;
  protection_type?: string;
  protection_details?: string;
  swap_right: string | null;
  swap_rights?: boolean;
  swap_partner_team_id?: string;
  swap_partner_team_name?: string;
  conveyance_terms: string;
  conveyance_conditions?: string;
  rollover_conditions?: string;
  extinguishment_conditions?: string;
  tradeability_status?: DraftTradeabilityStatus;
  obligation: string;
  status_type: 'OWNED' | 'OWED' | 'SWAP' | 'PROTECTED' | 'CONDITIONAL';
  source: string;
  source_id?: string;
  source_url?: string;
  effective_date?: string;
  retrieved_at?: string;
  verification_state: EvidenceStatus;
  verification_status?: string;
  notes?: string;
  asset_history?: DraftAssetHistoryItem[];
}

export interface InjuryEvent {
  id: string;
  player_name: string;
  player_id?: string;
  team_id: string;
  category: AvailabilityCategory;
  date: string;
  body_area: string | null;
  reason: string;
  games_missed: number | null;
  return_date: string | null;
  source: string;
  source_url?: string;
  published_at?: string;
  retrieved_at?: string;
  verification_state: EvidenceStatus;
  verification_status?: string;
  notes: string;
  is_current: boolean;
}

export interface AvailabilityEvent {
  id?: string;
  player_id?: string;
  player_name?: string;
  game_id?: string;
  game_date: string;
  opponent?: string;
  status: 'PLAYED' | 'LIMITED' | 'OUT' | 'DNP' | 'SUSPENDED' | 'G_LEAGUE' | 'UNKNOWN';
  minutes_played?: number;
  starter?: boolean;
  public_reason?: string;
  source: string;
  retrieved_at?: string;
  verification_status?: string;
}

export interface TeamAvailabilityOverview {
  team_id: string;
  team_slug: string;
  team_name: string;
  games_missed_total: number;
  games_available_total: number;
  availability_pct: number;
  currently_unavailable_count: number;
  currently_unavailable_players: Array<{
    player_id: string;
    player_name: string;
    position: string;
    status: string;
    public_reason: string;
    source: string;
    expected_return?: string;
  }>;
  recent_trend: 'STABLE' | 'IMPROVING' | 'ELEVATED_LOAD';
  as_of_date: string;
}

export interface ProspectRanking {
  outlet: string;
  rank: number;
  position_rank?: number;
  published_date: string;
  source_url: string;
}

export type ProspectEligibilityStatus = 
  | 'DRAFT_ELIGIBLE' 
  | 'EXPECTED_ELIGIBLE' 
  | 'NOT_CURRENTLY_ELIGIBLE' 
  | 'ELIGIBILITY_UNVERIFIED';

export interface Prospect {
  id: string;
  external_player_id?: string;
  full_name: string;
  date_of_birth?: string;
  age?: number;
  wingspan?: string;
  projected_draft_year: number;
  position: string;
  secondary_position?: string;
  height: string;
  weight: string;
  category: ProspectCategory;
  current_team_or_school: string;
  league?: string;
  country?: string;
  school_or_club?: string;
  draft_eligibility_status?: ProspectEligibilityStatus;
  eligibility_status: ProspectEligibility;
  class_year?: string;
  headshot_url?: string;
  scouting_summary: string;
  rankings?: ProspectRanking[];
  verification_state: EvidenceStatus;
  verification_status?: string;
  source?: string;
  retrieved_at?: string;
  // Deep skill grades
  skill_grades?: {
    shooting: number;
    finishing: number;
    playmaking: number;
    defense: number;
    athleticism: number;
    iq: number;
  };
}

export interface ProspectDraftFit {
  prospect_id: string;
  team_id: string;
  team_slug: string;
  team_name: string;
  roster_need_alignment: string;
  role_overlap: string;
  development_opportunity: string;
  timeline_alignment: string;
  positional_depth_context: string;
  contract_timeline_context: string;
  shot_profile_fit: string;
  defensive_system_fit: string;
}

export interface SourceRecord {
  id: string;
  source_name: string;
  source_url: string;
  data_category: string;
  authority_level: AuthorityLevel;
  refresh_interval: string;
  last_attempt: string;
  last_success: string;
  last_effective_date?: string;
  record_count?: number;
  access_method?: string;
  failure_state: string | null;
  failure_message?: string;
  field_coverage: string[];
  license_or_access_notes: string;
  status: SourceStatus;
}

export interface SourceConflict {
  id: string;
  entity_type: 'PLAYER' | 'CONTRACT' | 'DRAFT_ASSET' | 'INJURY' | 'CAP';
  entity_id: string;
  entity_name: string;
  field_name: string;
  value_a: string;
  source_a: string;
  value_b: string;
  source_b: string;
  detected_at: string;
  resolution_status: 'PENDING' | 'RESOLVED' | 'FLAGGED_UNRESOLVABLE';
  resolved_value?: string;
  resolution_note?: string;
}

export interface DataAuditLogItem {
  id: string;
  timestamp: string;
  job: string;
  entity_type: string;
  entity_id: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE' | 'VERIFY' | 'RECONCILE';
  old_value?: string;
  new_value?: string;
  source: string;
  actor_or_process: string;
  notes?: string;
}

export interface DecisionCalendarItem {
  id: string;
  date: string;
  category: 
    | 'CONTRACT_GUARANTEE'
    | 'OPTION_DEADLINE'
    | 'EXTENSION_DATE'
    | 'FREE_AGENCY'
    | 'TRADE_ELIGIBILITY'
    | 'TRADE_RESTRICTION'
    | 'EXCEPTION_EXPIRATION'
    | 'DRAFT_DEADLINE'
    | 'DRAFT_PICK_CONVEYANCE'
    | 'ROSTER_CUT_DATE'
    | 'TWO_WAY_DECISION'
    | 'G_LEAGUE_DECISION';
  player_or_asset: string;
  team_slug: string;
  decision_title: string;
  description: string;
  potential_impact: string;
  cba_citation?: string;
  source: string;
  verification_status: string;
}

export interface AskAtlasStructuredQuery {
  intent: 
    | 'PLAYER_SEARCH'
    | 'TEAM_SEARCH'
    | 'ROSTER_FILTER'
    | 'CONTRACT_SEARCH'
    | 'SALARY_FILTER'
    | 'CAP_QUERY'
    | 'TRADE_QUERY'
    | 'DRAFT_QUERY'
    | 'G_LEAGUE_QUERY'
    | 'TWO_WAY_QUERY'
    | 'PROGRESSION_QUERY'
    | 'LINEUP_QUERY'
    | 'SCOUTING_QUERY'
    | 'AVAILABILITY_QUERY'
    | 'PROSPECT_QUERY'
    | 'SOURCE_QUERY';
  query_text: string;
  target_team?: string;
  target_player?: string;
  filters?: Record<string, any>;
}

export interface AskAtlasResponse {
  question: string;
  intent: string;
  answer: string;
  key_data: Array<{ label: string; value: string | number; detail?: string }>;
  why_it_matters: string;
  filters_and_assumptions: string[];
  as_of_date: string;
  sources: Array<{ name: string; url?: string; citation?: string; verification_status: string }>;
  is_insufficient_data?: boolean;
}

export interface CbaRuleArticle {
  rule_id?: string;
  agreement_version?: string;
  article_number: string;
  section: string;
  subsection?: string;
  page?: string;
  title: string;
  summary: string;
  plain_english: string;
  restrictions: string[];
  first_apron_consequences?: string[];
  second_apron_consequences?: string[];
  source_document?: string;
  source_url?: string;
}

export interface CbaRule extends CbaRuleArticle {}

export interface CbaAgentResponse {
  query: string;
  answer_state: CbaAnswerState;
  answer: string;
  plain_english_explanation: string;
  rule_basis: {
    article: string;
    section: string;
    subsection?: string;
    page_reference: string;
    citation: string;
  };
  team_impact: string;
  player_impact?: string;
  transaction_impact?: string;
  calculation: string | null;
  missing_information: string[];
  source: string;
  evidence_status: EvidenceStatus;
  disclaimer: string;
}

export interface TradeScenario {
  scenario_id: string;
  name: string;
  created_at: string;
  teams: string[];
  assets_by_team: Record<string, { players: string[]; draft_picks: string[] }>;
  cba_screening_results: Record<string, CbaRuleStatus>;
  salary_deltas: Record<string, { incoming: number; outgoing: number; net_delta: number }>;
  apron_impacts: Record<string, string>;
  cba_version: string;
  warnings: string[];
  data_status: EvidenceStatus;
}

export interface Recommendation {
  recommendation_id: string;
  team_id: string;
  title?: string;
  category?: 'ROSTER' | 'CONTRACT' | 'TRADE' | 'DEVELOPMENT' | 'G_LEAGUE' | 'DRAFT' | 'FINANCIAL' | 'SCOUTING' | 'OTHER';
  summary?: string;
  problem: string;
  evidence: string;
  recommendation: string;
  alternatives: string[];
  financial_cost: string;
  financial_impact?: string;
  basketball_benefit: string;
  basketball_reasoning?: string;
  cba_mechanism: string;
  risks: string[];
  risk?: string;
  alternative_action?: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  missing_information: string[];
  next_decision: string;
  status?: 'ACTIVE' | 'INCOMPLETE_ANALYSIS' | 'IMPLEMENTED' | 'SUPERSEDED';
  data_snapshot?: Record<string, any>;
  created_at?: string;
}

export interface GMBriefData {
  team_id: string;
  season: string;
  effective_date: string;
  current_state: string;
  cap_position: string;
  key_constraints: string[];
  roster_gaps: string[];
  injury_availability_risk: string;
  draft_position: string;
  gleague_pipeline: string;
  biggest_risks: string[];
  best_opportunities: string[];
  next_three_actions: string[];
  recommendations?: Recommendation[];
  data_status: EvidenceStatus;
}

export interface RosterMembership {
  id: string;
  team_id: string;
  player_id: string;
  season: string;
  effective_date: string;
  roster_phase: RosterPhase;
  designation: RosterDesignation;
  is_active: boolean;
  source_id: string;
}

export interface GLeagueRelationship {
  id: string;
  parent_team_id: string;
  affiliate_id: string;
  active_assignments: string[];
  recalls: string[];
  returning_rights: string[];
  draft_rights: string[];
  tryout_pool: string[];
}

// --------------------------------------------------
// Player Intelligence & Advanced Performance Types
// --------------------------------------------------

export type GameAvailabilityState = 'PLAYED' | 'LIMITED' | 'MISSED' | 'DNP' | 'SUSPENSION' | 'G_LEAGUE';

export interface GamePlayerStat {
  game_id: string;
  game_date: string;
  season: string;
  opponent: string;
  is_home: boolean;
  is_starter: boolean;
  minutes: number;
  points: number;
  assists: number;
  rebounds: number;
  offensive_rebounds?: number;
  defensive_rebounds?: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fg_made: number;
  fg_attempted: number;
  fg_pct: number;
  three_made: number;
  three_attempted: number;
  three_pct: number;
  ft_made: number;
  ft_attempted: number;
  ft_pct: number;
  rim_attempts: number;
  usage_pct: number;
  true_shooting_pct: number;
  on_off_net: number;
  offensive_rating: number;
  defensive_rating: number;
  net_rating: number;
  status: GameAvailabilityState;
  dnp_reason?: string;
  source: string;
}

export interface PlayerSeasonAggregate {
  season: string;
  games_played: number;
  games_started: number;
  mpg: number;
  ppg: number;
  apg: number;
  rpg: number;
  spg: number;
  bpg: number;
  topg: number;
  fg_pct: number;
  three_pct: number;
  ft_pct: number;
  ts_pct: number;
  usg_pct: number;
  ast_pct: number;
  tov_pct: number;
  rim_freq: number;
  rim_fg_pct: number;
  on_off_net: number;
  ortg: number;
  drtg: number;
  net_rating: number;
  is_live?: boolean;
}

export interface PlayerProgressionSnapshot {
  player_id: string;
  baselines: {
    '2024-25': PlayerSeasonAggregate;
    '2025-26': PlayerSeasonAggregate;
    '2026-27_LIVE': PlayerSeasonAggregate;
  };
  metrics_comparison: Array<{
    metric: string;
    label: string;
    val_24_25: number;
    val_25_26: number;
    val_26_27_live: number;
    change_pct: number;
    trend: 'UP' | 'DOWN' | 'FLAT';
  }>;
}

export type SkillGradeLetter = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'F';

export interface SkillGradeItem {
  statistic: string;
  category: 'Finishing' | 'Shooting' | 'Playmaking' | 'Ball Security' | 'Rebounding' | 'Perimeter Defense' | 'Interior Defense' | 'Screen Navigation' | 'Defensive Versatility';
  value: string | number;
  percentile: number;
  grade: SkillGradeLetter;
}

export interface ShotZoneProfile {
  zone: 'Rim' | 'Paint Non-Rim' | 'Short Midrange' | 'Long Midrange' | 'Corner 3' | 'Above-Break 3';
  attempts_per_game: number;
  frequency_pct: number;
  fg_pct: number;
  league_avg_pct: number;
  relative_efficiency: number; // e.g. +4.2%
  league_percentile: number;
}

export interface LineupCombination {
  type: '2-Man' | '3-Man' | '5-Man';
  teammates: string[];
  minutes: number;
  possessions: number;
  offensive_rating: number;
  defensive_rating: number;
  net_rating: number;
  pace: number;
  ts_pct: number;
  rebound_pct: number;
}

export interface PeerCohort {
  id: string;
  cohort_name: string;
  position_category: string;
  age_range: string;
  role_description: string;
  median_salary: number;
  median_aav: number;
  highest_paid_salary: number;
  highest_paid_player: string;
  lowest_paid_salary: number;
  lowest_paid_player: string;
  cohort_size: number;
}

export interface ContractBenchmark {
  player_id: string;
  cohort: PeerCohort;
  player_salary: number;
  median_salary: number;
  diff_from_median: number;
  salary_percentile: number;
  production_percentile: number;
  value_quadrant: 'High Production / Low Cost' | 'High Production / High Cost' | 'Low Production / Low Cost' | 'Low Production / High Cost';
  modeled_estimate_salary?: number;
  data_label: string; // 'OBSERVED CONTRACT MARKET DATA' vs 'MODELED CONTRACT ESTIMATE'
}

export interface TwoWayTrackingRecord {
  id: string;
  player_name: string;
  player_id: string;
  nba_player_id?: string;
  team_id: string;
  team_name: string;
  affiliate_name: string;
  contract_status: 'TWO_WAY' | 'CONVERTED_STANDARD' | 'ASSIGNED' | 'RECALLED' | 'WAIVED';
  nba_games_played: number;
  nba_active_list_days: number;
  max_active_list_days: number; // 50 games cap
  gleague_games_played: number;
  current_location: 'NBA ACTIVE ROSTER' | 'G LEAGUE ASSIGNMENT' | 'TRAVEL';
  recent_action: string;
  conversion_eligible: boolean;
  effective_date: string;
}

export interface TeamBusinessValuation {
  team_id: string;
  team_name: string;
  team_slug: string;
  current_franchise_valuation: number; // e.g. 4.4B
  one_year_change_pct: number;
  annual_revenue: number;
  operating_income: number;
  debt_to_value_pct: number;
  arena_status: string;
  valuation_multiple: number;
  source_attribution: string;
  published_date: string;
  reporting_type: 'MANUAL / REPORTED SOURCE';
  methodology_notes: string;
}

// --------------------------------------------------
// CBA Versioning & Governing Agreement Architecture
// --------------------------------------------------
export type CbaAgreementStatus = 'ACTIVE_RATIFIED' | 'CONDITIONAL' | 'EXPIRED' | 'PENDING_RATIFICATION';

export interface CbaVersionModel {
  agreement_name: string;
  effective_date: string;
  expiration_date: string;
  opt_out_date: string;
  status: CbaAgreementStatus;
  source_url: string;
  document_version: string;
  retrieved_at: string;
  summary_notes: string;
}

export type ThresholdVerificationStatus = 'OFFICIAL' | 'PROJECTED' | 'CALCULATED' | 'UNKNOWN';

export type ContractOptionType = 
  | 'NONE'
  | 'TEAM_OPTION'
  | 'PLAYER_OPTION'
  | 'EARLY_TERMINATION_OPTION'
  | 'QUALIFYING_OFFER'
  | 'NON_GUARANTEED'
  | 'PARTIAL_GUARANTEE'
  | 'UNKNOWN';

// --------------------------------------------------
// Trade Rule Ledger & Deterministic Validation Architecture
// --------------------------------------------------
export type TradeRuleStatusType = 'PASS' | 'FAIL' | 'CONDITIONAL' | 'NOT_APPLICABLE' | 'INSUFFICIENT_DATA';

export interface TradeRuleLedgerItem {
  rule_key: string;
  title: string;
  topic: string;
  status: TradeRuleStatusType;
  inputs: {
    team_slug: string;
    incoming_salary?: number;
    outgoing_salary?: number;
    pre_trade_apron_salary?: number;
    post_trade_apron_salary?: number;
    trade_match_ceiling?: number;
    details?: string;
  };
  calculation: string;
  explanation: string;
  citation: {
    article: string;
    section: string;
    subsection?: string;
    page?: string;
    source_document: string;
    source_url?: string;
  };
  missing_information?: string[];
}

export interface TradeTeamFinancialSummary {
  team_slug: string;
  team_name: string;
  before: {
    team_salary: number;
    tax_salary: number;
    apron_salary: number;
    distance_to_tax: number;
    distance_to_first_apron: number;
    distance_to_second_apron: number;
    roster_count: number;
    hard_cap_status: 'NONE' | 'FIRST_APRON' | 'SECOND_APRON';
  };
  after: {
    team_salary: number;
    tax_salary: number;
    apron_salary: number;
    distance_to_tax: number;
    distance_to_first_apron: number;
    distance_to_second_apron: number;
    roster_count: number;
    hard_cap_status: 'NONE' | 'FIRST_APRON' | 'SECOND_APRON';
  };
  change: {
    salary_delta: number;
    tax_room_delta: number;
    first_apron_delta: number;
    second_apron_delta: number;
    roster_delta: number;
    new_hard_cap_triggered: boolean;
    trade_exceptions_created?: number;
    trade_exceptions_consumed?: number;
  };
}

export interface TradeValidationReport {
  is_legal: boolean;
  legal_status: 'SUCCESS_CONFIRMED' | 'FAILED_PROHIBITED' | 'CONDITIONAL_APPROVAL' | 'INSUFFICIENT_DATA';
  rule_ledger: TradeRuleLedgerItem[];
  team_summaries: Record<string, TradeTeamFinancialSummary>;
  primary_reason: string;
  timestamp: string;
  as_of_date: string;
  disclaimer: string;
}

// --------------------------------------------------
// Cap Decision Calendar & Reconciliation
// --------------------------------------------------
export type CapDecisionType = 
  | 'OPTION_DEADLINE'
  | 'GUARANTEE_DATE'
  | 'EXTENSION_ELIGIBILITY'
  | 'FREE_AGENCY'
  | 'TRADE_RESTRICTION_EXPIRATION'
  | 'EXCEPTION_EXPIRATION'
  | 'HARD_CAP_IMPLICATION'
  | 'DRAFT_PICK_OBLIGATION';

export interface CapDecisionEvent {
  id: string;
  date: string;
  team_id: string;
  player_name?: string;
  asset_name?: string;
  decision_type: CapDecisionType;
  financial_impact: string;
  description: string;
  source: string;
  source_url?: string;
  verification_status: EvidenceStatus;
}

export interface CapReconciliationRecord {
  team_id: string;
  team_slug: string;
  team_name: string;
  season: string;
  as_of_date: string;
  contracts_sum: number;
  dead_money_sum: number;
  cap_holds_sum: number;
  exceptions_total: number;
  calculated_team_salary: number;
  published_official_salary: number;
  reconciliation_difference: number;
  status: 'VERIFIED_RECONCILED' | 'RECONCILIATION_REQUIRED';
  notes: string;
  source: string;
}

export interface MultiYearCommitmentSnapshot {
  team_slug: string;
  seasons: Array<{
    season: string;
    cba_era: CbaEraStatus;
    threshold_status: ThresholdVerificationStatus;
    salary_cap: number;
    luxury_tax: number;
    first_apron: number;
    second_apron: number;
    committed_guaranteed: number;
    optional_salary: number;
    partial_guaranteed: number;
    non_guaranteed: number;
    dead_money: number;
    cap_holds: number;
    projected_total_commitments: number;
    cap_space_or_overage: number;
  }>;
}

export interface SavedTradeScenario {
  scenario_id: string;
  name: string;
  created_at: string;
  last_calculated_at: string;
  teams: string[];
  assets_by_team: Record<string, { players: string[]; draft_picks: string[] }>;
  team_summaries: Record<string, TradeTeamFinancialSummary>;
  rule_ledger: TradeRuleLedgerItem[];
  cba_legal_status: 'SUCCESS_CONFIRMED' | 'FAILED_PROHIBITED' | 'CONDITIONAL_APPROVAL' | 'INSUFFICIENT_DATA';
  notes: string;
  source_snapshot_id: string;
}


