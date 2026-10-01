import React, { useState } from 'react';
import { SourceService } from '../services';
import { SourceRecord, SourceStatus } from '../types';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { 
  Database, 
  ExternalLink, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Server,
  X,
  FileText
} from 'lucide-react';

export const SourceDeskView: React.FC = () => {
  const sources = SourceService.getAllSources();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeSourceModal, setActiveSourceModal] = useState<SourceRecord | null>(null);

  const categories = ['ALL', ...Array.from(new Set(sources.map((s) => s.data_category)))];

  const filteredSources = selectedCategory === 'ALL'
    ? sources
    : sources.filter((s) => s.data_category === selectedCategory);

  const getStatusBadge = (status: SourceStatus) => {
    switch (status) {
      case 'LIVE':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> LIVE
          </span>
        );
      case 'STALE':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> STALE
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> ERROR
          </span>
        );
      case 'MANUAL':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> MANUAL / AUDITED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-neutral-400 bg-neutral-800 border border-neutral-700 px-2 py-0.5 rounded">
            UNAVAILABLE
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Database className="w-6 h-6 text-amber-400" />
              <span>Source Desk & Data Provenance Registry</span>
            </h1>
            <span className="font-mono text-xs text-neutral-400 uppercase bg-neutral-800 border border-neutral-700 px-2 py-0.5 rounded">
              Audited Lineage
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Every changing data field throughout Front Office Atlas traces back to verified league feeds, ratified union texts, or audited front-office ledgers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <EvidenceBadge state="VERIFIED_CURRENT" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-[#12161f] p-1 rounded-lg border border-white/10 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Source Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSources.map((source) => (
          <div
            key={source.id}
            onClick={() => setActiveSourceModal(source)}
            className="bg-[#12161f] hover:bg-[#161b25] border border-white/10 hover:border-white/25 rounded-xl p-5 space-y-4 text-left flex flex-col justify-between cursor-pointer transition-all group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">
                    {source.data_category}
                  </span>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                    {source.source_name}
                  </h3>
                </div>
                <div>{getStatusBadge(source.status)}</div>
              </div>

              {/* Source URL & Authority */}
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-3">
                <span className="text-neutral-300 font-semibold">{source.authority_level}</span>
                <span className="text-neutral-600">·</span>
                <span className="text-neutral-400">Interval: {source.refresh_interval}</span>
              </div>

              {/* Field Coverage Lineage */}
              <div className="p-3 bg-[#0d1016] border border-white/5 rounded-lg space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                  Field Coverage Lineage:
                </span>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-300 font-mono">
                  {source.field_coverage.map((f, i) => (
                    <React.Fragment key={f}>
                      <span>{f}</span>
                      {i < source.field_coverage.length - 1 && (
                        <span className="text-neutral-600">·</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Access Notes */}
              <div className="mt-3 text-xs text-neutral-400 leading-relaxed line-clamp-2">
                {source.license_or_access_notes}
              </div>
            </div>

            {/* Timestamps & Attempt Details */}
            <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] font-mono text-neutral-500 mt-2">
              <span>Last Attempt: {source.last_attempt}</span>
              <span className="text-amber-400 group-hover:underline">
                Inspect Lineage Record →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Source Record Drawer / Modal */}
      {activeSourceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12161f] border border-white/15 rounded-xl p-6 max-w-lg w-full space-y-4 text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">
                  Source Lineage Record
                </span>
                <h3 className="font-mono text-base font-bold text-white">
                  {activeSourceModal.source_name}
                </h3>
              </div>
              <button
                onClick={() => setActiveSourceModal(null)}
                className="text-neutral-400 hover:text-white p-1 rounded font-mono text-xs"
              >
                Close (Esc)
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-300">
              <div className="flex items-center justify-between p-3 bg-[#0d1016] border border-white/5 rounded-lg font-mono">
                <span>Authority Level: <strong>{activeSourceModal.authority_level}</strong></span>
                {getStatusBadge(activeSourceModal.status)}
              </div>

              <div className="p-3 bg-[#0d1016] border border-white/5 rounded-lg space-y-1">
                <span className="font-mono text-[10px] text-neutral-500 uppercase block">Canonical Resource URL</span>
                <a
                  href={activeSourceModal.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-300 hover:underline flex items-center gap-1 font-mono text-[11px] break-all"
                >
                  <span>{activeSourceModal.source_url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>

              <div className="p-3 bg-[#0d1016] border border-white/5 rounded-lg space-y-1">
                <span className="font-mono text-[10px] text-neutral-500 uppercase block">Audited Field Coverage</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeSourceModal.field_coverage.map(fc => (
                    <span key={fc} className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-300">
                      {fc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#0d1016] border border-white/5 rounded-lg space-y-1 text-neutral-300">
                <span className="font-mono text-[10px] text-neutral-500 uppercase block">Legal / Access Notes</span>
                <p className="text-[11px] leading-relaxed">{activeSourceModal.license_or_access_notes}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-mono text-neutral-500">
                <span>Sync Interval: {activeSourceModal.refresh_interval}</span>
                <span>Audit State: {activeSourceModal.failure_state || 'Nominal'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
