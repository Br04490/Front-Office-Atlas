import React, { useState } from 'react';
import { PlayerIntelligenceService } from '../services/playerIntelligence';
import { TwoWayTrackingRecord } from '../types';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { 
  Building2, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Layers,
  Activity,
  ArrowUpDown,
  Filter
} from 'lucide-react';

interface TwoWayCommandViewProps {
  onSelectPlayerName?: (name: string) => void;
}

export const TwoWayCommandView: React.FC<TwoWayCommandViewProps> = ({ onSelectPlayerName }) => {
  const allRecords = PlayerIntelligenceService.getTwoWayCommandRegistry();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NBA_ACTIVE' | 'GLEAGUE_ASSIGNED'>('ALL');

  const filteredRecords = allRecords.filter((rec) => {
    const matchesSearch =
      rec.player_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.affiliate_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'NBA_ACTIVE' && rec.current_location === 'NBA ACTIVE ROSTER') ||
      (statusFilter === 'GLEAGUE_ASSIGNED' && rec.current_location === 'G LEAGUE ASSIGNMENT');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-sky-400" />
              <span>Two-Way Command Center</span>
            </h1>
            <span className="font-mono text-xs text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded uppercase">
              50-Game NBA Active List Cap Tracking
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Official league registry monitoring two-way contracts, developmental assignments to G League affiliates, active list day counts, and standard conversion eligibility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <EvidenceBadge state="VERIFIED_CURRENT" size="md" />
        </div>
      </div>

      {/* 2. Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0f1422] border border-white/10 rounded-xl space-y-1">
          <span className="text-[10px] font-mono text-neutral-500 uppercase block">Active Two-Way Contracts</span>
          <span className="font-mono text-2xl font-bold text-white">90 Roster Slots</span>
          <span className="text-[10px] font-mono text-neutral-400 block">3 Allowed Per NBA Franchise</span>
        </div>

        <div className="p-4 bg-[#0f1422] border border-white/10 rounded-xl space-y-1">
          <span className="text-[10px] font-mono text-neutral-500 uppercase block">Current Location: NBA Duty</span>
          <span className="font-mono text-2xl font-bold text-emerald-400">42 Players</span>
          <span className="text-[10px] font-mono text-emerald-400/80 block">Active List / Traveling</span>
        </div>

        <div className="p-4 bg-[#0f1422] border border-white/10 rounded-xl space-y-1">
          <span className="text-[10px] font-mono text-neutral-500 uppercase block">Current Location: G League</span>
          <span className="font-mono text-2xl font-bold text-sky-400">48 Players</span>
          <span className="text-[10px] font-mono text-sky-400/80 block">On Affiliate Assignment</span>
        </div>

        <div className="p-4 bg-[#0f1422] border border-white/10 rounded-xl space-y-1">
          <span className="text-[10px] font-mono text-neutral-500 uppercase block">Conversion Window</span>
          <span className="font-mono text-2xl font-bold text-amber-300">Open</span>
          <span className="text-[10px] font-mono text-amber-400/80 block">Standard Contract Upgrade</span>
        </div>
      </div>

      {/* 3. Filter Toolbar & Search */}
      <div className="bg-[#0f1422] border border-white/10 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-[#141a2a] p-1 rounded-lg border border-white/5 text-xs font-mono">
          {(['ALL', 'NBA_ACTIVE', 'GLEAGUE_ASSIGNED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {st === 'ALL' ? 'All Locations' : st === 'NBA_ACTIVE' ? 'NBA Active' : 'G League Assignment'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search two-way player, team, affiliate..."
            className="w-full bg-[#141a2a] border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-sky-400/50 transition-colors font-mono"
          />
        </div>
      </div>

      {/* 4. Two-Way Tracking Ledger Table */}
      <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0f1422]">
        <table className="w-full text-xs text-left font-mono">
          <thead className="bg-[#141a2a] text-neutral-400 text-[10px] uppercase border-b border-white/5">
            <tr>
              <th className="py-3 px-4">Two-Way Player</th>
              <th className="py-3 px-4">NBA Parent Club</th>
              <th className="py-3 px-4">G League Affiliate</th>
              <th className="py-3 px-3">Current Location</th>
              <th className="py-3 px-3">NBA Active Days</th>
              <th className="py-3 px-3">50-Game Cap Usage</th>
              <th className="py-3 px-4">Recent Transaction Action</th>
              <th className="py-3 px-4 text-right">Conversion State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[11px] text-neutral-300">
            {filteredRecords.map((rec) => {
              const capUsedPct = Math.round((rec.nba_active_list_days / rec.max_active_list_days) * 100);

              return (
                <tr key={rec.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-white font-bold">
                    {rec.player_name}
                  </td>
                  <td className="py-3 px-4 text-neutral-200">
                    {rec.team_name}
                  </td>
                  <td className="py-3 px-4 text-neutral-400">
                    {rec.affiliate_name}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border ${
                      rec.current_location === 'NBA ACTIVE ROSTER'
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                        : 'text-sky-400 bg-sky-500/10 border-sky-500/30'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        rec.current_location === 'NBA ACTIVE ROSTER' ? 'bg-emerald-400' : 'bg-sky-400'
                      }`} />
                      {rec.current_location}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-neutral-200 font-semibold">
                    {rec.nba_active_list_days} / {rec.max_active_list_days} Days
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${capUsedPct > 80 ? 'bg-rose-400' : 'bg-sky-400'}`}
                          style={{ width: `${capUsedPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-neutral-400">{capUsedPct}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-neutral-400 text-[10px]">
                    {rec.recent_action}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                      Standard Eligible
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
