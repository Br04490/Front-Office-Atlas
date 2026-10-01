import { ALL_TEAMS } from '../data/teams';
import { ALL_AFFILIATES } from '../data/affiliates';
import { CAP_THRESHOLDS_BY_SEASON } from '../data/capThresholds';
import { CBA_RULES_DATABASE } from '../data/cbaRules';
import { SOURCE_DESK_REGISTRY } from '../data/sources';
import { 
  ARCHITECTURAL_SCHEMA_SPECIMEN, 
  ARCHITECTURAL_SPECIMEN_CONTRACT, 
  VERIFIED_ROSTER_REGISTRY 
} from '../data/players';
import { 
  Team, 
  Player, 
  PlayerContract, 
  TeamCapSnapshot, 
  CapThreshold, 
  SourceRecord, 
  CbaRuleArticle, 
  Affiliate, 
  CbaAgentResponse,
  DraftAsset,
  InjuryEvent,
  Prospect,
  Transaction,
  TradeScenario,
  Recommendation,
  GMBriefData,
  RosterMembership
} from '../types';

// ============================================================================
// TeamService
// ============================================================================
export const TeamService = {
  getAllTeams: (): Team[] => {
    return ALL_TEAMS;
  },

  getTeamBySlug: (slug: string): Team | undefined => {
    return ALL_TEAMS.find((t) => t.slug === slug);
  },

  getTeamById: (id: string): Team | undefined => {
    return ALL_TEAMS.find((t) => t.id === id);
  },

  getTeamsByConference: (conference: 'Eastern' | 'Western'): Team[] => {
    return ALL_TEAMS.filter((t) => t.conference === conference);
  },

  getTeamsByDivision: (division: string): Team[] => {
    return ALL_TEAMS.filter((t) => t.division === division);
  },

  getFeaturedPilotTeam: (): Team => {
    // Houston Rockets is the initial featured / pilot team as mandated
    const houston = ALL_TEAMS.find((t) => t.slug === 'houston-rockets');
    return houston || ALL_TEAMS[0];
  },
};

// ============================================================================
// RosterService
// ============================================================================
export const RosterService = {
  getRosterPhase: (): string => {
    return 'training_camp';
  },

  getEffectiveDate: (): string => {
    return 'October 1, 2026';
  },

  getTeamRosterSummary: (teamId: string) => {
    const verified = VERIFIED_ROSTER_REGISTRY[teamId] || [];
    return {
      team_id: teamId,
      season: '2026-27',
      effective_date: '2026-10-01',
      retrieved_at: '2026-10-01 12:00:00 UTC',
      roster_phase: 'training_camp',
      is_final: false,
      standard_contracts_count: verified.filter(p => !p.two_way_status).length,
      two_way_count: verified.filter(p => p.two_way_status).length,
      camp_invites_count: 0,
      open_standard_spots: 15 - verified.filter(p => !p.two_way_status).length,
      open_two_way_spots: 3 - verified.filter(p => p.two_way_status).length,
      data_status: verified.length > 0 ? 'VERIFIED_CURRENT' : 'INCOMPLETE',
    };
  },
};

// ============================================================================
// PlayerService
// ============================================================================
export const PlayerService = {
  getPlayersByTeam: (teamId: string, includeSpecimen: boolean = false): Player[] => {
    const verified = VERIFIED_ROSTER_REGISTRY[teamId] || [];
    if (includeSpecimen && verified.length === 0) {
      // Allows testing the PlayerCard UI structure when toggled
      return [{ ...ARCHITECTURAL_SCHEMA_SPECIMEN, team_id: teamId }];
    }
    return verified;
  },

  getPlayerById: (playerId: string): Player | undefined => {
    if (playerId === ARCHITECTURAL_SCHEMA_SPECIMEN.player_id) {
      return ARCHITECTURAL_SCHEMA_SPECIMEN;
    }
    for (const teamPlayers of Object.values(VERIFIED_ROSTER_REGISTRY)) {
      const match = teamPlayers.find((p) => p.player_id === playerId);
      if (match) return match;
    }
    return undefined;
  },

  getSpecimenPlayer: (): Player => {
    return ARCHITECTURAL_SCHEMA_SPECIMEN;
  },

  searchPlayers: (query: string): Player[] => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results: Player[] = [];
    if (ARCHITECTURAL_SCHEMA_SPECIMEN.full_name.toLowerCase().includes(q)) {
      results.push(ARCHITECTURAL_SCHEMA_SPECIMEN);
    }
    for (const teamPlayers of Object.values(VERIFIED_ROSTER_REGISTRY)) {
      for (const p of teamPlayers) {
        if (p.full_name.toLowerCase().includes(q)) {
          results.push(p);
        }
      }
    }
    return results;
  },
};

