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

export interface DraftAsset {
  id: string;
  year: number;
  round: 1 | 2;
  original_team_id: string;
  current_controller_id: string;
  protection: string;
  swap_right: string | null;
  conveyance_terms: string;
  obligation: string;
  status_type: 'OWNED' | 'OWED' | 'SWAP' | 'PROTECTED' | 'CONDITIONAL';
  source: string;
  verification_state: EvidenceStatus;
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
  verification_state: EvidenceStatus;
  notes: string;
  is_current: boolean;
}

export interface AvailabilityEvent extends InjuryEvent {}

export interface ProspectRanking {
  outlet: string;
  rank: number;
  published_date: string;
  source_url: string;
}

export interface Prospect {
  id: string;
  full_name: string;
  projected_draft_year: number;
  position: string;
  height: string;
  weight: string;
  category: ProspectCategory;
  current_team_or_school: string;
  eligibility_status: ProspectEligibility;
  scouting_summary: string;
  rankings?: ProspectRanking[];
  verification_state: EvidenceStatus;
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
  failure_state: string | null;
  failure_message?: string;
  field_coverage: string[];
  license_or_access_notes: string;
  status: SourceStatus;
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
  problem: string;
  evidence: string;
  recommendation: string;
  alternatives: string[];
  financial_cost: string;
  basketball_benefit: string;
  cba_mechanism: string;
  risks: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  missing_information: string[];
  next_decision: string;
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
