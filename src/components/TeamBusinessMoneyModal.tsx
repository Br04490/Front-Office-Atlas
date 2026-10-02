import React from 'react';
import { Team } from '../types';
import { PlayerIntelligenceService } from '../services/playerIntelligence';
import { DollarSign, ExternalLink, X, TrendingUp, ShieldAlert, Building2, CheckCircle2 } from 'lucide-react';

interface TeamBusinessMoneyModalProps {
  team: Team;
  isOpen: boolean;
  onClose: () => void;
}

export const TeamBusinessMoneyModal: React.FC<TeamBusinessMoneyModalProps> = ({ team, isOpen, onClose }) => {
  if (!isOpen) return null;

  const biz = PlayerIntelligenceService.getTeamBusinessValuation(team.slug);

  const formatCurrency = (val: number) => {
    if (val >= 1000000000) {
      return `$${(val / 1000000000).toFixed(2)} Billion`;
    }
    return `$${(val / 1000000).toFixed(1)} Million`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#0f1422] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#141a2a]">
          <div className="flex items-center gap-2.5">
            <DollarSign className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                {team.name} · Business & Valuation Intelligence
              </h3>
              <span className="text-[10px] font-mono text-neutral-400">
                Franchise Economics · Revenue & Multiples
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
              {biz.reporting_type}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Top Valuation Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#141a2a] border border-white/5 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-neutral-500 uppercase block">Enterprise Franchise Valuation</span>
              <span className="font-mono text-2xl font-extrabold text-white">
                {formatCurrency(biz.current_franchise_valuation)}
              </span>
              <span className="text-xs font-mono text-emerald-400 block">
                +{biz.one_year_change_pct}% YoY Valuation Growth
              </span>
            </div>

            <div className="p-4 bg-[#141a2a] border border-white/5 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-neutral-500 uppercase block">Annual Franchise Revenue</span>
              <span className="font-mono text-2xl font-extrabold text-amber-300">
                {formatCurrency(biz.annual_revenue)}
              </span>
              <span className="text-xs font-mono text-neutral-400 block">
                Operating Income: {formatCurrency(biz.operating_income)}
              </span>
            </div>
          </div>

          {/* Operational Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 bg-[#0a0d14] rounded-lg border border-white/5">
              <span className="text-[10px] text-neutral-500 uppercase block">Revenue Multiple</span>
              <span className="font-bold text-neutral-200">{biz.valuation_multiple}x Multiple</span>
            </div>
            <div className="p-3 bg-[#0a0d14] rounded-lg border border-white/5">
              <span className="text-[10px] text-neutral-500 uppercase block">Debt-to-Value</span>
              <span className="font-bold text-neutral-200">{biz.debt_to_value_pct}% Ratio</span>
            </div>
            <div className="p-3 bg-[#0a0d14] rounded-lg border border-white/5 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-neutral-500 uppercase block">Arena Real Estate</span>
              <span className="font-bold text-neutral-200 truncate block">{biz.arena_status}</span>
            </div>
          </div>

          {/* Valuation Methodology & Audit Context */}
          <div className="p-4 bg-[#141a2a] border border-white/5 rounded-xl space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-white font-bold">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Valuation Methodology & Financial Architecture</span>
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              {biz.methodology_notes}
            </p>
          </div>

          {/* Disclosure & Provenance Box */}
          <div className="p-3.5 bg-[#0a0d14] border border-amber-500/20 rounded-xl space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-amber-300 font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Source Attribution: Sportico NBA Valuations</span>
              </span>
              <span className="text-[10px] text-neutral-500">Published: {biz.published_date}</span>
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              In accordance with Front Office Atlas reporting integrity standards, financial enterprise values are classified as <span className="text-amber-300 font-bold">MANUAL / REPORTED SOURCE</span>. Commercial rights distributions and stadium debt covenants are audited annually.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
