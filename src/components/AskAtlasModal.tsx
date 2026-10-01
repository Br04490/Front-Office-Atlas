import React, { useState } from 'react';
import { AtlasSearchService } from '../services';
import { EvidenceBadge } from './EvidenceBadge';
import { 
  X, 
  Search, 
  Database, 
  Terminal, 
  ArrowRight, 
  Building2, 
  BookOpen, 
  Layers, 
  FileText 
} from 'lucide-react';

interface AskAtlasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTeam: (slug: string) => void;
}

export const AskAtlasModal: React.FC<AskAtlasModalProps> = ({
  isOpen,
  onClose,
  onSelectTeam,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const exampleQueries = [
    'Show every team within $5M of the first apron.',
    'Which centers earn under $10M in 2026-27?',
    'Show Houston contracts expiring before 2029.',
    'Which teams control the most first-round picks (2027-2034)?',
    'Which two-way players are guards?',
    'Which teams have second-apron issues?',
    "Which G League players fit Houston's current development needs?",
  ];

  const searchResults = AtlasSearchService.searchAll(query);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-2xl bg-[#0f1217] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-[#141820] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                ASK ATLAS
              </h2>
              <p className="text-xs text-neutral-400">
                Front Office Database Natural Language Query Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input box */}
        <div className="p-6 space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-neutral-500 absolute left-4 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Query players, cap thresholds, draft obligations, or G League pipeline..."
              className="w-full bg-[#161a22] border border-white/10 rounded-lg pl-12 pr-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-sky-400/60 transition-colors"
            />
          </div>

          {/* If query has matches, display live search results */}
          {query.trim() && (searchResults.teams.length > 0 || searchResults.rules.length > 0 || searchResults.sources.length > 0) && (
            <div className="p-3 bg-[#11141b] border border-white/10 rounded-lg space-y-2 max-h-56 overflow-y-auto">
              <span className="text-[10px] font-mono text-neutral-500 uppercase block">
                Direct Atlas Entity Matches:
              </span>
              {searchResults.teams.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectTeam(t.slug);
                    onClose();
                  }}
                  className="w-full text-left p-2 rounded bg-[#161b25] hover:bg-[#1f2633] text-xs text-white flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>{t.name} ({t.abbreviation})</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">Open Team Hub →</span>
                </button>
              ))}
              {searchResults.rules.map((r, i) => (
                <div key={i} className="p-2 bg-[#161b25] rounded text-xs text-neutral-300">
                  <div className="font-semibold text-amber-300">{r.title}</div>
                  <div className="text-[10px] text-neutral-400">{r.article_number} {r.section}</div>
                </div>
              ))}
            </div>
          )}

          {/* Example prompt pills */}
          <div>
            <span className="text-[11px] font-mono text-neutral-500 uppercase block mb-2">
              Example Front-Office Queries:
            </span>
            <div className="space-y-1.5">
              {exampleQueries.map((eq, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setQuery(eq)}
                  className="w-full text-left px-3 py-2 rounded bg-[#13161d] hover:bg-[#191f2c] border border-white/5 hover:border-sky-500/30 text-xs text-neutral-300 flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <span>"{eq}"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-sky-400 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Query Engine State Notice */}
          <div className="p-4 bg-[#12161f] border border-white/5 rounded-lg space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-neutral-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                Engine Status
              </span>
              <EvidenceBadge state="DATA NOT CONNECTED" size="sm" />
            </div>
            <p className="text-neutral-400 leading-relaxed">
              Atlas Database Natural Language Parsing is established. Inbound PostgreSQL/Supabase table synchronization is pending verified credential connection.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0d1015] border-t border-white/5 flex items-center justify-between text-xs text-neutral-500 font-mono">
          <span>Prepared for Supabase / PostgreSQL Direct Ingestion</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
