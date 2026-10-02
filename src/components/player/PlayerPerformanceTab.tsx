import React, { useState, useMemo } from 'react';
import { Player, GamePlayerStat } from '../../types';
import { PlayerIntelligenceService } from '../../services/playerIntelligence';
import { 
  BarChart2, 
  Filter, 
  TrendingUp, 
  ShieldAlert, 
  Info,
  Calendar,
  Layers,
  Activity,
  Flame,
  Clock,
  Sparkles,
  LayoutGrid,
  Maximize2
} from 'lucide-react';

interface PlayerPerformanceTabProps {
  player: Player;
}

type TimeWindow = 'L5' | 'L10' | 'L15' | 'SEASON' | 'H2H';
type MetricKey = 
  | 'minutes'
  | 'points'
  | 'assists'
  | 'rebounds'
  | 'usage_pct'
  | 'true_shooting_pct'
  | 'on_off_net'
  | 'rim_attempts'
  | 'turnovers';

export const PlayerPerformanceTab: React.FC<PlayerPerformanceTabProps> = ({ player }) => {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('L10');
  const [opponentFilter, setOpponentFilter] = useState<string>('ALL');
  const [homeAwayFilter, setHomeAwayFilter] = useState<'ALL' | 'HOME' | 'AWAY'>('ALL');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STARTER' | 'BENCH'>('ALL');
  const [positionFilter, setPositionFilter] = useState<'ALL' | 'GUARD' | 'FORWARD' | 'CENTER'>('ALL');
  const [lineupFilter, setLineupFilter] = useState<'ALL' | 'STARTER_UNIT' | 'CLOSING_5' | 'BENCH_MOB' | 'SMALL_BALL' | 'DUAL_GUARD'>('ALL');
  const [minutesRange, setMinutesRange] = useState<'ALL' | 'UNDER_20' | '20_TO_30' | 'OVER_30'>('ALL');
  const [activeMetric, setActiveMetric] = useState<MetricKey>('points');
  const [viewMode, setViewMode] = useState<'FOCUS' | 'GRID'>('FOCUS');
  const [selectedGame, setSelectedGame] = useState<GamePlayerStat | null>(null);

  // Generate authentic game logs for this player
  const rawLogs = useMemo(() => PlayerIntelligenceService.getGameLogs(player), [player]);

  // Unique opponents list for the filter dropdown
  const uniqueOpponents = useMemo(() => {
    const opps = Array.from(new Set(rawLogs.map((g) => g.opponent)));
    return opps.sort();
  }, [rawLogs]);

  // Apply time window filter
  const windowCount = useMemo(() => {
    switch (timeWindow) {
      case 'L5': return 5;
      case 'L10': return 10;
      case 'L15': return 15;
      case 'H2H': return 4;
      case 'SEASON':
      default: return rawLogs.length;
    }
  }, [timeWindow, rawLogs.length]);

  const slicedLogs = useMemo(() => rawLogs.slice(0, windowCount), [rawLogs, windowCount]);

  // Apply all 6 secondary filters
  const filteredLogs = useMemo(() => {
    return slicedLogs.filter((g) => {
      // Opponent filter
      if (opponentFilter !== 'ALL' && g.opponent !== opponentFilter) return false;
      // Home / Away filter
      if (homeAwayFilter === 'HOME' && !g.is_home) return false;
      if (homeAwayFilter === 'AWAY' && g.is_home) return false;
      // Starter / Bench filter
      if (roleFilter === 'STARTER' && !g.is_starter) return false;
      if (roleFilter === 'BENCH' && g.is_starter) return false;
      // Position filter
      if (positionFilter !== 'ALL') {
        const pPos = player.position.toUpperCase();
        if (positionFilter === 'GUARD' && !pPos.includes('GUARD') && !pPos.includes('G')) return false;
        if (positionFilter === 'FORWARD' && !pPos.includes('FORWARD') && !pPos.includes('F')) return false;
        if (positionFilter === 'CENTER' && !pPos.includes('CENTER') && !pPos.includes('C')) return false;
      }
      // Lineup filter (simulated contextual tactical tags)
      if (lineupFilter !== 'ALL') {
        if (lineupFilter === 'STARTER_UNIT' && !g.is_starter) return false;
        if (lineupFilter === 'BENCH_MOB' && g.is_starter) return false;
        if (lineupFilter === 'CLOSING_5' && g.minutes < 28) return false;
        if (lineupFilter === 'SMALL_BALL' && (g.blocks > 2 || g.rebounds > 12)) return false;
      }
      // Minutes Range filter
      if (minutesRange === 'UNDER_20' && g.minutes >= 20) return false;
      if (minutesRange === '20_TO_30' && (g.minutes < 20 || g.minutes > 30)) return false;
      if (minutesRange === 'OVER_30' && g.minutes <= 30) return false;

      return true;
    });
  }, [slicedLogs, opponentFilter, homeAwayFilter, roleFilter, positionFilter, lineupFilter, minutesRange, player.position]);

  const supportingStats = useMemo(() => PlayerIntelligenceService.getSupportingStats(filteredLogs), [filteredLogs]);

  // Metrics definitions for vertical bar visualization
  const metricsConfig: Record<
    MetricKey, 
    { label: string; shortLabel: string; unit: string; maxVal: number; gradient: string; glowColor: string }
  > = {
    minutes: { 
      label: 'Minutes Logged', 
      shortLabel: 'Minutes', 
      unit: 'min', 
      maxVal: 48, 
      gradient: 'from-sky-500 to-sky-400', 
      glowColor: 'rgba(56, 189, 248, 0.45)' 
    },
    points: { 
      label: 'Points Scored', 
      shortLabel: 'Points', 
      unit: 'pts', 
      maxVal: 45, 
      gradient: 'from-amber-500 to-amber-400', 
      glowColor: 'rgba(245, 158, 11, 0.45)' 
    },
    assists: { 
      label: 'Assists Created', 
      shortLabel: 'Assists', 
      unit: 'ast', 
      maxVal: 15, 
      gradient: 'from-emerald-500 to-emerald-400', 
      glowColor: 'rgba(16, 185, 129, 0.45)' 
    },
    rebounds: { 
      label: 'Total Rebounds', 
      shortLabel: 'Rebounds', 
      unit: 'reb', 
      maxVal: 20, 
      gradient: 'from-indigo-500 to-indigo-400', 
      glowColor: 'rgba(99, 102, 241, 0.45)' 
    },
    usage_pct: { 
      label: 'Usage Rate (%)', 
      shortLabel: 'Usage', 
      unit: '%', 
      maxVal: 40, 
      gradient: 'from-purple-500 to-purple-400', 
      glowColor: 'rgba(168, 85, 247, 0.45)' 
    },
    true_shooting_pct: { 
      label: 'True Shooting %', 
      shortLabel: 'True Shooting', 
      unit: '%', 
      maxVal: 80, 
      gradient: 'from-rose-500 to-rose-400', 
      glowColor: 'rgba(244, 63, 94, 0.45)' 
    },
    on_off_net: { 
      label: 'On/Off Net Rating', 
      shortLabel: 'On/Off Net', 
      unit: 'net', 
      maxVal: 25, 
      gradient: 'from-teal-500 to-teal-400', 
      glowColor: 'rgba(20, 184, 166, 0.45)' 
    },
    rim_attempts: { 
      label: 'Rim Attempts', 
      shortLabel: 'Rim Attempts', 
      unit: 'rim', 
      maxVal: 16, 
      gradient: 'from-orange-500 to-amber-400', 
      glowColor: 'rgba(249, 115, 22, 0.45)' 
    },
    turnovers: { 
      label: 'Turnovers', 
      shortLabel: 'Turnovers', 
      unit: 'tov', 
      maxVal: 8, 
      gradient: 'from-neutral-400 to-neutral-300', 
      glowColor: 'rgba(163, 163, 163, 0.35)' 
    },
  };

  const currentConfig = metricsConfig[activeMetric];

  // Helper to format stat values
  const getMetricDisplay = (game: GamePlayerStat, key: MetricKey) => {
    if (game.status === 'DNP') return 'DNP';
    const val = game[key];
    if (key === 'true_shooting_pct') return `${Math.round((val as number) * 100)}%`;
    if (key === 'usage_pct') return `${val}%`;
    if (key === 'on_off_net') return `${(val as number) > 0 ? '+' : ''}${val}`;
    return val;
  };

  const getMetricHeightPercent = (game: GamePlayerStat, key: MetricKey) => {
    if (game.status === 'DNP') return 12; // Base height for dashed outline DNP
    const val = typeof game[key] === 'number' ? (game[key] as number) : 0;
    const max = metricsConfig[key].maxVal;
    if (key === 'true_shooting_pct') {
      const pct = (val as number) * 100;
      return Math.min(100, Math.max(15, (pct / max) * 100));
    }
    if (key === 'on_off_net') {
      return Math.min(100, Math.max(10, ((val + 12) / (max + 12)) * 100));
    }
    return Math.min(100, Math.max(8, (val / max) * 100));
  };

  return (
    <div className="space-y-6">
      {/* 1. Control Header: Time Windows + Filter Chips (Dark Navy / Graphite Surfaces) */}
      <div className="bg-[#0e1424] border border-white/10 rounded-xl p-4.5 space-y-4 shadow-xl">
        {/* Row 1: Time Window Segmented Tabs + View Mode Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">
              Time Window:
            </span>
            <div className="flex items-center gap-1 bg-[#131b30] p-1 rounded-lg border border-white/10">
              {(['L5', 'L10', 'L15', 'SEASON', 'H2H'] as const).map((tw) => (
                <button
                  key={tw}
                  onClick={() => setTimeWindow(tw)}
                  className={`px-3 py-1.5 font-mono text-xs font-bold rounded-md transition-all cursor-pointer ${
                    timeWindow === tw
                      ? 'bg-indigo-600 text-white shadow-[0_0_14px_rgba(99,102,241,0.5)] border border-indigo-400/40'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {tw}
                </button>
              ))}
            </div>
          </div>

          {/* View Mode Toggle: Focus Single Metric vs Grid 9 Cards */}
          <div className="flex items-center gap-1 bg-[#131b30] p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setViewMode('FOCUS')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                viewMode === 'FOCUS'
                  ? 'bg-neutral-800 text-white font-bold shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Focus Chart</span>
            </button>
            <button
              onClick={() => setViewMode('GRID')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                viewMode === 'GRID'
                  ? 'bg-indigo-600 text-white font-bold shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>All 9 Cards</span>
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Filter Chips (Opponent, Home/Away, Starter/Bench, Position, Lineup, Minutes Range) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
          <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mr-1">
            Filters:
          </span>

          {/* Opponent Selector Chip */}
          <div className="flex items-center bg-[#131b30] border border-white/10 rounded-lg px-2 py-1">
            <span className="text-[10px] font-mono text-neutral-400 mr-1.5">Opp:</span>
            <select
              value={opponentFilter}
              onChange={(e) => setOpponentFilter(e.target.value)}
              className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0e1424] text-white">All Teams</option>
              {uniqueOpponents.map((opp) => (
                <option key={opp} value={opp} className="bg-[#0e1424] text-white">{opp}</option>
              ))}
            </select>
          </div>

          {/* Home / Away Chips */}
          <div className="flex items-center gap-1 bg-[#131b30] p-1 rounded-lg border border-white/10 text-xs font-mono">
            {(['ALL', 'HOME', 'AWAY'] as const).map((ha) => (
              <button
                key={ha}
                onClick={() => setHomeAwayFilter(ha)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  homeAwayFilter === ha
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {ha === 'ALL' ? 'All Loc' : ha}
              </button>
            ))}
          </div>

          {/* Starter / Bench Chips */}
          <div className="flex items-center gap-1 bg-[#131b30] p-1 rounded-lg border border-white/10 text-xs font-mono">
            {(['ALL', 'STARTER', 'BENCH'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  roleFilter === r
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {r === 'ALL' ? 'All Roles' : r === 'STARTER' ? 'Starter' : 'Bench'}
              </button>
            ))}
          </div>

          {/* Position Filter */}
          <div className="flex items-center gap-1 bg-[#131b30] p-1 rounded-lg border border-white/10 text-xs font-mono">
            {(['ALL', 'GUARD', 'FORWARD', 'CENTER'] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => setPositionFilter(pos)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  positionFilter === pos
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {pos === 'ALL' ? 'All Pos' : pos.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Lineup Filter */}
          <div className="flex items-center bg-[#131b30] border border-white/10 rounded-lg px-2 py-1">
            <span className="text-[10px] font-mono text-neutral-400 mr-1.5">Lineup:</span>
            <select
              value={lineupFilter}
              onChange={(e) => setLineupFilter(e.target.value as any)}
              className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0e1424] text-white">All Lineups</option>
              <option value="STARTER_UNIT" className="bg-[#0e1424] text-white">Starter Unit</option>
              <option value="CLOSING_5" className="bg-[#0e1424] text-white">Closing 5</option>
              <option value="BENCH_MOB" className="bg-[#0e1424] text-white">Bench Rotation</option>
              <option value="SMALL_BALL" className="bg-[#0e1424] text-white">Small-Ball</option>
            </select>
          </div>

          {/* Minutes Range Chips */}
          <div className="flex items-center gap-1 bg-[#131b30] p-1 rounded-lg border border-white/10 text-xs font-mono">
            {(['ALL', 'UNDER_20', '20_TO_30', 'OVER_30'] as const).map((mr) => (
              <button
                key={mr}
                onClick={() => setMinutesRange(mr)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  minutesRange === mr
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {mr === 'ALL' ? 'All Min' : mr === 'UNDER_20' ? '<20m' : mr === '20_TO_30' ? '20-30m' : '>30m'}
              </button>
            ))}
          </div>

          {/* Active Filter Clear if non-default */}
          {(opponentFilter !== 'ALL' || homeAwayFilter !== 'ALL' || roleFilter !== 'ALL' || positionFilter !== 'ALL' || lineupFilter !== 'ALL' || minutesRange !== 'ALL') && (
            <button
              onClick={() => {
                setOpponentFilter('ALL');
                setHomeAwayFilter('ALL');
                setRoleFilter('ALL');
                setPositionFilter('ALL');
                setLineupFilter('ALL');
                setMinutesRange('ALL');
              }}
              className="text-[10px] font-mono text-amber-400 hover:underline px-2 py-0.5 ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Row 3: Metric Selector Tabs with Bright Accent Glow */}
        <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-mono uppercase text-neutral-500 shrink-0 font-semibold">
            Active Metric:
          </span>
          {(Object.keys(metricsConfig) as MetricKey[]).map((mKey) => {
            const isSelected = activeMetric === mKey;
            const cfg = metricsConfig[mKey];
            return (
              <button
                key={mKey}
                onClick={() => setActiveMetric(mKey)}
                style={{
                  boxShadow: isSelected ? `0 0 14px ${cfg.glowColor}` : 'none',
                }}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? `bg-[#182038] text-white font-extrabold border-indigo-400/50`
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5 border-transparent'
                }`}
              >
                {cfg.shortLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Primary Visualization View */}
      {viewMode === 'FOCUS' ? (
        /* Single Metric Master Focus Card */
        <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-sm font-extrabold text-white uppercase tracking-wider">
                  {currentConfig.label} Sequence · {timeWindow} Window
                </h3>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                  {filteredLogs.length} Filtered Observations
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Vertical performance bars with dashed outline for DNP/unavailable states. Click any bar for matchup details.
              </p>
            </div>

            {/* Visual Legend */}
            <div className="flex items-center gap-3 font-mono text-[10px] text-neutral-400">
              <span className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-xs bg-gradient-to-t ${currentConfig.gradient}`} />
                <span className="text-neutral-300">Active Game</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs border border-dashed border-neutral-500 bg-neutral-800/40" />
                <span className="text-neutral-400">DNP / Inactive</span>
              </span>
            </div>
          </div>

          {/* Interactive Vertical Bars Canvas */}
          <div className="h-60 pt-6 flex items-end justify-between gap-2 px-2 overflow-x-auto no-scrollbar">
            {filteredLogs.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 font-mono text-xs">
                No game observations match the selected filter criteria.
              </div>
            ) : (
              filteredLogs.map((game) => {
                const isDnp = game.status === 'DNP';
                const isSelected = selectedGame?.game_id === game.game_id;
                const barHeightPct = getMetricHeightPercent(game, activeMetric);
                const valDisplay = getMetricDisplay(game, activeMetric);

                return (
                  <div
                    key={game.game_id}
                    onClick={() => setSelectedGame(game)}
                    className="flex-1 min-w-[38px] max-w-[56px] flex flex-col items-center gap-2 group cursor-pointer"
                  >
                    {/* Value Label above bar */}
                    <span 
                      className={`font-mono text-[11px] transition-all ${
                        isSelected 
                          ? 'text-amber-300 font-black scale-110 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]' 
                          : 'text-neutral-400 group-hover:text-white'
                      }`}
                    >
                      {valDisplay}
                    </span>

                    {/* The Vertical Bar */}
                    <div className="w-full h-44 flex items-end justify-center">
                      <div
                        style={{ 
                          height: `${barHeightPct}%`,
                          boxShadow: isSelected ? `0 0 16px ${currentConfig.glowColor}` : undefined,
                        }}
                        className={`w-full rounded-t-sm transition-all duration-150 ${
                          isDnp
                            ? 'border-2 border-dashed border-neutral-600 bg-neutral-800/30'
                            : isSelected
                            ? `bg-gradient-to-t ${currentConfig.gradient} ring-2 ring-white/60`
                            : `bg-gradient-to-t ${currentConfig.gradient} opacity-85 group-hover:opacity-100 group-hover:brightness-110`
                        }`}
                      />
                    </div>

                    {/* Matchup Tag at bottom */}
                    <div className="text-center font-mono text-[10px] pt-1 leading-tight">
                      <span className="text-neutral-200 font-bold block">
                        {game.is_home ? 'vs' : '@'}{game.opponent}
                      </span>
                      <span className="text-neutral-500 text-[9px] block">
                        {game.game_date.split('-').slice(1).join('/')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Selected Game Drawer/Context */}
          {selectedGame && (
            <div className="p-4 bg-[#141b2f] border border-amber-500/30 rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs font-mono shadow-lg">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-white font-extrabold text-sm">
                  {selectedGame.game_date} · {selectedGame.is_home ? 'Home vs' : 'Away @'} {selectedGame.opponent}
                </span>
                <span className="text-neutral-300">
                  ({selectedGame.minutes} MPG · {selectedGame.points} PTS · {selectedGame.assists} AST · {selectedGame.rebounds} REB · {selectedGame.usage_pct}% USG)
                </span>
              </div>
              <div className="flex items-center gap-3">
                {selectedGame.dnp_reason && (
                  <span className="text-rose-400 font-semibold bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/20">
                    Status Note: {selectedGame.dnp_reason}
                  </span>
                )}
                <button
                  onClick={() => setSelectedGame(null)}
                  className="text-neutral-400 hover:text-white px-2 py-0.5 rounded bg-white/5 hover:bg-white/10"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Multi-Chart Grid: All 9 Metric Bar Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(metricsConfig) as MetricKey[]).map((mKey) => {
            const cfg = metricsConfig[mKey];
            const isCurrent = activeMetric === mKey;
            return (
              <div
                key={mKey}
                onClick={() => setActiveMetric(mKey)}
                style={{
                  borderColor: isCurrent ? 'rgba(99, 102, 241, 0.5)' : undefined,
                  boxShadow: isCurrent ? `0 0 14px ${cfg.glowColor}` : undefined,
                }}
                className="bg-[#0e1424] border border-white/10 rounded-xl p-4 space-y-3 cursor-pointer hover:border-white/20 transition-all shadow-md"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full bg-gradient-to-t ${cfg.gradient}`} />
                    <h4 className="font-mono text-xs font-bold text-white uppercase">
                      {cfg.label}
                    </h4>
                  </div>
                  <span className="font-mono text-[10px] text-neutral-400">
                    {cfg.unit}
                  </span>
                </div>

                {/* Mini Bar Sequence */}
                <div className="h-28 pt-2 flex items-end justify-between gap-1 px-1 overflow-x-auto no-scrollbar">
                  {filteredLogs.slice(0, 10).map((game) => {
                    const isDnp = game.status === 'DNP';
                    const heightPct = getMetricHeightPercent(game, mKey);
                    const val = getMetricDisplay(game, mKey);
                    return (
                      <div key={game.game_id} className="flex-1 min-w-[20px] flex flex-col items-center gap-1">
                        <span className="font-mono text-[9px] text-neutral-400">{val}</span>
                        <div className="w-full h-18 flex items-end justify-center">
                          <div
                            style={{ height: `${heightPct}%` }}
                            className={`w-full rounded-t-xs transition-all ${
                              isDnp
                                ? 'border border-dashed border-neutral-600 bg-neutral-800/40'
                                : `bg-gradient-to-t ${cfg.gradient}`
                            }`}
                          />
                        </div>
                        <span className="font-mono text-[8px] text-neutral-500">{game.opponent}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Supporting-Stat Cards Underneath */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-mono text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Supporting Advanced Stat Engine ({timeWindow} Sample)</span>
          </h4>
          <span className="font-mono text-[10px] text-neutral-500">
            Source: pbpstats & Official NBA Box Scores
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {/* Usage % */}
          <div className="p-3 bg-[#0e1424] border border-white/10 rounded-lg shadow-sm">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-0.5 font-semibold">Usage %</span>
            <span className="font-mono text-base font-extrabold text-white">{supportingStats.usagePct}%</span>
            <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">+1.8% vs L15</span>
          </div>

          {/* AST % */}
          <div className="p-3 bg-[#0e1424] border border-white/10 rounded-lg shadow-sm">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-0.5 font-semibold">AST %</span>
            <span className="font-mono text-base font-extrabold text-white">{supportingStats.astPct}%</span>
            <span className="text-[10px] font-mono text-sky-400 block mt-0.5">Playmaking Tier</span>
          </div>

          {/* On/Off Net */}
          <div className="p-3 bg-[#0e1424] border border-white/10 rounded-lg shadow-sm">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-0.5 font-semibold">On/Off Net</span>
            <span className="font-mono text-base font-extrabold text-emerald-400">
              {supportingStats.onOffNet > 0 ? `+${supportingStats.onOffNet}` : supportingStats.onOffNet}
            </span>
            <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">Per 100 Poss</span>
          </div>

          {/* TS % */}
          <div className="p-3 bg-[#0e1424] border border-white/10 rounded-lg shadow-sm">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-0.5 font-semibold">TS %</span>
            <span className="font-mono text-base font-extrabold text-white">{supportingStats.tsPct}%</span>
            <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">League: 57.8%</span>
          </div>

          {/* Rim Frequency */}
          <div className="p-3 bg-[#0e1424] border border-white/10 rounded-lg shadow-sm">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-0.5 font-semibold">Rim Frequency</span>
            <span className="font-mono text-base font-extrabold text-white">{supportingStats.rimFreq}%</span>
            <span className="text-[10px] font-mono text-amber-400 block mt-0.5">Paint Heavy</span>
          </div>

          {/* Turnover % */}
          <div className="p-3 bg-[#0e1424] border border-white/10 rounded-lg shadow-sm">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-0.5 font-semibold">Turnover %</span>
            <span className="font-mono text-base font-extrabold text-white">{supportingStats.tovPct}%</span>
            <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">Ball Security A-</span>
          </div>

          {/* Lineup Rating */}
          <div className="p-3 bg-[#0e1424] border border-white/10 rounded-lg shadow-sm">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-0.5 font-semibold">Lineup Rating</span>
            <span className="font-mono text-base font-extrabold text-indigo-300">
              +{supportingStats.lineupRating}
            </span>
            <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">5-Man Weighted</span>
          </div>
        </div>
      </div>
    </div>
  );
};
