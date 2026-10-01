import React, { useState } from 'react';
import { CapService, TeamService } from '../services';
import { CapApronMeter } from '../components/CapApronMeter';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { 
  ShieldCheck, 
  HelpCircle, 
  Sparkles, 
  Layers, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle 
} from 'lucide-react';

interface CapApronViewProps {
  onOpenCba: (prompt?: string) => void;
}

export const CapApronView: React.FC<CapApronViewProps> = ({ onOpenCba }) => {
  const [selectedSeason, setSelectedSeason] = useState('2026-27');
  const seasons = CapService.getAvailableSeasons();
  const currentThreshold = CapService.getCapThresholds(selectedSeason);
  const houston = TeamService.getFeaturedPilotTeam();

  const formatMillions = (val: number) => `$${(val / 1000000).toFixed(1)}M`;

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <span>Collective Bargaining Cap & Apron Matrix</span>
            </h1>
            <span className="font-mono text-xs text-neutral-400 uppercase bg-neutral-800 border border-neutral-700 px-2 py-0.5 rounded">
              2026 – 2032 Multi-Year Horizon
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Official salary cap, luxury tax, first apron, and second apron operational boundaries under the 2023 CBA.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <EvidenceBadge state="VERIFIED CURRENT DATA" />
          <button
            onClick={() => onOpenCba(`Explain the systemic differences between First Apron and Second Apron rules.`)}
            className="px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask CBA About Aprons</span>
          </button>
        </div>
      </div>

      {/* Main Cap & Apron Horizontal Meter */}
      <CapApronMeter
        team={houston}
        selectedSeason={selectedSeason}
        onSeasonChange={(s) => setSelectedSeason(s)}
        onOpenCbaWithPrompt={(prompt) => onOpenCba(prompt)}
      />

      {/* Key Exceptions & Maximum Salary Table */}
      <div className="bg-[#12161f] border border-white/10 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Mid-Level & Free Agent Exceptions ({selectedSeason})
            </h3>
            <p className="text-xs text-neutral-400">
              Permitted roster acquisition exceptions based on luxury tax and apron standing.
            </p>
          </div>
          <EvidenceBadge state="CALCULATED ESTIMATE" size="sm" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Non-Taxpayer MLE */}
          <div className="p-4 bg-[#0d1016] border border-white/5 rounded-lg space-y-1">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
              Non-Taxpayer MLE
            </span>
            <span className="font-mono text-base font-bold text-white tabular-nums">
              {formatMillions(currentThreshold.est_mid_level_nt)}
            </span>
            <p className="text-[11px] text-neutral-400 leading-snug pt-1">
              Available to teams below First Apron. Triggering hard-caps club at First Apron.
            </p>
          </div>

          {/* Taxpayer MLE */}
          <div className="p-4 bg-[#0d1016] border border-white/5 rounded-lg space-y-1">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
              Taxpayer MLE
            </span>
            <span className="font-mono text-base font-bold text-white tabular-nums">
              {formatMillions(currentThreshold.est_taxpayer_mle)}
            </span>
            <p className="text-[11px] text-neutral-400 leading-snug pt-1">
              For teams above tax but below Second Apron. Completely forfeited at Second Apron.
            </p>
          </div>

          {/* Room Exception */}
          <div className="p-4 bg-[#0d1016] border border-white/5 rounded-lg space-y-1">
            <span className="text-[10px] font-mono uppercase text-sky-400 font-bold block">
              Room Exception
            </span>
            <span className="font-mono text-base font-bold text-white tabular-nums">
              {formatMillions(currentThreshold.room_exception)}
            </span>
            <p className="text-[11px] text-neutral-400 leading-snug pt-1">
              For under-cap teams that renounce all other mid-level exceptions to create cap room.
            </p>
          </div>

          {/* Bi-Annual Exception */}
          <div className="p-4 bg-[#0d1016] border border-white/5 rounded-lg space-y-1">
            <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block">
              Bi-Annual Exception
            </span>
            <span className="font-mono text-base font-bold text-white tabular-nums">
              {formatMillions(currentThreshold.bi_annual_exception)}
            </span>
            <p className="text-[11px] text-neutral-400 leading-snug pt-1">
              Usable once every two seasons by under-tax clubs. Hard-caps at First Apron.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
