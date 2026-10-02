import React, { useState, useEffect } from 'react';
import { Team, Player } from '../types';
import { TeamService, PlayerService, CapService, GLeagueService } from '../services';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { FreshnessIndicator } from '../components/FreshnessIndicator';
import { SourceTooltip } from '../components/SourceTooltip';
import { PlayerCard } from '../components/PlayerCard';
import { CapApronMeter } from '../components/CapApronMeter';
import { GmBrief } from '../components/GmBrief';
import { TeamBusinessMoneyModal } from '../components/TeamBusinessMoneyModal';
import { 
  Building2, 
  Clock, 
  ShieldCheck, 
  DollarSign, 
  Users, 
  ExternalLink, 
  Filter, 
  Sparkles, 
  Layers, 
  Info,
  Calendar,
  AlertTriangle,
  Scale
} from 'lucide-react';

interface TeamPageProps {
  team: Team;
  onSelectTeam: (slug: string) => void;
  onSelectPlayer: (player: Player) => void;
  onOpenCba: (prompt?: string) => void;
}

export const TeamPage: React.FC<TeamPageProps> = ({
  team,
  onSelectTeam,
  onSelectPlayer,
  onOpenCba,
}) => {
  const [selectedSeason, setSelectedSeason] = useState('2026-27');
  const [showSpecimenPreview, setShowSpecimenPreview] = useState(false);
  const [activeMetricModal, setActiveMetricModal] = useState<string | null>(null);
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [dbPlayers, setDbPlayers] = useState<Player[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);

  type RosterFilter = 'ALL' | 'GUARDS' | 'WINGS' | 'BIGS' | 'STANDARD' | 'TWO_WAY' | 'CAMP' | 'NON_GUARANTEED' | 'GLEAGUE';
  type RosterSort = 'SALARY' | 'NAME' | 'AGE' | 'YEARS' | 'POSITION' | 'STATUS';

  const [rosterFilter, setRosterFilter] = useState<RosterFilter>('ALL');
  const [rosterSort, setRosterSort] = useState<RosterSort>('SALARY');

  useEffect(() => {
    let isCurrent = true;
    setIsLoadingRoster(true);
    PlayerService.fetchPlayersByTeam(team.id, team.slug)
      .then((fetched) => {
        if (isCurrent) {
          setDbPlayers(fetched);
          setIsLoadingRoster(false);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setIsLoadingRoster(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [team.id, team.slug]);

  const affiliate = GLeagueService.getAffiliateForTeam(team.id);
  const capSnapshot = CapService.getTeamCapSnapshot(team.id, selectedSeason);
  const localFallbackPlayers = PlayerService.getPlayersByTeam(team.id, showSpecimenPreview);
  const players = dbPlayers.length > 0 ? dbPlayers : localFallbackPlayers;
  const isFromDatabase = dbPlayers.length > 0;
  const standardCount = players.filter((p) => !p.two_way_status && p.player_id !== 'specimen_001').length;
  const twoWayCount = players.filter((p) => p.two_way_status).length;

  const filteredAndSortedPlayers = players
    .filter((p) => {
      if (rosterFilter === 'GUARDS') return p.position.toLowerCase().includes('guard');
      if (rosterFilter === 'WINGS') return p.position.toLowerCase().includes('forward') || p.secondary_position?.toLowerCase().includes('wing');
      if (rosterFilter === 'BIGS') return p.position.toLowerCase().includes('center') || p.height.startsWith('6-1') || p.height.startsWith('7-');
      if (rosterFilter === 'STANDARD') return !p.two_way_status && !p.contract_type?.toLowerCase().includes('two-way');
      if (rosterFilter === 'TWO_WAY') return Boolean(p.two_way_status) || p.contract_type?.toLowerCase().includes('two-way');
      if (rosterFilter === 'CAMP') return p.roster_phase === 'training_camp' || (p.current_salary || 0) < 1500000;
      if (rosterFilter === 'NON_GUARANTEED') return (p.guaranteed_amount || 0) < (p.current_salary || 1);
      if (rosterFilter === 'GLEAGUE') return Boolean(p.gleague_assignment_status) || Boolean(p.two_way_status);
      return true;
    })
    .sort((a, b) => {
      if (rosterSort === 'SALARY') return (b.current_salary || 0) - (a.current_salary || 0);
      if (rosterSort === 'NAME') return a.full_name.localeCompare(b.full_name);
      if (rosterSort === 'AGE') return (a.age || 0) - (b.age || 0);
      if (rosterSort === 'YEARS') return (b.years_remaining || 0) - (a.years_remaining || 0);
      if (rosterSort === 'POSITION') return a.position.localeCompare(b.position);
      if (rosterSort === 'STATUS') return a.roster_status.localeCompare(b.roster_status);
      return 0;
    });

  const formatCurrency = (val: number | null) => {
    if (val === null) return 'Pending Ingest';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // 10 Executive metrics with crucial separation of Team Salary, Apron Team Salary, and Tax Team Salary
  const executiveMetrics = [
    {
      id: 'team_salary',
      label: 'Team Salary',
      value: formatCurrency(capSnapshot.team_salary),
      subtext: 'Active payroll + dead money + cap holds',
      status: 'INCOMPLETE',
      cbaRef: 'Article VII, Section 1',
      components: ['Active player salaries', 'Waived / stretched dead money', 'Outstanding free agent cap holds'],
      calculation: 'Sum of all standard contracts, cap holds, and dead salary allocations.',
      sourceId: 'src_front_office_contracts',
      icon: DollarSign,
    },
    {
      id: 'apron_team_salary',
      label: 'Apron Team Salary',
      value: formatCurrency(capSnapshot.apron_team_salary),
      subtext: 'Calculated for 1st & 2nd apron thresholds',
      status: 'INCOMPLETE',
      cbaRef: 'Article VII, Section 2(e)',
      components: ['Active payroll', 'Unlikely incentives currently triggered', 'Waived guaranteed amounts'],
      calculation: 'Specific CBA formula measuring headroom against First ($209.02M) and Second Apron ($221.69M).',
      sourceId: 'src_cba_2023_ratified',
      icon: Scale,
    },
    {
      id: 'tax_team_salary',
      label: 'Tax Team Salary',
      value: formatCurrency(capSnapshot.tax_team_salary),
      subtext: 'Audited on final day of regular season',
      status: 'INCOMPLETE',
      cbaRef: 'Article VII, Section 2(a)',
      components: ['Regular season active player compensation', 'Earned likely/unlikely bonuses'],
      calculation: 'Calculated at end of regular season to assess luxury tax obligations ($200.43M threshold).',
      sourceId: 'src_cba_2023_ratified',
      icon: ShieldCheck,
    },
    {
      id: 'cap_room',
      label: 'Salary Cap Room',
      value: capSnapshot.salary_cap_room !== null ? formatCurrency(capSnapshot.salary_cap_room) : 'Pending Ingest',
      subtext: `Relative to $${(capSnapshot.salary_cap / 1000000).toFixed(1)}M threshold`,
      status: 'INCOMPLETE',
      cbaRef: 'Article VII, Section 1',
      components: ['Salary Cap ($164.96M)', 'Less Total Team Salary'],
      calculation: 'Max(0, Salary Cap - Team Salary).',
      sourceId: 'src_cba_2023_ratified',
      icon: Layers,
    },
    {
      id: 'tax_position',
      label: 'Luxury Tax Position',
      value: capSnapshot.luxury_tax_position !== null ? formatCurrency(capSnapshot.luxury_tax_position) : 'Non-Taxpayer (Est)',
      subtext: `Tax line: $${(capSnapshot.luxury_tax_threshold / 1000000).toFixed(1)}M`,
      status: 'INCOMPLETE',
      cbaRef: 'Article VII, Section 2',
      components: ['Tax Level ($200.43M)', 'Tax Team Salary'],
      calculation: 'Tax Team Salary - Luxury Tax Threshold.',
      sourceId: 'src_cba_2023_ratified',
      icon: ShieldCheck,
    },
    {
      id: 'first_apron_room',
      label: 'First Apron Room',
      value: capSnapshot.first_apron_room !== null ? formatCurrency(capSnapshot.first_apron_room) : 'Pending Ingest',
      subtext: `First apron: $${(capSnapshot.first_apron / 1000000).toFixed(1)}M`,
      status: 'INCOMPLETE',
      cbaRef: 'Article VII, Section 2(e)',
      components: ['First Apron Threshold ($209.02M)', 'Apron Team Salary'],
      calculation: 'First Apron - Apron Team Salary.',
      sourceId: 'src_cba_2023_ratified',
      icon: Info,
    },
    {
      id: 'second_apron_room',
      label: 'Second Apron Room',
      value: capSnapshot.second_apron_room !== null ? formatCurrency(capSnapshot.second_apron_room) : 'Pending Ingest',
      subtext: `Second apron: $${(capSnapshot.second_apron / 1000000).toFixed(1)}M`,
      status: 'INCOMPLETE',
      cbaRef: 'Article VII, Section 2(e)',
      components: ['Second Apron Threshold ($221.69M)', 'Apron Team Salary'],
      calculation: 'Second Apron - Apron Team Salary.',
      sourceId: 'src_cba_2023_ratified',
      icon: Info,
    },
    {
      id: 'roster_count',
      label: 'NBA Roster Count',
      value: isFromDatabase ? `${standardCount} / 15` : `${capSnapshot.nba_roster_count} / 15`,
      subtext: isFromDatabase ? 'Verified standard contracts loaded' : 'Standard NBA active commitments',
      status: isFromDatabase ? 'VERIFIED_CURRENT' : 'INCOMPLETE',
      cbaRef: 'Article VII, Section 1',
      components: ['Standard NBA contracts', 'Camp / Exhibit 10 conversions'],
      calculation: 'Count of standard NBA roster contracts (15 max regular season).',
      sourceId: isFromDatabase ? 'src_supabase_roster_db' : 'src_nba_stats_feed',
      icon: Users,
    },
    {
      id: 'two_way_count',
      label: 'Two-Way Count',
      value: isFromDatabase ? `${twoWayCount} / 3` : `${capSnapshot.two_way_count} / 3`,
      subtext: isFromDatabase ? 'Verified two-way contracts loaded' : 'Two-way player slots utilized',
      status: isFromDatabase ? 'VERIFIED_CURRENT' : 'INCOMPLETE',
      cbaRef: 'Article XXIX',
      components: ['Signed Two-Way contracts'],
      calculation: 'Up to 3 Two-Way slots per club (zero cap impact).',
      sourceId: isFromDatabase ? 'src_supabase_roster_db' : 'src_nba_stats_feed',
      icon: Users,
    },
    {
      id: 'open_spots',
      label: 'Open NBA Roster Spots',
      value: isFromDatabase ? `${Math.max(0, 15 - standardCount)}` : `${capSnapshot.open_roster_spots}`,
      subtext: 'Available active roster slots',
      status: isFromDatabase ? 'VERIFIED_CURRENT' : 'INCOMPLETE',
      cbaRef: 'Article VII',
      components: ['15 Standard Max Limit - Active Count'],
      calculation: '15 - Current Standard Contracts.',
      sourceId: isFromDatabase ? 'src_supabase_roster_db' : 'src_nba_stats_feed',
      icon: Users,
    },
  ];

  const activeMetricData = executiveMetrics.find((m) => m.id === activeMetricModal);

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Team Header Section */}
      <div 
        className="relative rounded-2xl p-6 sm:p-8 border border-white/10 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${team.colors.darkSurface} 0%, #0d1017 100%)`,
        }}
      >
        {/* Subtle accent border line */}
        <div 
          className="absolute top-0 left-0 right-0 h-1" 
          style={{ backgroundColor: team.colors.primary }}
        />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Team Logo / Monogram Insignia */}
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center font-mono font-bold text-2xl sm:text-3xl border border-white/15 shadow-xl shrink-0"
              style={{
                backgroundColor: '#0c0e12',
                color: '#ffffff',
                borderLeft: `4px solid ${team.colors.primary}`,
              }}
            >
              <span>{team.abbreviation}</span>
            </div>

            {/* Team Information */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                  {team.conference} Conference · {team.division} Division
                </span>
                <span className="text-neutral-600">·</span>
                <span className="text-xs font-mono text-neutral-400">
                  {team.arena}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
                {team.name}
              </h1>

              {/* Affiliate and Ingest Info */}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-neutral-400">
                {affiliate && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                    <span>G League Affiliate:</span>
                    <strong className="text-neutral-200">{affiliate.name}</strong>
                  </div>
                )}
                <span className="text-neutral-600 hidden sm:inline">·</span>
                <FreshnessIndicator effectiveDate="October 1, 2026" rosterPhase={team.roster_phase} />
              </div>
            </div>
          </div>

          {/* Verification Status, Business & Direct CBA Trigger */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 w-full lg:w-auto">
            <EvidenceBadge state="VERIFIED_CURRENT" />
            <button
              onClick={() => setIsBusinessModalOpen(true)}
              className="px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Business & Money</span>
            </button>
            <button
              onClick={() => onOpenCba(`Analyze collective bargaining agreement constraints and apron standing for ${team.name}.`)}
              className="px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask CBA About {team.nickname}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Executive Metric Cards Grid (Clickable) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
            Executive Payroll & Roster Metrics ({selectedSeason})
          </h2>
          <span className="text-[11px] font-mono text-neutral-500">
            Click any metric to inspect calculation formula, components & CBA citations
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {executiveMetrics.map((m) => {
            const IconComponent = m.icon;
            return (
              <div
                key={m.id}
                onClick={() => setActiveMetricModal(m.id)}
                className="p-3.5 bg-[#12161f] hover:bg-[#161a25] border border-white/10 hover:border-white/25 rounded-xl transition-all cursor-pointer group text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-neutral-400 mb-1.5">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider group-hover:text-amber-300 transition-colors">
                      {m.label}
                    </span>
                    <IconComponent className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300" />
                  </div>
                  <div className="text-base font-bold font-mono text-white tabular-nums">
                    {m.value}
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate mt-1">
                    {m.subtext}
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
                  <EvidenceBadge state={m.status} size="sm" />
                  <span className="text-[10px] font-mono text-neutral-500 group-hover:text-amber-400">
                    Formula →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cap & Apron Visual Meter */}
      <CapApronMeter
        team={team}
        selectedSeason={selectedSeason}
        onSeasonChange={(s) => setSelectedSeason(s)}
        onOpenCbaWithPrompt={(prompt) => onOpenCba(prompt)}
      />

      {/* GM Brief Section */}
      <GmBrief team={team} />

      {/* Roster Area */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                {team.name} Roster
              </h2>
              {isFromDatabase ? (
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Supabase Database Active · {players.length} Players
                </span>
              ) : players.length > 0 ? (
                <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Verified Active Roster · {players.length} Players
                </span>
              ) : (
                <span className="text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                  Training Camp / Preseason · October 1, 2026
                </span>
              )}
              {isLoadingRoster && (
                <span className="text-[11px] font-mono text-neutral-400 animate-pulse">
                  Querying database...
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Opening-night / regular-season roster cuts are not yet final. Distinguishing camp invitees from standard contracts.
            </p>
          </div>

          {/* Roster Controls: Specimen Toggle & Status */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSpecimenPreview(!showSpecimenPreview)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-medium border transition-colors cursor-pointer ${
                showSpecimenPreview
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-neutral-200'
              }`}
              title="Inspect PlayerCard rendering with verified schema specimen"
            >
              {showSpecimenPreview ? 'Hide Architectural Specimen' : 'Preview Player Card Specimen'}
            </button>
          </div>
        </div>

        {/* Roster Filter & Sort Toolbar */}
        <div className="bg-[#0f1422] border border-white/10 rounded-xl p-3.5 space-y-3 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Positional & Contract Filter Chips */}
            <div className="flex items-center gap-1 bg-[#141a2a] p-1 rounded-lg border border-white/5 overflow-x-auto no-scrollbar">
              {[
                { id: 'ALL', label: 'All Players' },
                { id: 'GUARDS', label: 'Guards' },
                { id: 'WINGS', label: 'Wings' },
                { id: 'BIGS', label: 'Bigs' },
                { id: 'STANDARD', label: 'Standard NBA' },
                { id: 'TWO_WAY', label: 'Two-Way' },
                { id: 'CAMP', label: 'Camp' },
                { id: 'NON_GUARANTEED', label: 'Non-Guaranteed' },
                { id: 'GLEAGUE', label: 'Assigned to G League' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setRosterFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                    rosterFilter === f.id
                      ? 'bg-neutral-800 text-white font-bold shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sorting Selector */}
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 text-[11px] uppercase">Sort By:</span>
              <select
                value={rosterSort}
                onChange={(e) => setRosterSort(e.target.value as any)}
                className="bg-[#141a2a] border border-white/10 text-neutral-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-amber-400/50 cursor-pointer"
              >
                <option value="SALARY">Salary (High to Low)</option>
                <option value="NAME">Name (A–Z)</option>
                <option value="AGE">Age (Youngest First)</option>
                <option value="YEARS">Years Remaining</option>
                <option value="POSITION">Position</option>
                <option value="STATUS">Roster Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Players Cards Grid / Authentic Empty State */}
        {filteredAndSortedPlayers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedPlayers.map((player) => (
              <PlayerCard
                key={player.player_id}
                player={player}
                onClick={(p) => onSelectPlayer(p)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 bg-[#12161f] border border-dashed border-white/15 rounded-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto text-neutral-400">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-neutral-200 font-mono tracking-wide uppercase">
                CURRENT VERIFIED ROSTER DATA AWAITING IMPORT
              </h3>
              <p className="text-xs text-neutral-400 max-w-lg mx-auto leading-relaxed">
                As mandated by the Front Office Atlas data integrity protocol, unverified player rosters and fabricated contracts are excluded. When the verified NBA roster dataset or Supabase connector is connected, all {team.name} players will render automatically using the universal PlayerCard component.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <EvidenceBadge state="SOURCE PENDING" />
              <button
                onClick={() => setShowSpecimenPreview(true)}
                className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono font-medium transition-colors cursor-pointer"
              >
                Inspect Player Card Layout →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Metric Calculation Detail Modal (Clickable Metrics) */}
      {activeMetricModal && activeMetricData && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12161f] border border-white/15 rounded-xl p-6 max-w-lg w-full space-y-4 text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                  Underlying Calculation Engine
                </span>
                <h3 className="font-mono text-base font-bold text-white uppercase">
                  {activeMetricData.label}
                </h3>
              </div>
              <button
                onClick={() => setActiveMetricModal(null)}
                className="text-neutral-400 hover:text-white text-xs font-mono p-1 rounded"
              >
                Close (Esc)
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-300">
              <div className="p-3 bg-[#0d1016] border border-white/5 rounded-lg space-y-1">
                <span className="font-mono text-[10px] text-neutral-500 uppercase block">CBA Reference</span>
                <span className="font-bold text-amber-300">{activeMetricData.cbaRef}</span>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[10px] text-neutral-500 uppercase block">Calculation Method</span>
                <p className="text-neutral-300 bg-[#0d1016] p-3 rounded-lg border border-white/5 font-mono text-[11px]">
                  {activeMetricData.calculation}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[10px] text-neutral-500 uppercase block">Constituent Components</span>
                <ul className="list-disc list-inside space-y-0.5 bg-[#0d1016] p-3 rounded-lg border border-white/5 text-neutral-400">
                  {activeMetricData.components.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 font-mono text-[11px]">
                <SourceTooltip sourceId={activeMetricData.sourceId} />
                <span className="text-neutral-500">Effective: October 1, 2026</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sportico Business & Valuation Intelligence Modal */}
      <TeamBusinessMoneyModal
        team={team}
        isOpen={isBusinessModalOpen}
        onClose={() => setIsBusinessModalOpen(false)}
      />
    </div>
  );
};
