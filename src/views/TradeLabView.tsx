import React, { useState } from 'react';
import { TeamService, CapService } from '../services';
import { Team, CbaRuleStatus } from '../types';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { 
  ArrowLeftRight, 
  ShieldAlert, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Sparkles, 
  Layers, 
  FileText,
  SlidersHorizontal,
  Scale,
  Users
} from 'lucide-react';

interface TradeLabViewProps {
  onOpenCba: (prompt?: string) => void;
}

export const TradeLabView: React.FC<TradeLabViewProps> = ({ onOpenCba }) => {
  const allTeams = TeamService.getAllTeams();
  const [team1Slug, setTeam1Slug] = useState('houston-rockets');
  const [team2Slug, setTeam2Slug] = useState('boston-celtics');
  const [team3Slug, setTeam3Slug] = useState<string | null>(null);
  const [activeSeason, setActiveSeason] = useState('2026-27');

  const team1 = TeamService.getTeamBySlug(team1Slug) || allTeams[0];
  const team2 = TeamService.getTeamBySlug(team2Slug) || allTeams[1];
  const team3 = team3Slug ? TeamService.getTeamBySlug(team3Slug) : null;

  const threshold = CapService.getCapThresholds(activeSeason);

  // 10 CBA Screening tests per prompt
  const cbaScreeningTests = [
    {
      id: 'salary_matching',
      name: 'Salary Matching Multipliers',
      description: 'Article VII § 3: Validates allowable incoming percentage bands (100% / 125% / 200%) based on taxpayer status.',
      status: 'INSUFFICIENT DATA' as CbaRuleStatus,
    },
    {
      id: 'salary_aggregation',
      name: 'Salary Aggregation Ban',
      description: 'Article VII § 3(c): Prohibits combining multiple outgoing contracts if team salary is above Second Apron ($221.69M).',
      status: 'INSUFFICIENT DATA' as CbaRuleStatus,
    },
    {
      id: 'first_apron_ceiling',
      name: 'First-Apron Restrictions',
      description: 'Article VII § 2(e): Restricts incoming trade salary to 100% of outgoing salary for clubs above First Apron ($209.02M).',
      status: 'INSUFFICIENT DATA' as CbaRuleStatus,
    },
    {
      id: 'second_apron_ceiling',
      name: 'Second-Apron Restrictions',
      description: 'Article VII § 2(e) & § 8: Forbids cash considerations, previous TPE utilization, and outgoing salary aggregation.',
      status: 'INSUFFICIENT DATA' as CbaRuleStatus,
    },
    {
      id: 'hard_cap_consequence',
      name: 'Hard-Cap Consequence',
      description: 'Article VII § 9(b): Verifies whether acquiring club is hard-capped at First or Second Apron from prior exception usage.',
      status: 'INSUFFICIENT DATA' as CbaRuleStatus,
    },
    {
      id: 'sign_and_trade',
      name: 'Sign-and-Trade Restrictions',
      description: 'Article VII § 9: Mandates 3-year minimum term, full first-year guarantee, and triggers First Apron hard-cap ceiling.',
      status: 'INSUFFICIENT DATA' as CbaRuleStatus,
    },
    {
      id: 'exception_usage',
      name: 'Trade Exception (TPE) Usage',
      description: 'Article VII § 4: Verifies proper absorption into existing non-simultaneous trade exception slots.',
      status: 'INSUFFICIENT DATA' as CbaRuleStatus,
    },
    {
      id: 'roster_requirements',
      name: 'Roster Count Requirements',
      description: 'Article VII: Verifies team does not exceed 15 standard NBA active contracts after completing transaction.',
      status: 'INSUFFICIENT DATA' as CbaRuleStatus,
    },
    {
      id: 'draft_pick_restrictions',
      name: 'Draft Pick Restrictions (Stepien Rule)',
      description: 'NBA By-laws: Ted Stepien rule requires teams to maintain at least one first-round selection in consecutive future drafts.',
      status: 'INSUFFICIENT DATA' as CbaRuleStatus,
    },
    {
      id: 'future_pick_freeze',
      name: 'Future-Pick Restrictions (7-Year Freeze)',
      description: 'Article VII § 10: Freezes 7-years-out first-round draft pick from trade conveyance if ending season above Second Apron.',
      status: 'INSUFFICIENT DATA' as CbaRuleStatus,
    },
  ];

  const getStatusBadge = (status: CbaRuleStatus) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3" /> PASS
          </span>
        );
      case 'FAIL':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded">
            <ShieldAlert className="w-3 h-3" /> FAIL
          </span>
        );
      case 'CONDITIONAL':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
            <AlertTriangle className="w-3 h-3" /> CONDITIONAL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-neutral-400 bg-neutral-800 border border-neutral-700 px-2 py-0.5 rounded">
            <HelpCircle className="w-3 h-3" /> INSUFFICIENT DATA
          </span>
        );
    }
  };

  const renderTeamWorkbench = (team: Team, title: string, onSelectSlug: (slug: string) => void) => {
    return (
      <div className="bg-[#12161f] border border-white/10 rounded-xl p-5 space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: team.colors.primary }}
            />
            <span className="font-mono text-xs font-bold text-neutral-300 uppercase">
              {title}
            </span>
          </div>
          <select
            value={team.slug}
            onChange={(e) => onSelectSlug(e.target.value)}
            className="bg-[#161a24] border border-white/10 text-white text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-400"
          >
            {allTeams.map((t) => (
              <option key={t.id} value={t.slug}>
                {t.name} ({t.abbreviation})
              </option>
            ))}
          </select>
        </div>

        {/* Financial Metrics Strip: Separate Outgoing/Incoming, Apron Salary, Tax Salary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 bg-[#0d1016] border border-white/5 rounded-lg">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">Outgoing Salary</span>
            <span className="font-mono text-neutral-200 font-bold">$0</span>
          </div>
          <div className="p-2.5 bg-[#0d1016] border border-white/5 rounded-lg">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">Incoming Salary</span>
            <span className="font-mono text-neutral-200 font-bold">$0</span>
          </div>
          <div className="p-2.5 bg-[#0d1016] border border-white/5 rounded-lg">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">Apron Salary Delta</span>
            <span className="font-mono text-amber-300 font-bold">$0 (Pending)</span>
          </div>
          <div className="p-2.5 bg-[#0d1016] border border-white/5 rounded-lg">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">Roster Spots</span>
            <span className="font-mono text-neutral-200 font-bold">15 / 15</span>
          </div>
        </div>

        {/* Trade Asset Dropzone */}
        <div className="p-6 bg-[#0a0d12] border border-dashed border-white/15 rounded-lg text-center space-y-2">
          <div className="text-xs font-mono font-bold text-neutral-400 uppercase">
            {team.name} Trade Package
          </div>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            Select standard contracts or future draft picks to include in outgoing transaction.
          </p>
          <div className="pt-2">
            <span className="text-[11px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded">
              ROSTER ASSETS STANDBY · PENDING VERIFIED INGEST
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Title & Engine Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <ArrowLeftRight className="w-6 h-6 text-amber-400" />
              <span>Executive Trade Machine & Scenario Lab</span>
            </h1>
            <span className="font-mono text-xs text-neutral-400 uppercase bg-neutral-800 border border-neutral-700 px-2 py-0.5 rounded">
              Multi-Team CBA Engine
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Simulate complex multi-team trades, contract absorption, apron delta impact, and Ted Stepien pick rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (team3Slug) setTeam3Slug(null);
              else setTeam3Slug(allTeams[2].slug);
            }}
            className="px-3 py-1.5 rounded-lg bg-[#141822] hover:bg-[#1a202c] border border-white/10 text-xs font-mono text-neutral-300 transition-colors"
          >
            {team3Slug ? 'Remove Team 3' : '+ Add 3rd Team'}
          </button>
          <EvidenceBadge state="CALCULATED" />
          <button
            onClick={() => onOpenCba(`Screen proposed trade scenario between ${team1.name} and ${team2.name}${team3 ? ` and ${team3.name}` : ''}.`)}
            className="px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-400/10"
          >
            <Sparkles className="w-3.5 h-3.5 fill-neutral-950" />
            <span>Launch Trade CBA Screening</span>
          </button>
        </div>
      </div>

      {/* Team Selection Workbenches (Supports 2 or 3 teams) */}
      <div className={`grid grid-cols-1 ${team3Slug ? 'lg:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
        {renderTeamWorkbench(team1, 'Team A (Primary Club)', setTeam1Slug)}
        {renderTeamWorkbench(team2, 'Team B (Trade Partner)', setTeam2Slug)}
        {team3 && renderTeamWorkbench(team3, 'Team C (Facilitating Club)', setTeam3Slug)}
      </div>

      {/* CBA Screening Engine Area */}
      <div className="bg-[#12161f] border border-white/10 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                CBA Automated Screening Engine (10 Compliance Tests)
              </h2>
              <span className="text-[10px] font-mono uppercase bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded border border-neutral-700">
                Article VII & XI
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Click any rule test to launch ATLAS CBA with full transaction context pre-loaded.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <EvidenceBadge state="INCOMPLETE" size="sm" />
          </div>
        </div>

        {/* Screening Result Mandatory Legal Notice */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg flex items-center justify-between text-xs font-mono text-amber-300">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold uppercase">
              CBA SCREENING RESULT — NOT OFFICIAL NBA LEAGUE APPROVAL
            </span>
          </div>
          <span className="text-neutral-400 hidden sm:inline">
            ENGINE NOT CONNECTED - AWAITING VERIFIED PAYROLL DATA
          </span>
        </div>

        {/* 10 CBA Tests Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {cbaScreeningTests.map((test) => (
            <button
              key={test.id}
              type="button"
              onClick={() =>
                onOpenCba(
                  `Evaluate ${test.name} under the CBA for proposed trade involving ${team1.name} and ${team2.name}.`
                )
              }
              className="p-3.5 bg-[#0d1016] hover:bg-[#141822] border border-white/5 hover:border-amber-500/30 rounded-lg text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                    {test.name}
                  </span>
                </div>
                <div>{getStatusBadge(test.status)}</div>
                <p className="text-[11px] text-neutral-400 leading-relaxed line-clamp-3 mt-2">
                  {test.description}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                <span className="text-amber-400 group-hover:underline">
                  Ask CBA →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
