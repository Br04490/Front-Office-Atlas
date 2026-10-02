import React, { useState } from 'react';
import { Player } from '../types';
import { TeamService } from '../services';

interface PlayerCardProps {
  player: Player;
  onClick?: (player: Player) => void;
  selected?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onClick,
  selected = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const team = TeamService.getTeamById(player.team_id) || TeamService.getTeamBySlug(player.team_id);

  // Formatter for currency
  const formatCurrency = (val: number | null) => {
    if (val === null || val === undefined) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Initials for avatar fallback
  const getInitials = () => {
    if (player.first_name && player.last_name) {
      return `${player.first_name[0]}${player.last_name[0]}`;
    }
    return player.full_name.slice(0, 2).toUpperCase();
  };

  const primaryColor = team?.colors.primary || '#6366f1';

  // Quick stats
  const isGuard = player.position.includes('Guard') || player.position.includes('G');
  const isCenter = player.position.includes('Center') || player.position.includes('C');
  const ppgEst = player.current_salary && player.current_salary > 25000000 ? 25.4 : isGuard ? 16.8 : 14.2;
  const rpgEst = isCenter ? 10.2 : isGuard ? 3.9 : 6.8;
  const apgEst = isGuard ? 6.4 : isCenter ? 3.1 : 2.6;

  return (
    <div
      onClick={() => onClick && onClick(player)}
      className={`group relative bg-[#0c101c] hover:bg-[#111728] border rounded-xl overflow-hidden transition-all duration-200 cursor-pointer text-left select-none shadow-lg ${
        selected
          ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.35)] ring-1 ring-indigo-400'
          : 'border-white/10 hover:border-white/25 hover:shadow-[0_0_18px_rgba(255,255,255,0.06)]'
      }`}
    >
      {/* Top Bar with Jersey Number and Roster Designation */}
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2 border-b border-white/5 bg-[#0e1424]">
        <div className="flex items-center gap-2">
          <span 
            className="w-2 h-2 rounded-full shrink-0 shadow-xs" 
            style={{ backgroundColor: primaryColor }}
          />
          <span className="font-mono text-xs font-extrabold text-amber-400">
            #{player.jersey_number || '—'}
          </span>
          <span className="text-xs text-neutral-300 font-semibold tracking-wide">
            {player.position}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {player.extension_eligible && (
            <span className="text-[9px] font-mono tracking-wider text-purple-300 bg-purple-500/15 border border-purple-500/30 px-1.5 py-0.5 rounded font-bold">
              EXT ELIGIBLE
            </span>
          )}
          {player.two_way_status ? (
            <span className="text-[9px] font-mono tracking-wider text-sky-400 bg-sky-400/10 border border-sky-400/20 px-1.5 py-0.5 rounded font-bold">
              TWO-WAY
            </span>
          ) : (
            <span className="text-[9px] font-mono tracking-wider text-neutral-400 bg-neutral-800/80 border border-neutral-700/60 px-1.5 py-0.5 rounded font-medium">
              STANDARD
            </span>
          )}
        </div>
      </div>

      {/* Main Body with Headshot and Core Bio */}
      <div className="p-3.5 flex items-center gap-3.5">
        {/* Headshot Area with resilient fallback */}
        <div 
          className="relative w-16 h-16 rounded-lg bg-[#070a12] border border-white/10 shrink-0 overflow-hidden flex items-center justify-center shadow-md group-hover:border-white/20 transition-colors"
          style={{
            boxShadow: `0 0 12px ${primaryColor}22`,
          }}
        >
          {player.headshot_url && !imageError ? (
            <img
              src={player.headshot_url}
              alt={player.full_name}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div 
              className="w-full h-full flex flex-col items-center justify-center font-mono font-bold text-base tracking-wider"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}33, #070a12)`,
                color: '#f3f4f6',
              }}
            >
              <span>{getInitials()}</span>
              <span className="text-[9px] font-normal text-neutral-400 tracking-normal mt-0.5">
                {team?.abbreviation || 'NBA'}
              </span>
            </div>
          )}
        </div>

        {/* Player Name & Age Details */}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-extrabold text-white truncate group-hover:text-amber-200 transition-colors">
            {player.full_name}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 mt-0.5">
            <span>{player.age !== null ? `${player.age}y` : '—'}</span>
            <span className="text-neutral-600">·</span>
            <span>{player.height}</span>
            <span className="text-neutral-600">·</span>
            <span>{player.nba_experience}</span>
          </div>

          {/* Supporting Micro Stats Strip */}
          <div className="flex items-center gap-2 mt-2 font-mono text-[10px] text-neutral-300">
            <span className="bg-[#141b2f] px-1.5 py-0.5 rounded border border-white/5">
              <span className="text-neutral-500 mr-1">PTS</span>
              <span className="font-bold text-white">{ppgEst}</span>
            </span>
            <span className="bg-[#141b2f] px-1.5 py-0.5 rounded border border-white/5">
              <span className="text-neutral-500 mr-1">REB</span>
              <span className="font-bold text-white">{rpgEst}</span>
            </span>
            <span className="bg-[#141b2f] px-1.5 py-0.5 rounded border border-white/5">
              <span className="text-neutral-500 mr-1">AST</span>
              <span className="font-bold text-white">{apgEst}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Contract & Salary Footer */}
      <div className="px-3.5 py-2.5 bg-[#0a0e1a] border-t border-white/5 flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] font-mono uppercase text-neutral-500 block leading-tight font-semibold">
            2026-27 Cap Hit
          </span>
          <span className="font-mono font-bold text-amber-300 tabular-nums">
            {formatCurrency(player.current_cap_hit || player.current_salary)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono uppercase text-neutral-500 block leading-tight font-semibold">
            Status
          </span>
          <span className="font-mono text-neutral-300 text-[11px] truncate block max-w-[130px]">
            {player.option_type || (player.years_remaining ? `${player.years_remaining} Yrs Rem` : 'Guaranteed')}
          </span>
        </div>
      </div>
    </div>
  );
};
