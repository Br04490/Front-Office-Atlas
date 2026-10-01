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
  const team = TeamService.getTeamById(player.team_id);

  // Formatter for currency
  const formatCurrency = (val: number | null) => {
    if (val === null || val === undefined) return 'Awaiting Ingest';
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

  const primaryColor = team?.colors.primary || '#CE1141';

  return (
    <div
      onClick={() => onClick && onClick(player)}
      className={`group relative bg-[#13161c] hover:bg-[#181c24] border rounded-lg overflow-hidden transition-all duration-150 cursor-pointer text-left select-none ${
        selected
          ? 'border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
          : 'border-white/10 hover:border-white/25'
      }`}
    >
      {/* Top Bar with Jersey Number and Roster Designation */}
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span 
            className="w-2 h-2 rounded-full shrink-0" 
            style={{ backgroundColor: primaryColor }}
          />
          <span className="font-mono text-xs font-semibold text-neutral-400">
            #{player.jersey_number || '—'}
          </span>
          <span className="text-xs text-neutral-300 font-medium tracking-wide">
            {player.position}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {player.extension_eligible && (
            <span className="text-[10px] font-mono tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded">
              EXT ELIGIBLE
            </span>
          )}
          {player.two_way_status ? (
            <span className="text-[10px] font-mono tracking-wider text-sky-400 bg-sky-400/10 border border-sky-400/20 px-1.5 py-0.5 rounded">
              TWO-WAY
            </span>
          ) : (
            <span className="text-[10px] font-mono tracking-wider text-neutral-400 bg-neutral-800 border border-neutral-700/60 px-1.5 py-0.5 rounded">
              STANDARD NBA
            </span>
          )}
        </div>
      </div>

      {/* Main Body with Headshot and Core Bio */}
      <div className="p-3.5 flex items-center gap-3.5">
        {/* Headshot Area with resilient fallback */}
        <div className="relative w-16 h-16 rounded-md bg-[#0b0d11] border border-white/10 shrink-0 overflow-hidden flex items-center justify-center">
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
                background: `linear-gradient(135deg, ${primaryColor}33, #0b0d11)`,
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
          <div className="text-sm font-bold text-white truncate group-hover:text-amber-200 transition-colors">
            {player.full_name}
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
            <span>Age: {player.age !== null ? player.age : '—'}</span>
            <span className="text-neutral-600">·</span>
            <span>{player.height}</span>
            <span className="text-neutral-600">·</span>
            <span>{player.nba_experience}</span>
          </div>
          {player.option_type && (
            <div className="mt-1 text-[11px] font-mono text-purple-300 truncate">
              {player.option_type}
            </div>
          )}
        </div>
      </div>

      {/* Contract & Salary Footer */}
      <div className="px-3.5 py-2.5 bg-[#0e1116] border-t border-white/5 flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] font-mono uppercase text-neutral-500 block leading-tight">
            Current Cap Hit
          </span>
          <span className="font-mono font-semibold text-neutral-200 tabular-nums">
            {formatCurrency(player.current_cap_hit)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono uppercase text-neutral-500 block leading-tight">
            Commitment
          </span>
          <span className="font-mono text-neutral-300">
            {player.years_remaining !== null ? `${player.years_remaining} Yrs Rem` : 'Unverified'}
          </span>
        </div>
      </div>
    </div>
  );
};
