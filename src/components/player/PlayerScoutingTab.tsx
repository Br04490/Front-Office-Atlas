import React, { useState } from 'react';
import { Player } from '../../types';
import { PlayerIntelligenceService } from '../../services/playerIntelligence';
import { SkillGradeTable } from './SkillGradeTable';
import { Target, Layers, ShieldCheck, Compass, Info, Flame } from 'lucide-react';

interface PlayerScoutingTabProps {
  player: Player;
}

export const PlayerScoutingTab: React.FC<PlayerScoutingTabProps> = ({ player }) => {
  const zones = PlayerIntelligenceService.getShotZoneProfile(player);
  const grades = PlayerIntelligenceService.getSkillGrades(player);
  const [selectedZone, setSelectedZone] = useState<string>('Rim');

  const activeZoneObj = zones.find((z) => z.zone === selectedZone) || zones[0];

  return (
    <div className="space-y-6">
      {/* 1. Tactical Shot Geography & Court Visualizer */}
      <div className="bg-[#0f1422] border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                Spatial Shot Geography & Zone Efficiency
              </h3>
              <span className="font-mono text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                2026-27 Active Profile
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Shot frequency shares and relative true field-goal efficiency against verified NBA league averages.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-neutral-500">Selected Zone:</span>
            <span className="text-indigo-400 font-bold">{activeZoneObj.zone}</span>
          </div>
        </div>

        {/* 6 Shot Zone Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {zones.map((z) => {
            const isSelected = selectedZone === z.zone;
            const isHot = z.relative_efficiency > 2;

            return (
              <div
                key={z.zone}
                onClick={() => setSelectedZone(z.zone)}
                className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 select-none ${
                  isSelected
                    ? 'bg-[#141a2a] border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)] ring-1 ring-indigo-400/40'
                    : 'bg-[#121622] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-neutral-200 truncate">{z.zone}</span>
                  {isHot && <Flame className="w-3 h-3 text-amber-400 shrink-0" />}
                </div>

                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">FG%</span>
                  <span className="font-mono text-base font-extrabold text-white">{z.fg_pct}%</span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-neutral-400">{z.frequency_pct}% Share</span>
                  <span className={z.relative_efficiency >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {z.relative_efficiency >= 0 ? `+${z.relative_efficiency}%` : `${z.relative_efficiency}%`}
                  </span>
                </div>

                <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-400 h-full rounded-full"
                    style={{ width: `${z.league_percentile}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Tactical Court Blueprint Graphic */}
        <div className="p-4 bg-[#0a0d14] border border-white/5 rounded-xl flex flex-col md:flex-row items-center gap-6">
          {/* Half-Court SVG Visualizer */}
          <div className="relative w-full max-w-[280px] h-[190px] bg-[#0c101a] border border-white/10 rounded-lg p-2 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 250 200" className="w-full h-full stroke-neutral-700 fill-none stroke-[1.5]">
              {/* Baseline & Sidelines */}
              <rect x="10" y="10" width="230" height="180" rx="4" />
              {/* Paint Key */}
              <rect x="85" y="10" width="80" height="95" className={selectedZone === 'Paint Non-Rim' ? 'stroke-amber-400 fill-amber-500/10' : ''} />
              {/* Restricted Area Arc */}
              <path d="M 105,10 A 20,20 0 0,0 145,10" className={selectedZone === 'Rim' ? 'stroke-indigo-400 fill-indigo-500/20' : ''} />
              {/* Free throw circle */}
              <circle cx="125" cy="105" r="30" />
              {/* Three-point line arc & corners */}
              <path d="M 28,10 L 28,55 A 95,95 0 0,0 222,55 L 222,10" className={selectedZone.includes('3') ? 'stroke-sky-400' : ''} />
            </svg>
            <span className="absolute bottom-2 right-2 text-[9px] font-mono text-neutral-500">
              Interactive FOA Court Blueprint
            </span>
          </div>

          {/* Zone Breakdown details */}
          <div className="flex-1 space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">{activeZoneObj.zone} Profile</span>
              <span className="text-neutral-400">·</span>
              <span className="text-emerald-400 font-bold">{activeZoneObj.league_percentile}th Percentile League Efficiency</span>
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Generates {activeZoneObj.attempts_per_game} attempts per contest at an audited {activeZoneObj.fg_pct}% conversion rate. Represents {activeZoneObj.frequency_pct}% of total offensive shot distribution.
            </p>
            <div className="pt-2 flex items-center gap-4 text-[11px] text-neutral-300">
              <div>Attempts / Game: <span className="text-white font-bold">{activeZoneObj.attempts_per_game}</span></div>
              <div>Relative Efficiency: <span className="text-emerald-400 font-bold">+{activeZoneObj.relative_efficiency}% vs League Avg</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Executive Skill Grade System */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-mono text-xs font-bold text-neutral-300 uppercase tracking-wider">
            Front Office Atlas · Skill Grade Matrix
          </h4>
          <span className="font-mono text-[10px] text-neutral-500">
            Percentile Audited Across Positional Class
          </span>
        </div>
        <SkillGradeTable grades={grades} />
      </div>
    </div>
  );
};
