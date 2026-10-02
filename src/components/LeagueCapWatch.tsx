import React, { useState, useMemo } from 'react';
import { TeamService } from '../services';
import { CapEngine, TaxEngine, ApronEngine, HardCapEngine } from '../services/capEngine';
import { CAP_THRESHOLDS_BY_SEASON } from '../data/capThresholds';
import { Team } from '../types';
import { Search, ArrowUpDown, Shield, AlertTriangle, CheckCircle2, Filter } from 'lucide-react';

interface LeagueCapWatchProps {
  season?: string;
  onSelectTeam?: (slug: string) => void;
  onOpenCba?: (prompt: string) => void;
}

type SortField = 
  | 'team_salary' 
  | 'tax_salary' 
  | 'apron_salary' 
  | 'cap_space' 
  | 'tax_distance' 
  | 'first_apron_distance' 
  | 'second_apron_distance';

type FilterType = 
  | 'ALL' 
  | 'BELOW_CAP' 
  | 'ABOVE_CAP' 
  | 'TAX_TEAM' 
  | 'FIRST_APRON' 
  | 'SECOND_APRON' 
  | 'HARD_CAPPED';

export const LeagueCapWatch: React.FC<LeagueCapWatchProps> = ({
  season = '2026-27',
  onSelectTeam,
  onOpenCba,
}) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('team_salary');
  const [sortAsc, setSortAsc] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

  const allTeams = TeamService.getAllTeams();
  const threshold = CAP_THRESHOLDS_BY_SEASON[season] || CAP_THRESHOLDS_BY_SEASON['2026-27'];

  const formatMillions = (val: number) => `$${(val / 1000000).toFixed(1)}M`;

  // Compute financial positions for all 30 teams
  const teamRows = useMemo(() => {
    return allTeams.map((team) => {
      const capData = CapEngine.calculateTeamSalary(team.slug, season);
      const taxData = TaxEngine.calculateTaxSalary(team.slug, season);
      const apronData = ApronEngine.calculateApronSalary(team.slug, season);
      const hardCapData = HardCapEngine.getHardCapStatus(team.slug, season);

      const capSpace = threshold.salary_cap - capData.team_salary;
      const isTax = taxData.is_taxpayer;
      const isFirstApron = apronData.first_apron_status === 'ABOVE';
      const isSecondApron = apronData.second_apron_status === 'ABOVE';

      // Distance to next important threshold
      let nextThresholdLabel = 'Tax Room';
      let nextThresholdDistance = taxData.distance_to_tax;
      if (capData.team_salary < threshold.salary_cap) {
        nextThresholdLabel = 'Cap Space';
        nextThresholdDistance = capSpace;
      } else if (!isTax) {
        nextThresholdLabel = 'Tax Apron';
        nextThresholdDistance = taxData.distance_to_tax;
      } else if (!isFirstApron) {
        nextThresholdLabel = '1st Apron Room';
        nextThresholdDistance = apronData.distance_to_first_apron;
      } else if (!isSecondApron) {
        nextThresholdLabel = '2nd Apron Room';
        nextThresholdDistance = apronData.distance_to_second_apron;
      } else {
        nextThresholdLabel = 'Over 2nd Apron';
        nextThresholdDistance = -apronData.distance_to_second_apron;
      }

      return {
        team,
        team_salary: capData.team_salary,
        tax_salary: taxData.tax_salary,
        apron_salary: apronData.apron_salary,
        cap_space: capSpace,
        tax_distance: taxData.distance_to_tax,
        first_apron_distance: apronData.distance_to_first_apron,
        second_apron_distance: apronData.distance_to_second_apron,
        is_taxpayer: isTax,
        is_first_apron: isFirstApron,
        is_second_apron: isSecondApron,
        is_hard_capped: hardCapData.is_hard_capped,
        hard_cap_level: hardCapData.hard_cap_level,
        next_threshold_label: nextThresholdLabel,
        next_threshold_distance: nextThresholdDistance,
      };
    });
  }, [allTeams, season, threshold]);

  // Filtering
  const filteredRows = useMemo(() => {
    return teamRows.filter((r) => {
      // Search
      const matchSearch = 
        r.team.name.toLowerCase().includes(search.toLowerCase()) ||
        r.team.abbreviation.toLowerCase().includes(search.toLowerCase()) ||
        r.team.conference.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;

      // Filter category
      if (activeFilter === 'BELOW_CAP' && r.team_salary >= threshold.salary_cap) return false;
      if (activeFilter === 'ABOVE_CAP' && r.team_salary < threshold.salary_cap) return false;
      if (activeFilter === 'TAX_TEAM' && !r.is_taxpayer) return false;
      if (activeFilter === 'FIRST_APRON' && !r.is_first_apron) return false;
      if (activeFilter === 'SECOND_APRON' && !r.is_second_apron) return false;
      if (activeFilter === 'HARD_CAPPED' && !r.is_hard_capped) return false;

      return true;
    });
  }, [teamRows, search, activeFilter, threshold.salary_cap]);

  // Sorting
  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  }, [filteredRows, sortField, sortAsc]);

  const handleSortToggle = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-base font-extrabold text-white uppercase tracking-wider">
              League Cap & Apron Watch (All 30 Franchises)
            </h3>
            <span className="font-mono text-[10px] text-neutral-400 bg-[#131b30] border border-white/10 px-2 py-0.5 rounded font-bold">
              {season} Cap: {formatMillions(threshold.salary_cap)} · 1st Apron: {formatMillions(threshold.first_apron)} · 2nd Apron: {formatMillions(threshold.second_apron)}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Audit Team Salary, Tax Salary, Apron Salary, tax liability status, and operational hard-caps across the entire association.
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Filter by team or conference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#131b30] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-400 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
        <span className="text-neutral-500 text-[10px] uppercase font-bold mr-1">Filter By:</span>
        {[
          { id: 'ALL', label: 'All 30 Teams' },
          { id: 'BELOW_CAP', label: 'Below Cap' },
          { id: 'ABOVE_CAP', label: 'Above Cap' },
          { id: 'TAX_TEAM', label: 'Luxury Tax Teams' },
          { id: 'FIRST_APRON', label: 'First Apron Teams' },
          { id: 'SECOND_APRON', label: 'Second Apron Teams' },
          { id: 'HARD_CAPPED', label: 'Hard-Capped Teams' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id as FilterType)}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeFilter === f.id
                ? 'bg-indigo-600 text-white font-bold shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                : 'bg-[#131b30] text-neutral-400 hover:text-neutral-200 border border-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 30-Team Table View */}
      <div className="overflow-x-auto rounded-lg border border-white/5">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-[#131b30] text-neutral-400 border-b border-white/10">
              <th className="p-3 font-bold uppercase text-[10px]">Team</th>
              <th 
                onClick={() => handleSortToggle('team_salary')}
                className="p-3 font-bold uppercase text-[10px] cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Team Salary</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                onClick={() => handleSortToggle('tax_salary')}
                className="p-3 font-bold uppercase text-[10px] cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Tax Salary</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                onClick={() => handleSortToggle('apron_salary')}
                className="p-3 font-bold uppercase text-[10px] cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Apron Salary</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3 font-bold uppercase text-[10px]">Tax Standing</th>
              <th className="p-3 font-bold uppercase text-[10px]">Apron Standing</th>
              <th className="p-3 font-bold uppercase text-[10px]">Hard Cap</th>
              <th 
                onClick={() => handleSortToggle('first_apron_distance')}
                className="p-3 font-bold uppercase text-[10px] cursor-pointer hover:text-white text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Threshold Headroom</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-[#0a0e1a]">
            {sortedRows.map((row) => (
              <tr 
                key={row.team.id}
                onClick={() => onSelectTeam && onSelectTeam(row.team.slug)}
                className="hover:bg-[#131b30] transition-colors cursor-pointer group"
              >
                {/* Team */}
                <td className="p-3 flex items-center gap-2.5">
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: row.team.colors.primary }}
                  />
                  <div>
                    <span className="font-bold text-white group-hover:text-amber-300 transition-colors">
                      {row.team.name}
                    </span>
                    <span className="text-[10px] text-neutral-500 block">
                      {row.team.abbreviation} · {row.team.division}
                    </span>
                  </div>
                </td>

                {/* Team Salary */}
                <td className="p-3 font-bold text-white tabular-nums">
                  {formatMillions(row.team_salary)}
                </td>

                {/* Tax Salary */}
                <td className="p-3 text-neutral-300 tabular-nums">
                  {formatMillions(row.tax_salary)}
                </td>

                {/* Apron Salary */}
                <td className="p-3 font-extrabold text-amber-300 tabular-nums">
                  {formatMillions(row.apron_salary)}
                </td>

                {/* Tax Status */}
                <td className="p-3">
                  {row.is_taxpayer ? (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                      TAXPAYER
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      UNDER TAX
                    </span>
                  )}
                </td>

                {/* Apron Status */}
                <td className="p-3">
                  {row.is_second_apron ? (
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded">
                      2ND APRON EXCEEDED
                    </span>
                  ) : row.is_first_apron ? (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                      1ST APRON EXCEEDED
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded">
                      BELOW APRONS
                    </span>
                  )}
                </td>

                {/* Hard Cap Status */}
                <td className="p-3">
                  {row.is_hard_capped ? (
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                      <Shield className="w-3 h-3" />
                      <span>{row.hard_cap_level}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-neutral-500">None</span>
                  )}
                </td>

                {/* Next Threshold Headroom */}
                <td className="p-3 text-right tabular-nums">
                  <span className={`font-bold block ${row.next_threshold_distance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {row.next_threshold_distance >= 0 ? `+${formatMillions(row.next_threshold_distance)}` : formatMillions(row.next_threshold_distance)}
                  </span>
                  <span className="text-[9px] text-neutral-500 block">
                    {row.next_threshold_label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
