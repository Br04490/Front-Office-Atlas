import React, { useState } from 'react';
import { CapService, TeamService } from '../services';
import { CapEngine, TaxEngine, ApronEngine, HardCapEngine } from '../services/capEngine';
import { CapApronMeter } from '../components/CapApronMeter';
import { MultiYearContractHorizonBars } from '../components/MultiYearContractHorizonBars';
import { LeagueCapWatch } from '../components/LeagueCapWatch';
import { CapDecisionCalendar } from '../components/CapDecisionCalendar';
import { CapReconciliationView } from '../components/CapReconciliationView';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { CBA_RULES_DATABASE, CBA_ACTIVE_VERSION } from '../data/cbaRules';
import { 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  Building2,
  BookOpen,
  Scale
} from 'lucide-react';

interface CapApronViewProps {
  onOpenCba: (prompt?: string) => void;
}

type CapViewTab = 
  | 'TEAM_METER' 
  | 'LEAGUE_WATCH' 
  | 'DECISION_CALENDAR' 
  | 'RECONCILIATION' 
  | 'CBA_RULES';

export const CapApronView: React.FC<CapApronViewProps> = ({ onOpenCba }) => {
  const [activeTab, setActiveTab] = useState<CapViewTab>('TEAM_METER');
  const [selectedSeason, setSelectedSeason] = useState('2026-27');
  const [selectedTeamSlug, setSelectedTeamSlug] = useState('houston-rockets');

  const seasons = CapService.getAvailableSeasons();
  const currentThreshold = CapService.getCapThresholds(selectedSeason);
  const allTeams = TeamService.getAllTeams();
  const currentTeam = TeamService.getTeamBySlug(selectedTeamSlug) || TeamService.getFeaturedPilotTeam();

  // Three separate salary concepts
  const capData = CapEngine.calculateTeamSalary(currentTeam.slug, selectedSeason);
  const taxData = TaxEngine.calculateTaxSalary(currentTeam.slug, selectedSeason);
  const apronData = ApronEngine.calculateApronSalary(currentTeam.slug, selectedSeason);
  const hardCapData = HardCapEngine.getHardCapStatus(currentTeam.slug, selectedSeason);

  const formatMillions = (val: number) => `$${(val / 1000000).toFixed(1)}M`;
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Title & Time-Aware Metadata Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <span>Collective Bargaining Cap & Apron Matrix</span>
            </h1>
            <span className="font-mono text-xs text-neutral-400 uppercase bg-[#131b30] border border-white/10 px-2.5 py-0.5 rounded font-bold">
              2026 – 2032 Multi-Year Horizon
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1 font-mono">
            <span>Official CBA Salary Cap, Tax, First Apron, and Second Apron Governance.</span>
            <span>·</span>
            <span className="text-amber-400 font-bold">CAP DATA AS OF: October 1, 2026</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <EvidenceBadge state="VERIFIED CURRENT DATA" />
          <button
            onClick={() => onOpenCba(`Explain the systemic differences between First Apron and Second Apron rules for ${currentTeam.name}.`)}
            className="px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask CBA About Aprons</span>
          </button>
        </div>
      </div>

      {/* Top Primary Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-1.5 bg-[#0e1424] p-1 rounded-xl border border-white/10 text-xs font-mono">
          {[
            { id: 'TEAM_METER', label: 'Team Cap & Aprons' },
            { id: 'LEAGUE_WATCH', label: 'League 30-Team Watch' },
            { id: 'DECISION_CALENDAR', label: 'Decision Calendar' },
            { id: 'RECONCILIATION', label: 'Reconciliation & Exceptions' },
            { id: 'CBA_RULES', label: 'Governing CBA Rules' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CapViewTab)}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)] border border-indigo-400/40'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Team Selector when in team-specific tabs */}
        {activeTab !== 'LEAGUE_WATCH' && activeTab !== 'CBA_RULES' && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-neutral-500 uppercase text-[10px] font-bold">Focus Franchise:</span>
            <select
              value={selectedTeamSlug}
              onChange={(e) => setSelectedTeamSlug(e.target.value)}
              className="bg-[#0e1424] border border-white/10 text-white rounded-lg px-3 py-1.5 font-bold focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              {allTeams.map((t) => (
                <option key={t.id} value={t.slug} className="bg-[#0e1424] text-white">
                  {t.name} ({t.abbreviation})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: TEAM CAP & APRONS */}
      {activeTab === 'TEAM_METER' && (
        <div className="space-y-6">
          {/* Three Separate Team Salary Concepts Header */}
          <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span 
                  className="w-3.5 h-3.5 rounded-full shadow-xs" 
                  style={{ backgroundColor: currentTeam.colors.primary }}
                />
                <h3 className="font-mono text-sm font-extrabold text-white uppercase tracking-wider">
                  {currentTeam.name} · Distinct CBA Salary Concepts ({selectedSeason})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">
                Rule Basis: Article VII § 1-3
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
              {/* Concept 1: Team Salary */}
              <div className="p-4 bg-[#131b30] border border-white/5 rounded-xl space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                  1. TEAM SALARY (Cap Operations)
                </span>
                <span className="text-xl font-extrabold text-white block">
                  {formatCurrency(capData.team_salary)}
                </span>
                <p className="text-[11px] text-neutral-400 leading-snug pt-1">
                  Active contracts (${formatMillions(capData.active_payroll)}) + Dead money (${formatMillions(capData.dead_money)}) + Incomplete charges. Used to determine available cap room.
                </p>
                <div className="pt-2 text-[10px] text-emerald-400">
                  {currentThreshold.salary_cap > capData.team_salary 
                    ? `Cap Space: +${formatMillions(currentThreshold.salary_cap - capData.team_salary)}`
                    : `Over Cap: ${formatMillions(capData.team_salary - currentThreshold.salary_cap)}`}
                </div>
              </div>

              {/* Concept 2: Tax Salary */}
              <div className="p-4 bg-[#131b30] border border-white/5 rounded-xl space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                  2. TAX SALARY (Tax Liability)
                </span>
                <span className="text-xl font-extrabold text-neutral-200 block">
                  {formatCurrency(taxData.tax_salary)}
                </span>
                <p className="text-[11px] text-neutral-400 leading-snug pt-1">
                  End-of-season earned salaries + dead money. Cap holds and trade exceptions do not count. Governs luxury tax bills.
                </p>
                <div className="pt-2 text-[10px] text-amber-300">
                  {taxData.is_taxpayer 
                    ? `Tax Level Exceeded by ${formatMillions(-taxData.distance_to_tax)} (Est. Tax: ${formatCurrency(taxData.tax_liability)})`
                    : `Tax Room: +${formatMillions(taxData.distance_to_tax)}`}
                </div>
              </div>

              {/* Concept 3: Apron Salary */}
              <div className="p-4 bg-[#131b30] border border-white/5 rounded-xl space-y-1">
                <span className="text-[10px] text-amber-400 uppercase font-bold block">
                  3. APRON SALARY (Roster Restrictions)
                </span>
                <span className="text-xl font-extrabold text-amber-300 block">
                  {formatCurrency(apronData.apron_salary)}
                </span>
                <p className="text-[11px] text-neutral-400 leading-snug pt-1">
                  Team salary + all earned & unearned incentives. Enforces trade matching, aggregation bans, and frozen pick penalties.
                </p>
                <div className="pt-2 text-[10px] text-rose-400 font-bold">
                  {apronData.first_apron_status === 'ABOVE' 
                    ? `First Apron Exceeded by ${formatMillions(-apronData.distance_to_first_apron)}`
                    : `First Apron Room: +${formatMillions(apronData.distance_to_first_apron)}`}
                </div>
              </div>
            </div>

            {/* Threshold Distances Bar Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
              <div className="p-2.5 bg-[#0b0f19] border border-white/5 rounded-lg">
                <span className="text-[10px] text-neutral-500 uppercase block font-bold">Distance to Cap</span>
                <span className={`font-bold ${currentThreshold.salary_cap - capData.team_salary >= 0 ? 'text-emerald-400' : 'text-neutral-300'}`}>
                  {formatCurrency(currentThreshold.salary_cap - capData.team_salary)}
                </span>
              </div>
              <div className="p-2.5 bg-[#0b0f19] border border-white/5 rounded-lg">
                <span className="text-[10px] text-neutral-500 uppercase block font-bold">Distance to Tax</span>
                <span className={`font-bold ${taxData.distance_to_tax >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {formatCurrency(taxData.distance_to_tax)}
                </span>
              </div>
              <div className="p-2.5 bg-[#0b0f19] border border-white/5 rounded-lg">
                <span className="text-[10px] text-neutral-500 uppercase block font-bold">Distance to 1st Apron</span>
                <span className={`font-bold ${apronData.distance_to_first_apron >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(apronData.distance_to_first_apron)}
                </span>
              </div>
              <div className="p-2.5 bg-[#0b0f19] border border-white/5 rounded-lg">
                <span className="text-[10px] text-neutral-500 uppercase block font-bold">Distance to 2nd Apron</span>
                <span className={`font-bold ${apronData.distance_to_second_apron >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(apronData.distance_to_second_apron)}
                </span>
              </div>
            </div>
          </div>

          {/* Horizontal Visual Threshold Meter */}
          <CapApronMeter
            team={currentTeam}
            selectedSeason={selectedSeason}
            onSeasonChange={(s) => setSelectedSeason(s)}
            onOpenCbaWithPrompt={(prompt) => onOpenCba(prompt)}
          />

          {/* Multi-Year Contract Horizon Bars (2026-27 | 2027-28 | 2028-29 | 2029-30) */}
          <MultiYearContractHorizonBars
            team={currentTeam}
            onOpenCba={(prompt) => onOpenCba(prompt)}
          />
        </div>
      )}

      {/* TAB 2: LEAGUE 30-TEAM WATCH */}
      {activeTab === 'LEAGUE_WATCH' && (
        <LeagueCapWatch
          season={selectedSeason}
          onSelectTeam={(slug) => {
            setSelectedTeamSlug(slug);
            setActiveTab('TEAM_METER');
          }}
          onOpenCba={onOpenCba}
        />
      )}

      {/* TAB 3: DECISION CALENDAR */}
      {activeTab === 'DECISION_CALENDAR' && (
        <CapDecisionCalendar
          teamSlug={currentTeam.slug}
          onOpenCba={onOpenCba}
        />
      )}

      {/* TAB 4: RECONCILIATION & EXCEPTIONS */}
      {activeTab === 'RECONCILIATION' && (
        <CapReconciliationView
          teamSlug={currentTeam.slug}
          season={selectedSeason}
          onOpenCba={onOpenCba}
        />
      )}

      {/* TAB 5: GOVERNING CBA RULES */}
      {activeTab === 'CBA_RULES' && (
        <div className="space-y-4">
          <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-3 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <h3 className="font-mono text-sm font-extrabold text-white uppercase tracking-wider">
                    {CBA_ACTIVE_VERSION.agreement_name}
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Ratified collective agreement repository. Every financial and trade validation in Front Office Atlas maps directly to these rules.
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-400">
                <span>Version: {CBA_ACTIVE_VERSION.document_version}</span>
                <span>·</span>
                <span className="text-emerald-400">{CBA_ACTIVE_VERSION.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CBA_RULES_DATABASE.map((rule) => (
                <div
                  key={rule.rule_key}
                  className="p-4 bg-[#131b30] border border-white/5 rounded-xl space-y-2.5 font-mono text-xs hover:border-amber-500/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2">
                    <div>
                      <span className="text-white font-extrabold text-sm block">
                        {rule.title}
                      </span>
                      <span className="text-amber-400 text-[11px] font-bold">
                        {rule.citation_reference} ({rule.article} {rule.section})
                      </span>
                    </div>
                    <span className="text-[9px] bg-neutral-800 text-neutral-300 border border-neutral-700 px-2 py-0.5 rounded font-bold">
                      {rule.topic.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-neutral-300 text-[11px] leading-relaxed">
                    {rule.plain_english_summary}
                  </p>

                  <div className="space-y-1 pt-1 text-[10px] text-neutral-400">
                    <span className="font-bold text-neutral-200 block">Core Operational Restrictions:</span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {rule.restrictions.slice(0, 3).map((r, rIdx) => (
                        <li key={rIdx} className="leading-snug">{r}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                    <span className="text-neutral-500">Source: {rule.source_document} p. {rule.page}</span>
                    <button
                      onClick={() => onOpenCba(`Provide full legal analysis and operational examples of ${rule.title} (${rule.citation_reference}).`)}
                      className="text-amber-400 hover:text-white transition-colors"
                    >
                      Ask CBA →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
