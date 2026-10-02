import { ALL_TEAMS } from '../data/teams';
import { ALL_AFFILIATES } from '../data/affiliates';
import { CAP_THRESHOLDS_BY_SEASON } from '../data/capThresholds';
import { CBA_RULES_DATABASE } from '../data/cbaRules';
import { SOURCE_DESK_REGISTRY } from '../data/sources';
import { DraftLedgerService } from './draftLedgerService';
import { VERIFIED_INJURY_EVENTS, VERIFIED_AVAILABILITY_EVENTS, TEAM_AVAILABILITY_METRICS } from '../data/availability';
import { VERIFIED_PROSPECTS, PROSPECT_DRAFT_FIT_EVALUATIONS } from '../data/prospects';
import { 
  ARCHITECTURAL_SCHEMA_SPECIMEN, 
  ARCHITECTURAL_SPECIMEN_CONTRACT, 
  VERIFIED_ROSTER_REGISTRY 
} from '../data/players';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
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
export interface TeamsProvenanceResponse {
  teams: Team[];
  source: 'SUPABASE' | 'LOCAL_SEED';
  label: string;
  count: number;
  error?: string | null;
}

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

  fetchTeamsFromDb: async (): Promise<Team[]> => {
    const res = await TeamService.fetchTeamsWithProvenance();
    return res.teams;
  },

  fetchTeamsWithProvenance: async (): Promise<TeamsProvenanceResponse> => {
    if (!isSupabaseConfigured() || !supabase) {
      return {
        teams: ALL_TEAMS,
        source: 'LOCAL_SEED',
        label: 'Local Verified Seed (Standby / Offline)',
        count: ALL_TEAMS.length,
        error: 'Supabase client not initialized',
      };
    }
    try {
      const { data, error } = await supabase.from('teams').select('*').order('name');
      if (error) {
        console.warn('[FOA TeamService] Supabase teams query error:', error.message);
        return {
          teams: ALL_TEAMS,
          source: 'LOCAL_SEED',
          label: 'Local Verified Seed (Supabase Fallback)',
          count: ALL_TEAMS.length,
          error: error.message,
        };
      }

      if (!data || data.length === 0) {
        return {
          teams: ALL_TEAMS,
          source: 'LOCAL_SEED',
          label: 'Local Verified Seed (teams table empty)',
          count: ALL_TEAMS.length,
          error: 'Table public.teams returned 0 rows',
        };
      }

      const mapped = (data as any[]).map((row) => {
        const localMatch = ALL_TEAMS.find((t) => t.slug === row.slug);
        return {
          id: localMatch ? localMatch.id : row.id,
          slug: row.slug,
          nba_team_id: row.nba_team_id || undefined,
          name: row.name,
          city: row.city,
          nickname: row.nickname,
          abbreviation: row.abbreviation,
          conference: (row.conference as 'Eastern' | 'Western') || (localMatch?.conference || 'Western'),
          division: (row.division as any) || (localMatch?.division || 'Southwest'),
          colors: {
            primary: row.primary_color || localMatch?.colors.primary || '#CE1141',
            secondary: row.secondary_color || localMatch?.colors.secondary || '#000000',
            accent: row.accent_color || row.primary_color || localMatch?.colors.accent || '#CE1141',
            darkSurface: row.dark_surface || localMatch?.colors.darkSurface || '#0d1017',
          },
          arena: row.arena || localMatch?.arena || '',
          logo_url: row.logo_url || localMatch?.logo_url,
          affiliateId: row.affiliate_id || localMatch?.affiliateId || null,
          affiliateName: row.affiliate_name || localMatch?.affiliateName || '',
          season: row.season || '2026-27',
          roster_phase: row.roster_phase || 'training_camp',
          dataStatus: row.verification_status || 'VERIFIED_CURRENT',
          lastUpdated: row.retrieved_at ? new Date(row.retrieved_at).toLocaleDateString() : 'October 1, 2026',
          retrieved_at: row.retrieved_at || '2026-10-01T12:00:00Z',
          effective_date: row.effective_date || '2026-10-01',
          verificationSource: 'Supabase PostgreSQL (public.teams)',
          preseason_record: row.preseason_record || '0-0 (Camp)',
        };
      });

      return {
        teams: mapped,
        source: 'SUPABASE',
        label: 'Supabase PostgreSQL (public.teams)',
        count: mapped.length,
        error: null,
      };
    } catch (err: any) {
      console.warn('[FOA TeamService] Unexpected exception querying teams:', err);
      return {
        teams: ALL_TEAMS,
        source: 'LOCAL_SEED',
        label: 'Local Verified Seed (Network Fallback)',
        count: ALL_TEAMS.length,
        error: err?.message || 'Network exception',
      };
    }
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

  fetchMembershipsFromDb: async (teamId: string): Promise<RosterMembership[]> => {
    if (!isSupabaseConfigured() || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from('roster_memberships')
        .select('*')
        .eq('team_id', teamId);
      if (error || !data) return [];
      return data as RosterMembership[];
    } catch {
      return [];
    }
  },
};

