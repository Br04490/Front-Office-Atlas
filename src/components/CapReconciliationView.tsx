import React, { useState } from 'react';
import { CapReconciliationService, VERIFIED_DEAD_MONEY, VERIFIED_CAP_HOLDS, VERIFIED_TEAM_EXCEPTIONS } from '../services/capEngine';
import { EvidenceBadge } from './EvidenceBadge';
import { ShieldCheck, AlertCircle, FileCheck, Layers, DollarSign, Sparkles } from 'lucide-react';

interface CapReconciliationViewProps {
  teamSlug?: string;
  season?: string;
  onOpenCba?: (prompt: string) => void;
}

export const CapReconciliationView: React.FC<CapReconciliationViewProps> = ({
  teamSlug = 'houston-rockets',
  season = '2026-27',
  onOpenCba,
}) => {
  const recon = CapReconciliationService.reconcileTeam(teamSlug, season);
  const teamDeadMoney = VERIFIED_DEAD_MONEY.filter((dm) => dm.team_id.includes(teamSlug));
  const teamCapHolds = VERIFIED_CAP_HOLDS.filter((ch) => ch.team_id.includes(teamSlug));
  const teamExceptions = VERIFIED_TEAM_EXCEPTIONS.filter((ex) => ex.team_id.includes(teamSlug) || ex.team_id === 'houston-rockets');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatMillions = (val: number) => `$${(val / 1000000).toFixed(1)}M`;

  return (
    <div className="space-y-6">
      {/* 1. Cap Reconciliation Ledger */}
      <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="font-mono text-sm font-extrabold text-white uppercase tracking-wider">
                Cap Reconciliation Engine ({recon.team_name} · {season})
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                recon.status === 'VERIFIED_RECONCILED'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}>
                {recon.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Deterministic cross-audit comparing sum of active player contracts, dead money, and holds against published NBA Operations registers.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-400">
            <span>AS OF: October 1, 2026</span>
          </div>
        </div>

        {/* Reconciliation Math Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 bg-[#131b30] border border-white/5 rounded-lg">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">Active Contracts</span>
            <span className="font-mono text-base font-bold text-white">{formatCurrency(recon.contracts_sum)}</span>
          </div>
          <div className="p-3 bg-[#131b30] border border-white/5 rounded-lg">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">+ Dead Money</span>
            <span className="font-mono text-base font-bold text-neutral-200">{formatCurrency(recon.dead_money_sum)}</span>
          </div>
          <div className="p-3 bg-[#131b30] border border-white/5 rounded-lg">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">= Calculated Salary</span>
            <span className="font-mono text-base font-bold text-amber-300">{formatCurrency(recon.calculated_team_salary)}</span>
          </div>
          <div className="p-3 bg-[#131b30] border border-white/5 rounded-lg">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">Published Total</span>
            <span className="font-mono text-base font-bold text-neutral-200">{formatCurrency(recon.published_official_salary)}</span>
          </div>
          <div className="p-3 bg-[#131b30] border border-white/5 rounded-lg">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">Variance Delta</span>
            <span className={`font-mono text-base font-bold ${recon.reconciliation_difference === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {recon.reconciliation_difference === 0 ? '$0 (Exact)' : formatCurrency(recon.reconciliation_difference)}
            </span>
          </div>
        </div>

        <div className="p-3 bg-[#131b30] border border-white/5 rounded-lg text-xs font-mono text-neutral-300 flex items-center justify-between">
          <span>{recon.notes} Source: {recon.source}</span>
          {onOpenCba && (
            <button
              onClick={() => onOpenCba(`Explain how dead money and cap holds count toward team salary under the CBA.`)}
              className="text-amber-400 hover:text-white transition-colors"
            >
              Ask CBA About Reconciliation →
            </button>
          )}
        </div>
      </div>

      {/* 2. Team Exceptions Inventory */}
      <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <h3 className="font-mono text-sm font-extrabold text-white uppercase tracking-wider">
              Exceptions Inventory ({recon.team_name})
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Available Mid-Level, Bi-Annual, and Traded Player Exceptions with verified hard-cap trigger flags.
            </p>
          </div>
          <EvidenceBadge state="VERIFIED CURRENT DATA" size="sm" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {teamExceptions.map((ex) => (
            <div key={ex.id} className="p-3.5 bg-[#131b30] border border-white/5 rounded-lg space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white uppercase">{ex.type.replace(/_/g, ' ')}</span>
                <span className="text-emerald-400 font-bold">{formatCurrency(ex.remaining_amount)}</span>
              </div>
              <div className="text-[11px] text-neutral-400">
                Total Slot: {formatCurrency(ex.total_amount)} · Expires: {ex.expires_at}
              </div>
              {ex.hard_cap_consequence && (
                <div className="text-[10px] text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                  ⚠️ Usage triggers First Apron Hard Cap ($209.0M)
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Dead Money & Cap Holds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dead Money */}
        <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h4 className="font-mono text-xs font-bold text-white uppercase">Dead Money Obligations</h4>
            <span className="text-xs font-mono text-amber-300 font-bold">
              Total: {formatCurrency(teamDeadMoney.reduce((acc, dm) => acc + dm.amount, 0))}
            </span>
          </div>
          {teamDeadMoney.length === 0 ? (
            <p className="text-xs text-neutral-500 font-mono py-2">No active dead money obligations on the cap sheet.</p>
          ) : (
            teamDeadMoney.map((dm) => (
              <div key={dm.id} className="p-2.5 bg-[#131b30] border border-white/5 rounded-lg flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-white font-bold block">{dm.player_name}</span>
                  <span className="text-[10px] text-neutral-400">{dm.type} obligation · {dm.season}</span>
                </div>
                <span className="text-neutral-200 font-bold">{formatCurrency(dm.amount)}</span>
              </div>
            ))
          )}
        </div>

        {/* Cap Holds */}
        <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h4 className="font-mono text-xs font-bold text-white uppercase">Free Agent & Pick Cap Holds</h4>
            <span className="text-xs font-mono text-sky-300 font-bold">
              Total: {formatCurrency(teamCapHolds.reduce((acc, ch) => acc + ch.amount, 0))}
            </span>
          </div>
          {teamCapHolds.length === 0 ? (
            <p className="text-xs text-neutral-500 font-mono py-2">No active cap holds recorded.</p>
          ) : (
            teamCapHolds.map((ch) => (
              <div key={ch.id} className="p-2.5 bg-[#131b30] border border-white/5 rounded-lg flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-white font-bold block">{ch.player_name}</span>
                  <span className="text-[10px] text-neutral-400">{ch.hold_type.replace(/_/g, ' ')} · {ch.season}</span>
                </div>
                <span className="text-neutral-200 font-bold">{formatCurrency(ch.amount)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