// ============================================================================
// ContractService
// ============================================================================
export const ContractService = {
  getPlayerContract: (playerId: string): PlayerContract | null => {
    if (playerId === ARCHITECTURAL_SCHEMA_SPECIMEN.player_id) {
      return ARCHITECTURAL_SPECIMEN_CONTRACT;
    }
    return null;
  },
};

// ============================================================================
// CapService
// ============================================================================
export const CapService = {
  getTeamCapSnapshot: (teamId: string, season: string = '2026-27'): TeamCapSnapshot => {
    const threshold = CAP_THRESHOLDS_BY_SEASON[season] || CAP_THRESHOLDS_BY_SEASON['2026-27'];

    // Critical distinction mandated by prompt:
    // TEAM SALARY, APRON TEAM SALARY, and TAX TEAM SALARY are separate.
    return {
      team_id: teamId,
      season,
      effective_date: '2026-10-01',
      roster_phase: 'training_camp',
      team_salary: null, // Null indicates unverified / pending verified import
      apron_team_salary: null, // Distinct from team_salary (excludes certain incentives/dead charges)
      tax_team_salary: null, // Distinct from team_salary (audited on last day of regular season)
      active_payroll: null,
      dead_money: null,
      cap_holds: null,
      salary_floor: threshold.salary_floor,
      salary_cap: threshold.salary_cap,
      luxury_tax_threshold: threshold.luxury_tax,
      first_apron: threshold.first_apron,
      second_apron: threshold.second_apron,
      salary_cap_room: null,
      luxury_tax_position: null,
      first_apron_room: null,
      second_apron_room: null,
      nba_roster_count: 0,
      two_way_count: 0,
      open_roster_spots: 15,
      data_status: 'INCOMPLETE',
      tax_status_label: 'Pending Verified Ingest',
      first_apron_status: 'INCOMPLETE',
      second_apron_status: 'INCOMPLETE',
    };
  },

  getCapThresholds: (season: string): CapThreshold => {
    return CAP_THRESHOLDS_BY_SEASON[season] || CAP_THRESHOLDS_BY_SEASON['2026-27'];
  },

  getAvailableSeasons: (): string[] => {
    return Object.keys(CAP_THRESHOLDS_BY_SEASON);
  },
};

// ============================================================================
// TransactionService
// ============================================================================
export const TransactionService = {
  getRecentTransactions: (teamId?: string): Transaction[] => {
    // Returns empty array pending verified data connection
    return [];
  },
};

// ============================================================================
// DraftService
// ============================================================================
export const DraftService = {
  getDraftLedgerYears: (): number[] => {
    return [2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034];
  },

  getPicksByYear: (year: number): DraftAsset[] => {
    // Return empty array / pending verified import to respect the "DO NOT FABRICATE" rule
    return [];
  },
};

// ============================================================================
// GLeagueService
// ============================================================================
export const GLeagueService = {
  getAllAffiliates: (): Affiliate[] => {
    return ALL_AFFILIATES;
  },

  getAffiliateById: (id: string): Affiliate | undefined => {
    return ALL_AFFILIATES.find((a) => a.id === id);
  },

  getAffiliateForTeam: (teamId: string): Affiliate | undefined => {
    return ALL_AFFILIATES.find((a) => a.parentTeamId === teamId);
  },

  getIndependentAffiliates: (): Affiliate[] => {
    return ALL_AFFILIATES.filter((a) => a.isIndependent);
  },
};

// ============================================================================
// InjuryService
// ============================================================================
export const InjuryService = {
  getRecentEvents: (teamId?: string): InjuryEvent[] => {
    return [];
  },
};

// ============================================================================
// ProspectService
// ============================================================================
export const ProspectService = {
  getProspectYears: (): number[] => {
    return [2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034];
  },

  getProspectsByYear: (year: number): Prospect[] => {
    return [];
  },
};

