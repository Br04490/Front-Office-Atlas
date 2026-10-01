import React, { useState } from 'react';
import { CapService } from '../services';
import { Team } from '../types';
import { EvidenceBadge } from './EvidenceBadge';
import { Info, HelpCircle } from 'lucide-react';

interface CapApronMeterProps {
  team?: Team;
  selectedSeason?: string;
  onSeasonChange?: (season: string) => void;
  onOpenCbaWithPrompt?: (prompt: string) => void;
}

export const CapApronMeter: React.FC<CapApronMeterProps> = ({
  team,
  selectedSeason = '2026-27',
  onSeasonChange,
  onOpenCbaWithPrompt,
}) => {
  const [activeSeason, setActiveSeason] = useState(selectedSeason);
  const seasons = CapService.getAvailableSeasons();
  const currentThreshold = CapService.getCapThresholds(activeSeason);
  const teamSnapshot = CapService.getTeamCapSnapshot(team?.id || 'houston-rockets', activeSeason);

  const handleSeasonSelect = (s: string) => {
    setActiveSeason(s);
    if (onSeasonChange) onSeasonChange(s);
  };

  const formatMillions = (val: number) => {
    return `$${(val / 1000000).toFixed(1)}M`;
  };

  // Get status color for CBA era
  const getCbaEraBadge = (era: string) => {
    switch (era) {
      case 'CURRENT CBA':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'CONDITIONAL CBA':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'FUTURE CBA UNKNOWN':
        return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
      default:
        return 'text-neutral-400 border-neutral-700 bg-neutral-800';
    }
  };

  // Maximum value for proportional meter scale (approx $240M or 1.15 * second_apron)
  const maxScale = currentThreshold.second_apron * 1.15;
  const getPercent = (amount: number) => Math.min(100, Math.max(0, (amount / maxScale) * 100));

  return (
    <div className="bg-[#12161f] border border-white/10 rounded-xl p-5 space-y-5">
      {/* Top Header Controls: Season Switcher & Era Flag */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-neutral-100 tracking-wide">
              Cap & Apron Framework
            </h3>
            <span
              className={`text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded border ${getCbaEraBadge(
                currentThreshold.cba_era
              )}`}
            >
              {currentThreshold.cba_era}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            {currentThreshold.notes}
          </p>
        </div>

        {/* Season Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#0b0e13] p-1 rounded-lg border border-white/10">
          {seasons.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSeasonSelect(s)}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-colors ${
                activeSeason === s
                  ? 'bg-neutral-800 text-neutral-100 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Threshold Meter */}
      <div className="space-y-2 pt-2">
        <div className="relative h-6 bg-[#0a0d12] rounded-lg border border-white/10 overflow-hidden">
          {/* Salary Floor Zone */}
          <div
            className="absolute top-0 bottom-0 bg-neutral-800/40 border-r border-dashed border-neutral-600"
            style={{ width: `${getPercent(currentThreshold.salary_floor)}%` }}
            title={`Salary Floor: ${formatMillions(currentThreshold.salary_floor)}`}
          />

          {/* Under Cap Zone */}
          <div
            className="absolute top-0 bottom-0 bg-emerald-500/10 border-r border-emerald-500/40"
            style={{
              left: `${getPercent(currentThreshold.salary_floor)}%`,
              width: `${getPercent(currentThreshold.salary_cap) - getPercent(currentThreshold.salary_floor)}%`,
            }}
            title={`Salary Cap: ${formatMillions(currentThreshold.salary_cap)}`}
          />

          {/* Tax Buffer Zone */}
          <div
            className="absolute top-0 bottom-0 bg-sky-500/10 border-r border-sky-500/50"
            style={{
              left: `${getPercent(currentThreshold.salary_cap)}%`,
              width: `${getPercent(currentThreshold.luxury_tax) - getPercent(currentThreshold.salary_cap)}%`,
            }}
            title={`Luxury Tax: ${formatMillions(currentThreshold.luxury_tax)}`}
          />

          {/* First Apron Danger Zone */}
          <div
            className="absolute top-0 bottom-0 bg-amber-500/15 border-r border-amber-500/60 cursor-pointer hover:bg-amber-500/25 transition-colors"
            style={{
              left: `${getPercent(currentThreshold.luxury_tax)}%`,
              width: `${getPercent(currentThreshold.first_apron) - getPercent(currentThreshold.luxury_tax)}%`,
            }}
            onClick={() =>
              onOpenCbaWithPrompt &&
              onOpenCbaWithPrompt(
                `Explain the first-apron rules and transactional consequences for ${
                  team?.name || 'this team'
                } in ${activeSeason}.`
              )
            }
            title="Click to inspect First Apron restrictions in ATLAS CBA"
          />

          {/* Second Apron Hard Restriction Zone */}
          <div
            className="absolute top-0 bottom-0 bg-rose-500/20 border-r border-rose-500/80 cursor-pointer hover:bg-rose-500/30 transition-colors"
            style={{
              left: `${getPercent(currentThreshold.first_apron)}%`,
              width: `${getPercent(currentThreshold.second_apron) - getPercent(currentThreshold.first_apron)}%`,
            }}
            onClick={() =>
              onOpenCbaWithPrompt &&
              onOpenCbaWithPrompt(
                `Explain second-apron trade restrictions, frozen picks, and aggregation ban for ${
                  team?.name || 'this team'
                } in ${activeSeason}.`
              )
            }
            title="Click to inspect Second Apron restrictions in ATLAS CBA"
          />
        </div>

        {/* Legend / Key Scale Ticks */}
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-1">
          <span>$0</span>
          <span>Floor: {formatMillions(currentThreshold.salary_floor)}</span>
          <span>Cap: {formatMillions(currentThreshold.salary_cap)}</span>
          <span>Tax: {formatMillions(currentThreshold.luxury_tax)}</span>
          <span className="text-amber-400 font-semibold">
            1st Apron: {formatMillions(currentThreshold.first_apron)}
          </span>
          <span className="text-rose-400 font-semibold">
            2nd Apron: {formatMillions(currentThreshold.second_apron)}
          </span>
        </div>
      </div>

      {/* Interactive Threshold Tiles (Clickable to launch CBA Intelligence) */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 pt-2">
        {/* Floor */}
        <div className="p-3 bg-[#0f131a] border border-white/5 rounded-lg text-left">
          <span className="text-[10px] font-mono uppercase text-neutral-500 block">
            Salary Floor (90%)
          </span>
          <span className="font-mono text-xs font-semibold text-neutral-200 tabular-nums">
            {formatMillions(currentThreshold.salary_floor)}
          </span>
        </div>

        {/* Cap */}
        <div className="p-3 bg-[#0f131a] border border-emerald-500/20 rounded-lg text-left">
          <span className="text-[10px] font-mono uppercase text-emerald-400/80 block">
            Salary Cap
          </span>
          <span className="font-mono text-xs font-semibold text-neutral-100 tabular-nums">
            {formatMillions(currentThreshold.salary_cap)}
          </span>
        </div>

        {/* Tax */}
        <div className="p-3 bg-[#0f131a] border border-sky-500/20 rounded-lg text-left">
          <span className="text-[10px] font-mono uppercase text-sky-400/80 block">
            Luxury Tax
          </span>
          <span className="font-mono text-xs font-semibold text-neutral-100 tabular-nums">
            {formatMillions(currentThreshold.luxury_tax)}
          </span>
        </div>

        {/* Team Salary */}
        <div className="p-3 bg-[#0f131a] border border-white/10 rounded-lg text-left">
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">
            Team Salary
          </span>
          <span className="font-mono text-xs font-semibold text-amber-300">
            Pending Ingest
          </span>
        </div>

        {/* First Apron (Clickable) */}
        <button
          type="button"
          onClick={() =>
            onOpenCbaWithPrompt &&
            onOpenCbaWithPrompt(`Explain the first-apron rules for ${team?.name || 'this team'}.`)
          }
          className="p-3 bg-amber-500/5 hover:bg-amber-500/15 border border-amber-500/30 rounded-lg text-left group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
              First Apron
            </span>
            <HelpCircle className="w-3 h-3 text-amber-500 group-hover:text-amber-300" />
          </div>
          <span className="font-mono text-xs font-bold text-amber-300 tabular-nums block mt-0.5">
            {formatMillions(currentThreshold.first_apron)}
          </span>
          <span className="text-[9px] text-amber-400/70 block mt-0.5">
            Click to Ask CBA →
          </span>
        </button>

        {/* Second Apron (Clickable) */}
        <button
          type="button"
          onClick={() =>
            onOpenCbaWithPrompt &&
            onOpenCbaWithPrompt(`Explain second-apron trade restrictions for ${team?.name || 'this team'}.`)
          }
          className="p-3 bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/30 rounded-lg text-left group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block">
              Second Apron
            </span>
            <HelpCircle className="w-3 h-3 text-rose-500 group-hover:text-rose-300" />
          </div>
          <span className="font-mono text-xs font-bold text-rose-300 tabular-nums block mt-0.5">
            {formatMillions(currentThreshold.second_apron)}
          </span>
          <span className="text-[9px] text-rose-400/70 block mt-0.5">
            Click to Ask CBA →
          </span>
        </button>
      </div>

      {/* Verification Notice */}
      <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-neutral-500" />
          Thresholds updated per 2023 CBA annual BRI smoothing adjustment formulas.
        </span>
        <EvidenceBadge state={teamSnapshot.data_status} size="sm" />
      </div>
    </div>
  );
};
