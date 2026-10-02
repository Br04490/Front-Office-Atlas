import React, { useState, useMemo } from 'react';
import { TeamService, PlayerService } from '../services';
import { CapEngine, TaxEngine, ApronEngine, HardCapEngine } from '../services/capEngine';
import { TradeValidationEngine } from '../services/tradeValidationEngine';
import { 
  Team, 
  Player, 
  DraftAsset, 
  TradeRuleLedgerItem, 
  TradeValidationReport,
  SavedTradeScenario 
} from '../types';
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
  Search,
  BookmarkPlus,
  Scale,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Sliders,
  History
} from 'lucide-react';

interface TradeLabViewProps {
  onOpenCba: (prompt?: string) => void;
}

export const TradeLabView: React.FC<TradeLabViewProps> = ({ onOpenCba }) => {
  const allTeams = TeamService.getAllTeams();
  const [team1Slug, setTeam1Slug] = useState('houston-rockets');
  const [team2Slug, setTeam2Slug] = useState('oklahoma-city-thunder');
  const [team3Slug, setTeam3Slug] = useState<string | null>(null);
  const [activeSeason, setActiveSeason] = useState('2026-27');

  // Selected outgoing players per team
  const [team1SelectedPlayerIds, setTeam1SelectedPlayerIds] = useState<string[]>([]);
  const [team2SelectedPlayerIds, setTeam2SelectedPlayerIds] = useState<string[]>([]);
  const [team3SelectedPlayerIds, setTeam3SelectedPlayerIds] = useState<string[]>([]);

  // Search inside roster pickers
  const [searchT1, setSearchT1] = useState('');
  const [searchT2, setSearchT2] = useState('');
  const [searchT3, setSearchT3] = useState('');

  // Cash sent
  const [team1Cash, setTeam1Cash] = useState<number>(0);
  const [team2Cash, setTeam2Cash] = useState<number>(0);

  // Saved Scenarios
  const [savedScenarios, setSavedScenarios] = useState<SavedTradeScenario[]>(() => {
    try {
      const stored = localStorage.getItem('foa_trade_scenarios');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [scenarioNameInput, setScenarioNameInput] = useState('');
  const [isComparingScenarios, setIsComparingScenarios] = useState(false);
  const [selectedScenarioForCompare, setSelectedScenarioForCompare] = useState<SavedTradeScenario | null>(null);

  // Active teams
  const team1 = TeamService.getTeamBySlug(team1Slug) || allTeams[0];
  const team2 = TeamService.getTeamBySlug(team2Slug) || allTeams[1];
  const team3 = team3Slug ? TeamService.getTeamBySlug(team3Slug) : null;

  // Rosters from verified player pipeline
  const team1Roster = useMemo(() => PlayerService.getPlayersByTeam(team1.slug), [team1.slug]);
  const team2Roster = useMemo(() => PlayerService.getPlayersByTeam(team2.slug), [team2.slug]);
  const team3Roster = useMemo(() => (team3 ? PlayerService.getPlayersByTeam(team3.slug) : []), [team3?.slug]);

  // Outgoing Player records
  const team1Outgoing = useMemo(
    () => team1Roster.filter((p) => team1SelectedPlayerIds.includes(p.player_id)),
    [team1Roster, team1SelectedPlayerIds]
  );
  const team2Outgoing = useMemo(
    () => team2Roster.filter((p) => team2SelectedPlayerIds.includes(p.player_id)),
    [team2Roster, team2SelectedPlayerIds]
  );
  const team3Outgoing = useMemo(
    () => team3Roster.filter((p) => team3SelectedPlayerIds.includes(p.player_id)),
    [team3Roster, team3SelectedPlayerIds]
  );

  // Format currency helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };
  const formatMillions = (val: number) => `$${(val / 1000000).toFixed(1)}M`;

  // Deterministic trade validation execution
  const parties = useMemo(() => {
    const list = [
      {
        team_slug: team1.slug,
        outgoing_players: team1Outgoing,
        cash_sent: team1Cash,
      },
      {
        team_slug: team2.slug,
        outgoing_players: team2Outgoing,
        cash_sent: team2Cash,
      },
    ];
    if (team3) {
      list.push({
        team_slug: team3.slug,
        outgoing_players: team3Outgoing,
        cash_sent: 0,
      });
    }
    return list;
  }, [team1.slug, team2.slug, team3?.slug, team1Outgoing, team2Outgoing, team3Outgoing, team1Cash, team2Cash]);

  const validationReport: TradeValidationReport = useMemo(() => {
    return TradeValidationEngine.validateTrade(parties, activeSeason);
  }, [parties, activeSeason]);

  // Save Trade Scenario handler
  const handleSaveScenario = () => {
    if (!scenarioNameInput.trim()) return;
    const newScenario: SavedTradeScenario = {
      scenario_id: `scen_${Date.now()}`,
      name: scenarioNameInput.trim(),
      created_at: new Date().toISOString(),
      last_calculated_at: new Date().toISOString(),
      teams: parties.map((p) => p.team_slug),
      assets_by_team: {
        [team1.slug]: { players: team1SelectedPlayerIds, draft_picks: [] },
        [team2.slug]: { players: team2SelectedPlayerIds, draft_picks: [] },
        ...(team3 ? { [team3.slug]: { players: team3SelectedPlayerIds, draft_picks: [] } } : {}),
      },
      team_summaries: validationReport.team_summaries,
      rule_ledger: validationReport.rule_ledger,
      cba_legal_status: validationReport.legal_status,
      notes: `Trade between ${team1.name} and ${team2.name}${team3 ? ` and ${team3.name}` : ''}. Status: ${validationReport.legal_status}`,
      source_snapshot_id: 'snap_2026_10_01_training_camp',
    };

    const updated = [newScenario, ...savedScenarios];
    setSavedScenarios(updated);
    try {
      localStorage.setItem('foa_trade_scenarios', JSON.stringify(updated));
    } catch {}
    setScenarioNameInput('');
  };

  const getStatusBadge = (status: TradeRuleLedgerItem['status']) => {
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

  // Render Compact Player Card
  const renderCompactPlayerCard = (
    player: Player,
    isSelected: boolean,
    onToggle: () => void
  ) => {
    return (
      <div
        key={player.player_id}
        onClick={onToggle}
        className={`p-2.5 rounded-lg border transition-all cursor-pointer text-left select-none relative group ${
          isSelected
            ? 'bg-[#151c32] border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.35)] ring-1 ring-indigo-400'
            : 'bg-[#0b0f1a] border-white/10 hover:border-white/20 hover:bg-[#101626]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {/* Headshot */}
          <div className="relative w-10 h-10 rounded-md bg-[#070a12] border border-white/10 shrink-0 overflow-hidden flex items-center justify-center">
            {player.headshot_url ? (
              <img
                src={player.headshot_url}
                alt={player.full_name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <span className="font-mono text-[10px] font-bold text-neutral-400">
                {player.first_name?.[0]}{player.last_name?.[0]}
              </span>
            )}
            <span className="absolute bottom-0 right-0 font-mono text-[8px] font-bold bg-neutral-900/90 text-amber-300 px-0.5 rounded-tl">
              #{player.jersey_number || '—'}
            </span>
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-[11px] truncate group-hover:text-amber-200">
                {player.full_name}
              </span>
              <span className="text-[11px] font-extrabold text-amber-300">
                {formatMillions(player.current_salary || 0)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-neutral-400 mt-0.5">
              <span>{player.position}</span>
              <span>·</span>
              <span>{player.years_remaining ? `${player.years_remaining}y rem` : '1y'}</span>
              <span>·</span>
              <span className="text-purple-300 truncate">{player.option_type || 'Standard'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Team Workbench Column
  const renderTeamColumn = (
    team: Team,
    roleTitle: string,
    onSelectSlug: (slug: string) => void,
    roster: Player[],
    selectedPlayerIds: string[],
    setSelectedPlayerIds: React.Dispatch<React.SetStateAction<string[]>>,
    outgoingPlayers: Player[],
    incomingPlayers: Player[],
    searchQuery: string,
    setSearchQuery: (q: string) => void,
    cashVal: number,
    setCashVal: (c: number) => void
  ) => {
    const summary = validationReport.team_summaries[team.slug];
    const filteredRoster = roster.filter((p) => 
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.position.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
        {/* Top Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-full shadow-xs"
                style={{ backgroundColor: team.colors.primary }}
              />
              <div>
                <span className="font-mono text-xs font-bold text-neutral-200 uppercase tracking-wide block">
                  {roleTitle}
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {team.name} ({team.abbreviation})
                </span>
              </div>
            </div>
            <select
              value={team.slug}
              onChange={(e) => onSelectSlug(e.target.value)}
              className="bg-[#141b30] border border-white/10 text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-400 cursor-pointer font-mono"
            >
              {allTeams.map((t) => (
                <option key={t.id} value={t.slug} className="bg-[#0e1424] text-white">
                  {t.name} ({t.abbreviation})
                </option>
              ))}
            </select>
          </div>

          {/* Current Salary Strip (Team, Tax, Apron, Roster) */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 bg-[#131b30] border border-white/5 rounded-lg">
                <span className="text-[9px] text-neutral-500 uppercase block">Team Salary</span>
                <span className="font-bold text-white text-[11px]">{formatMillions(summary.before.team_salary)}</span>
              </div>
              <div className="p-2 bg-[#131b30] border border-white/5 rounded-lg">
                <span className="text-[9px] text-neutral-500 uppercase block">Tax Salary</span>
                <span className="font-bold text-neutral-300 text-[11px]">{formatMillions(summary.before.tax_salary)}</span>
              </div>
              <div className="p-2 bg-[#131b30] border border-white/5 rounded-lg">
                <span className="text-[9px] text-amber-500 uppercase block">Apron Salary</span>
                <span className="font-extrabold text-amber-300 text-[11px]">{formatMillions(summary.before.apron_salary)}</span>
              </div>
              <div className="p-2 bg-[#131b30] border border-white/5 rounded-lg">
                <span className="text-[9px] text-neutral-500 uppercase block">Roster</span>
                <span className="font-bold text-neutral-200 text-[11px]">{summary.before.roster_count} / 15</span>
              </div>
            </div>
          )}

          {/* Outgoing Assets Box */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-rose-300 uppercase text-[11px]">
                Outgoing Assets ({outgoingPlayers.length})
              </span>
              <span className="font-extrabold text-white">
                Salary Out: {formatMillions(outgoingPlayers.reduce((acc, p) => acc + (p.current_salary || 0), 0))}
              </span>
            </div>

            <div className="min-h-[80px] bg-[#070a12] border border-dashed border-white/10 rounded-lg p-2 space-y-1.5">
              {outgoingPlayers.length === 0 ? (
                <p className="text-[11px] text-neutral-500 font-mono text-center py-4">
                  Select players from the roster list below to include in outgoing trade package.
                </p>
              ) : (
                outgoingPlayers.map((p) => (
                  <div key={p.player_id} className="flex items-center justify-between bg-[#141b30] px-2.5 py-1.5 rounded text-xs font-mono">
                    <span className="text-white font-bold">{p.full_name} ({p.position})</span>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-300 font-extrabold">{formatMillions(p.current_salary || 0)}</span>
                      <button
                        onClick={() => setSelectedPlayerIds((prev) => prev.filter((id) => id !== p.player_id))}
                        className="text-neutral-500 hover:text-rose-400"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Incoming Assets Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-emerald-300 uppercase text-[11px]">
                Incoming Assets ({incomingPlayers.length})
              </span>
              <span className="font-extrabold text-white">
                Salary In: {formatMillions(incomingPlayers.reduce((acc, p) => acc + (p.current_salary || 0), 0))}
              </span>
            </div>

            <div className="min-h-[60px] bg-[#070a12] border border-white/5 rounded-lg p-2 space-y-1">
              {incomingPlayers.length === 0 ? (
                <p className="text-[11px] text-neutral-500 font-mono text-center py-2">
                  No incoming assets designated yet from trade partner.
                </p>
              ) : (
                incomingPlayers.map((p) => (
                  <div key={p.player_id} className="flex items-center justify-between bg-[#0e1628] px-2.5 py-1 rounded text-xs font-mono">
                    <span className="text-neutral-200 font-bold">{p.full_name} ({p.position})</span>
                    <span className="text-emerald-400 font-extrabold">{formatMillions(p.current_salary || 0)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Post-Trade Standing Card */}
          {summary && (
            <div className="p-3 bg-[#131b30] border border-white/10 rounded-lg space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/5 pb-1">
                <span className="font-bold text-neutral-300 uppercase text-[10px]">Post-Trade Financial Projection</span>
                <span className={`font-extrabold ${summary.change.salary_delta <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  Delta: {summary.change.salary_delta > 0 ? `+${formatMillions(summary.change.salary_delta)}` : formatMillions(summary.change.salary_delta)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div>Post Apron Salary: <strong className="text-amber-300">{formatMillions(summary.after.apron_salary)}</strong></div>
                <div>Post Roster Count: <strong className="text-white">{summary.after.roster_count} Players</strong></div>
                <div>1st Apron Headroom: <strong className={summary.after.distance_to_first_apron >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{formatMillions(summary.after.distance_to_first_apron)}</strong></div>
                <div>2nd Apron Headroom: <strong className={summary.after.distance_to_second_apron >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{formatMillions(summary.after.distance_to_second_apron)}</strong></div>
              </div>
            </div>
          )}

          {/* Roster Picker Search & Grid */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
              <input
                type="text"
                placeholder={`Search ${team.name} roster (${roster.length})...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#131b30] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-400 font-mono"
              />
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 no-scrollbar">
              {filteredRoster.map((player) => {
                const isSelected = selectedPlayerIds.includes(player.player_id);
                return renderCompactPlayerCard(player, isSelected, () => {
                  if (isSelected) {
                    setSelectedPlayerIds((prev) => prev.filter((id) => id !== player.player_id));
                  } else {
                    setSelectedPlayerIds((prev) => [...prev, player.player_id]);
                  }
                });
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Title & Engine Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <ArrowLeftRight className="w-6 h-6 text-amber-400" />
              <span>Executive Trade Machine & Scenario Lab</span>
            </h1>
            <span className="font-mono text-xs text-neutral-400 uppercase bg-[#141b30] border border-white/10 px-2.5 py-0.5 rounded font-bold">
              Multi-Team CBA Engine
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1 font-mono">
            <span>Simulate complex multi-team trades with live before/after salary calculations, apron delta impact, and exact CBA rule citations.</span>
            <span>·</span>
            <span className="text-amber-400 font-bold">AS OF: October 1, 2026</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (team3Slug) setTeam3Slug(null);
              else setTeam3Slug(allTeams[2].slug);
            }}
            className="px-3.5 py-2 rounded-lg bg-[#141b30] hover:bg-[#1a2340] border border-white/10 text-xs font-mono text-neutral-300 transition-colors cursor-pointer"
          >
            {team3Slug ? 'Remove 3rd Team' : '+ Add 3rd Team'}
          </button>

          <button
            onClick={() => onOpenCba(`Perform a deep CBA legality screening on trade between ${team1.name} and ${team2.name}.`)}
            className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-mono text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-400/20"
          >
            <Sparkles className="w-3.5 h-3.5 fill-neutral-950" />
            <span>Launch Ask CBA Audit</span>
          </button>
        </div>
      </div>

      {/* Trade Status Alert Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono shadow-lg ${
        validationReport.legal_status === 'SUCCESS_CONFIRMED'
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : validationReport.legal_status === 'FAILED_PROHIBITED'
          ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          : 'bg-[#131b30] border-white/10 text-neutral-300'
      }`}>
        <div className="flex items-center gap-3">
          {validationReport.legal_status === 'SUCCESS_CONFIRMED' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : validationReport.legal_status === 'FAILED_PROHIBITED' ? (
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <div>
            <div className="font-extrabold text-sm uppercase tracking-wide">
              {validationReport.legal_status === 'SUCCESS_CONFIRMED'
                ? 'TRADE PERMITTED UNDER 2023 CBA RULES'
                : validationReport.legal_status === 'FAILED_PROHIBITED'
                ? 'TRADE REJECTED — CBA RESTRICTIONS VIOLATED'
                : 'TRANSACTION PENDING ASSET SELECTION'}
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">
              {validationReport.primary_reason}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Save Scenario UI */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Scenario name..."
              value={scenarioNameInput}
              onChange={(e) => setScenarioNameInput(e.target.value)}
              className="bg-[#0b0f1a] border border-white/10 rounded px-2.5 py-1 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-indigo-400"
            />
            <button
              onClick={handleSaveScenario}
              disabled={!scenarioNameInput.trim()}
              className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Team Columns (Supports 2 or 3 teams) */}
      <div className={`grid grid-cols-1 ${team3Slug ? 'lg:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
        {renderTeamColumn(
          team1,
          'Team A (Primary Club)',
          setTeam1Slug,
          team1Roster,
          team1SelectedPlayerIds,
          setTeam1SelectedPlayerIds,
          team1Outgoing,
          team2Outgoing,
          searchT1,
          setSearchT1,
          team1Cash,
          setTeam1Cash
        )}
        {renderTeamColumn(
          team2,
          'Team B (Trade Partner)',
          setTeam2Slug,
          team2Roster,
          team2SelectedPlayerIds,
          setTeam2SelectedPlayerIds,
          team2Outgoing,
          team1Outgoing,
          searchT2,
          setSearchT2,
          team2Cash,
          setTeam2Cash
        )}
        {team3 && renderTeamColumn(
          team3,
          'Team C (Facilitating Club)',
          setTeam3Slug,
          team3Roster,
          team3SelectedPlayerIds,
          setTeam3SelectedPlayerIds,
          team3Outgoing,
          team1Outgoing,
          searchT3,
          setSearchT3,
          0,
          () => {}
        )}
      </div>

      {/* BEFORE / AFTER COMPARATIVE LEDGER */}
      <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <h3 className="font-mono text-sm font-extrabold text-white uppercase tracking-wider">
              Financial Impact: Before vs. After Transaction Matrix
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Audits changes in Team Salary, Luxury Tax Liability, First & Second Apron Headroom, and Roster Headcount.
            </p>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">
            CBA Article VII § 1-3
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-white/5 font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#131b30] text-neutral-400 border-b border-white/10 text-[10px] uppercase">
                <th className="p-3">Team</th>
                <th className="p-3">State</th>
                <th className="p-3">Team Salary</th>
                <th className="p-3">Tax Salary</th>
                <th className="p-3">Apron Salary</th>
                <th className="p-3">1st Apron Room</th>
                <th className="p-3">2nd Apron Room</th>
                <th className="p-3">Roster</th>
                <th className="p-3">Hard Cap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-[#0a0e1a]">
              {parties.map((party) => {
                const s = validationReport.team_summaries[party.team_slug];
                if (!s) return null;
                return (
                  <React.Fragment key={party.team_slug}>
                    {/* Before Row */}
                    <tr className="text-neutral-400">
                      <td className="p-3 font-bold text-white row-span-3 align-top pt-4">
                        {s.team_name}
                      </td>
                      <td className="p-3 font-bold text-neutral-500 uppercase text-[10px]">Before</td>
                      <td className="p-3">{formatMillions(s.before.team_salary)}</td>
                      <td className="p-3">{formatMillions(s.before.tax_salary)}</td>
                      <td className="p-3 text-amber-400 font-bold">{formatMillions(s.before.apron_salary)}</td>
                      <td className="p-3">{formatMillions(s.before.distance_to_first_apron)}</td>
                      <td className="p-3">{formatMillions(s.before.distance_to_second_apron)}</td>
                      <td className="p-3">{s.before.roster_count}</td>
                      <td className="p-3">{s.before.hard_cap_status}</td>
                    </tr>
                    {/* After Row */}
                    <tr className="text-white bg-white/[0.02]">
                      <td className="p-3 font-bold text-indigo-400 uppercase text-[10px]">After</td>
                      <td className="p-3 font-bold">{formatMillions(s.after.team_salary)}</td>
                      <td className="p-3 font-bold">{formatMillions(s.after.tax_salary)}</td>
                      <td className="p-3 font-extrabold text-amber-300">{formatMillions(s.after.apron_salary)}</td>
                      <td className={`p-3 font-bold ${s.after.distance_to_first_apron >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatMillions(s.after.distance_to_first_apron)}
                      </td>
                      <td className={`p-3 font-bold ${s.after.distance_to_second_apron >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatMillions(s.after.distance_to_second_apron)}
                      </td>
                      <td className="p-3 font-bold">{s.after.roster_count}</td>
                      <td className="p-3 font-bold text-rose-300">{s.after.hard_cap_status}</td>
                    </tr>
                    {/* Change Row */}
                    <tr className="border-b border-white/10 text-[11px] bg-indigo-950/20">
                      <td className="p-3 font-bold text-amber-300 uppercase text-[10px]">Change</td>
                      <td className="p-3 font-extrabold text-amber-300">
                        {s.change.salary_delta >= 0 ? `+${formatMillions(s.change.salary_delta)}` : formatMillions(s.change.salary_delta)}
                      </td>
                      <td className="p-3 font-bold text-neutral-300">
                        {s.change.salary_delta >= 0 ? `+${formatMillions(s.change.salary_delta)}` : formatMillions(s.change.salary_delta)}
                      </td>
                      <td className="p-3 font-bold text-amber-400">
                        {s.change.salary_delta >= 0 ? `+${formatMillions(s.change.salary_delta)}` : formatMillions(s.change.salary_delta)}
                      </td>
                      <td className="p-3 text-neutral-400">
                        {s.change.first_apron_delta >= 0 ? `+${formatMillions(s.change.first_apron_delta)}` : formatMillions(s.change.first_apron_delta)}
                      </td>
                      <td className="p-3 text-neutral-400">
                        {s.change.second_apron_delta >= 0 ? `+${formatMillions(s.change.second_apron_delta)}` : formatMillions(s.change.second_apron_delta)}
                      </td>
                      <td className="p-3 text-neutral-300">
                        {s.change.roster_delta >= 0 ? `+${s.change.roster_delta}` : s.change.roster_delta}
                      </td>
                      <td className="p-3 text-[10px] text-neutral-400">
                        {s.change.new_hard_cap_triggered ? '⚠️ Hard Cap Incurred' : 'Unchanged'}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETERMINISTIC CBA RULE-BY-RULE LEDGER */}
      <div className="bg-[#0e1424] border border-white/10 rounded-xl p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                CBA Deterministic Rule Ledger ({validationReport.rule_ledger.length} Compliance Audits)
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Every rule test is calculated separately with exact mathematical equations, governing restrictions, and CBA citations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <EvidenceBadge state="VERIFIED CURRENT DATA" size="sm" />
          </div>
        </div>

        {/* Rule Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {validationReport.rule_ledger.map((rule) => (
            <div
              key={rule.rule_key}
              className="p-4 bg-[#131b30] border border-white/5 rounded-xl space-y-3 font-mono text-xs hover:border-white/20 transition-all shadow-md"
            >
              <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2">
                <div>
                  <span className="text-white font-extrabold text-sm block">
                    {rule.title}
                  </span>
                  <span className="text-neutral-400 text-[10px]">
                    Topic: {rule.topic.toUpperCase()}
                  </span>
                </div>
                <div>{getStatusBadge(rule.status)}</div>
              </div>

              {/* Calculation Equation */}
              <div className="p-2.5 bg-[#0b0f19] border border-white/5 rounded-lg space-y-1">
                <span className="text-[9px] uppercase text-neutral-500 font-bold block">Calculation / Equation:</span>
                <p className="text-neutral-200 text-[11px] font-semibold leading-relaxed">
                  {rule.calculation}
                </p>
              </div>

              {/* Plain-English Explanation */}
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                {rule.explanation}
              </p>

              {/* Citation Footer */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-neutral-400">
                <span className="text-amber-300 font-bold">
                  {rule.citation.article} {rule.citation.section} {rule.citation.subsection || ''}
                </span>
                <button
                  onClick={() => onOpenCba(`Explain the legal nuances of ${rule.title} under ${rule.citation.article} ${rule.citation.section}.`)}
                  className="text-amber-400 hover:text-white transition-colors"
                >
                  Ask CBA →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SAVED SCENARIOS & COMPARISON */}
      {savedScenarios.length > 0 && (
        <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl font-mono text-xs">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-white uppercase text-sm">
                Saved Trade Scenarios ({savedScenarios.length})
              </h3>
            </div>
            <span className="text-[10px] text-neutral-400">
              Preserved with immutable cap snapshot IDs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {savedScenarios.map((scen) => (
              <div
                key={scen.scenario_id}
                className="p-3 bg-[#131b30] border border-white/5 rounded-lg space-y-2 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white truncate">{scen.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    scen.cba_legal_status === 'SUCCESS_CONFIRMED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {scen.cba_legal_status === 'SUCCESS_CONFIRMED' ? 'PERMITTED' : 'VIOLATION'}
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400">
                  Teams: {scen.teams.join(', ')} · Saved {scen.created_at.split('T')[0]}
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                  <button
                    onClick={() => {
                      setSelectedScenarioForCompare(scen);
                      setIsComparingScenarios(true);
                    }}
                    className="text-indigo-400 hover:text-white"
                  >
                    Compare Baseline vs This →
                  </button>
                  <button
                    onClick={() => {
                      const updated = savedScenarios.filter((s) => s.scenario_id !== scen.scenario_id);
                      setSavedScenarios(updated);
                      try { localStorage.setItem('foa_trade_scenarios', JSON.stringify(updated)); } catch {}
                    }}
                    className="text-neutral-500 hover:text-rose-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scenario Compare Modal */}
      {isComparingScenarios && selectedScenarioForCompare && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0e1424] border border-white/10 rounded-2xl max-w-4xl w-full p-6 space-y-5 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Scenario Comparison: Baseline vs. {selectedScenarioForCompare.name}
                </h3>
                <span className="text-[11px] text-neutral-400">
                  Side-by-side financial differential audit
                </span>
              </div>
              <button
                onClick={() => setIsComparingScenarios(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#131b30] border border-white/5 rounded-xl space-y-2">
                <span className="text-neutral-400 uppercase font-bold text-[10px] block">Current Active State</span>
                <div className="space-y-1 text-neutral-200">
                  <div>Team A: {team1.name} (Payroll: {formatMillions(validationReport.team_summaries[team1.slug]?.before.team_salary || 0)})</div>
                  <div>Team B: {team2.name} (Payroll: {formatMillions(validationReport.team_summaries[team2.slug]?.before.team_salary || 0)})</div>
                  <div>Legal Status: {validationReport.legal_status}</div>
                </div>
              </div>

              <div className="p-4 bg-[#131b30] border border-indigo-500/40 rounded-xl space-y-2">
                <span className="text-indigo-400 uppercase font-bold text-[10px] block">Saved Scenario: {selectedScenarioForCompare.name}</span>
                <div className="space-y-1 text-neutral-200">
                  <div>Teams: {selectedScenarioForCompare.teams.join(', ')}</div>
                  <div>Saved Date: {selectedScenarioForCompare.created_at}</div>
                  <div>Historical Legal Status: {selectedScenarioForCompare.cba_legal_status}</div>
                  <div className="text-neutral-400 text-[11px] pt-1">{selectedScenarioForCompare.notes}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