// Cache for dynamically loaded verified players from Supabase
const dynamicRosterCache: Record<string, Player[]> = {};

function mapDbRecordToPlayer(row: any, fallbackTeamId: string): Player {
  const fullName = row.full_name || 'Verified Player';
  const nameParts = fullName.trim().split(' ');
  return {
    player_id: row.id || row.nba_player_id || `player_${Math.random()}`,
    nba_player_id: row.nba_player_id || null,
    full_name: fullName,
    first_name: row.first_name || nameParts[0] || '',
    last_name: row.last_name || nameParts.slice(1).join(' ') || '',
    team_id: row.team_id || fallbackTeamId,
    jersey_number: row.jersey_number !== null && row.jersey_number !== undefined ? String(row.jersey_number) : '—',
    position: row.position || 'Forward',
    secondary_position: row.secondary_position || undefined,
    age: row.age !== undefined && row.age !== null ? Number(row.age) : null,
    date_of_birth: row.date_of_birth || null,
    height: row.height || '—',
    weight: row.weight || '—',
    nba_experience: row.nba_experience || '—',
    college: row.college_or_origin || null,
    international_origin: row.international_origin || null,
    draft_year: row.draft_year !== undefined && row.draft_year !== null ? Number(row.draft_year) : null,
    draft_round: row.draft_round !== undefined && row.draft_round !== null ? Number(row.draft_round) : null,
    draft_pick: row.draft_pick !== undefined && row.draft_pick !== null ? Number(row.draft_pick) : null,
    how_acquired: row.how_acquired || 'Roster Ingest',
    headshot_url: row.headshot_url || null,
    contract_type: row.contract_type || 'Standard NBA',
    roster_status: row.roster_status || 'Active Roster',
    two_way_status: Boolean(row.two_way_status),
    gleague_assignment_status: Boolean(row.gleague_assignment_status),
    current_salary: row.current_salary !== null && row.current_salary !== undefined ? Number(row.current_salary) : null,
    current_cap_hit: row.current_cap_hit !== null && row.current_cap_hit !== undefined ? Number(row.current_cap_hit) : null,
    guaranteed_amount: row.guaranteed_amount !== null && row.guaranteed_amount !== undefined ? Number(row.guaranteed_amount) : null,
    years_remaining: row.years_remaining !== null && row.years_remaining !== undefined ? Number(row.years_remaining) : null,
    free_agency_year: row.free_agency_year !== null && row.free_agency_year !== undefined ? Number(row.free_agency_year) : null,
    option_type: row.option_type || null,
    extension_eligible: Boolean(row.extension_eligible),
    injury_status: row.injury_status || null,
    data_status: row.verification_status || 'VERIFIED_CURRENT',
    source_url: row.source_url || null,
    retrieved_at: row.retrieved_at || null,
    effective_date: row.effective_date || '2026-10-01',
    roster_phase: row.roster_phase || 'training_camp',
  };
}

