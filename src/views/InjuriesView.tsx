import React, { useState } from 'react';
import { AvailabilityCategory } from '../types';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  Filter 
} from 'lucide-react';

export const InjuriesView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<AvailabilityCategory | 'ALL'>('ALL');

  const categories: (AvailabilityCategory | 'ALL')[] = [
    'ALL',
    'INJURY',
    'REST',
    'SUSPENSION',
    'COACH DECISION',
    'G LEAGUE ASSIGNMENT',
    'OTHER',
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Activity className="w-6 h-6 text-amber-400" />
              <span>Player Availability & Participation Registry</span>
            </h1>
            <span className="font-mono text-xs text-neutral-400 uppercase bg-neutral-800 border border-neutral-700 px-2 py-0.5 rounded">
              League Filing Stream
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Official availability status tracking, game participation logs, and formal league injury report filings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <EvidenceBadge state="VERIFICATION REQUIRED" />
        </div>
      </div>

      {/* Strict Legal & Medical Boundary Callout */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-200 space-y-1">
          <span className="font-bold text-amber-300 block uppercase font-mono tracking-wider">
            Mandatory Front-Office Medical Rule: Never Make Medical Diagnoses
          </span>
          <p className="text-neutral-300 leading-relaxed">
            Front Office Atlas records solely officially filed league availability designations and publicly sourced body areas. The system never makes clinical diagnoses, prognostic determinations, or subjective return timelines.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 bg-[#12161f] p-1 rounded-lg border border-white/10 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Availability Stream Feed / Empty State */}
      <div className="bg-[#12161f] border border-white/10 rounded-xl p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto text-neutral-400">
          <Clock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white font-mono tracking-wide uppercase">
            OFFICIAL INJURY & AVAILABILITY FEED AWAITING VERIFIED CONNECTOR
          </h3>
          <p className="text-xs text-neutral-400 max-w-lg mx-auto leading-relaxed">
            The availability ingestion pipeline is ready to consume official 5:00 PM ET NBA Injury Reports and G League assignment transaction wires upon API connector activation.
          </p>
        </div>

        {/* Ingestion Table Schema Specification */}
        <div className="pt-4 border-t border-white/5">
          <div className="text-[11px] font-mono text-neutral-500 uppercase mb-3">
            Expected Data Fields:
          </div>
          <div className="border border-white/5 rounded-lg overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0e1117] text-neutral-400 font-mono text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-4">Event Date</th>
                  <th className="py-2.5 px-4">Player</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Body Area (Sourced)</th>
                  <th className="py-2.5 px-4">Games Missed</th>
                  <th className="py-2.5 px-4">Return Status</th>
                  <th className="py-2.5 px-4">Source & State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px] text-neutral-400">
                <tr>
                  <td className="py-2.5 px-4">Daily Game Day</td>
                  <td className="py-2.5 px-4">Roster Player</td>
                  <td className="py-2.5 px-4">INJURY / REST</td>
                  <td className="py-2.5 px-4">Public Filing Only</td>
                  <td className="py-2.5 px-4">Counted</td>
                  <td className="py-2.5 px-4">Official Designation</td>
                  <td className="py-2.5 px-4">
                    <EvidenceBadge state="SOURCE PENDING" size="sm" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
