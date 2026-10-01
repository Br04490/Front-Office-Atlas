import React, { useState } from 'react';
import { ProspectCategory, ProspectEligibility } from '../types';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { Target, Calendar, UserCheck, ShieldAlert, BookOpen } from 'lucide-react';

export const ProspectsView: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2027);
  const [categoryFilter, setCategoryFilter] = useState<ProspectCategory | 'ALL'>('ALL');

  const draftYears = [2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034];
  const categories: (ProspectCategory | 'ALL')[] = [
    'ALL',
    'COLLEGE',
    'INTERNATIONAL',
    'HIGH SCHOOL',
    'YOUNGER PUBLIC RANKINGS',
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Target className="w-6 h-6 text-amber-400" />
              <span>Prospect Scouting Pipeline (2027 – 2034)</span>
            </h1>
            <span className="font-mono text-xs text-neutral-400 uppercase bg-neutral-800 border border-neutral-700 px-2 py-0.5 rounded">
              Amateur & International Scouting
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Long-range talent pipeline tracking college athletes, international professionals, high school prospects, and draft-eligible entrants.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <EvidenceBadge state="VERIFICATION REQUIRED" />
        </div>
      </div>

      {/* Critical Distinction Notice (Ranked Prospect vs NBA Draft Eligible) */}
      <div className="p-4 bg-sky-500/10 border border-sky-500/30 rounded-xl flex items-start gap-3.5 text-xs text-neutral-200">
        <UserCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-sky-300 block font-mono uppercase">
            Eligibility Boundary: Ranked Prospect vs. NBA Draft Eligible
          </span>
          <p className="text-neutral-300 leading-relaxed">
            Per NBA collective bargaining eligibility bylaws, prospects are classified strictly between <strong>RANKED PROSPECT</strong> (scouted amateur or international athlete not yet eligible or declared) and <strong>NBA DRAFT ELIGIBLE</strong> (meets CBA age threshold and formal filing criteria for the current calendar draft year).
          </p>
        </div>
      </div>

      {/* Year Selector (2027-2034) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-white/5">
        {draftYears.map((yr) => (
          <button
            key={yr}
            onClick={() => setSelectedYear(yr)}
            className={`px-4 py-2 font-mono text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              selectedYear === yr
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-[#12161f] text-neutral-400 hover:text-neutral-200 border border-white/5'
            }`}
          >
            Class of {yr}
          </button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-1 bg-[#12161f] p-1 rounded-lg border border-white/10 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap ${
              categoryFilter === cat
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Empty State / Ingestion Blueprint */}
      <div className="bg-[#12161f] border border-white/10 rounded-xl p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto text-neutral-400">
          <BookOpen className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white font-mono tracking-wide uppercase">
            {selectedYear} SCOUTING BOARD · PROSPECT DATA PENDING VERIFIED IMPORT
          </h3>
          <p className="text-xs text-neutral-400 max-w-lg mx-auto leading-relaxed">
            In accordance with Front Office Atlas data guidelines, subjective mock drafts and fabricated player rankings are strictly prohibited. The prospect pipeline will populate as verified collegiate and international scouting reports are imported.
          </p>
        </div>

        {/* Expected Schema */}
        <div className="pt-4 border-t border-white/5">
          <div className="text-[11px] font-mono text-neutral-500 uppercase mb-3">
            Expected Prospect Ingestion Schema:
          </div>
          <div className="border border-white/5 rounded-lg overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0e1117] text-neutral-400 font-mono text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-4">Prospect Name</th>
                  <th className="py-2.5 px-4">Projected Class</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Current Team / School</th>
                  <th className="py-2.5 px-4">Position & Measurables</th>
                  <th className="py-2.5 px-4">Eligibility Status</th>
                  <th className="py-2.5 px-4">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px] text-neutral-400">
                <tr>
                  <td className="py-2.5 px-4">Ingestion Inbound</td>
                  <td className="py-2.5 px-4">{selectedYear}</td>
                  <td className="py-2.5 px-4">{categoryFilter === 'ALL' ? 'COLLEGE' : categoryFilter}</td>
                  <td className="py-2.5 px-4">NCAA / International FIBA</td>
                  <td className="py-2.5 px-4">Verified Combine Data</td>
                  <td className="py-2.5 px-4">
                    <span className="text-amber-400">RANKED PROSPECT</span>
                  </td>
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