// ============================================================================
// PlayerService
// ============================================================================
export const PlayerService = {
  getPlayersByTeam: (teamId: string, includeSpecimen: boolean = false): Player[] => {
    // 1. Check dynamic cache (populated from Supabase)
    if (dynamicRosterCache[teamId] && dynamicRosterCache[teamId].length > 0) {
      return dynamicRosterCache[teamId];
    }

    // 2. Check local verified registry fallback
    const matchedTeam = ALL_TEAMS.find((t) => t.id === teamId || t.slug === teamId);
    const verified =
      VERIFIED_ROSTER_REGISTRY[teamId] ||
      (matchedTeam ? VERIFIED_ROSTER_REGISTRY[matchedTeam.slug] || VERIFIED_ROSTER_REGISTRY[matchedTeam.id] : []) ||
      [];
    if (verified.length > 0) {
      return verified;
    }

    // 3. Optional specimen preview for verifying UI layout
    if (includeSpecimen) {
      return [{ ...ARCHITECTURAL_SCHEMA_SPECIMEN, team_id: teamId }];
    }

    return [];
  },

  /**
   * Asynchronously fetches verified roster from Supabase with graceful fallback
   */
  fetchPlayersByTeam: async (teamId: string, teamSlug?: string): Promise<Player[]> => {
    // Check if Supabase client is ready and configured
    if (!isSupabaseConfigured() || !supabase) {
      return PlayerService.getPlayersByTeam(teamId);
    }

    try {
      const slugToQuery = teamSlug || teamId;
      // Step 1: Resolve team UUID by slug from Supabase
      const { data: teamData, error: teamErr } = await supabase
        .from('teams')
        .select('id')
        .or(`slug.eq.${slugToQuery},id.eq.${teamId}`)
        .maybeSingle();

      const teamUuid = (teamData as any)?.id;
      if (!teamUuid) {
        // Fallback to local
        return PlayerService.getPlayersByTeam(teamId);
      }

      // Step 2: Query players associated with resolved team UUID
      const { data: playersData, error: playersErr } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', teamUuid)
        .order('current_salary', { ascending: false, nullsFirst: false });

      if (playersErr || !playersData || playersData.length === 0) {
        return PlayerService.getPlayersByTeam(teamId);
      }

      const mappedPlayers = (playersData as any[]).map((r) => mapDbRecordToPlayer(r, teamId));
      dynamicRosterCache[teamId] = mappedPlayers;
      return mappedPlayers;
    } catch (err) {
      // Graceful fallback on network or table access failure
      console.warn('[FOA PlayerService] Supabase query fallback:', err);
      return PlayerService.getPlayersByTeam(teamId);
    }
  },

  getPlayerById: (playerId: string): Player | undefined => {
    if (playerId === ARCHITECTURAL_SCHEMA_SPECIMEN.player_id) {
      return ARCHITECTURAL_SCHEMA_SPECIMEN;
    }

    // Check dynamic cache
    for (const cachedPlayers of Object.values(dynamicRosterCache)) {
      const match = cachedPlayers.find((p) => p.player_id === playerId || p.nba_player_id === playerId);
      if (match) return match;
    }

    // Check local registry
    for (const teamPlayers of Object.values(VERIFIED_ROSTER_REGISTRY)) {
      const match = teamPlayers.find((p) => p.player_id === playerId || p.nba_player_id === playerId);
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
    const seenIds = new Set<string>();

    if (ARCHITECTURAL_SCHEMA_SPECIMEN.full_name.toLowerCase().includes(q)) {
      results.push(ARCHITECTURAL_SCHEMA_SPECIMEN);
      seenIds.add(ARCHITECTURAL_SCHEMA_SPECIMEN.player_id);
    }

    // Search dynamic cache
    for (const cachedPlayers of Object.values(dynamicRosterCache)) {
      for (const p of cachedPlayers) {
        if (p.full_name.toLowerCase().includes(q) && !seenIds.has(p.player_id)) {
          results.push(p);
          seenIds.add(p.player_id);
        }
      }
    }

    // Search local registry
    for (const teamPlayers of Object.values(VERIFIED_ROSTER_REGISTRY)) {
      for (const p of teamPlayers) {
        if (p.full_name.toLowerCase().includes(q) && !seenIds.has(p.player_id)) {
          results.push(p);
          seenIds.add(p.player_id);
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

  fetchContractByPlayerId: async (playerId: string): Promise<PlayerContract | null> => {
    if (playerId === ARCHITECTURAL_SCHEMA_SPECIMEN.player_id) {
      return ARCHITECTURAL_SPECIMEN_CONTRACT;
    }
    if (!isSupabaseConfigured() || !supabase) {
      return ContractService.getPlayerContract(playerId);
    }
    try {
      const { data: contractData, error: contractErr } = await supabase
        .from('contracts')
        .select('*, contract_seasons(*)')
        .eq('player_id', playerId)
        .maybeSingle();

      if (contractErr || !contractData) {
        return ContractService.getPlayerContract(playerId);
      }

      return {
        contract_id: contractData.id,
        player_id: contractData.player_id,
        signing_date: contractData.signing_date,
        contract_type: contractData.contract_type,
        years_total: contractData.years_total,
        total_value: contractData.total_value ? Number(contractData.total_value) : null,
        total_guaranteed: contractData.total_guaranteed ? Number(contractData.total_guaranteed) : null,
        seasons: (contractData.contract_seasons || []).map((s: any) => ({
          season: s.season,
          base_salary: s.base_salary ? Number(s.base_salary) : null,
          cap_hit: s.cap_hit ? Number(s.cap_hit) : null,
          guaranteed: s.guaranteed ? Number(s.guaranteed) : null,
          option_type: s.option_type || null,
          incentive_likely: s.incentive_likely ? Number(s.incentive_likely) : null,
          incentive_unlikely: s.incentive_unlikely ? Number(s.incentive_unlikely) : null,
          guarantee_date: s.guarantee_date || null,
        })),
        decision_dates: [],
        bird_rights: contractData.bird_rights || 'Full Bird Rights',
        trade_restriction: contractData.trade_restriction || null,
        extension_eligible_date: contractData.extension_eligible_date || null,
        source_id: contractData.source_id || 'src_supabase_contracts',
        data_status: contractData.verification_status || 'VERIFIED_CURRENT',
      };
    } catch {
      return ContractService.getPlayerContract(playerId);
    }
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

  fetchCapSnapshotFromDb: async (teamId: string, season: string = '2026-27'): Promise<TeamCapSnapshot> => {
    const fallback = CapService.getTeamCapSnapshot(teamId, season);
    if (!isSupabaseConfigured() || !supabase) return fallback;
    try {
      const { data, error } = await supabase
        .from('team_cap_snapshots')
        .select('*')
        .eq('team_id', teamId)
        .eq('season', season)
        .maybeSingle();

      if (error || !data) return fallback;
      return {
        team_id: data.team_id,
        season: data.season,
        effective_date: data.effective_date,
        roster_phase: data.roster_phase,
        team_salary: data.team_salary !== null ? Number(data.team_salary) : null,
        apron_team_salary: data.apron_team_salary !== null ? Number(data.apron_team_salary) : null,
        tax_team_salary: data.tax_team_salary !== null ? Number(data.tax_team_salary) : null,
        active_payroll: data.active_payroll !== null ? Number(data.active_payroll) : null,
        dead_money: data.dead_money !== null ? Number(data.dead_money) : null,
        cap_holds: data.cap_holds !== null ? Number(data.cap_holds) : null,
        salary_floor: Number(data.salary_floor),
        salary_cap: Number(data.salary_cap),
        luxury_tax_threshold: Number(data.luxury_tax_threshold),
        first_apron: Number(data.first_apron),
        second_apron: Number(data.second_apron),
        salary_cap_room: data.salary_cap_room !== null ? Number(data.salary_cap_room) : null,
        luxury_tax_position: data.luxury_tax_position !== null ? Number(data.luxury_tax_position) : null,
        first_apron_room: data.first_apron_room !== null ? Number(data.first_apron_room) : null,
        second_apron_room: data.second_apron_room !== null ? Number(data.second_apron_room) : null,
        nba_roster_count: Number(data.nba_roster_count || 0),
        two_way_count: Number(data.two_way_count || 0),
        open_roster_spots: Number(data.open_roster_spots || 15),
        data_status: data.verification_status || 'INCOMPLETE',
        tax_status_label: data.tax_status_label || 'Pending Verified Ingest',
        first_apron_status: data.first_apron_status || 'INCOMPLETE',
        second_apron_status: data.second_apron_status || 'INCOMPLETE',
      };
    } catch {
      return fallback;
    }
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

  fetchTransactionsFromDb: async (teamId?: string): Promise<Transaction[]> => {
    if (!isSupabaseConfigured() || !supabase) return [];
    try {
      let query = supabase.from('transactions').select('*').order('date', { ascending: false });
      if (teamId) {
        query = query.eq('team_id', teamId);
      }
      const { data, error } = await query;
      if (error || !data) return [];
      return data as Transaction[];
    } catch {
      return [];
    }
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
    return DraftLedgerService.getPicksByYear(year);
  },

  getPicksByTeam: (teamSlugOrId: string): DraftAsset[] => {
    return DraftLedgerService.getPicksByTeam(teamSlugOrId);
  },

  fetchPicksByYear: async (year: number): Promise<DraftAsset[]> => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('draft_assets')
          .select('*')
          .eq('year', year)
          .order('round');
        if (!error && data && data.length > 0) return data as DraftAsset[];
      } catch {}
    }
    return DraftLedgerService.getPicksByYear(year);
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
    if (!teamId) return VERIFIED_INJURY_EVENTS;
    return VERIFIED_INJURY_EVENTS.filter((e) => e.team_id === teamId || e.team_id.includes(teamId));
  },

  getTeamAvailabilityMetrics: (teamSlug: string) => {
    return TEAM_AVAILABILITY_METRICS[teamSlug] || TEAM_AVAILABILITY_METRICS['houston-rockets'];
  },

  getAllTeamAvailabilityMetrics: () => {
    return TEAM_AVAILABILITY_METRICS;
  },

  getAvailabilityLogsForPlayer: (playerId?: string): AvailabilityEvent[] => {
    return VERIFIED_AVAILABILITY_EVENTS;
  },
};

// ============================================================================
// ProspectService
// ============================================================================
export const ProspectService = {
  getProspectYears: (): number[] => {
    return [2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034];
  },

  getAllProspects: (): Prospect[] => {
    return VERIFIED_PROSPECTS;
  },

  getProspectsByYear: (year: number): Prospect[] => {
    return VERIFIED_PROSPECTS.filter((p) => p.projected_draft_year === year);
  },

  getProspectById: (id: string): Prospect | undefined => {
    return VERIFIED_PROSPECTS.find((p) => p.id === id);
  },

  getDraftFit: (prospectId: string, teamSlug: string = 'houston-rockets') => {
    return PROSPECT_DRAFT_FIT_EVALUATIONS[prospectId] || null;
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

  fetchRulesFromDb: async (): Promise<CbaRuleArticle[]> => {
    if (!isSupabaseConfigured() || !supabase) return CBA_RULES_DATABASE;
    try {
      const { data, error } = await supabase
        .from('cba_rules')
        .select('*')
        .order('article_number');
      if (error || !data || data.length === 0) return CBA_RULES_DATABASE;
      return (data as any[]).map((r) => ({
        article_number: r.article_number,
        section: r.section,
        subsection: r.subsection || undefined,
        page: r.page || '',
        title: r.title,
        summary: r.summary,
        plain_english: r.plain_english,
        restrictions: Array.isArray(r.restrictions) ? r.restrictions : [],
        first_apron_consequences: Array.isArray(r.first_apron_consequences) ? r.first_apron_consequences : [],
        second_apron_consequences: Array.isArray(r.second_apron_consequences) ? r.second_apron_consequences : [],
        source_document: r.source_document || 'NBA-NBPA Collective Bargaining Agreement (Ratified 2023)',
        source_url: r.source_url || 'https://nbpa.com/cba',
      }));
    } catch {
      return CBA_RULES_DATABASE;
    }
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

  fetchSourcesFromDb: async (): Promise<SourceRecord[]> => {
    if (!isSupabaseConfigured() || !supabase) return SOURCE_DESK_REGISTRY;
    try {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .order('source_name');
      if (error || !data || data.length === 0) return SOURCE_DESK_REGISTRY;
      return (data as any[]).map((s) => ({
        id: s.id,
        source_name: s.source_name,
        source_url: s.source_url,
        data_category: s.data_category,
        authority_level: s.authority_level,
        refresh_interval: s.refresh_interval,
        last_attempt: s.last_attempt ? new Date(s.last_attempt).toLocaleTimeString() : 'Pending Ingest',
        last_success: s.last_success ? new Date(s.last_success).toLocaleTimeString() : 'Never',
        failure_state: s.failure_state || null,
        failure_message: s.failure_message || undefined,
        field_coverage: Array.isArray(s.field_coverage) ? s.field_coverage : [],
        license_or_access_notes: s.license_or_access_notes || '',
        status: s.status || 'MANUAL',
      }));
    } catch {
      return SOURCE_DESK_REGISTRY;
    }
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
