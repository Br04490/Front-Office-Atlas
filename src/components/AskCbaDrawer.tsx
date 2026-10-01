import React, { useState, useEffect } from 'react';
import { CbaAgentResponse, Player, Team } from '../types';
import { CbaService } from '../services';
import { EvidenceBadge } from './EvidenceBadge';
import { 
  X, 
  Sparkles, 
  Send, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Clock, 
  ShieldAlert 
} from 'lucide-react';

interface AskCbaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  initialPlayer?: Player;
  currentTeam?: Team;
}

export const AskCbaDrawer: React.FC<AskCbaDrawerProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  initialPlayer,
  currentTeam,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [history, setHistory] = useState<CbaAgentResponse[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleExecuteQuery(initialQuery);
    }
  }, [initialQuery]);

  if (!isOpen) return null;

  const quickPrompts = [
    `Can ${currentTeam?.name || 'Houston'} aggregate these salaries?`,
    'What happens if this team crosses the first apron?',
    'Explain second-apron trade restrictions.',
    'Can this player be extended under Article XI?',
    'What incoming salary can we receive in a trade?',
  ];

  const handleExecuteQuery = (textToRun: string) => {
    if (!textToRun.trim()) return;
    setIsProcessing(true);

    setTimeout(() => {
      const response = CbaService.queryCbaAgent(textToRun, currentTeam?.slug);
      setHistory((prev) => [response, ...prev]);
      setIsProcessing(false);
      setQuery('');
    }, 250);
  };

  const getAnswerBadge = (state: string) => {
    switch (state) {
      case 'YES':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> YES
          </span>
        );
      case 'NO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono text-xs font-bold">
            <ShieldAlert className="w-3.5 h-3.5" /> NO
          </span>
        );
      case 'CONDITIONAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
            <AlertTriangle className="w-3.5 h-3.5" /> CONDITIONAL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 border border-neutral-700 text-neutral-300 font-mono text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5" /> INSUFFICIENT INFORMATION
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#0e1116] border-l border-white/10 h-full flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-[#12161e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  ATLAS CBA
                </h2>
                <span className="text-[10px] font-mono uppercase bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded border border-neutral-700">
                  AI Rule Intelligence
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                NBA Collective Bargaining Agreement Intelligence · Ratified 2023-2030
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

        {/* Global Mandatory Legal Screening Banner */}
        <div className="px-6 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-[11px] font-mono text-amber-300">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-semibold uppercase tracking-wider">
              SCREENING RESULT — NOT OFFICIAL NBA LEAGUE APPROVAL
            </span>
          </div>
          <span className="text-neutral-400 hidden sm:inline">2023 CBA Ed.</span>
        </div>

        {/* Active Context Bar */}
        {(currentTeam || initialPlayer) && (
          <div className="px-6 py-2 bg-[#131720] border-b border-white/5 flex items-center gap-4 text-xs font-mono text-neutral-400 overflow-x-auto">
            <span className="text-neutral-500 uppercase text-[10px]">Context Loaded:</span>
            {currentTeam && (
              <span className="text-neutral-200">
                Team: <strong className="text-amber-300">{currentTeam.name}</strong>
              </span>
            )}
            {initialPlayer && (
              <span className="text-neutral-200">
                Player: <strong className="text-amber-300">{initialPlayer.full_name}</strong>
              </span>
            )}
            <span className="text-neutral-200">
              Season: <strong className="text-amber-300">2026-27</strong>
            </span>
          </div>
        )}

        {/* Query Input Box */}
        <div className="p-4 border-b border-white/10 bg-[#10141b]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExecuteQuery(query);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask any CBA question (e.g. Can Houston aggregate salaries?)..."
              className="flex-1 bg-[#161a23] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400/60 transition-colors"
            />
            <button
              type="submit"
              disabled={isProcessing || !query.trim()}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Query</span>
            </button>
          </form>

          {/* Quick Prompts */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="text-[10px] font-mono text-neutral-500 uppercase shrink-0">
              Quick Scenarios:
            </span>
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleExecuteQuery(p)}
                className="whitespace-nowrap px-2.5 py-1 rounded bg-[#171c26] hover:bg-[#1f2533] border border-white/5 hover:border-white/20 text-neutral-300 text-xs transition-colors shrink-0"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {history.length === 0 ? (
            <div className="p-8 border border-dashed border-white/10 rounded-xl text-center space-y-4 bg-[#11141b]">
              <BookOpen className="w-10 h-10 text-neutral-500 mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-neutral-200">
                  CBA Intelligence Ready
                </h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1">
                  Query the ratified 2023 NBA-NBPA Collective Bargaining Agreement rules on aprons, trade matching, exception eligibility, extensions, and roster limits.
                </p>
              </div>
              <div className="pt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-400">
                <Clock className="w-3 h-3 text-neutral-500" />
                <span>CBA KNOWLEDGE BASE ENGINE ONLINE</span>
              </div>
            </div>
          ) : (
            history.map((item, idx) => (
              <div 
                key={idx}
                className="bg-[#131720] border border-white/10 rounded-xl p-5 space-y-4 shadow-lg text-left"
              >
                {/* Query Title & Determination State */}
                <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block">
                      Query
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      "{item.query}"
                    </h3>
                  </div>
                  <div>{getAnswerBadge(item.answer_state)}</div>
                </div>

                {/* Structured ANSWER */}
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block mb-1">
                    ANSWER
                  </span>
                  <p className="text-sm font-semibold text-neutral-100 leading-snug">
                    {item.answer}
                  </p>
                </div>

                {/* PLAIN-ENGLISH EXPLANATION */}
                <div className="p-3 bg-[#0d1016] border border-white/5 rounded-lg text-xs text-neutral-300 leading-relaxed">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                    Plain-English Explanation
                  </span>
                  {item.plain_english_explanation}
                </div>

                {/* RULE BASIS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#0d1016] border border-white/5 rounded-lg">
                    <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                      Rule Basis
                    </span>
                    <div className="font-mono text-amber-300 font-semibold">
                      {item.rule_basis.article}, {item.rule_basis.section}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      {item.rule_basis.citation}
                    </div>
                  </div>
                  <div className="p-3 bg-[#0d1016] border border-white/5 rounded-lg">
                    <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                      Calculation Formula
                    </span>
                    <div className="font-mono text-neutral-200">
                      {item.calculation || 'No mechanical formula required.'}
                    </div>
                  </div>
                </div>

                {/* TEAM IMPACT */}
                <div className="text-xs">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                    Team Operational Impact
                  </span>
                  <p className="text-neutral-300 bg-[#0d1016] p-3 rounded-lg border border-white/5">
                    {item.team_impact}
                  </p>
                </div>

                {/* MISSING INFORMATION */}
                {item.missing_information.length > 0 && (
                  <div className="text-xs">
                    <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                      Missing Information For Official Confirmation
                    </span>
                    <ul className="list-disc list-inside text-neutral-400 space-y-0.5 bg-[#0d1016] p-3 rounded-lg border border-white/5">
                      {item.missing_information.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Footer with Evidence Status & Mandatory Disclaimer */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                  <EvidenceBadge state={item.evidence_status} size="sm" />
                  <span className="text-amber-500/80 font-semibold uppercase">
                    {item.disclaimer}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
