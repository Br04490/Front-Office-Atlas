import React, { useState } from 'react';
import { Player } from '../../types';
import { PlayerIntelligenceService } from '../../services/playerIntelligence';
import { Users, Activity, Scale, ShieldCheck } from 'lucide-react';

interface PlayerLineupsTabProps {
  player: Player;
}

export const PlayerLineupsTab: React.FC<PlayerLineupsTabProps> = ({ player }) => {
  const combos = PlayerIntelligenceService.getLineupCombinations(player);
  const [selectedType, setSelectedType] = useState<'ALL' | '2-Man' | '3-Man' | '5-Man'>('ALL');

  const filteredCombos = selectedType === 'ALL'
    ? combos
    : combos.filter((c) => c.type === selectedType);

  return (
    <div className="space-y-6">
      {/* 1. Lineup Intelligence Header */}
      <div className="bg-[#0f1422] border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                Lineup Synergy & Stint Intelligence
              </h3>
              <span className="font-mono text-[10px] text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded">
                pbpstats Stint Engine
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Net rating, pace, and possession efficiency when paired alongside primary rotational partners.
            </p>
          </div>

          {/* Type Segmented Filter */}
          <div className="flex items-center gap-1 bg-[#141a2a] p-1 rounded-lg border border-white/5 text-xs font-mono">
            {(['ALL', '2-Man', '3-Man', '5-Man'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedType === t
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Lineups List */}
        <div className="space-y-3">
          {filteredCombos.map((combo, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#141a2a] border border-white/5 rounded-xl space-y-3 font-mono text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                    {combo.type} Combination
                  </span>
                  <span className="text-white font-semibold">
                    {player.full_name} + {combo.teammates.join(' + ')}
                  </span>
                </div>
                <div className="text-neutral-400 text-[11px]">
                  {combo.minutes} Min · {combo.possessions} Possessions · Pace {combo.pace}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 bg-[#0a0d14] rounded-lg">
                  <span className="text-[10px] text-neutral-500 uppercase block">Offensive Rating</span>
                  <span className="text-sm font-bold text-white">{combo.offensive_rating}</span>
                </div>
                <div className="p-2.5 bg-[#0a0d14] rounded-lg">
                  <span className="text-[10px] text-neutral-500 uppercase block">Defensive Rating</span>
                  <span className="text-sm font-bold text-white">{combo.defensive_rating}</span>
                </div>
                <div className="p-2.5 bg-[#0a0d14] rounded-lg">
                  <span className="text-[10px] text-neutral-500 uppercase block">Net Rating</span>
                  <span className="text-sm font-bold text-emerald-400">+{combo.net_rating}</span>
                </div>
                <div className="p-2.5 bg-[#0a0d14] rounded-lg">
                  <span className="text-[10px] text-neutral-500 uppercase block">True Shooting %</span>
                  <span className="text-sm font-bold text-amber-300">{(combo.ts_pct * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
