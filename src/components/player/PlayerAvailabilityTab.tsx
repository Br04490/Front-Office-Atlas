import React, { useState, useMemo } from 'react';
import { Player, GamePlayerStat, GameAvailabilityState } from '../../types';
import { PlayerIntelligenceService } from '../../services/playerIntelligence';
import { ShieldCheck, AlertCircle, Info, Calendar, Activity, Clock, FileText } from 'lucide-react';

interface PlayerAvailabilityTabProps {
  player: Player;
}

type AvailabilityWindow = 'L5' | 'L10' | 'L15' | 'SEASON';

export const PlayerAvailabilityTab: React.FC<PlayerAvailabilityTabProps> = ({ player }) => {
  const [timeWindow, setTimeWindow] = useState<AvailabilityWindow>('SEASON');
  const [selectedGame, setSelectedGame] = useState<GamePlayerStat | null>(null);

  const allGames = useMemo(() => PlayerIntelligenceService.getGameLogs(player), [player]);

  const games = useMemo(() => {
    let count = allGames.length;
    if (timeWindow === 'L5') count = 5;
    if (timeWindow === 'L10') count = 10;
    if (timeWindow === 'L15') count = 15;
    return allGames.slice(0, count);
  }, [allGames, timeWindow]);

  const playedCount = games.filter((g) => g.status === 'PLAYED').length;
  const limitedCount = games.filter((g) => g.status === 'LIMITED').length;
  const dnpCount = games.filter((g) => g.status === 'DNP').length;
  const missedCount = games.filter((g) => g.status === 'MISSED').length;

  const availabilityRate = Math.round(
    ((playedCount + limitedCount * 0.5) / (games.length || 1)) * 100
  );

  return (
    <div className="space-y-6">
      {/* 1. Availability Summary Overview */}
      <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-extrabold text-white uppercase tracking-wider">
                Availability & Workload Intelligence
              </h3>
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded">
                {availabilityRate}% Availability Index
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Physical workload audit, minute distribution, official injury report filings, and documented rest reasons.
            </p>
          </div>

          {/* Time Window Selector */}
          <div className="flex items-center gap-1 bg-[#131b30] p-1 rounded-lg border border-white/10">
            {(['L5', 'L10', 'L15', 'SEASON'] as const).map((tw) => (
              <button
                key={tw}
                onClick={() => setTimeWindow(tw)}
                className={`px-3 py-1 font-mono text-xs font-bold rounded-md transition-all cursor-pointer ${
                  timeWindow === tw
                    ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)] border border-indigo-400/40'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {tw}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Summary Stat Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Played / Normal Role: Green */}
          <div className="p-3.5 bg-[#131b30] border border-white/5 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-semibold">Played Normal Role</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="font-mono text-2xl font-extrabold text-emerald-400">{playedCount}</span>
              <span className="text-xs text-neutral-400 font-mono">Games</span>
            </div>
          </div>

          {/* Limited: Amber */}
          <div className="p-3.5 bg-[#131b30] border border-white/5 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-semibold">Limited Minutes</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="font-mono text-2xl font-extrabold text-amber-400">{limitedCount}</span>
              <span className="text-xs text-neutral-400 font-mono">Games</span>
            </div>
          </div>

          {/* DNP / Inactive: Gray Outline */}
          <div className="p-3.5 bg-[#131b30] border border-white/5 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-semibold">Inactive / DNP</span>
              <span className="w-2.5 h-2.5 rounded-xs border border-dashed border-neutral-400 bg-neutral-800" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="font-mono text-2xl font-extrabold text-neutral-300">{dnpCount}</span>
              <span className="text-xs text-neutral-400 font-mono">Games</span>
            </div>
          </div>

          {/* Missed Game: Red */}
          <div className="p-3.5 bg-[#131b30] border border-white/5 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-semibold">Missed Game</span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="font-mono text-2xl font-extrabold text-rose-400">{missedCount}</span>
              <span className="text-xs text-neutral-400 font-mono">Games</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Vertical Bar Availability Timeline (Matching the Requested Color Scheme) */}
      <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div>
            <span className="font-mono text-xs font-bold text-neutral-200 uppercase tracking-wider block">
              Game-by-Game Availability Bar Timeline
            </span>
            <span className="text-xs text-neutral-400">
              Click or hover any game bar to inspect source filing, reason, and date.
            </span>
          </div>

          {/* Color Legend requested:
              green = played / normal role
              amber = limited
              gray outline = inactive / DNP
              red = missed game */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
              <span>Played (Normal)</span>
            </span>
            <span className="flex items-center gap-1.5 text-neutral-300">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
              <span>Limited</span>
            </span>
            <span className="flex items-center gap-1.5 text-neutral-400">
              <span className="w-2.5 h-2.5 rounded-xs border border-dashed border-neutral-400 bg-neutral-800/40" />
              <span>Inactive / DNP</span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)]" />
              <span>Missed Game</span>
            </span>
          </div>
        </div>

        {/* Timeline Vertical Bars Canvas */}
        <div className="h-48 pt-4 flex items-end justify-between gap-2 px-2 overflow-x-auto no-scrollbar">
          {games.map((game) => {
            const isSelected = selectedGame?.game_id === game.game_id;
            
            // Bar height logic
            const heightPct = 
              game.status === 'PLAYED' 
                ? Math.min(100, Math.max(30, (game.minutes / 40) * 100))
                : game.status === 'LIMITED'
                ? Math.min(60, Math.max(25, (game.minutes / 40) * 100))
                : 15;

            // Bar styling per exact user prompt
            let barStyle = 'bg-emerald-500 hover:bg-emerald-400';
            if (game.status === 'LIMITED') {
              barStyle = 'bg-amber-500 hover:bg-amber-400';
            } else if (game.status === 'DNP') {
              barStyle = 'border-2 border-dashed border-neutral-500 bg-neutral-800/30';
            } else if (game.status === 'MISSED') {
              barStyle = 'bg-rose-500 hover:bg-rose-400';
            }

            return (
              <div
                key={game.game_id}
                onClick={() => setSelectedGame(game)}
                className="flex-1 min-w-[34px] max-w-[52px] flex flex-col items-center gap-2 group cursor-pointer"
              >
                {/* Minute Label above bar */}
                <span className={`font-mono text-[10px] transition-all ${
                  isSelected ? 'text-amber-300 font-extrabold scale-110' : 'text-neutral-400 group-hover:text-white'
                }`}>
                  {game.status === 'DNP' ? 'DNP' : `${Math.round(game.minutes)}m`}
                </span>

                {/* The Vertical Bar */}
                <div className="w-full h-32 flex items-end justify-center">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-sm transition-all duration-150 ${barStyle} ${
                      isSelected ? 'ring-2 ring-white shadow-[0_0_12px_rgba(255,255,255,0.5)]' : ''
                    }`}
                  />
                </div>

                {/* Opponent & Date Label */}
                <div className="text-center font-mono text-[9px] pt-1">
                  <span className="text-neutral-300 font-semibold block">
                    {game.is_home ? 'vs' : '@'}{game.opponent}
                  </span>
                  <span className="text-neutral-500 text-[8px] block">
                    {game.game_date.split('-').slice(1).join('/')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected / Hover Game Details (Hover/click = source + reason + date) */}
        <div className="p-4 bg-[#131b30] border border-white/10 rounded-lg space-y-2.5 text-xs font-mono shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <span className="text-white font-bold">
                {selectedGame ? `${selectedGame.game_date} · ${selectedGame.is_home ? 'Home vs' : 'Away @'} ${selectedGame.opponent}` : 'Select Any Game Bar Above to Audit Source & Reason'}
              </span>
            </div>
            {selectedGame && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                selectedGame.status === 'PLAYED'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : selectedGame.status === 'LIMITED'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : selectedGame.status === 'DNP'
                  ? 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {selectedGame.status}
              </span>
            )}
          </div>

          {selectedGame ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px] text-neutral-300">
              <div>
                <span className="text-neutral-500 block uppercase text-[10px]">Minutes Logged</span>
                <span className="text-white font-bold">{selectedGame.minutes} MPG ({selectedGame.is_starter ? 'Starter' : 'Bench'})</span>
              </div>
              <div>
                <span className="text-neutral-500 block uppercase text-[10px]">Verification Source</span>
                <span className="text-sky-300 font-bold">{selectedGame.source}</span>
              </div>
              <div>
                <span className="text-neutral-500 block uppercase text-[10px]">Filing Date</span>
                <span className="text-white font-bold">{selectedGame.game_date} 17:00 ET Injury Report</span>
              </div>
              {selectedGame.dnp_reason && (
                <div className="col-span-full bg-amber-500/10 border border-amber-500/20 rounded p-2 text-amber-300">
                  <span className="font-bold">Official Documented Reason:</span> {selectedGame.dnp_reason}
                </div>
              )}
            </div>
          ) : (
            <p className="text-neutral-500 text-[11px]">
              Audit source: Official NBA Injury Report filing (5:00 PM ET deadline), player load management protocol, and medical staff game status notes.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
