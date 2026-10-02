import React, { useState } from 'react';
import { AtlasSearchService } from '../services';
import { AskAtlasEngine } from '../services/askAtlasEngine';
import { AskAtlasResponse } from '../types';
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
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
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
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AskAtlasResponse | null>(null);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);

  if (!isOpen) return null;

  const exampleQueries = [
    "Who are Houston's two-way players?",
    'Which Rockets contracts expire after 2027-28?',
    'Show guards age 25 or younger making less than $15M.',
    'Which teams are closest to the second apron?',
    'What first-round picks does Oklahoma City control in 2029?',
    'Show top 2027 draft prospects and eligibility.',
    "What is Houston's roster availability and injury status?",
  ];

  const handleExecuteQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setQuery(queryText);
    setIsLoading(true);
    setResponse(null);

    try {
      const res = await AskAtlasEngine.processQuery(queryText);
      setResponse(res);
    } catch (err) {
      console.warn('AskAtlas query error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const searchResults = AtlasSearchService.searchAll(query);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 font-mono">
      <div 
        className="w-full max-w-3xl bg-[#0b0f19] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-[#0e1424] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-wide">
                  ASK ATLAS
                </h2>
                <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-bold">
                  STRUCTURED DATA BACKBONE
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Front Office Database Natural Language Query Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Box & Submit */}
        <div className="p-6 space-y-4 border-b border-white/5 bg-[#0e1424]">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleExecuteQuery(query);
            }}
            className="relative flex items-center"
          >
            <Search className="w-5 h-5 text-neutral-500 absolute left-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask structured front office question (e.g. 'Who are Houston's two-way players?')..."
              className="w-full bg-[#131b30] border border-white/15 rounded-xl pl-12 pr-28 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-400 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              {isLoading ? 'Querying...' : 'Execute'}
            </button>
          </form>

          {/* Prompt Suggestions */}
          {!response && !isLoading && (
            <div className="space-y-2">
              <span className="text-[10px] uppercase text-neutral-500 font-bold block">
                Sample Structured Front Office Inquiries:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {exampleQueries.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => handleExecuteQuery(ex)}
                    className="text-left text-[11px] px-3 py-1.5 rounded-lg bg-[#131b30] hover:bg-[#182340] border border-white/5 hover:border-white/20 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Response Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {isLoading && (
            <div className="p-12 text-center space-y-3">
              <Sparkles className="w-8 h-8 mx-auto text-indigo-400 animate-spin" />
              <p className="font-bold text-white uppercase text-sm">
                Querying Front Office Database & Calculating CBA Multipliers...
              </p>
              <p className="text-neutral-400 text-xs max-w-md mx-auto">
                Extracting structured entity intent, querying real contracts, rosters, and aprons without inventing facts.
              </p>
            </div>
          )}

          {response && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* 1. ANSWER (Concise First) */}
              <div className="p-5 bg-[#131b30] border border-white/10 rounded-xl space-y-2 shadow-md">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">
                    Atlas Synthesized Determination
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    Intent: <strong className="text-white">{response.intent}</strong>
                  </span>
                </div>
                <p className="text-sm font-sans text-neutral-100 leading-relaxed font-semibold">
                  {response.answer}
                </p>
              </div>

              {/* 2. KEY DATA (Expandable Details) */}
              {response.key_data && response.key_data.length > 0 && (
                <div className="p-4 bg-[#0e1424] border border-white/10 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Key Verified Database Records ({response.key_data.length})
                    </span>
                    <button
                      onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                      className="text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isDetailsExpanded ? 'Collapse' : 'Expand'}</span>
                      {isDetailsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {isDetailsExpanded && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {response.key_data.map((row, idx) => (
                        <div key={idx} className="p-3 bg-[#131b30] border border-white/5 rounded-lg space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">{row.label}</span>
                            <span className="font-extrabold text-amber-300">{row.value}</span>
                          </div>
                          {row.detail && (
                            <span className="text-[10px] text-neutral-400 block font-sans">
                              {row.detail}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. WHY IT MATTERS */}
              <div className="p-4 bg-[#0e1424] border border-white/10 rounded-xl space-y-1.5">
                <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider block">
                  Front Office Impact & Strategic Importance:
                </span>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  {response.why_it_matters}
                </p>
              </div>

              {/* 4. FILTERS & ASSUMPTIONS */}
              <div className="p-4 bg-[#0e1424] border border-white/10 rounded-xl space-y-1.5">
                <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block">
                  Applied Query Filters & Methodological Assumptions:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-neutral-400 font-sans">
                  {response.filters_and_assumptions.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* 5. AS OF DATE & SOURCES */}
              <div className="p-4 bg-[#0e1424] border border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px]">
                <div className="space-y-0.5">
                  <span className="text-neutral-500 uppercase text-[10px] font-bold block">Factual As-Of Date</span>
                  <span className="text-white font-bold">{response.as_of_date}</span>
                </div>

                <div className="space-y-0.5 sm:text-right">
                  <span className="text-neutral-500 uppercase text-[10px] font-bold block">Verified Sources</span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {response.sources.map((s, idx) => (
                      <span key={idx} className="text-[10px] bg-neutral-900 border border-white/10 px-2 py-0.5 rounded text-neutral-300">
                        {s.name} ({s.verification_status})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Entity Results Match */}
          {query.trim() && (searchResults.teams.length > 0 || searchResults.players.length > 0) && (
            <div className="pt-2 border-t border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-neutral-500 uppercase block font-bold">
                Direct Franchise & Player Jump:
              </span>
              <div className="flex flex-wrap gap-2">
                {searchResults.teams.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTeam(t.slug);
                      onClose();
                    }}
                    className="p-2 rounded-lg bg-[#131b30] hover:bg-[#182340] border border-white/10 text-xs text-white flex items-center gap-2 cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{t.name}</span>
                    <ArrowRight className="w-3 h-3 text-neutral-500" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