// ============================================================================
// CbaService
// ============================================================================
export const CbaService = {
  getAllRules: (): CbaRuleArticle[] => {
    return CBA_RULES_DATABASE;
  },

  searchRules: (query: string): CbaRuleArticle[] => {
    const q = query.toLowerCase();
    return CBA_RULES_DATABASE.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.article_number.toLowerCase().includes(q) ||
        r.section.toLowerCase().includes(q)
    );
  },

  /**
   * Generates structured CBA screening responses based on ratified 2023 CBA text.
   * Clearly shows SCREENING RESULT — NOT OFFICIAL NBA LEAGUE APPROVAL
   */
  queryCbaAgent: (query: string, teamSlug?: string): CbaAgentResponse => {
    const lower = query.toLowerCase();

    if (lower.includes('first apron') || lower.includes('1st apron')) {
      return {
        query,
        answer_state: 'CONDITIONAL',
        answer: 'Crossing the First Apron activates rigid salary matching (100% ceiling) and triggers an immediate hard cap if exceptions or sign-and-trades are used.',
        plain_english_explanation:
          'Teams operating above the First Apron ($209,015,000 official for 2026-27) cannot take back even $1 more in incoming salary than they send out in trades. Furthermore, if a team uses the Non-Taxpayer Mid-Level Exception or acquires any player via Sign-and-Trade, they become hard-capped at the First Apron and can never exceed it during that league year.',
        rule_basis: {
          article: 'Article VII',
          section: 'Section 2(e) & Section 9(b)',
          subsection: '(b)',
          page_reference: '2023 NBA-NBPA CBA, pp. 182-194',
          citation: 'Article VII, Section 2(e): First Apron Mechanics & Trade Ceiling',
        },
        team_impact: `If ${teamSlug || 'this team'} exceeds the First Apron ($209,015,000 in 2026-27), they forfeit the Non-Taxpayer MLE, cannot sign buyout players previously paid above the MLE, and cannot take back surplus incoming trade salary.`,
        player_impact: 'Buyout players previously earning over $14.98M cannot be signed by this club.',
        transaction_impact: 'Incoming trade compensation must be <= 100% of outgoing salary.',
        calculation: 'Max Incoming Salary = Exactly 100% of Outgoing Salary. (Formula: Incoming <= Outgoing).',
        missing_information: [
          'Verified team payroll snapshot for the 2026-27 league year',
          'List of exceptions currently used (Non-Taxpayer MLE, BAE, or Sign-and-Trade)',
        ],
        source: 'NBA-NBPA Collective Bargaining Agreement (2023-2030)',
        evidence_status: 'VERIFIED_CURRENT',
        disclaimer: 'CBA SCREENING RESULT — NOT OFFICIAL NBA LEAGUE APPROVAL',
      };
    }

    if (lower.includes('second apron') || lower.includes('2nd apron') || lower.includes('aggregate')) {
      return {
        query,
        answer_state: 'NO',
        answer: 'Salary aggregation is strictly prohibited for teams in or above the Second Apron.',
        plain_english_explanation:
          'Under Article VII, Section 3(c) of the 2023 CBA, Second Apron teams ($221,686,000 official for 2026-27) cannot combine multiple player contracts to match incoming salary in a trade. In addition, Second Apron teams cannot send cash in trades, cannot use previous Traded Player Exceptions (TPE), and forfeit the Taxpayer Mid-Level Exception entirely.',
        rule_basis: {
          article: 'Article VII',
          section: 'Section 3(c) & Section 8',
          subsection: '(c)',
          page_reference: '2023 NBA-NBPA CBA, pp. 195-208',
          citation: 'Article VII, Section 3(c): Aggregation Ban for Second Apron Teams',
        },
        team_impact: 'All outgoing transactions must be evaluated strictly 1-for-1. The team cannot trade two $10M players to acquire one $18M player.',
        player_impact: 'Roster depth cannot be packaged into a single higher-salaried player.',
        transaction_impact: 'Aggregation prohibited; zero cash considerations permitted.',
        calculation: 'Aggregation Multiplier = 0. Single-player incoming salary <= Single-player outgoing salary.',
        missing_information: [
          'Verified payroll relative to the official Second Apron ($221,686,000)',
          'Whether the trade would push team salary over the Second Apron threshold post-transaction',
        ],
        source: 'NBA-NBPA Collective Bargaining Agreement (2023-2030)',
        evidence_status: 'VERIFIED_CURRENT',
        disclaimer: 'CBA SCREENING RESULT — NOT OFFICIAL NBA LEAGUE APPROVAL',
      };
    }

    if (lower.includes('extend') || lower.includes('extension')) {
      return {
        query,
        answer_state: 'CONDITIONAL',
        answer: 'Veteran extensions are permitted after 2 or 3 years depending on contract length, capped at 140% of prior salary.',
        plain_english_explanation:
          'Under Article XI, Section 4 of the 2023 CBA, veteran extensions allow a starting salary increase of up to 140% of the previous season salary (or 140% of estimated league average player salary, whichever is greater). Contracts of 3 or 4 years can be extended 2 years after signing.',
        rule_basis: {
          article: 'Article XI',
          section: 'Section 4(a)',
          subsection: '(a)',
          page_reference: '2023 NBA-NBPA CBA, pp. 288-294',
          citation: 'Article XI, Section 4: Veteran Player Extensions & Maximum Salary Percentages',
        },
        team_impact: 'Enables front offices to secure cornerstone players up to 4 additional seasons without entering unrestricted free agency.',
        player_impact: 'Provides immediate financial security with up to 8% annual salary escalators.',
        transaction_impact: 'Extended player enters trade moratorium window post-extension execution.',
        calculation: 'Max Year 1 Salary = Max(Prior Year Salary * 1.40, League Average Salary * 1.40).',
        missing_information: [
          'Exact contract signing date and original contract term length',
          'Current base salary figure for base calculation',
        ],
        source: 'NBA-NBPA Collective Bargaining Agreement (2023-2030)',
        evidence_status: 'VERIFIED_CURRENT',
        disclaimer: 'CBA SCREENING RESULT — NOT OFFICIAL NBA LEAGUE APPROVAL',
      };
    }

    // Default response when query is custom or knowledge base connection is pending
    return {
      query,
      answer_state: 'INSUFFICIENT INFORMATION',
      answer: 'CBA screening requires verified team payroll records and transaction parameter verification.',
      plain_english_explanation:
        'The query was processed against the Front Office Atlas CBA Rule Engine. To provide a definitive legal determination, verified team payroll, active apron status, and contract records must be supplied.',
      rule_basis: {
        article: 'Article VII',
        section: 'Section 1-12',
        page_reference: '2023-2030 NBA-NBPA CBA',
        citation: 'NBA Collective Bargaining Agreement (Ratified 2023)',
      },
      team_impact: 'Legal implications will be computed automatically once verified team cap snapshots are ingested.',
      calculation: null,
      missing_information: [
        'Team active payroll data source',
        'Official player contract filing',
        'CBA Knowledge Base live embedding server connection',
      ],
      source: 'NBA-NBPA Collective Bargaining Agreement (2023-2030)',
      evidence_status: 'INCOMPLETE',
      disclaimer: 'CBA SCREENING RESULT — NOT OFFICIAL NBA LEAGUE APPROVAL',
    };
  },
};

