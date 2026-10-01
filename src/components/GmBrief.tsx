import React, { useState } from 'react';
import { Team } from '../types';
import { EvidenceBadge } from './EvidenceBadge';
import { FreshnessIndicator } from './FreshnessIndicator';
import { 
  Briefcase, 
  TrendingUp, 
  AlertOctagon, 
  Target, 
  CheckSquare, 
  Layers, 
  Lock, 
  Activity, 
  Calendar, 
  GitBranch, 
  ChevronRight,
  ShieldAlert,
  Info
} from 'lucide-react';

interface GmBriefProps {
  team: Team;
}

export const GmBrief: React.FC<GmBriefProps> = ({ team }) => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // 9 Executive Sections mandated by GM protocol
  const sections = [
    {
      id: 'current_state',
      title: 'Current State',
      icon: Layers,
      color: 'text-sky-400',
      summary: '2026-27 Preseason / Training Camp Baseline',
      status: 'INCOMPLETE',
      details: 'Evaluates current roster architecture, age distribution, and depth chart hierarchy once verified camp registration is ingested.',
    },
    {
      id: 'cap_position',
      title: 'Cap Position',
      icon: TrendingUp,
      color: 'text-emerald-400',
      summary: 'Threshold Headroom vs Floor, Tax, and Aprons',
      status: 'INCOMPLETE',
      details: 'Tracks Team Salary, Apron Team Salary, and Tax Team Salary relative to official 2026-27 thresholds ($164.96M Cap, $200.43M Tax, $209.02M 1st Apron, $221.69M 2nd Apron).',
    },
    {
      id: 'key_constraints',
      title: 'Key Constraints',
      icon: Lock,
      color: 'text-amber-400',
      summary: 'Article VII & XI Transactional Moratoriums',
      status: 'INCOMPLETE',
      details: 'Monitors hard-cap triggers, aggregation bans, recently signed trade moratoriums, and poison-pill provisions.',
    },
    {
      id: 'roster_gaps',
      title: 'Biggest Roster Gaps',
      icon: Target,
      color: 'text-purple-400',
      summary: 'Positional Depth & Skill Profile Deficits',
      status: 'INCOMPLETE',
      details: 'Positional and archetypal gap analysis pending final opening-night roster lock.',
    },
    {
      id: 'injury_risk',
      title: 'Injury / Availability Risk',
      icon: Activity,
      color: 'text-rose-400',
      summary: 'Historical Workload & Availability Ledger',
      status: 'INCOMPLETE',
      details: 'Strict policy: No subjective medical predictions or clinical diagnoses. Only officially filed availability filings are recorded.',
    },
    {
      id: 'draft_position',
      title: 'Draft Position',
      icon: Calendar,
      color: 'text-indigo-400',
      summary: '2027–2034 Future Asset Control & Obligations',
      status: 'INCOMPLETE',
      details: 'Ted Stepien rule compliance and conditional conveyance tracking across upcoming 7 draft cycles.',
    },
    {
      id: 'gleague_pipeline',
      title: 'G League Pipeline',
      icon: GitBranch,
      color: 'text-teal-400',
      summary: `${team.affiliateName} Affiliate Alignment`,
      status: 'INCOMPLETE',
      details: 'Two-Way game limits (50 games max), assignment logistics, and central league cap wall isolation.',
    },
    {
      id: 'best_opportunities',
      title: 'Best Opportunities',
      icon: TrendingUp,
      color: 'text-cyan-400',
      summary: 'Strategic Asymmetric Asset Plays',
      status: 'INCOMPLETE',
      details: 'Cap-space utilization, trade exception absorption, or tax avoidance maneuvers.',
    },
  ];

  return (
    <div className="bg-[#12161f] border border-white/10 rounded-xl p-6 space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                GM BRIEF · {team.name.toUpperCase()}
              </h3>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
                Executive Strategy Brief
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Comprehensive decision-intelligence overview for general managers, cap strategists, and basketball operations.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
          <FreshnessIndicator effectiveDate="October 1, 2026" rosterPhase={team.roster_phase} showDetails={false} />
          <EvidenceBadge state="ANALYSIS PENDING VERIFIED DATA" size="sm" />
        </div>
      </div>

      {/* Grid of the 8 Analytical Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {sections.map((sec) => {
          const IconComp = sec.icon;
          return (
            <div
              key={sec.id}
              onClick={() => setSelectedSection(sec.id === selectedSection ? null : sec.id)}
              className={`p-4 bg-[#0d1016] border rounded-lg transition-all cursor-pointer text-left flex flex-col justify-between ${
                selectedSection === sec.id
                  ? 'border-amber-400/50 bg-[#141822]'
                  : 'border-white/5 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-200 uppercase">
                    <IconComp className={`w-4 h-4 ${sec.color}`} />
                    <span>{sec.title}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${selectedSection === sec.id ? 'rotate-90 text-amber-300' : ''}`} />
                </div>
                <div className="text-[11px] text-neutral-400 line-clamp-1">
                  {sec.summary}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                <span className="font-mono text-[10px] text-neutral-500 uppercase">
                  ANALYSIS PENDING VERIFIED DATA
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Section Drawer / Pop-down if section is selected */}
      {selectedSection && (
        <div className="p-4 bg-[#0b0e14] border border-amber-500/30 rounded-lg text-xs space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-amber-300 uppercase">
              {sections.find(s => s.id === selectedSection)?.title} · Strategic Protocol
            </span>
            <button
              onClick={() => setSelectedSection(null)}
              className="text-neutral-500 hover:text-white font-mono text-[10px]"
            >
              Dismiss
            </button>
          </div>
          <p className="text-neutral-300 leading-relaxed">
            {sections.find(s => s.id === selectedSection)?.details}
          </p>
          <div className="p-2.5 bg-neutral-900 border border-white/5 rounded text-[11px] font-mono text-neutral-400 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>Automated GM recommendation engine standby: awaiting verified payroll & transaction feeds.</span>
          </div>
        </div>
      )}

      {/* 9th Section: NEXT 3 ACTIONS (Prominent full-width row) */}
      <div className="p-4 bg-[#0d1016] border border-white/5 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-200 uppercase">
            <CheckSquare className="w-4 h-4 text-amber-400" />
            <span>Next 3 Tactical Actions</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-500 uppercase">
            Preseason Task Queue
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-neutral-900/50 border border-dashed border-white/10 rounded text-xs text-neutral-400 flex flex-col justify-center text-center min-h-[64px]">
            <span className="font-mono font-semibold text-neutral-300 block mb-0.5">ACTION 1</span>
            <span>AUDIT TRAINING CAMP CONTRACT CONVERSIONS</span>
          </div>
          <div className="p-3 bg-neutral-900/50 border border-dashed border-white/10 rounded text-xs text-neutral-400 flex flex-col justify-center text-center min-h-[64px]">
            <span className="font-mono font-semibold text-neutral-300 block mb-0.5">ACTION 2</span>
            <span>VERIFY FIRST APRON BUFFER & EXCEPTIONS ELIGIBILITY</span>
          </div>
          <div className="p-3 bg-neutral-900/50 border border-dashed border-white/10 rounded text-xs text-neutral-400 flex flex-col justify-center text-center min-h-[64px]">
            <span className="font-mono font-semibold text-neutral-300 block mb-0.5">ACTION 3</span>
            <span>CONFIRM G LEAGUE TWO-WAY ALLOCATIONS ({team.affiliateName})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
