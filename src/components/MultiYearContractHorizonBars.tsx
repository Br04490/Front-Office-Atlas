import React, { useState } from 'react';
import { Team, CapThreshold } from '../types';
import { CapService, PlayerService, TeamService } from '../services';
import { ShieldCheck, Sparkles, HelpCircle, Layers, Calendar, DollarSign, ChevronRight } from 'lucide-react';

interface MultiYearContractHorizonBarsProps {
  team?: Team;
  onOpenCba?: (prompt: string) => void;
}

interface HorizonYearData {
  season: string;
  salaryCap: number;
  luxuryTax: number;
  firstApron: number;
  secondApron: number;
  guaranteedPayroll: number;
  optionPayroll: number;
  nonGuaranteedPayroll: number;
  extensionEligibleCount: number;
  expiringFreeAgentsCount: number;
  notablePlayers: Array<{
    name: string;
    salary: number;
    guaranteeType: 'GUARANTEED' | 'OPTION' | 'NON_GUARANTEED';
    optionType?: string;
    hasExtensionWindow?: boolean;
    isFreeAgentNext?: boolean;
  }>;
}

export const MultiYearContractHorizonBars: React.FC<MultiYearContractHorizonBarsProps> = ({
  team,
  onOpenCba,
}) => {
  const [selectedSeason, setSelectedSeason] = useState('2026-27');
  const [activePlayerHover, setActivePlayerHover] = useState<string | null>(null);

  const activeTeam = team || TeamService.getFeaturedPilotTeam();
  const teamRoster = PlayerService.getPlayersByTeam(activeTeam.slug);

  // Multi-year horizon data for 2026-27, 2027-28, 2028-29, 2029-30
  const horizonYears: HorizonYearData[] = [
    {
      season: '2026-27',
      salaryCap: 154647000,
      luxuryTax: 188031000,
      firstApron: 209020000,
      secondApron: 221689000,
      guaranteedPayroll: 184500000,
      optionPayroll: 14200000,
      nonGuaranteedPayroll: 3800000,
      extensionEligibleCount: 3,
      expiringFreeAgentsCount: 2,
      notablePlayers: [
        { name: 'Kevin Durant', salary: 54700000, guaranteeType: 'GUARANTEED' },
        { name: 'Alperen Şengün', salary: 34500000, guaranteeType: 'GUARANTEED' },
        { name: 'Amen Thompson', salary: 10400000, guaranteeType: 'GUARANTEED', hasExtensionWindow: true },
        { name: 'Reed Sheppard', salary: 9800000, guaranteeType: 'GUARANTEED' },
        { name: 'Jabari Smith Jr.', salary: 12400000, guaranteeType: 'OPTION', optionType: 'Team Option' },
        { name: 'Tari Eason', salary: 6200000, guaranteeType: 'NON_GUARANTEED', hasExtensionWindow: true },
      ],
    },
    {
      season: '2027-28',
      salaryCap: 170112000,
      luxuryTax: 206834000,
      firstApron: 229922000,
      secondApron: 243858000,
      guaranteedPayroll: 142000000,
      optionPayroll: 32000000,
      nonGuaranteedPayroll: 8500000,
      extensionEligibleCount: 4,
      expiringFreeAgentsCount: 5,
      notablePlayers: [
        { name: 'Alperen Şengün', salary: 37200000, guaranteeType: 'GUARANTEED' },
        { name: 'Amen Thompson', salary: 13200000, guaranteeType: 'OPTION', optionType: 'Team Option', hasExtensionWindow: true },
        { name: 'Reed Sheppard', salary: 10300000, guaranteeType: 'GUARANTEED' },
        { name: 'Kevin Durant', salary: 0, guaranteeType: 'GUARANTEED', isFreeAgentNext: true },
      ],
    },
    {
      season: '2028-29',
      salaryCap: 187123000,
      luxuryTax: 227517000,
      firstApron: 252914000,
      secondApron: 268244000,
      guaranteedPayroll: 98000000,
      optionPayroll: 45000000,
      nonGuaranteedPayroll: 12000000,
      extensionEligibleCount: 2,
      expiringFreeAgentsCount: 7,
      notablePlayers: [
        { name: 'Alperen Şengün', salary: 40100000, guaranteeType: 'GUARANTEED' },
        { name: 'Amen Thompson', salary: 38500000, guaranteeType: 'OPTION', optionType: 'Max Extension Window' },
        { name: 'Reed Sheppard', salary: 13800000, guaranteeType: 'OPTION', optionType: 'Team Option' },
      ],
    },
    {
      season: '2029-30',
      salaryCap: 205835000,
      luxuryTax: 250269000,
      firstApron: 278205000,
      secondApron: 295068000,
      guaranteedPayroll: 62000000,
      optionPayroll: 42000000,
      nonGuaranteedPayroll: 0,
      extensionEligibleCount: 1,
      expiringFreeAgentsCount: 9,
      notablePlayers: [
        { name: 'Alperen Şengün', salary: 43200000, guaranteeType: 'OPTION', optionType: 'Player Option' },
        { name: 'Amen Thompson', salary: 41500000, guaranteeType: 'GUARANTEED' },
      ],
    },
  ];

  const currentYearData = horizonYears.find((y) => y.season === selectedSeason) || horizonYears[0];
  const maxThreshold = 300000000;

  const formatMillions = (val: number) => `$${(val / 1000000).toFixed(1)}M`;

  return (
    <div className="bg-[#0e1424] border border-white/10 rounded-xl p-5 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-sm font-extrabold text-white uppercase tracking-wider">
              Multi-Year Contract Horizon & Apron Exposure Matrix
            </h3>
            <span className="font-mono text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded font-bold">
              {activeTeam.name}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Visual vertical bar matrix breaking down guaranteed payroll, options, non-guaranteed commitments, extension windows, and free agency milestones.
          </p>
        </div>

        {/* Year Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#131b30] p-1 rounded-lg border border-white/10">
          {horizonYears.map((hy) => (
            <button
              key={hy.season}
              onClick={() => setSelectedSeason(hy.season)}
              className={`px-3 py-1 font-mono text-xs font-bold rounded-md transition-all cursor-pointer ${
                selectedSeason === hy.season
                  ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)] border border-indigo-400/40'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {hy.season}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Contract Year Bars (2026-27 | 2027-28 | 2028-29 | 2029-30) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
        {horizonYears.map((hy) => {
          const isSelected = selectedSeason === hy.season;
          const totalPayroll = hy.guaranteedPayroll + hy.optionPayroll + hy.nonGuaranteedPayroll;
          const guaranteedPct = (hy.guaranteedPayroll / maxThreshold) * 100;
          const optionPct = (hy.optionPayroll / maxThreshold) * 100;
          const nonGuarPct = (hy.nonGuaranteedPayroll / maxThreshold) * 100;

          const isOverCap = totalPayroll > hy.salaryCap;
          const isOverTax = totalPayroll > hy.luxuryTax;
          const isOverFirstApron = totalPayroll > hy.firstApron;
          const isOverSecondApron = totalPayroll > hy.secondApron;

          return (
            <div
              key={hy.season}
              onClick={() => setSelectedSeason(hy.season)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#141b30] border-indigo-500 shadow-[0_0_16px_rgba(99,102,241,0.3)] ring-1 ring-indigo-400'
                  : 'bg-[#0b0f19] border-white/5 hover:border-white/20'
              }`}
            >
              {/* Year & Total */}
              <div>
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-sm font-extrabold ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                    {hy.season}
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-300">
                    {formatMillions(totalPayroll)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {isOverSecondApron ? (
                    <span className="text-[9px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 font-bold">
                      2ND APRON EXCEEDED
                    </span>
                  ) : isOverFirstApron ? (
                    <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold">
                      1ST APRON
                    </span>
                  ) : isOverTax ? (
                    <span className="text-[9px] font-mono text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20 font-bold">
                      LUXURY TAX
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">
                      UNDER TAX
                    </span>
                  )}
                </div>
              </div>

              {/* Vertical Stacked Bar Visualizing Commitments */}
              <div className="my-4 h-48 bg-[#070a10] border border-white/5 rounded-lg p-1.5 flex items-end justify-center relative">
                {/* Benchmark Lines: Salary Cap, Tax, First Apron, Second Apron */}
                <div 
                  className="absolute left-0 right-0 border-t border-dashed border-emerald-500/50 z-10"
                  style={{ bottom: `${(hy.salaryCap / maxThreshold) * 100}%` }}
                  title={`Salary Cap: ${formatMillions(hy.salaryCap)}`}
                />
                <div 
                  className="absolute left-0 right-0 border-t border-dashed border-amber-500/50 z-10"
                  style={{ bottom: `${(hy.luxuryTax / maxThreshold) * 100}%` }}
                  title={`Tax: ${formatMillions(hy.luxuryTax)}`}
                />
                <div 
                  className="absolute left-0 right-0 border-t border-dashed border-rose-500/60 z-10"
                  style={{ bottom: `${(hy.firstApron / maxThreshold) * 100}%` }}
                  title={`First Apron: ${formatMillions(hy.firstApron)}`}
                />

                {/* Stacked Vertical Segment */}
                <div className="w-12 flex flex-col justify-end">
                  {/* Non-guaranteed segment (Top) */}
                  {hy.nonGuaranteedPayroll > 0 && (
                    <div
                      style={{ height: `${nonGuarPct * 1.5}px` }}
                      className="w-full border border-dashed border-neutral-400 bg-neutral-700/60 rounded-t-xs"
                      title={`Non-Guaranteed: ${formatMillions(hy.nonGuaranteedPayroll)}`}
                    />
                  )}
                  {/* Option segment (Middle) */}
                  {hy.optionPayroll > 0 && (
                    <div
                      style={{ height: `${optionPct * 1.5}px` }}
                      className="w-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                      title={`Option: ${formatMillions(hy.optionPayroll)}`}
                    />
                  )}
                  {/* Guaranteed segment (Base) */}
                  <div
                    style={{ height: `${guaranteedPct * 1.5}px` }}
                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-b-xs shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                    title={`Guaranteed: ${formatMillions(hy.guaranteedPayroll)}`}
                  />
                </div>
              </div>

              {/* Markers for this Year */}
              <div className="space-y-1.5 text-[10px] font-mono border-t border-white/5 pt-2">
                <div className="flex items-center justify-between text-emerald-400">
                  <span>Guaranteed:</span>
                  <span className="font-bold">{formatMillions(hy.guaranteedPayroll)}</span>
                </div>
                <div className="flex items-center justify-between text-amber-300">
                  <span>Option Slots:</span>
                  <span className="font-bold">{formatMillions(hy.optionPayroll)}</span>
                </div>
                <div className="flex items-center justify-between text-purple-400">
                  <span>Extension Window:</span>
                  <span className="font-bold">{hy.extensionEligibleCount} Players</span>
                </div>
                <div className="flex items-center justify-between text-rose-400">
                  <span>Free Agency:</span>
                  <span className="font-bold">{hy.expiringFreeAgentsCount} Expiring</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Year Breakdown & Notable Player Markers */}
      <div className="p-4 bg-[#131b30] border border-white/10 rounded-xl space-y-3 font-mono text-xs shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-sm">
              {currentYearData.season} Contract Audit & CBA Thresholds
            </span>
            <span className="text-neutral-400">
              (Cap: {formatMillions(currentYearData.salaryCap)} · Tax: {formatMillions(currentYearData.luxuryTax)} · 1st Apron: {formatMillions(currentYearData.firstApron)} · 2nd Apron: {formatMillions(currentYearData.secondApron)})
            </span>
          </div>
          {onOpenCba && (
            <button
              onClick={() => onOpenCba(`Explain our ${currentYearData.season} apron flexibility and extension restrictions for ${activeTeam.name}.`)}
              className="text-amber-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask CBA About {currentYearData.season}</span>
            </button>
          )}
        </div>

        {/* Notable Player Contract Markers in this Horizon Year */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {currentYearData.notablePlayers.map((player) => (
            <div
              key={player.name}
              className="p-2.5 bg-[#0b0f19] border border-white/5 rounded-lg flex items-center justify-between gap-2 hover:border-white/20 transition-all"
            >
              <div>
                <span className="text-white font-bold block">{player.name}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                    player.guaranteeType === 'GUARANTEED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : player.guaranteeType === 'OPTION'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      : 'border border-dashed border-neutral-500 text-neutral-400'
                  }`}>
                    {player.optionType || player.guaranteeType}
                  </span>
                  {player.hasExtensionWindow && (
                    <span className="text-[9px] bg-purple-500/15 text-purple-300 border border-purple-500/30 px-1 py-0.2 rounded font-bold">
                      EXT WINDOW
                    </span>
                  )}
                  {player.isFreeAgentNext && (
                    <span className="text-[9px] bg-rose-500/15 text-rose-300 border border-rose-500/30 px-1 py-0.2 rounded font-bold">
                      FREE AGENCY
                    </span>
                  )}
                </div>
              </div>
              <span className="font-mono text-amber-300 font-extrabold">
                {player.salary > 0 ? formatMillions(player.salary) : 'FA'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
