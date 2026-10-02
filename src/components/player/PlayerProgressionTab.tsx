import React, { useState } from 'react';
import { Player } from '../../types';
import { PlayerIntelligenceService } from '../../services/playerIntelligence';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus, Activity, ShieldCheck } from 'lucide-react';

interface PlayerProgressionTabProps {
  player: Player;
}

export const PlayerProgressionTab: React.FC<PlayerProgressionTabProps> = ({ player }) => {
  const snapshot = PlayerIntelligenceService.getProgressionSnapshot(player);
  const [selectedMetric, setSelectedMetric] = useState<string>('ppg');

  const b24 = snapshot.baselines['2024-25'];
  const b25 = snapshot.baselines['2025-26'];
  const live26 = snapshot.baselines['2026-27_LIVE'];

  const currentMetricObj = snapshot.metrics_comparison.find((m) => m.metric === selectedMetric) || snapshot.metrics_comparison[0];

  return (
    <div className="space-y-6">
      {/* 1. Header explanation & metric selector */}
      <div className="bg-[#0f1422] border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                Multi-Year Career Progression Engine
              </h3>
              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                2024-25 → 2026-27 Live
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Tracks year-over-year baseline progression against live 2026-27 regular season observations.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-neutral-500">Selected Metric:</span>
            <span className="text-amber-300 font-bold">{currentMetricObj.label}</span>
          </div>
        </div>

        {/* Metric Selector Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {snapshot.metrics_comparison.map((item) => (
            <button
              key={item.metric}
              onClick={() => setSelectedMetric(item.metric)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedMetric === item.metric
                  ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)] border border-indigo-400/50'
                  : 'bg-[#141a2a] text-neutral-400 hover:text-neutral-200 border border-white/5'
              }`}
            >
              <span>{item.label}</span>
              <span className={`text-[10px] ${
                item.trend === 'UP' ? 'text-emerald-300' : item.trend === 'DOWN' ? 'text-rose-300' : 'text-neutral-400'
              }`}>
                {item.change_pct > 0 ? `+${item.change_pct}%` : `${item.change_pct}%`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Visual Multi-Year Baseline Progression Canvas */}
      <div className="bg-[#0f1422] border border-white/10 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <span className="font-mono text-xs text-neutral-400 uppercase tracking-wider">
            Trajectory Comparison: {currentMetricObj.label}
          </span>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
              <span>2024-25 Baseline</span>
            </span>
            <span className="flex items-center gap-1.5 text-neutral-300">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
              <span>2025-26 Baseline</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-300 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span>2026-27 Live (Current)</span>
            </span>
          </div>
        </div>

        {/* 3 Step Multi-Year Bar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Year 1: 2024-25 */}
          <div className="p-4 bg-[#141a2a] border border-white/5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-neutral-400">2024-25 Season</span>
              <span className="text-[10px] font-mono text-neutral-500">74 Games</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-extrabold text-neutral-300">
                {currentMetricObj.val_24_25}
              </span>
              <span className="text-xs text-neutral-500 font-mono">Baseline</span>
            </div>
            <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-neutral-500 h-full rounded-full"
                style={{ width: `${Math.min(100, (currentMetricObj.val_24_25 / (currentMetricObj.val_26_27_live * 1.15 || 1)) * 100)}%` }}
              />
            </div>
            <span className="text-[11px] text-neutral-500 font-mono block">Audited Final Regular Season</span>
          </div>

          {/* Year 2: 2025-26 */}
          <div className="p-4 bg-[#141a2a] border border-indigo-500/20 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-indigo-300">2025-26 Season</span>
              <span className="text-[10px] font-mono text-indigo-400">78 Games</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-extrabold text-white">
                {currentMetricObj.val_25_26}
              </span>
              <span className="text-xs text-indigo-400 font-mono">
                {currentMetricObj.val_25_26 >= currentMetricObj.val_24_25 ? '+' : ''}
                {Math.round((currentMetricObj.val_25_26 - currentMetricObj.val_24_25) * 10) / 10}
              </span>
            </div>
            <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full"
                style={{ width: `${Math.min(100, (currentMetricObj.val_25_26 / (currentMetricObj.val_26_27_live * 1.15 || 1)) * 100)}%` }}
              />
            </div>
            <span className="text-[11px] text-indigo-400/80 font-mono block">Audited Full Season</span>
          </div>

          {/* Year 3: 2026-27 Live */}
          <div className="p-4 bg-[#141a2a] border border-amber-500/40 rounded-xl space-y-3 shadow-[0_0_20px_rgba(245,158,11,0.08)]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-amber-300">2026-27 (Live Active)</span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                14 Games Ingested
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-extrabold text-amber-300">
                {currentMetricObj.val_26_27_live}
              </span>
              <span className={`text-xs font-mono font-bold flex items-center ${
                currentMetricObj.change_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {currentMetricObj.change_pct >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {currentMetricObj.change_pct > 0 ? `+${currentMetricObj.change_pct}%` : `${currentMetricObj.change_pct}%`}
              </span>
            </div>
            <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-amber-400 h-full rounded-full shadow-[0_0_10px_rgba(245,158,11,0.6)]"
                style={{ width: '92%' }}
              />
            </div>
            <span className="text-[11px] text-neutral-400 font-mono block">Recalculated After Every Final Game</span>
          </div>
        </div>

        {/* Detailed Full Season Aggregate Table */}
        <div className="pt-2">
          <h4 className="font-mono text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3">
            Full Box Score Season Comparison
          </h4>
          <div className="border border-white/5 rounded-lg overflow-x-auto bg-[#0a0d14]">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-[#141a2a] text-neutral-400 text-[10px] uppercase border-b border-white/5">
                <tr>
                  <th className="py-2.5 px-4">Season</th>
                  <th className="py-2.5 px-3">GP</th>
                  <th className="py-2.5 px-3">MPG</th>
                  <th className="py-2.5 px-3">PPG</th>
                  <th className="py-2.5 px-3">APG</th>
                  <th className="py-2.5 px-3">RPG</th>
                  <th className="py-2.5 px-3">FG%</th>
                  <th className="py-2.5 px-3">3P%</th>
                  <th className="py-2.5 px-3">TS%</th>
                  <th className="py-2.5 px-3">USG%</th>
                  <th className="py-2.5 px-3">ORTG</th>
                  <th className="py-2.5 px-3">DRTG</th>
                  <th className="py-2.5 px-4 text-right">NET RTG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[11px]">
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-4 text-neutral-400 font-bold">{b24.season}</td>
                  <td className="py-2.5 px-3">{b24.games_played}</td>
                  <td className="py-2.5 px-3">{b24.mpg}</td>
                  <td className="py-2.5 px-3 font-semibold text-white">{b24.ppg}</td>
                  <td className="py-2.5 px-3">{b24.apg}</td>
                  <td className="py-2.5 px-3">{b24.rpg}</td>
                  <td className="py-2.5 px-3">{(b24.fg_pct * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3">{(b24.three_pct * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3">{(b24.ts_pct * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3">{b24.usg_pct}%</td>
                  <td className="py-2.5 px-3">{b24.ortg}</td>
                  <td className="py-2.5 px-3">{b24.drtg}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-emerald-400">+{b24.net_rating}</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-4 text-neutral-300 font-bold">{b25.season}</td>
                  <td className="py-2.5 px-3">{b25.games_played}</td>
                  <td className="py-2.5 px-3">{b25.mpg}</td>
                  <td className="py-2.5 px-3 font-semibold text-white">{b25.ppg}</td>
                  <td className="py-2.5 px-3">{b25.apg}</td>
                  <td className="py-2.5 px-3">{b25.rpg}</td>
                  <td className="py-2.5 px-3">{(b25.fg_pct * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3">{(b25.three_pct * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3">{(b25.ts_pct * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3">{b25.usg_pct}%</td>
                  <td className="py-2.5 px-3">{b25.ortg}</td>
                  <td className="py-2.5 px-3">{b25.drtg}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-emerald-400">+{b25.net_rating}</td>
                </tr>
                <tr className="bg-amber-500/5 hover:bg-amber-500/10">
                  <td className="py-2.5 px-4 text-amber-300 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>{live26.season}</span>
                  </td>
                  <td className="py-2.5 px-3 text-amber-200">{live26.games_played}</td>
                  <td className="py-2.5 px-3 text-amber-200">{live26.mpg}</td>
                  <td className="py-2.5 px-3 font-bold text-amber-300">{live26.ppg}</td>
                  <td className="py-2.5 px-3 text-amber-200">{live26.apg}</td>
                  <td className="py-2.5 px-3 text-amber-200">{live26.rpg}</td>
                  <td className="py-2.5 px-3 text-amber-200">{(live26.fg_pct * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-amber-200">{(live26.three_pct * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-amber-200">{(live26.ts_pct * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-amber-200">{live26.usg_pct}%</td>
                  <td className="py-2.5 px-3 text-amber-200">{live26.ortg}</td>
                  <td className="py-2.5 px-3 text-amber-200">{live26.drtg}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-amber-300">+{live26.net_rating}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
