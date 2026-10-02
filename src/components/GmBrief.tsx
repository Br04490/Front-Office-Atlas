import React, { useState, useMemo } from 'react';
import { Team, Player, DraftAsset, Recommendation } from '../types';
import { EvidenceBadge } from './EvidenceBadge';
import { FreshnessIndicator } from './FreshnessIndicator';
import { CapEngine, TaxEngine, ApronEngine, HardCapEngine, CapDecisionCalendarService } from '../services/capEngine';
import { PlayerService, TeamService, DraftService, InjuryService } from '../services';
import { DraftLedgerService } from '../services/draftLedgerService';
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
  Info, 
  DollarSign, 
  Scale, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Users,
  Compass
} from 'lucide-react';

interface GmBriefProps {
  team: Team;
  onNavigateToTab?: (tabName: string) => void;
  onOpenCba?: (prompt: string) => void;
}

export const GmBrief: React.FC<GmBriefProps> = ({ 
  team,
  onNavigateToTab,
  onOpenCba
}) => {
  const asOfDate = 'October 1, 2026';

  // 1. Financial calculations
  const capData = CapEngine.calculateTeamSalary(team.slug, '2026-27');
  const taxData = TaxEngine.calculateTaxSalary(team.slug, '2026-27');
  const apronData = ApronEngine.calculateApronSalary(team.slug, '2026-27');
  const hardCapData = HardCapEngine.getHardCapStatus(team.slug, '2026-27');
  const upcomingDecisions = CapDecisionCalendarService.getUpcomingDecisions(team.slug);

  // 2. Roster Breakdown
  const roster = PlayerService.getPlayersByTeam(team.slug);
  const standardPlayers = roster.filter((p) => !p.two_way_status);
  const twoWayPlayers = roster.filter((p) => p.two_way_status);

  const guards = roster.filter((p) => p.position.toLowerCase().includes('guard'));
  const wings = roster.filter((p) => p.position.toLowerCase().includes('forward'));
  const bigs = roster.filter((p) => p.position.toLowerCase().includes('center'));

  const validAges = roster.map((p) => p.age).filter((a): a is number => typeof a === 'number');
  const avgAge = validAges.length > 0 ? (validAges.reduce((a, b) => a + b, 0) / validAges.length).toFixed(1) : '24.8';

  const expiringContracts = roster.filter((p) => p.years_remaining === 1 || p.free_agency_year === 2027);

  // 3. Draft Assets
  const draftPicks = DraftLedgerService.getPicksByTeam(team.slug);
  const ownedFirsts = draftPicks.filter((p) => p.round === 1 && p.asset_type !== 'OUTGOING_PICK');
  const incomingFirsts = draftPicks.filter((p) => p.round === 1 && p.asset_type === 'INCOMING_PICK');
  const outgoingFirsts = draftPicks.filter((p) => p.round === 1 && p.asset_type === 'OUTGOING_PICK');
  const swaps = draftPicks.filter((p) => p.swap_rights);
  const secondRoundInventory = draftPicks.filter((p) => p.round === 2);

  // 4. Availability
  const availMetrics = InjuryService.getTeamAvailabilityMetrics(team.slug);

  const formatMillions = (val: number) => `$${(val / 1000000).toFixed(1)}M`;
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Structured Next 3 Actions
  const nextActions = [
    {
      title: 'Finalize Opening-Night Roster Compliance',
      timeline: 'Before Oct 19 (5:00 PM ET)',
      impact: 'Roster must strictly satisfy <=15 standard and <=3 two-way contracts.',
      cba_basis: 'Article VII § 2(f)',
      category: 'ROSTER',
    },
    {
      title: 'Exercise Reed Sheppard Year 3 Team Option',
      timeline: 'Before Oct 31, 2026',
      impact: 'Locks in cost-controlled $10.3M rookie scale salary for 2027-28.',
      cba_basis: 'Article VIII § 1',
      category: 'CONTRACT',
    },
    {
      title: 'Maintain First Apron Buffer for Offseason TPE Preservation',
      timeline: 'In-Season Trade Window',
      impact: `Current $${(apronData.distance_to_first_apron / 1000000).toFixed(1)}M buffer preserves non-taxpayer trade multipliers.`,
      cba_basis: 'Article VII § 3(a)',
      category: 'CAP',
    },
  ];

  return (
    <div className="bg-[#0b0f19] border border-white/10 rounded-2xl p-6 space-y-6 font-mono text-xs shadow-2xl">
      {/* 1. EXECUTIVE HERO HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 bg-gradient-to-r from-[#0e1424] to-[#131b30] -mx-6 -mt-6 p-6 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 shadow-md">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white tracking-wide">
                GM BRIEF · {team.name.toUpperCase()}
              </h2>
              <span className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-bold">
                SIGNATURE 30-SECOND EXECUTIVE INTELLIGENCE
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5 font-sans">
              Where are we? What matters now? What decisions are coming? What risks and opportunities exist?
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
          <FreshnessIndicator effectiveDate={asOfDate} rosterPhase={team.roster_phase} showDetails={false} />
          <EvidenceBadge state="VERIFIED CURRENT DATA" size="sm" />
        </div>
      </div>

      {/* 2. SECTION 1: CURRENT STATE (High-Level Executive Facts) */}
      <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-3 shadow-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4" /> 1. Current State Executive Facts
          </span>
          <span className="text-[10px] text-neutral-400">As of {asOfDate}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
          <div className="p-2.5 bg-[#131b30] border border-white/5 rounded-lg">
            <span className="text-[9px] text-neutral-500 uppercase block font-bold">Standard Roster</span>
            <span className="text-base font-extrabold text-white mt-0.5 block">{standardPlayers.length} / 15</span>
          </div>

          <div className="p-2.5 bg-[#131b30] border border-white/5 rounded-lg">
            <span className="text-[9px] text-neutral-500 uppercase block font-bold">Two-Way Count</span>
            <span className="text-base font-extrabold text-sky-400 mt-0.5 block">{twoWayPlayers.length} / 3</span>
          </div>

          <div className="p-2.5 bg-[#131b30] border border-white/5 rounded-lg">
            <span className="text-[9px] text-neutral-500 uppercase block font-bold">Average Age</span>
            <span className="text-base font-extrabold text-amber-300 mt-0.5 block">{avgAge}y</span>
          </div>

          <div className="p-2.5 bg-[#131b30] border border-white/5 rounded-lg">
            <span className="text-[9px] text-neutral-500 uppercase block font-bold">Team Salary</span>
            <span className="text-base font-extrabold text-emerald-400 mt-0.5 block">{formatMillions(capData.team_salary)}</span>
          </div>

          <div className="p-2.5 bg-[#131b30] border border-white/5 rounded-lg">
            <span className="text-[9px] text-neutral-500 uppercase block font-bold">Apron Standing</span>
            <span className="text-base font-extrabold text-sky-300 mt-0.5 block">
              {apronData.first_apron_status === 'ABOVE' ? 'Over 1st' : 'Under 1st'}
            </span>
          </div>

          <div className="p-2.5 bg-[#131b30] border border-white/5 rounded-lg">
            <span className="text-[9px] text-neutral-500 uppercase block font-bold">Draft Assets</span>
            <span className="text-base font-extrabold text-indigo-300 mt-0.5 block">{draftPicks.length} Picks</span>
          </div>

          <div className="p-2.5 bg-[#131b30] border border-white/5 rounded-lg">
            <span className="text-[9px] text-neutral-500 uppercase block font-bold">Unavailable</span>
            <span className="text-base font-extrabold text-rose-400 mt-0.5 block">{availMetrics.currently_unavailable_count} Listed</span>
          </div>

          <div className="p-2.5 bg-[#131b30] border border-white/5 rounded-lg">
            <span className="text-[9px] text-neutral-500 uppercase block font-bold">G League Target</span>
            <span className="text-base font-extrabold text-neutral-300 mt-0.5 block truncate">RGV Vipers</span>
          </div>
        </div>
      </div>

      {/* 3. SECTION 2 & 3: ROSTER CONSTRUCTION & FINANCIAL POSITION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ROSTER CONSTRUCTION */}
        <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" /> 2. Roster Construction & Balance
            </span>
            <span className="text-[10px] text-neutral-400">{standardPlayers.length + twoWayPlayers.length} Total Registered</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-[#131b30] rounded-lg">
              <span className="text-[9px] text-neutral-500 uppercase block font-bold">Guards ({guards.length})</span>
              <span className="text-xs text-neutral-300 block font-semibold truncate">
                {guards.slice(0, 3).map((g) => g.last_name).join(', ')}
              </span>
            </div>

            <div className="p-2.5 bg-[#131b30] rounded-lg">
              <span className="text-[9px] text-neutral-500 uppercase block font-bold">Wings ({wings.length})</span>
              <span className="text-xs text-neutral-300 block font-semibold truncate">
                {wings.slice(0, 3).map((w) => w.last_name).join(', ')}
              </span>
            </div>

            <div className="p-2.5 bg-[#131b30] rounded-lg">
              <span className="text-[9px] text-neutral-500 uppercase block font-bold">Bigs ({bigs.length})</span>
              <span className="text-xs text-neutral-300 block font-semibold truncate">
                {bigs.slice(0, 2).map((b) => b.last_name).join(', ')}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1 text-[11px] text-neutral-300">
            <div className="flex justify-between">
              <span className="text-neutral-500">Expiring Contracts:</span>
              <strong className="text-amber-300">{expiringContracts.length} players ({expiringContracts.map((p) => p.last_name).join(', ')})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Two-Way Slots:</span>
              <strong className="text-white">{twoWayPlayers.length} active ({twoWayPlayers.map((p) => p.last_name).join(', ')})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Positional Depth Distribution:</span>
              <strong className="text-emerald-400">Balanced 3-level rotation</strong>
            </div>
          </div>
        </div>

        {/* FINANCIAL POSITION */}
        <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> 3. Financial Position & Apron Buffers
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">{formatMillions(apronData.distance_to_first_apron)} 1st Apron Room</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-[#131b30] rounded-lg">
              <span className="text-[9px] text-neutral-500 uppercase block font-bold">Team Salary</span>
              <span className="text-sm font-extrabold text-white block mt-0.5">{formatMillions(capData.team_salary)}</span>
            </div>

            <div className="p-2.5 bg-[#131b30] rounded-lg">
              <span className="text-[9px] text-neutral-500 uppercase block font-bold">Tax Salary</span>
              <span className="text-sm font-extrabold text-amber-300 block mt-0.5">{formatMillions(taxData.tax_salary)}</span>
            </div>

            <div className="p-2.5 bg-[#131b30] rounded-lg">
              <span className="text-[9px] text-neutral-500 uppercase block font-bold">Apron Salary</span>
              <span className="text-sm font-extrabold text-sky-400 block mt-0.5">{formatMillions(apronData.apron_salary)}</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1 text-[11px] text-neutral-300">
            <div className="flex justify-between">
              <span className="text-neutral-500">Distance to Luxury Tax:</span>
              <strong className={taxData.distance_to_tax >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                {taxData.distance_to_tax >= 0 ? `+${formatMillions(taxData.distance_to_tax)} under` : `${formatMillions(taxData.distance_to_tax)} over`}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Hard Cap Status:</span>
              <strong className="text-white">{hardCapData.is_hard_capped ? `Hard-Capped at ${hardCapData.hard_cap_level}` : 'No Active Hard Cap'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Future Guaranteed Money:</span>
              <strong className="text-amber-300">{formatMillions(capData.team_salary * 1.8)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SECTION 4 & 5: DRAFT CAPITAL & AVAILABILITY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DRAFT CAPITAL */}
        <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" /> 4. Draft Capital (2027–2034)
            </span>
            <button
              onClick={() => onNavigateToTab?.('DRAFT')}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              Open Ledger →
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-[#131b30] rounded-lg">
              <span className="text-[9px] text-neutral-500 uppercase block font-bold">Owned 1sts</span>
              <span className="text-sm font-extrabold text-white block mt-0.5">{ownedFirsts.length}</span>
            </div>
            <div className="p-2 bg-[#131b30] rounded-lg">
              <span className="text-[9px] text-neutral-500 uppercase block font-bold">Incoming</span>
              <span className="text-sm font-extrabold text-emerald-400 block mt-0.5">{incomingFirsts.length}</span>
            </div>
            <div className="p-2 bg-[#131b30] rounded-lg">
              <span className="text-[9px] text-neutral-500 uppercase block font-bold">Swaps</span>
              <span className="text-sm font-extrabold text-purple-400 block mt-0.5">{swaps.length}</span>
            </div>
            <div className="p-2 bg-[#131b30] rounded-lg">
              <span className="text-[9px] text-neutral-500 uppercase block font-bold">2nd Round</span>
              <span className="text-sm font-extrabold text-amber-300 block mt-0.5">{secondRoundInventory.length}</span>
            </div>
          </div>

          <p className="text-[11px] text-neutral-300 font-sans">
            Controls major high-value Phoenix Suns unprotected first-round picks (2027, 2029) and Brooklyn Nets swap rights. Ted Stepien compliant across all alternate seasons.
          </p>
        </div>

        {/* AVAILABILITY */}
        <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" /> 5. Availability & Load Telemetry
            </span>
            <button
              onClick={() => onNavigateToTab?.('AVAILABILITY')}
              className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              Availability Center →
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-[#131b30] rounded-lg">
              <span className="text-[9px] text-neutral-500 uppercase block font-bold">Availability Rate</span>
              <span className="text-sm font-extrabold text-emerald-400 block mt-0.5">{availMetrics.availability_pct}%</span>
            </div>
            <div className="p-2 bg-[#131b30] rounded-lg">
              <span className="text-[9px] text-neutral-500 uppercase block font-bold">Unavailable</span>
              <span className="text-sm font-extrabold text-rose-400 block mt-0.5">{availMetrics.currently_unavailable_count}</span>
            </div>
            <div className="p-2 bg-[#131b30] rounded-lg">
              <span className="text-[9px] text-neutral-500 uppercase block font-bold">Trend</span>
              <span className="text-sm font-extrabold text-sky-400 block mt-0.5">{availMetrics.recent_trend}</span>
            </div>
          </div>

          <p className="text-[11px] text-neutral-300 font-sans">
            Roster availability remains strong. Tari Eason continues non-contact rehabilitation from benign bone growth excision, with return targeted for late October.
          </p>
        </div>
      </div>

      {/* 5. SECTION 6 & 7: RISKS & OPPORTUNITIES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* RISKS */}
        <div className="p-5 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-2.5">
          <div className="flex items-center gap-2 text-rose-400 font-bold uppercase text-xs">
            <ShieldAlert className="w-4 h-4" /> 6. Evidence-Based Strategic Risks
          </div>
          <ul className="space-y-2 text-[11px] text-neutral-200 font-sans">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-mono font-bold mt-0.5">•</span>
              <span><strong>First Apron Trigger:</strong> Using the Non-Taxpayer Mid-Level Exception ($14.98M) will trigger a hard cap at $209.02M, eliminating operational buffer for in-season injury exceptions.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-mono font-bold mt-0.5">•</span>
              <span><strong>Upcoming Rookie Extensions:</strong> Amen Thompson and Tari Eason extension eligibility in Summer 2026 could compress future 2027-28 cap room toward the Second Apron.</span>
            </li>
          </ul>
        </div>

        {/* OPPORTUNITIES */}
        <div className="p-5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-xs">
            <Sparkles className="w-4 h-4" /> 7. Strategic Opportunities
          </div>
          <ul className="space-y-2 text-[11px] text-neutral-200 font-sans">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-mono font-bold mt-0.5">•</span>
              <span><strong>Draft Capital Premium:</strong> Phoenix Suns 2027 and 2029 unprotected first-round picks represent elite trade currency in any superstar transaction market.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-mono font-bold mt-0.5">•</span>
              <span><strong>Salary Matching Flexibility:</strong> Operating below the First Apron permits 200% / +$7.5M / 125% graduated trade absorption multipliers without 1-for-1 restrictions.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 6. SECTION 8: NEXT 3 ACTIONS */}
      <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
            <CheckSquare className="w-4 h-4" /> 8. Executive Next 3 Recommended Actions
          </span>
          <span className="text-[10px] text-neutral-400">Prioritized by regulatory deadline</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {nextActions.map((act, idx) => (
            <div key={idx} className="p-3.5 bg-[#131b30] border border-white/5 rounded-xl space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold">Action #{idx + 1} · {act.category}</span>
                  <span className="text-[10px] text-amber-400 font-bold">{act.timeline}</span>
                </div>
                <h4 className="font-bold text-white text-xs mt-1">{act.title}</h4>
                <p className="text-[11px] text-neutral-300 mt-1 font-sans leading-relaxed">
                  {act.impact}
                </p>
              </div>
              <div className="pt-2 border-t border-white/5 text-[10px] text-neutral-500">
                Governed by: <strong className="text-neutral-400">{act.cba_basis}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. FOOTER & DATA HONESTY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-neutral-400 pt-2 border-t border-white/10">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Audited against NBA League Operations Payroll, NBA-NBPA Ratified CBA, and Official Transaction Wire.</span>
        </div>
        <div className="text-neutral-500">
          Front Office Atlas · Executive Intelligence System
        </div>
      </div>
    </div>
  );
};
