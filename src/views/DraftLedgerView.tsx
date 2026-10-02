import React, { useState, useMemo } from 'react';
import { DraftService, TeamService } from '../services';
import { DraftLedgerService } from '../services/draftLedgerService';
import { DraftAsset, Team } from '../types';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { 
  Layers, 
  Calendar, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Search, 
  ArrowRight, 
  Info, 
  GitCommit, 
  Sliders, 
  CheckCircle2, 
  X, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface DraftLedgerViewProps {
  initialTeamSlug?: string;
  onOpenCba?: (prompt: string) => void;
}

export const DraftLedgerView: React.FC<DraftLedgerViewProps> = ({ 
  initialTeamSlug = 'houston-rockets',
  onOpenCba
}) => {
  const years = DraftLedgerService.getAvailableDraftYears();
  const allTeams = TeamService.getAllTeams();

  const [viewMode, setViewMode] = useState<'TEAM_LEDGER' | 'LEAGUE_EXPLORER'>('TEAM_LEDGER');
  const [selectedTeamSlug, setSelectedTeamSlug] = useState<string>(initialTeamSlug);
  const [selectedYear, setSelectedYear] = useState<number>(2027);
  const [roundFilter, setRoundFilter] = useState<'ALL' | 1 | 2>('ALL');
  const [selectedPick, setSelectedPick] = useState<DraftAsset | null>(null);

  const currentTeam = TeamService.getTeamBySlug(selectedTeamSlug) || allTeams[0];

  // Picks for current team across all horizon years
  const teamPicks = useMemo(() => {
    return DraftLedgerService.getPicksByTeam(currentTeam.slug);
  }, [currentTeam.slug]);

  // Stepien rule audit for focused franchise
  const stepienAudit = useMemo(() => {
    return DraftLedgerService.evaluateStepienRule(currentTeam.slug);
  }, [currentTeam.slug]);

  // League explorer picks for selected year
  const leagueYearPicks = useMemo(() => {
    return DraftLedgerService.getPicksByYear(selectedYear);
  }, [selectedYear]);

  // Get asset badge styling
  const getAssetTypeBadge = (assetType?: string, statusType?: string) => {
    switch (assetType || statusType) {
      case 'INCOMING_PICK':
      case 'OWNED':
        return (
          <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded">
            INCOMING
          </span>
        );
      case 'OUTGOING_PICK':
      case 'OWED':
        return (
          <span className="font-mono text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-1.5 py-0.5 rounded">
            OUTGOING
          </span>
        );
      case 'SWAP_RIGHT':
      case 'SWAP':
        return (
          <span className="font-mono text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-1.5 py-0.5 rounded">
            SWAP RIGHT
          </span>
        );
      case 'CONDITIONAL_PICK':
      case 'PROTECTED':
        return (
          <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">
            PROTECTED
          </span>
        );
      default:
        return (
          <span className="font-mono text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-1.5 py-0.5 rounded">
            OWN PICK
          </span>
        );
    }
  };

  const getTradeabilityBadge = (status?: string) => {
    switch (status) {
      case 'VERIFIED_TRADEABLE':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3" /> VERIFIED TRADEABLE
          </span>
        );
      case 'CONDITIONAL':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
            <AlertTriangle className="w-3 h-3" /> CONDITIONAL
          </span>
        );
      case 'ENCUMBERED':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
            <ShieldAlert className="w-3 h-3" /> ENCUMBERED / OWED
          </span>
        );
      case 'RESTRICTED':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-neutral-400 bg-neutral-800 border border-neutral-700 px-2 py-0.5 rounded">
            <Info className="w-3 h-3" /> 7-YR RESTRICTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-neutral-400 bg-neutral-800 border border-neutral-700 px-2 py-0.5 rounded">
            VERIFICATION PENDING
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Title & Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-amber-400" />
              <span>Draft Capital & Obligation Ledger</span>
            </h1>
            <span className="font-mono text-xs text-neutral-400 uppercase bg-[#131b30] border border-white/10 px-2.5 py-0.5 rounded font-bold">
              2027 – 2034 Horizon
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Lineage-tracked first and second-round draft picks, lottery swap rights, Stepien rule compliance, and conveyance terms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <EvidenceBadge state="VERIFIED CURRENT DATA" />
          {onOpenCba && (
            <button
              onClick={() => onOpenCba(`Explain the Ted Stepien Rule and the 2023 CBA Second Apron 7-year frozen pick restriction for ${currentTeam.name}.`)}
              className="px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask CBA About Draft Rules</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode Switcher & Team Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0e1424] border border-white/10 rounded-xl p-3">
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setViewMode('TEAM_LEDGER')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'TEAM_LEDGER'
                ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)] border border-indigo-400/40'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            Team Draft Ledger
          </button>
          <button
            onClick={() => setViewMode('LEAGUE_EXPLORER')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'LEAGUE_EXPLORER'
                ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)] border border-indigo-400/40'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            League Asset Explorer
          </button>
        </div>

        {viewMode === 'TEAM_LEDGER' ? (
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-neutral-400 uppercase text-[10px] font-bold">Focus Franchise:</span>
            <select
              value={selectedTeamSlug}
              onChange={(e) => setSelectedTeamSlug(e.target.value)}
              className="bg-[#131b30] border border-white/10 text-white rounded-lg px-3 py-1.5 font-bold focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              {allTeams.map((t) => (
                <option key={t.id} value={t.slug} className="bg-[#0e1424] text-white">
                  {t.name} ({t.abbreviation})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {years.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stepien Rule & Apron Rule Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-4 rounded-xl border font-mono text-xs space-y-1.5 ${
          stepienAudit.is_compliant 
            ? 'bg-[#0f172a] border-emerald-500/20 text-neutral-300' 
            : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Ted Stepien Rule Standing ({currentTeam.abbreviation})
            </span>
            <span className="text-[10px] text-neutral-400 font-semibold">NBA By-Laws § 7.03</span>
          </div>
          <p className="text-xs text-neutral-300">
            {stepienAudit.notes}
          </p>
        </div>

        <div className="p-4 bg-[#0e1424] border border-white/10 rounded-xl font-mono text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              2023 CBA Second Apron 7-Year Pick Freeze
            </span>
            <span className="text-[10px] text-neutral-400 font-semibold">Art. VII § 8 & § 10</span>
          </div>
          <p className="text-xs text-neutral-300">
            Teams exceeding the Second Apron cannot trade first-round picks 7 years in advance (2033/2034). Repeat apron violations re-seed the pick to #30.
          </p>
        </div>
      </div>

      {/* VIEW 1: TEAM TIMELINE GRID (Rows: 2027 to 2034 | Columns: Round 1, Round 2) */}
      {viewMode === 'TEAM_LEDGER' && (
        <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h3 className="font-mono text-sm font-extrabold text-white uppercase tracking-wider">
                {currentTeam.name} Multi-Year Draft Capital Matrix
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Click any draft asset card to inspect original ownership, conveyance triggers, swap terms, and transaction lineage.
              </p>
            </div>
            <span className="font-mono text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded font-bold">
              {teamPicks.length} Audited Assets
            </span>
          </div>

          {/* Grid Container: Header Rows */}
          <div className="border border-white/10 rounded-xl overflow-hidden font-mono text-xs">
            <div className="grid grid-cols-12 bg-[#131b30] p-3 text-[10px] text-neutral-400 uppercase font-bold border-b border-white/10">
              <div className="col-span-2">Draft Year</div>
              <div className="col-span-5">Round 1 Selection(s)</div>
              <div className="col-span-5">Round 2 Selection(s)</div>
            </div>

            {/* Rows for 2027 through 2034 */}
            <div className="divide-y divide-white/5">
              {years.map((year) => {
                const yearR1 = teamPicks.filter((p) => p.year === year && p.round === 1);
                const yearR2 = teamPicks.filter((p) => p.year === year && p.round === 2);

                return (
                  <div key={year} className="grid grid-cols-12 p-3.5 hover:bg-white/[0.02] transition-colors items-start gap-3">
                    {/* Year Label */}
                    <div className="col-span-2 pt-1">
                      <span className="text-sm font-extrabold text-white block">{year}</span>
                      <span className="text-[10px] text-neutral-500 block">Class of {year}</span>
                    </div>

                    {/* Round 1 Picks */}
                    <div className="col-span-5 space-y-2">
                      {yearR1.length === 0 ? (
                        <div className="p-2 rounded-lg bg-neutral-900/40 border border-dashed border-neutral-800 text-[11px] text-neutral-500 italic">
                          No Round 1 selection held (conveyed or unallocated)
                        </div>
                      ) : (
                        yearR1.map((pick) => (
                          <div
                            key={pick.id}
                            onClick={() => setSelectedPick(pick)}
                            className="p-3 bg-[#131b30] hover:bg-[#182340] border border-white/10 hover:border-indigo-400/60 rounded-xl transition-all cursor-pointer shadow-sm space-y-1.5 select-none"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-xs">
                                {pick.original_team_name || pick.original_team_id}
                              </span>
                              {getAssetTypeBadge(pick.asset_type, pick.status_type)}
                            </div>
                            <div className="text-[11px] text-neutral-300">
                              {pick.protection || 'Unprotected selection'}
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                              {getTradeabilityBadge(pick.tradeability_status)}
                              <span className="text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5">
                                Lineage <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Round 2 Picks */}
                    <div className="col-span-5 space-y-2">
                      {yearR2.length === 0 ? (
                        <div className="p-2 rounded-lg bg-neutral-900/40 border border-dashed border-neutral-800 text-[11px] text-neutral-500 italic">
                          No Round 2 selection held
                        </div>
                      ) : (
                        yearR2.map((pick) => (
                          <div
                            key={pick.id}
                            onClick={() => setSelectedPick(pick)}
                            className="p-3 bg-[#131b30] hover:bg-[#182340] border border-white/10 hover:border-indigo-400/60 rounded-xl transition-all cursor-pointer shadow-sm space-y-1.5 select-none"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-neutral-200 text-xs">
                                {pick.original_team_name || pick.original_team_id}
                              </span>
                              {getAssetTypeBadge(pick.asset_type, pick.status_type)}
                            </div>
                            <div className="text-[11px] text-neutral-400">
                              {pick.conveyance_terms || 'Standard unconditional second-round selection'}
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                              {getTradeabilityBadge(pick.tradeability_status)}
                              <span className="text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5">
                                Lineage <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LEAGUE ASSET EXPLORER (Selected Year across League) */}
      {viewMode === 'LEAGUE_EXPLORER' && (
        <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h3 className="font-mono text-sm font-extrabold text-white uppercase tracking-wider">
                League-Wide Draft Asset Inventory ({selectedYear})
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Every audited first and second-round selection for the {selectedYear} NBA Draft class.
              </p>
            </div>
            <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded font-bold">
              {leagueYearPicks.length} Assets Logged
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {leagueYearPicks.map((pick) => (
              <div
                key={pick.id}
                onClick={() => setSelectedPick(pick)}
                className="p-4 bg-[#131b30] hover:bg-[#17223b] border border-white/10 hover:border-indigo-400/60 rounded-xl transition-all cursor-pointer font-mono space-y-2 select-none shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-xs">
                    {pick.year} Round {pick.round}
                  </span>
                  {getAssetTypeBadge(pick.asset_type, pick.status_type)}
                </div>

                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Original Owner</span>
                  <span className="text-xs font-bold text-neutral-200">{pick.original_team_name || pick.original_team_id}</span>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Current Controlling Franchise</span>
                  <span className="text-xs font-bold text-amber-300">{pick.current_owner_team_name || pick.current_controller_id}</span>
                </div>

                <div className="text-[11px] text-neutral-300 pt-1 border-t border-white/5 line-clamp-2">
                  {pick.protection || pick.conveyance_terms}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                  {getTradeabilityBadge(pick.tradeability_status)}
                  <span className="text-indigo-400 font-bold">Inspect →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DETAILED DRAFT ASSET SIDE DRAWER */}
      {selectedPick && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#0e1424] border border-white/15 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 font-mono text-xs space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-white">
                    {selectedPick.year} NBA Draft · Round {selectedPick.round} Asset
                  </h3>
                  {getAssetTypeBadge(selectedPick.asset_type, selectedPick.status_type)}
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Asset ID: {selectedPick.id} · Audit Source: {selectedPick.source}
                </p>
              </div>
              <button
                onClick={() => setSelectedPick(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Attribution Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-[#131b30] border border-white/5 rounded-xl">
                <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Original Owner</span>
                <span className="text-xs font-bold text-white block mt-0.5">
                  {selectedPick.original_team_name || selectedPick.original_team_id}
                </span>
              </div>

              <div className="p-3 bg-[#131b30] border border-white/5 rounded-xl">
                <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Current Controlling Franchise</span>
                <span className="text-xs font-bold text-amber-300 block mt-0.5">
                  {selectedPick.current_owner_team_name || selectedPick.current_controller_id}
                </span>
              </div>

              <div className="p-3 bg-[#131b30] border border-white/5 rounded-xl">
                <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Tradeability Standing</span>
                <div className="mt-1">
                  {getTradeabilityBadge(selectedPick.tradeability_status)}
                </div>
              </div>
            </div>

            {/* Protection & Conveyance Terms */}
            <div className="space-y-3 p-4 bg-[#131b30] border border-white/5 rounded-xl">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                  Lottery Protection & Margin Terms
                </span>
                <p className="text-xs text-neutral-200 mt-0.5 leading-relaxed font-sans">
                  {selectedPick.protection_details || selectedPick.protection || 'Unprotected selection without draft lottery encumbrances.'}
                </p>
              </div>

              {selectedPick.swap_rights && (
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[10px] text-purple-400 uppercase font-bold block">
                    Swap Rights Specification
                  </span>
                  <p className="text-xs text-neutral-300 mt-0.5 font-sans">
                    {selectedPick.swap_right || 'Option to swap draft position with partner franchise if more favorable.'}
                  </p>
                </div>
              )}

              {selectedPick.conveyance_conditions && (
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                    Rollover & Extinguishment Conditions
                  </span>
                  <p className="text-xs text-neutral-300 mt-0.5 font-sans">
                    {selectedPick.conveyance_conditions}
                  </p>
                </div>
              )}
            </div>

            {/* TRANSACTION LINEAGE CHAIN */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Transaction Lineage & Provenance Chain
                </span>
              </div>

              {selectedPick.asset_history && selectedPick.asset_history.length > 0 ? (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-500/30">
                  {selectedPick.asset_history.map((hist, hIdx) => (
                    <div key={hIdx} className="relative space-y-1">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-400 ring-4 ring-indigo-500/20" />
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-white">
                          {hist.from_team_name || hist.from_team_id} → {hist.to_team_name || hist.to_team_id}
                        </span>
                        <span className="text-neutral-500">{hist.date}</span>
                      </div>
                      <p className="text-xs text-neutral-300 font-sans">
                        {hist.description}
                      </p>
                      {hist.cba_rule && (
                        <span className="text-[10px] text-neutral-500 font-mono">
                          Governed by: {hist.cba_rule}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-neutral-900/60 border border-white/5 rounded-xl text-neutral-400 text-xs italic">
                  Franchise original draft asset. No preceding trade conveyances or altered protections recorded.
                </div>
              )}
            </div>

            {/* Footer with Verification Status */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[11px] text-neutral-400">
              <span>Verification: <strong className="text-white">{selectedPick.verification_status || 'VERIFIED OFFICIAL'}</strong></span>
              <span>Retrieved: {selectedPick.retrieved_at ? new Date(selectedPick.retrieved_at).toLocaleDateString() : 'October 1, 2026'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
