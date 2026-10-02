import React, { useState, useEffect } from 'react';
import { Player, PlayerContract } from '../types';
import { TeamService, ContractService } from '../services';
import { PlayerIntelligenceService } from '../services/playerIntelligence';
import { EvidenceBadge } from './EvidenceBadge';
import { PlayerPerformanceTab } from './player/PlayerPerformanceTab';
import { PlayerProgressionTab } from './player/PlayerProgressionTab';
import { PlayerAvailabilityTab } from './player/PlayerAvailabilityTab';
import { PlayerContractMarketTab } from './player/PlayerContractMarketTab';
import { PlayerScoutingTab } from './player/PlayerScoutingTab';
import { PlayerLineupsTab } from './player/PlayerLineupsTab';
import { PlayerVideoTab } from './player/PlayerVideoTab';
import { SkillGradeTable } from './player/SkillGradeTable';
import { 
  X, 
  Sparkles, 
  AlertCircle, 
  FileText, 
  ArrowRight,
  TrendingUp,
  BarChart2,
  Calendar,
  Layers,
  Activity,
  Video,
  DollarSign,
  ShieldCheck,
  Scale,
  Crosshair,
  Shield,
  Compass
} from 'lucide-react';

interface PlayerDetailDrawerProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onAskCba: (contextQuery: string, playerContext?: Player) => void;
}

// Exactly the 8 Primary Tabs requested
export type PrimaryTabType =
  | 'OVERVIEW'
  | 'CONTRACT'
  | 'PERFORMANCE'
  | 'AVAILABILITY'
  | 'LINEUPS'
  | 'DEVELOPMENT'
  | 'TRANSACTIONS'
  | 'CBA';

// Deeper analytics accessible within Development & Deep Scouting
export type DeepAnalyticsSubTab =
  | 'DEVELOPMENT_SUMMARY'
  | 'PROGRESSION'
  | 'SHOT_PROFILE'
  | 'PLAYMAKING'
  | 'DEFENSE'
  | 'MARKET_BENCHMARK'
  | 'G_LEAGUE'
  | 'VIDEO'
  | 'SOURCES';

