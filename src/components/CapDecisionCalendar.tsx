import React, { useState } from 'react';
import { CapDecisionCalendarService } from '../services/capEngine';
import { CapDecisionType, CapDecisionEvent } from '../types';
import { Calendar, Clock, AlertTriangle, FileText, CheckCircle2, ChevronRight, ShieldAlert } from 'lucide-react';

interface CapDecisionCalendarProps {
  teamSlug?: string;
  onOpenCba?: (prompt: string) => void;
}

export const CapDecisionCalendar: React.FC<CapDecisionCalendarProps> = ({
  teamSlug = 'houston-rockets',
  onOpenCba,
}) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const allEvents = CapDecisionCalendarService.getUpcomingDecisions(teamSlug);

  const filteredEvents = allEvents.filter((ev) => {
    if (selectedType === 'ALL') return true;
    return ev.decision_type === selectedType;
  });

  const getDecisionBadge = (type: CapDecisionType) => {
    switch (type) {
      case 'OPTION_DEADLINE':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'GUARANTEE_DATE':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'EXTENSION_ELIGIBILITY':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'FREE_AGENCY':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'HARD_CAP_IMPLICATION':
        return 'bg-rose-500/20 text-rose-200 border-rose-500/40';
      case 'TRADE_RESTRICTION_EXPIRATION':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'EXCEPTION_EXPIRATION':
        return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  return (
    <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <h3 className="font-mono text-sm font-extrabold text-white uppercase tracking-wider">
              Cap & CBA Operational Decision Calendar
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Audit upcoming contractual trigger dates, guarantee deadlines, extension windows, and moratorium boundaries.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 bg-[#131b30] p-1 rounded-lg border border-white/10 text-xs font-mono">
          {['ALL', 'OPTION_DEADLINE', 'GUARANTEE_DATE', 'EXTENSION_ELIGIBILITY', 'TRADE_RESTRICTION_EXPIRATION'].map((dt) => (
            <button
              key={dt}
              onClick={() => setSelectedType(dt)}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                selectedType === dt
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {dt === 'ALL' ? 'All Milestones' : dt.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-2.5">
        {filteredEvents.map((ev) => (
          <div
            key={ev.id}
            className="p-3.5 bg-[#131b30] border border-white/5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/20 transition-all font-mono text-xs"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-amber-300">{ev.date}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getDecisionBadge(ev.decision_type)}`}>
                  {ev.decision_type.replace(/_/g, ' ')}
                </span>
                <span className="text-white font-bold truncate">
                  {ev.player_name}
                </span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                {ev.description}
              </p>
              <div className="flex items-center gap-3 text-[10px] text-neutral-400 pt-0.5">
                <span>Impact: <strong className="text-emerald-400">{ev.financial_impact}</strong></span>
                <span>·</span>
                <span>Source: {ev.source}</span>
              </div>
            </div>

            {onOpenCba && (
              <button
                onClick={() => onOpenCba(`Explain the CBA rules regarding ${ev.player_name} and deadline on ${ev.date}.`)}
                className="shrink-0 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-[11px] transition-colors cursor-pointer"
              >
                Inspect in CBA →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
