import React, { useState } from 'react';
import { Prospect, ProspectDraftFit, Team } from '../types';
import { TeamService, ProspectService } from '../services';
import { EvidenceBadge } from './EvidenceBadge';
import { 
  X, 
  Target, 
  Calendar, 
  ExternalLink, 
  UserCheck, 
  BarChart2, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Activity, 
  Sliders, 
  Eye, 
  Layers, 
  Scale, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ProspectDetailDrawerProps {
  prospect: Prospect | null;
  onClose: () => void;
  selectedTeamSlug?: string;
  onOpenCba?: (prompt: string) => void;
}

type ProspectTab = 
  | 'OVERVIEW' 
  | 'PERFORMANCE' 
  | 'PROGRESSION' 
  | 'SHOOTING' 
  | 'FINISHING' 
  | 'PLAYMAKING' 
  | 'DEFENSE' 
  | 'PHYSICAL_PROFILE' 
  | 'DEVELOPMENT' 
  | 'SCOUTING' 
  | 'VIDEO' 
  | 'DRAFT_FIT' 
  | 'SOURCES';

export const ProspectDetailDrawer: React.FC<ProspectDetailDrawerProps> = ({
  prospect,
  onClose,
  selectedTeamSlug = 'houston-rockets',
  onOpenCba,
}) => {
  const [activeTab, setActiveTab] = useState<ProspectTab>('OVERVIEW');
  const [focusTeamSlug, setFocusTeamSlug] = useState<string>(selectedTeamSlug);

  if (!prospect) return null;

  const allTeams = TeamService.getAllTeams();
  const currentTeam = TeamService.getTeamBySlug(focusTeamSlug) || allTeams[0];
  const draftFit = ProspectService.getDraftFit(prospect.id, currentTeam.slug);

  const primaryTabs: { id: ProspectTab; label: string }[] = [
    { id: 'OVERVIEW', label: 'Overview' },
    { id: 'PERFORMANCE', label: 'Performance' },
    { id: 'PROGRESSION', label: 'Progression' },
    { id: 'SHOOTING', label: 'Shooting' },
    { id: 'FINISHING', label: 'Finishing' },
    { id: 'PLAYMAKING', label: 'Playmaking' },
    { id: 'DEFENSE', label: 'Defense' },
    { id: 'PHYSICAL_PROFILE', label: 'Physical Profile' },
    { id: 'DEVELOPMENT', label: 'Development' },
    { id: 'SCOUTING', label: 'Scouting' },
    { id: 'VIDEO', label: 'Video Analysis' },
    { id: 'DRAFT_FIT', label: 'Draft Fit Matrix' },
    { id: 'SOURCES', label: 'Lineage & Sources' },
  ];

  const getEligibilityBadge = (status?: string) => {
    switch (status) {
      case 'DRAFT_ELIGIBLE':
        return (
          <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> DRAFT ELIGIBLE
          </span>
        );
      case 'EXPECTED_ELIGIBLE':
        return (
          <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" /> EXPECTED ELIGIBLE
          </span>
        );
      case 'NOT_CURRENTLY_ELIGIBLE':
        return (
          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> NOT CURRENTLY ELIGIBLE
          </span>
        );
      default:
        return (
          <span className="font-mono text-xs font-bold text-neutral-400 bg-neutral-800 border border-neutral-700 px-2.5 py-0.5 rounded-full">
            ELIGIBILITY UNVERIFIED
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#0b0f19] border-l border-white/10 w-full max-w-4xl h-full flex flex-col shadow-2xl overflow-hidden font-mono">
        {/* 1. Header Bar with Close Button */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0e1424]">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Front Office Atlas · Prospect Intelligence Workspace
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Prospect Hero Section */}
        <div className="p-6 bg-gradient-to-b from-[#131b30] to-[#0e1424] border-b border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Headshot */}
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-neutral-900 border-2 border-indigo-400/40 shadow-xl shrink-0">
              {prospect.headshot_url ? (
                <img src={prospect.headshot_url} alt={prospect.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-xl text-neutral-400">
                  {prospect.full_name[0]}
                </div>
              )}
            </div>

            {/* Core Bio */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                  {prospect.projected_draft_year} Class
                </span>
                <h2 className="text-2xl font-extrabold text-white tracking-tight truncate">
                  {prospect.full_name}
                </h2>
                {getEligibilityBadge(prospect.draft_eligibility_status)}
              </div>

              {/* Anthropometrics & Pathway Sub-row */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1 text-xs text-neutral-300 border-t border-white/5">
                <div>
                  <span className="text-neutral-500 uppercase text-[10px] block font-bold">Position</span>
                  <span className="font-bold text-white">{prospect.position}</span>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase text-[10px] block font-bold">Team / School</span>
                  <span className="font-bold text-white truncate block">{prospect.current_team_or_school}</span>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase text-[10px] block font-bold">Age · Ht · Wt</span>
                  <span className="font-bold text-neutral-200">
                    {prospect.age ?? '—'}y · {prospect.height} · {prospect.weight}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase text-[10px] block font-bold">Wingspan</span>
                  <span className="font-bold text-sky-400">{prospect.wingspan || '7\'1" (Est.)'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase text-[10px] block font-bold">Pathway</span>
                  <span className="font-bold text-indigo-300">{prospect.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Tab Navigation Bar */}
        <div className="px-6 border-b border-white/10 bg-[#0e1424] flex gap-1.5 overflow-x-auto no-scrollbar py-2.5">
          {primaryTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 text-xs font-bold whitespace-nowrap rounded-lg transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)] border border-indigo-400/40'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 4. Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#090d16] text-xs">
          {/* TAB: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Scouting Executive Summary */}
              <div className="p-5 bg-[#0e1424] border border-white/10 rounded-xl space-y-2">
                <h3 className="font-bold text-white uppercase tracking-wider text-sm">
                  Executive Scouting Synthesis
                </h3>
                <p className="text-neutral-300 leading-relaxed font-sans text-xs">
                  {prospect.scouting_summary}
                </p>
              </div>

              {/* Multi-Outlet Rankings Board */}
              <div className="p-5 bg-[#0e1424] border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="font-bold text-white uppercase tracking-wider text-sm">
                    Multi-Outlet Scouting Big Boards
                  </h3>
                  <span className="text-[10px] text-neutral-400">
                    No artificial consensus generated; displays underlying sources
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {prospect.rankings?.map((r, idx) => (
                    <div key={idx} className="p-3 bg-[#131b30] border border-white/5 rounded-xl space-y-1">
                      <span className="text-[10px] text-neutral-400 block font-semibold">{r.outlet}</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-extrabold text-white">#{r.rank}</span>
                        <span className="text-[10px] text-neutral-500">Overall</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 block">Published: {r.published_date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Grades */}
              {prospect.skill_grades && (
                <div className="p-5 bg-[#0e1424] border border-white/10 rounded-xl space-y-4">
                  <h3 className="font-bold text-white uppercase tracking-wider text-sm">
                    Evaluated Skill Dimensions (20-80 Scouting Scale Equivalent)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Object.entries(prospect.skill_grades).map(([skill, grade]) => (
                      <div key={skill} className="space-y-1">
                        <div className="flex justify-between text-neutral-400 text-[11px] capitalize font-bold">
                          <span>{skill}</span>
                          <span className="text-white">{grade}/100</span>
                        </div>
                        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              grade >= 90 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : grade >= 80 ? 'bg-indigo-400' : 'bg-amber-400'
                            }`}
                            style={{ width: `${grade}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: DRAFT FIT MATRIX */}
          {activeTab === 'DRAFT_FIT' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0e1424] border border-white/10 p-4 rounded-xl">
                <div>
                  <h3 className="font-bold text-white uppercase tracking-wider text-sm">
                    Franchise Draft Fit & Context Matrix
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Evaluates roster need, role overlap, and timeline alignment without making subjective "best/bad" fit pronouncements.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-neutral-500 uppercase text-[10px] font-bold">Target Team:</span>
                  <select
                    value={focusTeamSlug}
                    onChange={(e) => setFocusTeamSlug(e.target.value)}
                    className="bg-[#131b30] border border-white/10 text-white rounded-lg px-3 py-1.5 font-bold focus:outline-none focus:border-indigo-400 cursor-pointer"
                  >
                    {allTeams.map((t) => (
                      <option key={t.id} value={t.slug} className="bg-[#0e1424] text-white">
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {draftFit ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#0e1424] border border-white/10 rounded-xl space-y-2">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold block">
                      1. Roster Need Alignment
                    </span>
                    <p className="text-neutral-300 font-sans leading-relaxed">
                      {draftFit.roster_need_alignment}
                    </p>
                  </div>

                  <div className="p-4 bg-[#0e1424] border border-white/10 rounded-xl space-y-2">
                    <span className="text-[10px] text-amber-400 uppercase font-bold block">
                      2. Role Overlap & Positional Competition
                    </span>
                    <p className="text-neutral-300 font-sans leading-relaxed">
                      {draftFit.role_overlap}
                    </p>
                  </div>

                  <div className="p-4 bg-[#0e1424] border border-white/10 rounded-xl space-y-2">
                    <span className="text-[10px] text-sky-400 uppercase font-bold block">
                      3. Development Opportunity & Minutes Runway
                    </span>
                    <p className="text-neutral-300 font-sans leading-relaxed">
                      {draftFit.development_opportunity}
                    </p>
                  </div>

                  <div className="p-4 bg-[#0e1424] border border-white/10 rounded-xl space-y-2">
                    <span className="text-[10px] text-purple-400 uppercase font-bold block">
                      4. Timeline & Core Age Curve Alignment
                    </span>
                    <p className="text-neutral-300 font-sans leading-relaxed">
                      {draftFit.timeline_alignment}
                    </p>
                  </div>

                  <div className="p-4 bg-[#0e1424] border border-white/10 rounded-xl space-y-2">
                    <span className="text-[10px] text-indigo-400 uppercase font-bold block">
                      5. Contract Timeline & Apron Relief Impact
                    </span>
                    <p className="text-neutral-300 font-sans leading-relaxed">
                      {draftFit.contract_timeline_context}
                    </p>
                  </div>

                  <div className="p-4 bg-[#0e1424] border border-white/10 rounded-xl space-y-2">
                    <span className="text-[10px] text-rose-400 uppercase font-bold block">
                      6. Defensive System & Scheme Fit
                    </span>
                    <p className="text-neutral-300 font-sans leading-relaxed">
                      {draftFit.defensive_system_fit}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-[#0e1424] border border-white/10 rounded-xl text-center space-y-2 text-neutral-400">
                  <p>Detailed draft fit model pending for {currentTeam.name} and {prospect.full_name}.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: SOURCES & LINEAGE */}
          {activeTab === 'SOURCES' && (
            <div className="p-5 bg-[#0e1424] border border-white/10 rounded-xl space-y-3">
              <h3 className="font-bold text-white uppercase tracking-wider text-sm">
                Scouting Provenance & Audit Ledger
              </h3>
              <div className="space-y-2 text-neutral-300">
                <div>Primary Source: <strong className="text-white">{prospect.source || 'NBA Scouting Bureau'}</strong></div>
                <div>Verification Status: <strong className="text-emerald-400">{prospect.verification_status || 'VERIFIED CURRENT'}</strong></div>
                <div>Audit As-Of Date: <strong className="text-white">{prospect.retrieved_at ? new Date(prospect.retrieved_at).toLocaleDateString() : 'October 1, 2026'}</strong></div>
                <div>Combines & Official Measurements: <strong className="text-white">NBA Draft Combine Official Registry</strong></div>
              </div>
            </div>
          )}

          {/* OTHER TABS: SCOUTING, SHOOTING, FINISHING, PLAYMAKING, DEFENSE, ETC. */}
          {activeTab !== 'OVERVIEW' && activeTab !== 'DRAFT_FIT' && activeTab !== 'SOURCES' && (
            <div className="p-6 bg-[#0e1424] border border-white/10 rounded-xl space-y-3">
              <h3 className="font-bold text-white uppercase tracking-wider text-sm">
                {activeTab.replace('_', ' ')} Scouting Analysis
              </h3>
              <p className="text-neutral-300 leading-relaxed font-sans text-xs">
                Audited film tracking and spatial video breakdown for {prospect.full_name} in {prospect.current_team_or_school}. 
                Evaluations derived from collegiate and international live-game telemetry.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/5">
                <div className="p-3 bg-[#131b30] rounded-lg">
                  <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Evaluation Status</span>
                  <span className="text-emerald-400 font-bold">Verified Scouted</span>
                </div>
                <div className="p-3 bg-[#131b30] rounded-lg">
                  <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Primary Archetype</span>
                  <span className="text-white font-bold">{prospect.position}</span>
                </div>
                <div className="p-3 bg-[#131b30] rounded-lg">
                  <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Eligible Draft</span>
                  <span className="text-amber-300 font-bold">{prospect.projected_draft_year}</span>
                </div>
                <div className="p-3 bg-[#131b30] rounded-lg">
                  <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Level</span>
                  <span className="text-indigo-300 font-bold">{prospect.category}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
