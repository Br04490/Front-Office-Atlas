import React from 'react';
import { RosterPhase } from '../types';
import { Clock, Calendar, ShieldCheck } from 'lucide-react';

interface FreshnessIndicatorProps {
  effectiveDate?: string;
  retrievedAt?: string;
  rosterPhase?: RosterPhase;
  showDetails?: boolean;
}

export const FreshnessIndicator: React.FC<FreshnessIndicatorProps> = ({
  effectiveDate = 'October 1, 2026',
  retrievedAt = '2026-10-01 12:00 UTC',
  rosterPhase = 'training_camp',
  showDetails = true,
}) => {
  const getPhaseLabel = (phase: RosterPhase) => {
    switch (phase) {
      case 'training_camp':
        return 'Training Camp Roster';
      case 'preseason':
        return 'Preseason Roster';
      case 'opening_night':
        return 'Opening Night Roster';
      case 'regular_season':
        return 'Regular Season Roster';
      case 'postseason':
        return 'Postseason Roster';
      default:
        return 'Offseason Snapshot';
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-neutral-400">
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
        <Calendar className="w-3 h-3 text-amber-400" />
        <span>As of {effectiveDate}</span>
      </div>

      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
        <ShieldCheck className="w-3 h-3 text-sky-400" />
        <span>Phase: {getPhaseLabel(rosterPhase)}</span>
      </div>

      {showDetails && (
        <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-neutral-500">
          <Clock className="w-3 h-3" />
          <span>Refreshed: {retrievedAt}</span>
        </div>
      )}
    </div>
  );
};
