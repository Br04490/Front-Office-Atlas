import React from 'react';
import { Team } from '../types';
import { TeamService } from '../services';
import { 
  Sparkles, 
  Search, 
  Database, 
  ChevronDown, 
  Command, 
  ShieldCheck 
} from 'lucide-react';

interface NavbarProps {
  currentNav: string;
  onSelectNav: (nav: string) => void;
  currentTeam: Team;
  onSelectTeam: (slug: string) => void;
  onOpenAskCba: (prompt?: string) => void;
  onOpenAskAtlas: () => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentNav,
  onSelectNav,
  currentTeam,
  onSelectTeam,
  onOpenAskCba,
  onOpenAskAtlas,
  onOpenSearch,
}) => {
  const allTeams = TeamService.getAllTeams();

  const navItems = [
    { label: 'League', id: 'League' },
    { label: 'Teams', id: 'Teams' },
    { label: 'Cap & Apron', id: 'Cap & Apron' },
    { label: 'Trade Lab', id: 'Trade Lab' },
    { label: 'Two-Way Command', id: 'Two-Way Command' },
    { label: 'Draft Ledger', id: 'Draft Ledger' },
    { label: 'G League', id: 'G League' },
    { label: 'Injuries', id: 'Injuries' },
    { label: 'Prospects', id: 'Prospects' },
    { label: 'Scenarios', id: 'Scenarios' },
    { label: 'Sources', id: 'Sources' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0c10]/95 backdrop-blur-md border-b border-white/10 select-none">
      {/* Top Main Navigation Row */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone (Single element per top bar contract) */}
        <div className="flex items-center gap-6 shrink-0">
          <button
            onClick={() => onSelectNav('League')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-white/15 flex items-center justify-center font-mono font-bold text-amber-400 group-hover:border-amber-400/50 transition-colors">
              FOA
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-amber-300 transition-colors">
              FRONT OFFICE ATLAS
            </span>
          </button>

          {/* Quick Team Switcher Dropdown */}
          <div className="hidden lg:flex items-center gap-2 bg-[#12161f] border border-white/10 rounded-lg px-2.5 py-1 text-xs">
            <span 
              className="w-2 h-2 rounded-full shrink-0" 
              style={{ backgroundColor: currentTeam.colors.primary }}
            />
            <span className="text-neutral-400 font-mono">Team:</span>
            <select
              value={currentTeam.slug}
              onChange={(e) => {
                onSelectTeam(e.target.value);
                onSelectNav('Teams');
              }}
              className="bg-transparent text-neutral-100 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              {allTeams.map((t) => (
                <option key={t.id} value={t.slug} className="bg-[#12161f] text-neutral-100">
                  {t.name} ({t.abbreviation})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Global Search Input Box Trigger */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full bg-[#12161f] hover:bg-[#161a25] border border-white/10 hover:border-white/20 rounded-lg px-3.5 py-2 text-xs text-neutral-400 flex items-center justify-between transition-colors text-left"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Search className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span className="truncate">Search player, team, pick, contract, prospect, CBA topic...</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px] text-neutral-500 bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded shrink-0">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </button>
        </div>

        {/* Actions Zone: ASK CBA & ASK ATLAS buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenAskAtlas}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg text-neutral-300 bg-[#141822] hover:bg-[#1a202c] border border-white/10 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span>ASK ATLAS</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenAskCba()}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg text-neutral-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-400/10 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 fill-neutral-950" />
            <span>ASK CBA</span>
          </button>
        </div>
      </div>

      {/* Persistent Nav Links Bar (Single-line scrolling) */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-white/5 py-1 text-xs font-medium">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectNav(item.id)}
            className={`px-3 py-2 rounded-md whitespace-nowrap transition-colors ${
              currentNav === item.id
                ? 'bg-white/10 text-white font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