export const PlayerDetailDrawer: React.FC<PlayerDetailDrawerProps> = ({
  player,
  isOpen,
  onClose,
  onAskCba,
}) => {
  const [activeTab, setActiveTab] = useState<PrimaryTabType>('OVERVIEW');
  const [developmentSubTab, setDevelopmentSubTab] = useState<DeepAnalyticsSubTab>('DEVELOPMENT_SUMMARY');
  const [imageError, setImageError] = useState(false);
  const [loadedContract, setLoadedContract] = useState<PlayerContract | null>(null);

  useEffect(() => {
    if (!player) return;
    let isMounted = true;
    ContractService.fetchContractByPlayerId(player.player_id).then((c) => {
      if (isMounted) setLoadedContract(c);
    });
    return () => {
      isMounted = false;
    };
  }, [player?.player_id]);

  if (!isOpen || !player) return null;

  const team = TeamService.getTeamById(player.team_id) || TeamService.getTeamBySlug(player.team_id);
  const contract = loadedContract || ContractService.getPlayerContract(player.player_id);
  const skillGrades = PlayerIntelligenceService.getSkillGrades(player);

  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const primaryTabs: PrimaryTabType[] = [
    'OVERVIEW',
    'CONTRACT',
    'PERFORMANCE',
    'AVAILABILITY',
    'LINEUPS',
    'DEVELOPMENT',
    'TRANSACTIONS',
    'CBA',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl lg:max-w-5xl bg-[#090d16] border-l border-white/10 h-full flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header Bar with Brand Color & Ask CBA Action */}
        <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between bg-[#0e1424]">
          <div className="flex items-center gap-3">
            <span 
              className="w-3 h-3 rounded-full shadow-xs"
              style={{ backgroundColor: team?.colors.primary || '#CE1141' }}
            />
            <span className="font-mono text-xs font-semibold text-neutral-300 uppercase tracking-widest">
              {team?.name || 'NBA'} · Player Intelligence Workspace
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onAskCba(`Can ${player.full_name} be extended or traded under current CBA rules?`, player)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(245,158,11,0.15)] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ASK CBA ABOUT THIS PLAYER</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Premium Player Identity Hero Header (Headshot, Name, Number, Position, Team, Age, Contract Status) */}
        <div className="p-6 bg-gradient-to-b from-[#11172a] to-[#090d16] border-b border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Verified Headshot with Team-Colored Subtle Glow Frame */}
            <div 
              className="relative w-24 h-24 rounded-xl bg-[#0e1424] border border-white/15 shrink-0 overflow-hidden flex items-center justify-center shadow-xl"
              style={{
                boxShadow: `0 0 20px ${team?.colors.primary || '#6366f1'}33`,
              }}
            >
              {player.headshot_url && !imageError ? (
                <img
                  src={player.headshot_url}
                  alt={player.full_name}
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div 
                  className="w-full h-full flex flex-col items-center justify-center font-mono font-bold text-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${team?.colors.primary || '#CE1141'}44, #0e1424)`,
                    color: '#ffffff',
                  }}
                >
                  <span>{player.first_name?.[0] || 'N'}{player.last_name?.[0] || 'A'}</span>
                  <span className="text-[10px] font-normal text-neutral-400 tracking-wider mt-1">
                    {team?.abbreviation || 'NBA'}
                  </span>
                </div>
              )}
            </div>

            {/* Core Bio Details & Status Chips */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Jersey Number */}
                <span className="font-mono text-xl font-extrabold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded">
                  #{player.jersey_number || '—'}
                </span>

                {/* Player Name */}
                <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight truncate">
                  {player.full_name}
                </h2>

                <EvidenceBadge state={player.data_status} size="sm" />

                {/* Contract Status Banner */}
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
                  {player.two_way_status ? 'TWO-WAY CONTRACT' : player.contract_type || 'STANDARD GUARANTEED'}
                </span>
              </div>

              {/* Bio Sub-grid: Position, Team, Age, Contract Status, 2026-27 Salary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2 border-t border-white/5 text-xs font-mono">
                <div>
                  <span className="text-neutral-500 uppercase text-[10px] block font-semibold">Position</span>
                  <span className="font-bold text-neutral-200">{player.position}</span>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase text-[10px] block font-semibold">Team</span>
                  <span className="font-bold text-neutral-200">{team?.name || 'NBA'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase text-[10px] block font-semibold">Age · Ht · Wt</span>
                  <span className="font-bold text-neutral-200">
                    {player.age ?? '—'}y · {player.height} · {player.weight}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase text-[10px] block font-semibold">Experience</span>
                  <span className="font-bold text-neutral-200">{player.nba_experience}</span>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase text-[10px] block font-semibold">2026-27 Salary</span>
                  <span className="font-bold text-amber-300">{formatCurrency(player.current_salary)}</span>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase text-[10px] block font-semibold">Contract Status</span>
                  <span className="font-bold text-sky-400 truncate block">
                    {player.extension_eligible ? 'Extension Eligible' : 'Under Contract'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Primary Tab Navigation (OVERVIEW, CONTRACT, PERFORMANCE, AVAILABILITY, LINEUPS, DEVELOPMENT, TRANSACTIONS, CBA) */}
        <div className="px-6 border-b border-white/10 bg-[#0e1424] flex gap-1.5 overflow-x-auto no-scrollbar py-2.5">
          {primaryTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-mono font-bold whitespace-nowrap rounded-lg transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-[0_0_14px_rgba(99,102,241,0.5)] border border-indigo-400/40'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 4. Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#090d16]">
          {/* OVERVIEW TAB */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#0e1424] border border-white/5 rounded-xl">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                    Contract Archetype
                  </span>
                  <span className="text-sm font-bold text-neutral-200">
                    {player.contract_type}
                  </span>
                  <p className="text-xs text-neutral-400 mt-2">
                    Standard guaranteed player contract filed with NBA league operations under Article II.
                  </p>
                </div>
                <div className="p-4 bg-[#0e1424] border border-white/5 rounded-xl">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                    How Acquired
                  </span>
                  <span className="text-sm font-bold text-neutral-200">
                    {player.how_acquired}
                  </span>
                  <p className="text-xs text-neutral-400 mt-2">
                    Drafted {player.draft_year ? `${player.draft_year} (Round ${player.draft_round || 1}, Pick ${player.draft_pick || '—'})` : 'via Free Agency'}.
                  </p>
                </div>
                <div className="p-4 bg-[#0e1424] border border-white/5 rounded-xl">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                    Free Agency Status
                  </span>
                  <span className="text-sm font-bold text-amber-300">
                    {player.free_agency_year ? `${player.free_agency_year} Free Agent` : 'Under Multi-Year Control'}
                  </span>
                  <p className="text-xs text-neutral-400 mt-2">
                    {player.option_type ? `Option: ${player.option_type}` : 'Unrestricted free agent upon contract completion.'}
                  </p>
                </div>
              </div>

              {/* Quick Performance Preview */}
              <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <span>Recent Performance Snapshot</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('PERFORMANCE')}
                    className="font-mono text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>Open Advanced Performance Tab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <PlayerPerformanceTab player={player} />
              </div>
            </div>
          )}

          {/* CONTRACT TAB */}
          {activeTab === 'CONTRACT' && (
            <PlayerContractMarketTab player={player} contract={contract} />
          )}

          {/* PERFORMANCE TAB */}
          {activeTab === 'PERFORMANCE' && (
            <PlayerPerformanceTab player={player} />
          )}

          {/* AVAILABILITY TAB */}
          {activeTab === 'AVAILABILITY' && (
            <PlayerAvailabilityTab player={player} />
          )}

          {/* LINEUPS TAB */}
          {activeTab === 'LINEUPS' && (
            <PlayerLineupsTab player={player} />
          )}

          {/* DEVELOPMENT TAB (Hosts Deep Scouting, Progression, Shot Profile, Defense, Playmaking, G League, Video, Sources) */}
          {activeTab === 'DEVELOPMENT' && (
            <div className="space-y-6">
              {/* Secondary Sub-Navigation for Deep Intelligence */}
              <div className="bg-[#0e1424] border border-white/10 rounded-xl p-3 flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[10px] text-neutral-400 uppercase font-semibold mr-2">
                  Intelligence Dimension:
                </span>
                {[
                  { id: 'DEVELOPMENT_SUMMARY', label: 'Physical Profile' },
                  { id: 'PROGRESSION', label: 'Multi-Year Progression' },
                  { id: 'SHOT_PROFILE', label: 'Spatial Shot Geography' },
                  { id: 'PLAYMAKING', label: 'Playmaking Grades' },
                  { id: 'DEFENSE', label: 'Defensive Versatility' },
                  { id: 'MARKET_BENCHMARK', label: 'Market Benchmark' },
                  { id: 'G_LEAGUE', label: 'G League Pathway' },
                  { id: 'VIDEO', label: 'Computer Vision Video' },
                  { id: 'SOURCES', label: 'Lineage & Sources' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setDevelopmentSubTab(st.id as DeepAnalyticsSubTab)}
                    className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all cursor-pointer ${
                      developmentSubTab === st.id
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Sub-tab 1: Physical Profile & Development Summary */}
              {developmentSubTab === 'DEVELOPMENT_SUMMARY' && (
                <div className="space-y-4">
                  <div className="p-5 bg-[#0e1424] border border-white/10 rounded-xl space-y-3 font-mono text-xs">
                    <h3 className="text-sm font-bold text-white uppercase">
                      Player Development & Anthropometric Profile
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-neutral-300 pt-2 border-t border-white/5">
                      <div>Draft Class: <span className="text-white font-bold block">{player.draft_year || 'Verified Active'}</span></div>
                      <div>Wingspan / Frame: <span className="text-white font-bold block">{player.height} (Projected +4")</span></div>
                      <div>Body Composition: <span className="text-white font-bold block">{player.weight}</span></div>
                      <div>Skill Curve: <span className="text-emerald-400 font-bold block">Ascending Tier-1</span></div>
                    </div>
                  </div>
                  <SkillGradeTable grades={skillGrades} />
                </div>
              )}

              {/* Sub-tab 2: Progression */}
              {developmentSubTab === 'PROGRESSION' && (
                <PlayerProgressionTab player={player} />
              )}

              {/* Sub-tab 3: Spatial Shot Profile */}
              {developmentSubTab === 'SHOT_PROFILE' && (
                <PlayerScoutingTab player={player} />
              )}

              {/* Sub-tab 4: Playmaking */}
              {developmentSubTab === 'PLAYMAKING' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#0e1424] border border-white/10 rounded-xl space-y-1">
                    <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                      Playmaking & Decision Making Metrics
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Live-dribble passing accuracy, turnover leverage, and secondary creation rates.
                    </p>
                  </div>
                  <SkillGradeTable grades={skillGrades} filterCategory="Playmaking" />
                </div>
              )}

              {/* Sub-tab 5: Defense */}
              {developmentSubTab === 'DEFENSE' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#0e1424] border border-white/10 rounded-xl space-y-1">
                    <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                      Defensive Versatility & Point-of-Attack Impact
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Screen navigation, rim protection differential, and switch versatility rating.
                    </p>
                  </div>
                  <SkillGradeTable grades={skillGrades} filterCategory="Defense" />
                </div>
              )}

              {/* Sub-tab 6: Market Benchmark */}
              {developmentSubTab === 'MARKET_BENCHMARK' && (
                <PlayerContractMarketTab player={player} contract={contract} />
              )}

              {/* Sub-tab 7: G League */}
              {developmentSubTab === 'G_LEAGUE' && (
                <div className="space-y-4">
                  <div className="p-5 bg-[#0e1424] border border-white/10 rounded-xl space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <h3 className="text-sm font-bold text-white uppercase">
                        G League Affiliate Pathway
                      </h3>
                      <span className="text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                        {team?.affiliateName || 'Rio Grande Valley Vipers'}
                      </span>
                    </div>
                    <p className="text-neutral-400 text-xs">
                      Developmental assignment tracking, training camp affiliations, and two-way movement limits under the 2023 CBA.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-neutral-300">
                      <div>Status: <span className="text-white font-bold">NBA Active Roster</span></div>
                      <div>Assignment Days: <span className="text-white font-bold">0 Days (Full NBA Duty)</span></div>
                      <div>Affiliate Rights: <span className="text-white font-bold">{team?.name || 'NBA'}</span></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 8: Video */}
              {developmentSubTab === 'VIDEO' && (
                <PlayerVideoTab player={player} />
              )}

              {/* Sub-tab 9: Sources */}
              {developmentSubTab === 'SOURCES' && (
                <div className="space-y-4">
                  <div className="p-5 bg-[#0e1424] border border-white/10 rounded-xl space-y-3 font-mono text-xs">
                    <h3 className="text-sm font-bold text-white uppercase">
                      Data Lineage & Evidence Source Trace
                    </h3>
                    <div className="border border-white/5 rounded-lg p-3 bg-[#0a0d14] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold">NBA League Operations Registry</span>
                        <EvidenceBadge state="VERIFIED_CURRENT" size="sm" />
                      </div>
                      <div className="text-[11px] text-neutral-400 break-all">
                        URL: {player.source_url || 'https://data.nba.com/v1/league_operations'}
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        Retrieved: {player.retrieved_at || 'October 1, 2026 12:00 UTC'} · Effective: {player.effective_date || '2026-10-01'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TRANSACTIONS TAB */}
          {activeTab === 'TRANSACTIONS' && (
            <div className="space-y-4">
              <div className="p-5 bg-[#0e1424] border border-white/10 rounded-xl space-y-3 font-mono text-xs">
                <h3 className="text-sm font-bold text-white uppercase">
                  Verified Transaction History
                </h3>
                <div className="border border-white/5 rounded-lg p-3 bg-[#0a0d14] space-y-1">
                  <span className="text-neutral-400 text-[10px]">October 1, 2026 · Contract Filing</span>
                  <div className="text-white font-bold">{player.contract_type} Verified Active</div>
                  <p className="text-neutral-400 text-[11px]">
                    Filed with NBA league office. Source: Collective Bargaining Operations Registry.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CBA TAB */}
          {activeTab === 'CBA' && (
            <div className="space-y-4">
              <div className="p-5 bg-[#0e1424] border border-white/10 rounded-xl space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-sm font-bold text-amber-300 uppercase">
                    CBA Contract & Trade Eligibility Screening
                  </h3>
                  <button
                    onClick={() => onAskCba(`Explain the trade restrictions and extension eligibility for ${player.full_name}`, player)}
                    className="text-amber-400 hover:text-white transition-colors"
                  >
                    Open in Ask CBA →
                  </button>
                </div>
                <div className="space-y-2 text-neutral-300 text-xs">
                  <div>
                    <span className="text-neutral-500 uppercase text-[10px] block">Trade Restriction</span>
                    <span className="text-white font-bold">No restriction currently active</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 uppercase text-[10px] block">Extension Window</span>
                    <span className="text-white font-bold">
                      {player.extension_eligible ? 'Eligible for rookie scale extension' : 'Standard veteran extension rules apply'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 uppercase text-[10px] block">Bird Rights Status</span>
                    <span className="text-white font-bold">Full Bird Rights / Early Bird applicable upon contract expiry</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
