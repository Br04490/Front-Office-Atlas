import React, { useState } from 'react';
import { GLeagueService, TeamService } from '../services';
import { Affiliate, Team } from '../types';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { 
  Building2, 
  GitBranch, 
  ArrowDown, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  Globe, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';

interface GLeagueViewProps {
  onSelectTeam: (slug: string) => void;
}

export const GLeagueView: React.FC<GLeagueViewProps> = ({ onSelectTeam }) => {
  const affiliates = GLeagueService.getAllAffiliates();
  const independentAffiliates = GLeagueService.getIndependentAffiliates();
  const [selectedAffiliateId, setSelectedAffiliateId] = useState<string>(affiliates[0].id);

  const activeAffiliate = affiliates.find((a) => a.id === selectedAffiliateId) || affiliates[0];
  const parentTeam = activeAffiliate.parentTeamId 
    ? TeamService.getTeamById(activeAffiliate.parentTeamId) 
    : null;

  const pipelineStages = [
    {
      stage: 'NBA PARENT TEAM',
      description: parentTeam ? parentTeam.name : 'Independent G League Organization',
      badge: 'NBA Organization',
      capImpact: 'Full Cap Responsibility',
      color: 'border-white/20 bg-[#12161f]',
    },
    {
      stage: 'NBA ACTIVE ROSTER',
      description: 'Up to 15 standard NBA contracts occupying active payroll slots.',
      badge: 'NBA Primary Roster',
      capImpact: '100% NBA Cap & Luxury Tax Hit',
      color: 'border-emerald-500/30 bg-emerald-500/5',
    },
    {
      stage: 'TWO-WAY PLAYERS',
      description: 'Up to 3 Two-Way contract slots. 50 active NBA games limit.',
      badge: 'Two-Way Contract',
      capImpact: '$0 NBA Cap Charge (Zero Tax Impact)',
      color: 'border-sky-500/30 bg-sky-500/5',
    },
    {
      stage: 'NBA ASSIGNMENTS',
      description: 'First & second year NBA players assigned to G League for development.',
      badge: 'Active Assignment',
      capImpact: 'Maintains NBA Contract Cap Status',
      color: 'border-amber-500/30 bg-amber-500/5',
    },
    {
      stage: 'RECALLS',
      description: 'Assigned players summoned back to active NBA roster by parent club.',
      badge: 'Immediate Recall',
      capImpact: 'Full NBA Salary Re-activated',
      color: 'border-purple-500/30 bg-purple-500/5',
    },
    {
      stage: 'G LEAGUE AFFILIATE',
      description: activeAffiliate.name,
      badge: activeAffiliate.isIndependent ? 'Independent Club' : 'Single-Affiliate Club',
      capImpact: 'G League Operations Budget Only',
      color: 'border-amber-500/40 bg-amber-500/10',
    },
    {
      stage: 'STANDARD G LEAGUE PLAYERS',
      description: 'Contracted directly with NBA G League central entity. Not signed to NBA.',
      badge: 'Central League Contract',
      capImpact: '$0 NBA Cap Hit (Zero NBA Team Liability)',
      color: 'border-white/10 bg-[#0d1016]',
    },
    {
      stage: 'AFFILIATE PLAYERS',
      description: 'Waived standard NBA camp players designated to affiliate for bonus.',
      badge: 'Affiliate Rights',
      capImpact: '$0 NBA Cap Hit (Exhibit 10 Bonus Only)',
      color: 'border-white/10 bg-[#0d1016]',
    },
    {
      stage: 'RETURNING RIGHTS',
      description: 'Franchise holds exclusive G League player rights for two successive seasons.',
      badge: 'Franchise Rights',
      capImpact: '$0 NBA Cap Hit',
      color: 'border-white/10 bg-[#0d1016]',
    },
    {
      stage: 'DRAFT RIGHTS',
      description: 'Rights retained from G League draft selections.',
      badge: 'G League Draft',
      capImpact: '$0 NBA Cap Hit',
      color: 'border-white/10 bg-[#0d1016]',
    },
    {
      stage: 'TRYOUT PLAYERS',
      description: 'Open tryout participants invited to affiliate training camp.',
      badge: 'Local Tryout Pool',
      capImpact: '$0 NBA Cap Hit',
      color: 'border-white/10 bg-[#0d1016]',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <GitBranch className="w-6 h-6 text-amber-400" />
              <span>G League Development Pipeline</span>
            </h1>
            <span className="font-mono text-xs text-neutral-400 uppercase bg-neutral-800 border border-neutral-700 px-2 py-0.5 rounded">
              31 Teams Registered
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            End-to-end player development tracking, assignment mechanics, recall logistics, and cap-wall separation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <EvidenceBadge state="VERIFICATION REQUIRED" />
        </div>
      </div>

      {/* Financial Wall Separation Callout */}
      <div className="p-4 bg-sky-500/10 border border-sky-500/30 rounded-xl flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-200 space-y-1">
          <span className="font-bold text-sky-300 block">
            CBA Financial Rule: G League Separation Wall
          </span>
          <p className="text-neutral-300 leading-relaxed">
            Standard G League player contracts are held by the central league entity and are completely separate from NBA team salary caps and luxury tax liabilities. Only players on Two-Way contracts, 10-day contracts, or assigned standard NBA roster players exert payroll impact.
          </p>
        </div>
      </div>

      {/* Independent Teams Spotlight (Mexico City Capitanes) */}
      <div className="p-5 bg-[#12161f] border border-amber-500/30 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Independent Franchise Status · Capitanes de Ciudad de México
            </h3>
          </div>
          <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
            Autonomous Organization
          </span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          Unlike the 30 single-affiliated franchises, <strong>Capitanes de Ciudad de México</strong> operates independently without an NBA parent club. Any NBA team may freely call up Capitanes players or sign them to standard NBA or Two-Way contracts.
        </p>
      </div>

      {/* Interactive Affiliate Selector */}
      <div className="bg-[#12161f] border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-300 uppercase">
              Select Franchise Pipeline
            </span>
            <span className="text-xs text-neutral-500 block">
              Viewing pipeline for: <strong className="text-white">{activeAffiliate.name}</strong>
            </span>
          </div>
          <select
            value={selectedAffiliateId}
            onChange={(e) => setSelectedAffiliateId(e.target.value)}
            className="bg-[#161a24] border border-white/10 text-white text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-400"
          >
            {affiliates.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} {a.isIndependent ? '(Independent)' : `(${a.parentTeamName})`}
              </option>
            ))}
          </select>
        </div>

        {/* 11-Stage Pipeline Flow */}
        <div className="space-y-2.5 pt-2">
          {pipelineStages.map((stage, idx) => (
            <div key={stage.stage} className="space-y-2">
              <div className={`p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${stage.color}`}>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                      {stage.stage}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900/80 px-2 py-0.5 rounded border border-white/5">
                      {stage.badge}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300">
                    {stage.description}
                  </p>
                </div>

                <div className="text-right sm:shrink-0">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                    CBA Financial Ledger Impact
                  </span>
                  <span className="font-mono text-xs font-semibold text-neutral-200">
                    {stage.capImpact}
                  </span>
                </div>
              </div>

              {idx < pipelineStages.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowDown className="w-3.5 h-3.5 text-neutral-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
