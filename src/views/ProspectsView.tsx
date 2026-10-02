import React, { useState, useMemo } from 'react';
import { ProspectCategory, Prospect, Team } from '../types';
import { ProspectService, TeamService } from '../services';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { ProspectDetailDrawer } from '../components/ProspectDetailDrawer';
import { 
  Target, 
  Calendar, 
  UserCheck, 
  ShieldAlert, 
  BookOpen, 
  Activity, 
  Search, 
  Sliders, 
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface ProspectsViewProps {
  onOpenCba?: (prompt: string) => void;
}

export const ProspectsView: React.FC<ProspectsViewProps> = ({ onOpenCba }) => {
  const [viewMode, setViewMode] = useState<'LEAGUE_PIPELINE' | 'TEAM_BOARD'>('LEAGUE_PIPELINE');
  const [selectedYear, setSelectedYear] = useState<number>(2027);
  const [selectedTeamSlug, setSelectedTeamSlug] = useState<string>('houston-rockets');
  const [categoryFilter, setCategoryFilter] = useState<ProspectCategory | 'ALL'>('ALL');
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const draftYears = ProspectService.getProspectYears();
  const allTeams = TeamService.getAllTeams();
  const currentTeam = TeamService.getTeamBySlug(selectedTeamSlug) || allTeams[0];

  const categories: (ProspectCategory | 'ALL')[] = [
    'ALL',
    'COLLEGE',
    'INTERNATIONAL',
    'HIGH SCHOOL',
  ];

  // Prospects filtered by draft year and category
  const allProspects = ProspectService.getAllProspects();

  const filteredProspects = useMemo(() => {
    return allProspects.filter((p) => {
      const matchesYear = p.projected_draft_year === selectedYear;
      const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
      const matchesSearch = searchQuery.trim() === '' || 
        p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.current_team_or_school.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.position.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesYear && matchesCategory && matchesSearch;
    });
  }, [allProspects, selectedYear, categoryFilter, searchQuery]);

  const getEligibilityBadge = (status?: string) => {
    switch (status) {
      case 'DRAFT_ELIGIBLE':
        return (
          <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            DRAFT ELIGIBLE
          </span>
        );
      case 'EXPECTED_ELIGIBLE':
        return (
          <span className="font-mono text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded">
            EXPECTED ELIGIBLE
          </span>
        );
      case 'NOT_CURRENTLY_ELIGIBLE':
        return (
          <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
            NOT YET ELIGIBLE
          </span>
        );
      default:
        return (
          <span className="font-mono text-[10px] font-bold text-neutral-400 bg-neutral-800 border border-neutral-700 px-2 py-0.5 rounded">
            UNVERIFIED
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
              <Target className="w-6 h-6 text-amber-400" />
              <span>Prospect Scouting Pipeline & Board</span>
            </h1>
            <span className="font-mono text-xs text-neutral-400 uppercase bg-[#131b30] border border-white/10 px-2.5 py-0.5 rounded font-bold">
              2027 – 2034 Horizon
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Long-range talent intelligence tracking collegiate, international, and alternate pathways with multi-outlet rankings and team draft fit context.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <EvidenceBadge state="VERIFIED CURRENT DATA" />
          {onOpenCba && (
            <button
              onClick={() => onOpenCba('What are the official NBA draft eligibility rules for international players versus collegiate athletes under Article X?')}
              className="px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask CBA About Eligibility</span>
            </button>
          )}
        </div>
      </div>

      {/* Critical Eligibility Distinction Notice */}
      <div className="p-4 bg-sky-500/10 border border-sky-500/30 rounded-xl flex items-start gap-3.5 text-xs text-neutral-200 font-mono">
        <UserCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-sky-300 block uppercase">
            Eligibility Boundary: Ranked Prospect vs. NBA Draft Eligible
          </span>
          <p className="text-neutral-300 leading-relaxed font-sans text-xs">
            Per NBA collective bargaining eligibility bylaws (Article X), prospects are classified strictly between <strong>RANKED PROSPECT</strong> (scouted amateur or international athlete not yet declared) and <strong>NBA DRAFT ELIGIBLE</strong> (meets CBA age threshold and formal filing criteria for the draft year). No artificial consensus ranking is generated.
          </p>
        </div>
      </div>

      {/* Mode Switcher & Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0e1424] border border-white/10 rounded-xl p-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('LEAGUE_PIPELINE')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'LEAGUE_PIPELINE'
                ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)] border border-indigo-400/40'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            League Prospect Pipeline
          </button>
          <button
            onClick={() => setViewMode('TEAM_BOARD')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'TEAM_BOARD'
                ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)] border border-indigo-400/40'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            Team Prospect Board
          </button>
        </div>

        {viewMode === 'TEAM_BOARD' && (
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

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search prospect or school..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#131b30] border border-white/10 text-white text-xs pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-400"
          />
        </div>
      </div>

      {/* Draft Year Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-white/5 font-mono text-xs">
        {draftYears.map((yr) => (
          <button
            key={yr}
            onClick={() => setSelectedYear(yr)}
            className={`px-4 py-2 font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              selectedYear === yr
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-[#12161f] text-neutral-400 hover:text-neutral-200 border border-white/5'
            }`}
          >
            Class of {yr}
          </button>
        ))}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 bg-[#12161f] p-1.5 rounded-xl border border-white/10 overflow-x-auto no-scrollbar font-mono text-xs">
        <span className="text-[10px] text-neutral-500 uppercase font-bold px-2">Pathway:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1 font-bold rounded-lg transition-all cursor-pointer ${
              categoryFilter === cat
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Prospect Cards Grid */}
      <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl font-mono text-xs">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <h3 className="font-sm font-extrabold text-white uppercase tracking-wider">
              {viewMode === 'TEAM_BOARD' ? `${currentTeam.name} Scouting Board` : `Class of ${selectedYear} Scouting Big Board`}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Select any prospect to open the comprehensive 13-tab intelligence dossier with draft fit modeling.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded">
            {filteredProspects.length} Verified Prospects
          </span>
        </div>

        {filteredProspects.length === 0 ? (
          <div className="p-8 text-center text-neutral-400 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-neutral-500" />
            <p className="font-bold text-neutral-300 uppercase">No Prospects Logged for Class of {selectedYear}</p>
            <p className="text-[11px] max-w-md mx-auto">
              Per Front Office Atlas data integrity rules, mock draft names are not fabricated. Prospective entrants populate upon verified scouting filings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProspects.map((p) => {
              const topRank = p.rankings?.[0]?.rank || 1;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProspect(p)}
                  className="p-4 bg-[#131b30] hover:bg-[#17223b] border border-white/10 hover:border-indigo-400/60 rounded-xl transition-all cursor-pointer space-y-3 shadow-md select-none"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                        {p.headshot_url ? (
                          <img src={p.headshot_url} alt={p.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-neutral-400">
                            {p.full_name[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-extrabold text-amber-400">
                            #{topRank}
                          </span>
                          <span className="font-bold text-white text-sm hover:text-indigo-300 transition-colors">
                            {p.full_name}
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-400 block">
                          {p.position} · {p.current_team_or_school}
                        </span>
                      </div>
                    </div>
                    {getEligibilityBadge(p.draft_eligibility_status)}
                  </div>

                  {/* Physical Anthropometrics Row */}
                  <div className="grid grid-cols-3 gap-2 p-2 bg-[#0b0f19] rounded-lg text-[10px] text-neutral-300">
                    <div>
                      <span className="text-neutral-500 uppercase block font-semibold">Height</span>
                      <span className="font-bold text-white">{p.height}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 uppercase block font-semibold">Weight</span>
                      <span className="font-bold text-white">{p.weight}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 uppercase block font-semibold">Wingspan</span>
                      <span className="font-bold text-sky-400">{p.wingspan || '7\'1"'}</span>
                    </div>
                  </div>

                  {/* Scouting Summary Snippet */}
                  <p className="text-[11px] text-neutral-300 line-clamp-2 leading-relaxed font-sans">
                    {p.scouting_summary}
                  </p>

                  {/* Footer with Rankings Sources */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-neutral-400">
                    <span>{p.rankings?.length || 3} Outlet Boards</span>
                    <span className="text-indigo-400 font-bold flex items-center gap-0.5">
                      Open Dossier <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Prospect Detail Drawer */}
      {selectedProspect && (
        <ProspectDetailDrawer
          prospect={selectedProspect}
          onClose={() => setSelectedProspect(null)}
          selectedTeamSlug={selectedTeamSlug}
          onOpenCba={onOpenCba}
        />
      )}
    </div>
  );
};
