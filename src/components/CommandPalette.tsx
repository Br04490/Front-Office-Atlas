import React, { useState, useEffect } from 'react';
import { TeamService, CbaService, PlayerService } from '../services';
import { 
  Search, 
  X, 
  ArrowRight, 
  Building2, 
  BookOpen, 
  User, 
  Layers, 
  Database,
  ShieldCheck
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTeam: (slug: string) => void;
  onSelectNav: (nav: string) => void;
  onOpenCba: (prompt?: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTeam,
  onSelectNav,
  onOpenCba,
}) => {
  const [query, setQuery] = useState('');
  const allTeams = TeamService.getAllTeams();
  const cbaRules = CbaService.getAllRules();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const matchedTeams = query.trim()
    ? allTeams.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.abbreviation.toLowerCase().includes(query.toLowerCase()) ||
          t.city.toLowerCase().includes(query.toLowerCase())
      )
    : allTeams.slice(0, 5);

  const matchedCba = query.trim()
    ? cbaRules.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.article_number.toLowerCase().includes(query.toLowerCase()) ||
          r.summary.toLowerCase().includes(query.toLowerCase())
      )
    : cbaRules.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div 
        className="w-full max-w-2xl bg-[#0f1217] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-white/10 bg-[#141820] flex items-center px-4">
          <Search className="w-5 h-5 text-neutral-400 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search player, team, pick, contract, prospect, CBA topic..."
            className="w-full bg-transparent py-4 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {/* Quick Actions / Jump to Navigation */}
          {!query && (
            <div>
              <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-2 px-2">
                Quick Navigation
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { label: 'Trade Lab', id: 'Trade Lab' },
                  { label: 'Cap & Apron', id: 'Cap & Apron' },
                  { label: 'Draft Ledger', id: 'Draft Ledger' },
                  { label: 'G League', id: 'G League' },
                  { label: 'Injuries', id: 'Injuries' },
                  { label: 'Prospects', id: 'Prospects' },
                  { label: 'Source Desk', id: 'Sources' },
                  { label: 'League Hub', id: 'League' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectNav(item.id);
                      onClose();
                    }}
                    className="p-2 text-left bg-[#141820] hover:bg-[#1c222e] rounded-lg border border-white/5 text-xs text-neutral-300 font-mono transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Teams Matches */}
          {matchedTeams.length > 0 && (
            <div>
              <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-2 px-2">
                NBA Organizations
              </span>
              <div className="space-y-1">
                {matchedTeams.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTeam(t.slug);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-lg bg-[#12161f] hover:bg-[#181d28] border border-white/5 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: t.colors.primary }}
                      />
                      <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {t.name}
                      </span>
                      <span className="text-xs font-mono text-neutral-400">
                        ({t.abbreviation})
                      </span>
                    </div>
                    <span className="text-xs font-mono text-neutral-500 group-hover:text-neutral-300 flex items-center gap-1">
                      <span>Open Hub</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CBA Topics Matches */}
          {matchedCba.length > 0 && (
            <div>
              <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-2 px-2">
                CBA Rules & Articles
              </span>
              <div className="space-y-1">
                {matchedCba.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onOpenCba(`Explain ${r.title} under ${r.article_number}, ${r.section}.`);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-lg bg-[#12161f] hover:bg-[#181d28] border border-white/5 flex items-start justify-between group transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-amber-400 font-semibold">
                          {r.article_number} {r.section}
                        </span>
                        <span className="text-xs font-bold text-white group-hover:text-amber-200 transition-colors">
                          {r.title}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                        {r.summary}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-amber-400 shrink-0 ml-4 group-hover:underline">
                      Ask CBA →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#0b0d11] border-t border-white/5 flex items-center justify-between text-xs text-neutral-500 font-mono">
          <span>Search 30 Franchises, 2023 CBA Articles, and Draft Classes</span>
          <span>Esc to exit</span>
        </div>
      </div>
    </div>
  );
};
