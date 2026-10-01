import React, { useState } from 'react';
import { Player } from '../types';
import { TeamService, ContractService } from '../services';
import { EvidenceBadge } from './EvidenceBadge';
import { X, Sparkles, AlertCircle, FileText, ArrowRight } from 'lucide-react';

interface PlayerDetailDrawerProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onAskCba: (contextQuery: string, playerContext?: Player) => void;
}

type TabType =
  | 'OVERVIEW'
  | 'CONTRACT'
  | 'CAP'
  | 'PERFORMANCE'
  | 'AVAILABILITY'
  | 'TRANSACTIONS'
  | 'DEVELOPMENT'
  | 'G LEAGUE'
  | 'DRAFT HISTORY'
  | 'CBA'
  | 'SOURCES';

export const PlayerDetailDrawer: React.FC<PlayerDetailDrawerProps> = ({
  player,
  isOpen,
  onClose,
  onAskCba,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [imageError, setImageError] = useState(false);

  if (!isOpen || !player) return null;

  const team = TeamService.getTeamById(player.team_id);
  const contract = ContractService.getPlayerContract(player.player_id);

  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const tabs: TabType[] = [
    'OVERVIEW',
    'CONTRACT',
    'CAP',
    'PERFORMANCE',
    'AVAILABILITY',
    'TRANSACTIONS',
    'DEVELOPMENT',
    'G LEAGUE',
    'DRAFT HISTORY',
    'CBA',
    'SOURCES',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-[#0f1217] border-l border-white/10 h-full flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#13171e]">
          <div className="flex items-center gap-3">
            <span 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: team?.colors.primary || '#CE1141' }}
            />
            <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest">
              {team?.name || 'NBA'} · Player Intelligence Dossier
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onAskCba(`Can ${player.full_name} be extended or traded under current CBA rules?`, player)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-mono font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ASK CBA ABOUT THIS PLAYER</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Player Identity Hero Block */}
        <div className="p-6 bg-gradient-to-b from-[#141820] to-[#0f1217] border-b border-white/10">
          <div className="flex items-start gap-6">
            {/* Large Headshot / Avatar */}
            <div className="relative w-24 h-24 rounded-lg bg-[#0a0c0f] border border-white/10 shrink-0 overflow-hidden flex items-center justify-center">
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
                    background: `linear-gradient(135deg, ${team?.colors.primary || '#CE1141'}44, #0b0d11)`,
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

            {/* Bio details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg font-bold text-amber-400">
                  #{player.jersey_number || '—'}
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight truncate">
                  {player.full_name}
                </h2>
                <EvidenceBadge state={player.data_status} size="sm" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-3 border-t border-white/5 text-xs">
                <div>
                  <span className="text-neutral-500 uppercase font-mono text-[10px] block">Position</span>
                  <span className="font-semibold text-neutral-200">{player.position}</span>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase font-mono text-[10px] block">Age / Height / Weight</span>
                  <span className="font-semibold text-neutral-200">
                    {player.age ?? '—'} · {player.height} · {player.weight}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase font-mono text-[10px] block">NBA Experience</span>
                  <span className="font-semibold text-neutral-200">{player.nba_experience}</span>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase font-mono text-[10px] block">Origin / School</span>
                  <span className="font-semibold text-neutral-200 truncate block">
                    {player.college || player.international_origin || 'Direct Draft'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-white/10 bg-[#11141a] flex gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2.5 text-xs font-mono font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#141820] border border-white/5 rounded-lg">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                    Contract Archetype
                  </span>
                  <span className="text-sm font-semibold text-neutral-200">
                    {player.contract_type}
                  </span>
                </div>
                <div className="p-4 bg-[#141820] border border-white/5 rounded-lg">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                    How Acquired
                  </span>
                  <span className="text-sm font-semibold text-neutral-200">
                    {player.how_acquired}
                  </span>
                </div>
                <div className="p-4 bg-[#141820] border border-white/5 rounded-lg">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                    Free Agency Status
                  </span>
                  <span className="text-sm font-semibold text-neutral-200">
                    {player.free_agency_year ? `${player.free_agency_year} Unrestricted` : 'Pending Verification'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#141820] border border-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
                    Contract Commitment Summary
                  </h3>
                  <EvidenceBadge state={player.data_status} size="sm" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-neutral-500 block">Current Salary</span>
                    <span className="font-mono text-neutral-200 text-sm font-semibold tabular-nums">
                      {formatCurrency(player.current_salary)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Cap Hit</span>
                    <span className="font-mono text-neutral-200 text-sm font-semibold tabular-nums">
                      {formatCurrency(player.current_cap_hit)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Guaranteed</span>
                    <span className="font-mono text-neutral-200 text-sm font-semibold tabular-nums">
                      {formatCurrency(player.guaranteed_amount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Remaining Years</span>
                    <span className="font-mono text-neutral-200 text-sm font-semibold">
                      {player.years_remaining !== null ? `${player.years_remaining} Seasons` : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-neutral-300">
                  <span className="font-bold text-amber-300 block mb-0.5">
                    Data Integrity Notice: Verification Required
                  </span>
                  Official player contracts, bonus incentives, and physical evaluation records are maintained in the primary front-office ledger. Unverified media estimates are excluded.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'CONTRACT' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-100">
                    Multi-Year Compensation Breakdown
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Annual base salary, cap charges, guaranteed protections, and option decision deadlines.
                  </p>
                </div>
                <EvidenceBadge state={contract ? contract.data_status : 'DATA NOT CONNECTED'} size="sm" />
              </div>

              {contract ? (
                <div className="border border-white/10 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#141820] text-neutral-400 font-mono text-[10px] uppercase border-b border-white/5">
                      <tr>
                        <th className="py-2.5 px-4">Season</th>
                        <th className="py-2.5 px-4 text-right">Base Salary</th>
                        <th className="py-2.5 px-4 text-right">Cap Hit</th>
                        <th className="py-2.5 px-4 text-right">Guaranteed</th>
                        <th className="py-2.5 px-4">Option / Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {contract.seasons.map((s) => (
                        <tr key={s.season} className="hover:bg-white/5">
                          <td className="py-2.5 px-4 font-semibold text-neutral-200">{s.season}</td>
                          <td className="py-2.5 px-4 text-right tabular-nums text-neutral-300">{formatCurrency(s.base_salary)}</td>
                          <td className="py-2.5 px-4 text-right tabular-nums text-neutral-100 font-semibold">{formatCurrency(s.cap_hit)}</td>
                          <td className="py-2.5 px-4 text-right tabular-nums text-neutral-300">{formatCurrency(s.guaranteed)}</td>
                          <td className="py-2.5 px-4 text-neutral-400">{s.option_type || 'Guaranteed'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 bg-[#141820] border border-white/10 rounded-lg text-center">
                  <FileText className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                  <div className="text-sm font-bold text-neutral-300">
                    CONTRACT SCHEDULE AWAITING VERIFIED INGEST
                  </div>
                  <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1">
                    Season-by-season salary schedules will automatically populate when the Supabase contracts table or official league feed is connected.
                  </p>
                </div>
              )}

              {contract && contract.decision_dates.length > 0 && (
                <div className="p-4 bg-[#141820] border border-white/10 rounded-lg">
                  <h4 className="text-xs font-mono font-bold uppercase text-neutral-300 mb-3">
                    Important Decision Dates
                  </h4>
                  <div className="space-y-2.5">
                    {contract.decision_dates.map((d, i) => (
                      <div key={i} className="flex items-start justify-between text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <div>
                          <span className="font-semibold text-neutral-200">{d.label}</span>
                          <span className="text-neutral-500 block text-[11px]">{d.description}</span>
                        </div>
                        <span className="font-mono text-amber-400 font-medium shrink-0 ml-4">{d.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'AVAILABILITY' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-100">Availability & Participation Ledger</h3>
                  <p className="text-xs text-neutral-400">
                    Historical games missed and formal league availability notifications.
                  </p>
                </div>
                <EvidenceBadge state="VERIFICATION REQUIRED" size="sm" />
              </div>

              <div className="p-4 bg-[#141820] border border-white/10 rounded-lg text-xs space-y-2 text-neutral-300">
                <div className="font-bold text-neutral-200">Strict Front-Office Medical Rule:</div>
                <p className="text-neutral-400">
                  Front Office Atlas never generates or hallucinates medical diagnoses, prognosis, or subjective return timelines. Only officially filed league availability designations are reflected.
                </p>
              </div>

              <div className="p-6 bg-[#141820] border border-dashed border-white/10 rounded-lg text-center text-xs text-neutral-500">
                AVAILABILITY STREAM PENDING VERIFIED INGESTION PIPE
              </div>
            </div>
          )}

          {activeTab === 'CBA' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-100">CBA Rules Governing This Player</h3>
                <EvidenceBadge state="VERIFIED CURRENT DATA" size="sm" />
              </div>
              <div className="p-4 bg-[#141820] border border-white/10 rounded-lg text-xs space-y-3">
                <div className="font-mono text-amber-400 font-semibold">
                  Article XI, Section 4 · Extension Eligibility
                </div>
                <p className="text-neutral-300">
                  Under the 2023 CBA, players meeting requisite service time criteria can sign extensions for up to 140% of their previous season salary or 140% of the league average salary.
                </p>
                <button
                  onClick={() => onAskCba(`Explain extension parameters and trade restrictions for ${player.full_name}.`, player)}
                  className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-mono text-xs font-semibold pt-1"
                >
                  <span>Launch Atlas CBA analysis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Fallback for other tabs */}
          {['CAP', 'PERFORMANCE', 'TRANSACTIONS', 'DEVELOPMENT', 'G LEAGUE', 'DRAFT HISTORY', 'SOURCES'].includes(activeTab) && (
            <div className="p-8 bg-[#141820] border border-dashed border-white/10 rounded-lg text-center space-y-2">
              <div className="font-mono text-xs font-bold text-neutral-300 uppercase">
                {activeTab} LEDGER · DATA NOT CONNECTED
              </div>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Component and state architecture established. Awaiting verified database sync.
              </p>
              <div className="pt-2">
                <EvidenceBadge state="SOURCE PENDING" size="sm" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