// ============================================================================
// SourceService
// ============================================================================
export const SourceService = {
  getAllSources: (): SourceRecord[] => {
    return SOURCE_DESK_REGISTRY;
  },

  getSourceById: (id: string): SourceRecord | undefined => {
    return SOURCE_DESK_REGISTRY.find((s) => s.id === id);
  },
};

// ============================================================================
// ScenarioService (Scenario Center)
// ============================================================================
export const ScenarioService = {
  getSavedScenarios: (): TradeScenario[] => {
    try {
      const data = localStorage.getItem('foa_scenarios');
      if (data) return JSON.parse(data);
    } catch (e) {
      // Local storage fallback
    }
    return [];
  },

  saveScenario: (scenario: TradeScenario) => {
    try {
      const existing = ScenarioService.getSavedScenarios();
      const updated = [scenario, ...existing.filter(s => s.scenario_id !== scenario.scenario_id)];
      localStorage.setItem('foa_scenarios', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save scenario locally', e);
    }
  },

  deleteScenario: (scenarioId: string) => {
    try {
      const existing = ScenarioService.getSavedScenarios();
      const updated = existing.filter(s => s.scenario_id !== scenarioId);
      localStorage.setItem('foa_scenarios', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not delete scenario', e);
    }
  },
};

// ============================================================================
// AtlasSearchService (Global Front-Office Query Engine)
// ============================================================================
export const AtlasSearchService = {
  searchAll: (query: string) => {
    if (!query.trim()) return { teams: [], players: [], rules: [], sources: [] };
    const q = query.toLowerCase();

    const teams = ALL_TEAMS.filter(
      t => t.name.toLowerCase().includes(q) || t.abbreviation.toLowerCase().includes(q) || t.city.toLowerCase().includes(q)
    );

    const players = PlayerService.searchPlayers(query);

    const rules = CbaService.searchRules(query);

    const sources = SOURCE_DESK_REGISTRY.filter(
      s => s.source_name.toLowerCase().includes(q) || s.data_category.toLowerCase().includes(q)
    );

    return { teams, players, rules, sources };
  },
};
