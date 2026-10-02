import React, { useState, useMemo } from 'react';
import { InjuryEvent, AvailabilityEvent, TeamAvailabilityOverview, Team } from '../types';
import { InjuryService, TeamService, PlayerService } from '../services';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Layers, 
  Search, 
  Calendar, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';

interface InjuriesViewProps {
  initialTeamSlug?: string;
  onOpenCba?: (prompt: string) => void;
}

export const InjuriesView: React.FC<InjuriesViewProps> = ({ 
  initialTeamSlug = 'houston-rockets',
  onOpenCba
}) => {
  const allTeams = TeamService.getAllTeams();
  const [viewMode, setViewMode] = useState<'TEAM_CENTER' | 'LEAGUE_WATCH'>('TEAM_CENTER');
  const [selectedTeamSlug, setSelectedTeamSlug] = useState<string>(initialTeamSlug);
  const [selectedEvent, setSelectedEvent] = useState<InjuryEvent | AvailabilityEvent | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const currentTeam = TeamService.getTeamBySlug(selectedTeamSlug) || allTeams[0];
  const teamMetrics = InjuryService.getTeamAvailabilityMetrics(currentTeam.slug);
  const allMetrics = InjuryService.getAllTeamAvailabilityMetrics();
  const recentEvents = InjuryService.getRecentEvents(viewMode === 'TEAM_CENTER' ? currentTeam.slug : undefined);
  const availabilityLogs = InjuryService.getAvailabilityLogsForPlayer();

  // Status Color and Icon helper
  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'AVAILABLE':
      case 'PLAYED':
        return (
          <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
            AVAILABLE / PLAYED
          </span>
        );
      case 'QUESTIONABLE':
      case 'PROBABLE':
      case 'LIMITED':
        return (
          <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
            {status.toUpperCase()}
          </span>
        );
      case 'OUT':
      case 'DOUBTFUL':
      case 'INJURED_RESERVE':
        return (
          <span className="font-mono text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded">
            OUT / INACTIVE
          </span>
        );
      case 'G_LEAGUE':
      case 'G_LEAGUE_ASSIGNMENT':
        return (
          <span className="font-mono text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded">
            G LEAGUE
          </span>
        );
      case 'DNP':
      case 'COACH DECISION':
        return (
          <span className="font-mono text-[10px] font-bold text-neutral-400 bg-neutral-800 border border-dashed border-neutral-600 px-2 py-0.5 rounded">
            DNP / COACH
          </span>
        );
      default:
        return (
          <span className="font-mono text-[10px] font-bold text-neutral-400 bg-neutral-800 border border-neutral-700 px-2 py-0.5 rounded">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Activity className="w-6 h-6 text-amber-400" />
              <span>Player Availability & Injury Intelligence</span>
            </h1>
            <span className="font-mono text-xs text-neutral-400 uppercase bg-[#131b30] border border-white/10 px-2.5 py-0.5 rounded font-bold">
              Public Availability Telemetry
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Tracks officially filed league availability designations, game participation logs, and team availability load without medical speculation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <EvidenceBadge state="VERIFIED CURRENT DATA" />
          {onOpenCba && (
            <button
              onClick={() => onOpenCba(`Explain the NBA Player Participation Policy and 65-game award threshold rules for ${currentTeam.name}.`)}
              className="px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask CBA About Participation Rules</span>
            </button>
          )}
        </div>
      </div>

      {/* Strict Medical Boundary Callout */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3.5 text-xs text-neutral-200 font-mono">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-amber-300 block uppercase">
            Mandatory Front-Office Medical Discipline: Public Designations Only
          </span>
          <p className="text-neutral-300 leading-relaxed font-sans text-xs">
            Front Office Atlas records solely officially filed league availability reports, box scores, and public body areas. The system never makes clinical diagnoses, prognostic determinations, or subjective return timelines.
          </p>
        </div>
      </div>

      {/* Mode Switcher & Focus Team Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0e1424] border border-white/10 rounded-xl p-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('TEAM_CENTER')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'TEAM_CENTER'
                ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)] border border-indigo-400/40'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            Team Availability Center
          </button>
          <button
            onClick={() => setViewMode('LEAGUE_WATCH')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'LEAGUE_WATCH'
                ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)] border border-indigo-400/40'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            League Availability Watch
          </button>
        </div>

        {viewMode === 'TEAM_CENTER' && (
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 uppercase text-[10px] font-bold">Focus Franchise:</span>
            <select
              value={selectedTeamSlug}
              onChange={(e) => setSelectedTeamSlug(e.target.value)}
              className="bg-[#131b30] border border-white/10 text-white rounded-lg px-3 py-1.5 font-bold focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              {allTeams.map((t) => (
                <option key={t.id} value={t.slug} className="bg-[#0e1424] text-white">
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* TEAM AVAILABILITY CENTER */}
      {viewMode === 'TEAM_CENTER' && (
        <div className="space-y-6">
          {/* Availability Load KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-4 bg-[#0e1424] border border-white/10 rounded-xl space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">Availability Rate</span>
              <span className="text-2xl font-extrabold text-emerald-400 block">{teamMetrics.availability_pct}%</span>
              <span className="text-[10px] text-neutral-400 block">Games Available: {teamMetrics.games_available_total}</span>
            </div>

            <div className="p-4 bg-[#0e1424] border border-white/10 rounded-xl space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">Games Missed</span>
              <span className="text-2xl font-extrabold text-amber-300 block">{teamMetrics.games_missed_total}</span>
              <span className="text-[10px] text-neutral-400 block">Cumulative player games</span>
            </div>

            <div className="p-4 bg-[#0e1424] border border-white/10 rounded-xl space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">Currently Unavailable</span>
              <span className="text-2xl font-extrabold text-rose-400 block">{teamMetrics.currently_unavailable_count}</span>
              <span className="text-[10px] text-neutral-400 block">Listed on public filing</span>
            </div>

            <div className="p-4 bg-[#0e1424] border border-white/10 rounded-xl space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">Recent Trend</span>
              <span className={`text-base font-extrabold block mt-1 ${
                teamMetrics.recent_trend === 'IMPROVING' ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {teamMetrics.recent_trend}
              </span>
              <span className="text-[10px] text-neutral-400 block">As of {teamMetrics.as_of_date}</span>
            </div>
          </div>

          {/* VISUAL: GAME-BY-GAME PARTICIPATION BAR TIMELINE */}
          <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="font-sm font-extrabold text-white uppercase tracking-wider">
                  Game-by-Game Participation Timeline (Visual Matrix)
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Click any game bar to inspect exact minutes, opponent, starter designation, and officially reported public reasons.
                </p>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-400 rounded-xs" /> Played</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-400 rounded-xs" /> Limited</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-400 rounded-xs" /> Out</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-sky-400 rounded-xs" /> G League</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 border border-dashed border-neutral-400 rounded-xs" /> DNP</span>
              </div>
            </div>

            {/* Vertical Bars Timeline Container */}
            <div className="flex items-end justify-between gap-2 h-36 bg-[#090d16] p-4 rounded-xl border border-white/5">
              {availabilityLogs.map((log, idx) => {
                const isPlayed = log.status === 'PLAYED';
                const isLimited = log.status === 'LIMITED';
                const isOut = log.status === 'OUT';
                const isGLeague = log.status === 'G_LEAGUE';
                const isDnp = log.status === 'DNP';

                const barHeightPct = isPlayed ? Math.min(100, Math.max(30, ((log.minutes_played || 25) / 40) * 100)) : isLimited ? 45 : 15;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedEvent(log)}
                    className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group"
                    title={`${log.game_date} ${log.opponent}: ${log.status} (${log.minutes_played || 0} min)`}
                  >
                    <span className="text-[9px] text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {log.minutes_played ? `${Math.round(log.minutes_played)}m` : '0m'}
                    </span>

                    <div
                      style={{ height: `${barHeightPct}%` }}
                      className={`w-full max-w-[28px] rounded-t-sm transition-all group-hover:brightness-125 ${
                        isPlayed
                          ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                          : isLimited
                          ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                          : isOut
                          ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                          : isGLeague
                          ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                          : 'border-2 border-dashed border-neutral-600 bg-neutral-800/40'
                      }`}
                    />

                    <span className="text-[9px] text-neutral-400 font-bold block truncate max-w-[34px]">
                      {log.opponent?.replace('vs ', '').replace('@ ', '')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CURRENT UNAVAILABILITY & RECENT FILINGS LEDGER */}
          <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-sm font-extrabold text-white uppercase tracking-wider">
                Official Public Injury Report Filings ({currentTeam.name})
              </h3>
              <span className="text-[10px] text-neutral-400">
                Preserved historical ledger · Never overwritten
              </span>
            </div>

            <div className="divide-y divide-white/5">
              {recentEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] px-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{evt.player_name}</span>
                      {getStatusBadge(evt.category)}
                      {evt.body_area && (
                        <span className="text-[10px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                          {evt.body_area}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-300 font-sans">
                      {evt.reason}
                    </p>
                  </div>

                  <div className="text-right text-[11px] text-neutral-400 shrink-0">
                    <div>Filing Date: <strong className="text-white">{evt.date}</strong></div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">Source: {evt.source}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LEAGUE AVAILABILITY WATCH */}
      {viewMode === 'LEAGUE_WATCH' && (
        <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl font-mono text-xs">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h3 className="font-sm font-extrabold text-white uppercase tracking-wider">
                League-Wide Availability & Injury Watch (30 Franchises)
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Real-time official league 5:00 PM availability status across the Association.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded">
              {Object.keys(allMetrics).length} Teams Monitored
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(allMetrics).map((m) => (
              <div
                key={m.team_id}
                className="p-4 bg-[#131b30] border border-white/10 rounded-xl space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{m.team_name}</span>
                  <span className="font-bold text-emerald-400 text-xs">{m.availability_pct}% Available</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] p-2 bg-[#0b0f19] rounded-lg">
                  <div>Games Missed: <strong className="text-white">{m.games_missed_total}</strong></div>
                  <div>Unavailable: <strong className="text-rose-400">{m.currently_unavailable_count}</strong></div>
                  <div>Trend: <strong className="text-amber-300">{m.recent_trend}</strong></div>
                </div>

                {m.currently_unavailable_players.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-white/5">
                    {m.currently_unavailable_players.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px]">
                        <span className="text-neutral-200 font-bold">{p.player_name} ({p.position})</span>
                        <span className="text-rose-400 font-semibold">{p.status} · {p.public_reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EVENT DETAIL MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono text-xs">
          <div className="bg-[#0e1424] border border-white/15 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white uppercase text-sm">
                  Availability Event Detail
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-neutral-300 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500 uppercase font-semibold">Date:</span>
                <span className="text-white font-bold">{(selectedEvent as any).date || (selectedEvent as any).game_date}</span>
              </div>

              {(selectedEvent as any).opponent && (
                <div className="flex justify-between">
                  <span className="text-neutral-500 uppercase font-semibold">Opponent:</span>
                  <span className="text-white font-bold">{(selectedEvent as any).opponent}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-neutral-500 uppercase font-semibold">Status:</span>
                {getStatusBadge((selectedEvent as any).category || (selectedEvent as any).status)}
              </div>

              {(selectedEvent as any).minutes_played !== undefined && (
                <div className="flex justify-between">
                  <span className="text-neutral-500 uppercase font-semibold">Minutes Played:</span>
                  <span className="text-white font-bold">{(selectedEvent as any).minutes_played} min</span>
                </div>
              )}

              <div className="p-3 bg-[#131b30] rounded-xl space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Reported Reason:</span>
                <p className="text-neutral-200 font-sans text-xs">
                  {(selectedEvent as any).reason || (selectedEvent as any).public_reason || 'Officially filed league game participation.'}
                </p>
              </div>

              <div className="flex justify-between pt-2 border-t border-white/5 text-[10px] text-neutral-400">
                <span>Source: {selectedEvent.source}</span>
                <span>Verification: <strong>VERIFIED OFFICIAL</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
