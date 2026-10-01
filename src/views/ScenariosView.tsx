import React, { useState, useEffect } from 'react';
import { TeamService, CapService, ScenarioService } from '../services';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { TradeScenario } from '../types';
import { 
  Sliders, 
  Sparkles, 
  TrendingUp, 
  Layers, 
  DollarSign, 
  ShieldCheck, 
  HelpCircle,
  Plus,
  Save,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface ScenariosViewProps {
  onOpenCba: (prompt?: string) => void;
}

type ScenarioType = 
  | 'TRADE'
  | 'SIGNING'
  | 'WAIVER'
  | 'EXTENSION'
  | 'OPTION_EXERCISED'
  | 'OPTION_DECLINED'
  | 'GLEAGUE_CONVERSION'
  | 'TWO_WAY_CONVERSION'
  | 'DRAFT_TRADE'
  | 'SALARY_DUMP'
  | 'CAP_SPACE_STRATEGY'
  | 'APRON_AVOIDANCE';

export const ScenariosView: React.FC<ScenariosViewProps> = ({ onOpenCba }) => {
  const allTeams = TeamService.getAllTeams();
  const [selectedTeamSlug, setSelectedTeamSlug] = useState('houston-rockets');
  const [targetSeason, setTargetSeason] = useState('2026-27');
  const [scenarioType, setScenarioType] = useState<ScenarioType>('APRON_AVOIDANCE');
  const [scenarioName, setScenarioName] = useState('Houston 2026-27 Apron Buffer Modeling');
  const [assumptions, setAssumptions] = useState('Maintain active team salary below $209.02M First Apron to preserve Non-Taxpayer Mid-Level Exception.');
  const [savedScenarios, setSavedScenarios] = useState<TradeScenario[]>([]);

  useEffect(() => {
    setSavedScenarios(ScenarioService.getSavedScenarios());
  }, []);

  const team = TeamService.getTeamBySlug(selectedTeamSlug) || allTeams[0];
  const threshold = CapService.getCapThresholds(targetSeason);
  const seasons = CapService.getAvailableSeasons();

  const scenarioTypes: { id: ScenarioType; label: string }[] = [
    { id: 'APRON_AVOIDANCE', label: 'Apron Avoidance' },
    { id: 'TRADE', label: 'Multi-Team Trade' },
    { id: 'SIGNING', label: 'Free Agent Signing' },
    { id: 'EXTENSION', label: 'Veteran Extension' },
    { id: 'WAIVER', label: 'Stretch / Waiver' },
    { id: 'OPTION_EXERCISED', label: 'Option Exercised' },
    { id: 'OPTION_DECLINED', label: 'Option Declined' },
    { id: 'GLEAGUE_CONVERSION', label: 'G League Conversion' },
    { id: 'TWO_WAY_CONVERSION', label: 'Two-Way Conversion' },
    { id: 'DRAFT_TRADE', label: 'Draft Pick Trade' },
    { id: 'SALARY_DUMP', label: 'Salary Dump' },
    { id: 'CAP_SPACE_STRATEGY', label: 'Cap Space Strategy' },
  ];

  const handleSaveCurrentScenario = () => {
    const newScenario: TradeScenario = {
      scenario_id: `scen_${Date.now()}`,
      name: scenarioName || `${team.name} ${scenarioType} Scenario`,
      created_at: new Date().toISOString(),
      teams: [team.name],
      assets_by_team: { [team.name]: { players: [], draft_picks: [] } },
      cba_screening_results: { 'Article VII Compliance': 'INSUFFICIENT DATA' },
      salary_deltas: { [team.name]: { incoming: 0, outgoing: 0, net_delta: 0 } },
      apron_impacts: { [team.name]: 'First Apron Headroom Preserved' },
      cba_version: '2023-2030 CBA',
      warnings: ['Requires verified player contracts to calculate precise dollar impact.'],
      data_status: 'SCENARIO',
    };

    ScenarioService.saveScenario(newScenario);
    setSavedScenarios(ScenarioService.getSavedScenarios());
  };

  const handleDeleteScenario = (id: string) => {
    ScenarioService.deleteScenario(id);
    setSavedScenarios(ScenarioService.getSavedScenarios());
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Sliders className="w-6 h-6 text-amber-400" />
              <span>Front Office Scenario Center</span>
            </h1>
            <span className="font-mono text-xs text-neutral-400 uppercase bg-neutral-800 border border-neutral-700 px-2 py-0.5 rounded">
              Strategic Modeling Sandbox
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Build, test, and save multi-year roster movements, cap space models, and apron avoidance paths.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <EvidenceBadge state="SCENARIO" />
          <button
            onClick={() => onOpenCba(`Analyze ${scenarioType} scenario for ${team.name} under ${targetSeason} CBA rules.`)}
            className="px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consult CBA Agent</span>
          </button>
        </div>
      </div>

      {/* Scenario Builder Form */}
      <div className="bg-[#12161f] border border-white/10 rounded-xl p-5 space-y-5 text-left">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
            Scenario Parameters & Hypotheses
          </h2>
          <span className="text-[11px] font-mono text-neutral-500">
            Local Front-Office Storage Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Target Team */}
          <div>
            <label className="text-[10px] font-mono uppercase text-neutral-500 block mb-1.5">
              Franchise
            </label>
            <select
              value={selectedTeamSlug}
              onChange={(e) => setSelectedTeamSlug(e.target.value)}
              className="w-full bg-[#161a24] border border-white/10 text-white font-semibold rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
            >
              {allTeams.map((t) => (
                <option key={t.id} value={t.slug}>
                  {t.name} ({t.abbreviation})
                </option>
              ))}
            </select>
          </div>

          {/* Target Season */}
          <div>
            <label className="text-[10px] font-mono uppercase text-neutral-500 block mb-1.5">
              Projected Season
            </label>
            <select
              value={targetSeason}
              onChange={(e) => setTargetSeason(e.target.value)}
              className="w-full bg-[#161a24] border border-white/10 text-white font-semibold rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
            >
              {seasons.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Scenario Type */}
          <div>
            <label className="text-[10px] font-mono uppercase text-neutral-500 block mb-1.5">
              Scenario Category
            </label>
            <select
              value={scenarioType}
              onChange={(e) => setScenarioType(e.target.value as ScenarioType)}
              className="w-full bg-[#161a24] border border-white/10 text-white font-semibold rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
            >
              {scenarioTypes.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Save Action Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleSaveCurrentScenario}
              className="w-full py-2 px-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold font-mono text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Scenario</span>
            </button>
          </div>
        </div>

        {/* Name & Assumptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
              Scenario Title
            </label>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="w-full bg-[#161a24] border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
              Key Strategic Assumptions
            </label>
            <input
              type="text"
              value={assumptions}
              onChange={(e) => setAssumptions(e.target.value)}
              className="w-full bg-[#161a24] border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Saved Scenarios Registry */}
      <div className="bg-[#12161f] border border-white/10 rounded-xl p-5 space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
            Saved Scenarios ({savedScenarios.length})
          </h3>
          <span className="text-[10px] font-mono text-neutral-500">
            Executive Sandbox Models
          </span>
        </div>

        {savedScenarios.length > 0 ? (
          <div className="space-y-2.5">
            {savedScenarios.map((scen) => (
              <div
                key={scen.scenario_id}
                className="p-3.5 bg-[#0d1016] border border-white/5 rounded-lg flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {scen.name}
                    </span>
                    <EvidenceBadge state={scen.data_status} size="sm" />
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1 font-mono">
                    Created: {new Date(scen.created_at).toLocaleDateString()} · {scen.cba_version}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenCba(`Inspect CBA compliance for saved scenario: "${scen.name}".`)}
                    className="px-2.5 py-1 text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded hover:bg-amber-500/20 transition-colors"
                  >
                    Screen CBA →
                  </button>
                  <button
                    onClick={() => handleDeleteScenario(scen.scenario_id)}
                    className="p-1.5 text-neutral-500 hover:text-rose-400 rounded transition-colors"
                    title="Delete scenario"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 border border-dashed border-white/10 rounded-lg text-center text-xs text-neutral-500">
            No custom scenarios saved yet. Use the parameters above to model and save cap strategies.
          </div>
        )}
      </div>
    </div>
  );
};
