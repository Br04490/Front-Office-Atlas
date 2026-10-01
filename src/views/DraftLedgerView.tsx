import React, { useState } from 'react';
import { DraftService, TeamService } from '../services';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { Layers, Calendar, Shield, Search, ArrowRight, Info } from 'lucide-react';

export const DraftLedgerView: React.FC = () => {
  const years = DraftService.getDraftLedgerYears();
  const [selectedYear, setSelectedYear] = useState<number>(2027);
  const [roundFilter, setRoundFilter] = useState<'ALL' | 1 | 2>('ALL');
  const allTeams = TeamService.getAllTeams();

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-amber-400" />
              <span>NBA Draft Asset & Obligation Ledger</span>
            </h1>
            <span className="font-mono text-xs text-neutral-400 uppercase bg-neutral-800 border border-neutral-700 px-2 py-0.5 rounded">
              2027 – 2034 Horizon
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Tracks first and second round draft picks, lottery protections, swap conditions, and multi-year conveyances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <EvidenceBadge state="SOURCE PENDING" />
        </div>
      </div>

      {/* Year Selection Tabs (2027-2034) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-white/5">
        {years.map((yr) => (
          <button
            key={yr}
            onClick={() => setSelectedYear(yr)}
            className={`px-4 py-2 font-mono text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              selectedYear === yr
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-[#12161f] text-neutral-400 hover:text-neutral-200 border border-white/5'
            }`}
          >
            {yr} Draft Class
          </button>
        ))}
      </div>

      {/* Draft Rules Info Header (Ted Stepien & 7-Year Frozen Pick Rule) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-[#12161f] border border-white/10 rounded-xl space-y-1 text-xs">
          <span className="font-mono font-bold text-neutral-200 uppercase">
            Ted Stepien Rule Protocol
          </span>
          <p className="text-neutral-400 leading-relaxed">
            Teams are prohibited from being without a first-round pick in consecutive future drafts. Swaps and conditional protections must preserve compliance.
          </p>
        </div>
        <div className="p-4 bg-[#12161f] border border-white/10 rounded-xl space-y-1 text-xs">
          <span className="font-mono font-bold text-amber-300 uppercase">
            2023 CBA Second-Apron Pick Freeze
          </span>
          <p className="text-neutral-400 leading-relaxed">
            Teams exceeding the Second Apron have their first-round pick 7 years out automatically frozen from trades, re-seeding to pick #30 upon repeat apron breach.
          </p>
        </div>
      </div>

      {/* Draft Grid / Empty State */}
      <div className="bg-[#12161f] border border-white/10 rounded-xl p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto text-neutral-400">
          <Calendar className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white font-mono tracking-wide uppercase">
            {selectedYear} DRAFT ASSET LEDGER · PICK DATA PENDING
          </h3>
          <p className="text-xs text-neutral-400 max-w-lg mx-auto leading-relaxed">
            In accordance with Front Office Atlas data integrity rules, pick ownership, lottery swap rights, and protection terms (e.g. Top-4 protected, lottery protected) are not fabricated. Verified ledger imports will map all 30 first and second round selections for {selectedYear}.
          </p>
        </div>

        {/* Structural Schema preview table */}
        <div className="pt-4 border-t border-white/5">
          <div className="text-[11px] font-mono text-neutral-500 uppercase mb-3">
            Expected Asset Ingestion Schema:
          </div>
          <div className="border border-white/5 rounded-lg overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0e1117] text-neutral-400 font-mono text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-4">Year / Round</th>
                  <th className="py-2.5 px-4">Original Team</th>
                  <th className="py-2.5 px-4">Current Controller</th>
                  <th className="py-2.5 px-4">Protection Details</th>
                  <th className="py-2.5 px-4">Swap Rights</th>
                  <th className="py-2.5 px-4">Conveyance Terms</th>
                  <th className="py-2.5 px-4">Verification State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px] text-neutral-400">
                <tr>
                  <td className="py-2.5 px-4">{selectedYear} Round 1</td>
                  <td className="py-2.5 px-4">Houston Rockets</td>
                  <td className="py-2.5 px-4">Houston Rockets</td>
                  <td className="py-2.5 px-4">Unprotected</td>
                  <td className="py-2.5 px-4">None</td>
                  <td className="py-2.5 px-4">Direct Exercise</td>
                  <td className="py-2.5 px-4">
                    <EvidenceBadge state="VERIFICATION REQUIRED" size="sm" />
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
