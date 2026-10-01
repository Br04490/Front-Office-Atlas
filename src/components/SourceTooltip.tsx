import React, { useState } from 'react';
import { SourceService } from '../services';
import { ExternalLink, Database, Info } from 'lucide-react';

interface SourceTooltipProps {
  sourceId: string;
  className?: string;
  onOpenSourceDesk?: (sourceId: string) => void;
}

export const SourceTooltip: React.FC<SourceTooltipProps> = ({
  sourceId,
  className = '',
  onOpenSourceDesk,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const source = SourceService.getSourceById(sourceId);

  if (!source) return null;

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="inline-flex items-center gap-1 text-[10px] font-mono text-neutral-400 hover:text-amber-300 transition-colors cursor-pointer"
        title="View Data Provenance Lineage"
      >
        <Database className="w-3 h-3 text-neutral-500" />
        <span className="underline decoration-dotted decoration-neutral-600">Source Lineage</span>
      </button>

      {isOpen && (
        <div 
          className="absolute left-0 bottom-full mb-1.5 z-50 w-72 p-3 bg-[#11141b] border border-white/15 rounded-lg shadow-2xl text-left text-xs font-sans space-y-2 pointer-events-auto"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-1.5">
            <span className="font-mono text-[10px] text-amber-400 uppercase font-semibold">
              {source.authority_level}
            </span>
            <span className="font-mono text-[10px] text-neutral-400">
              {source.status}
            </span>
          </div>

          <div>
            <div className="font-bold text-white leading-tight">
              {source.source_name}
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5 truncate">
              {source.data_category}
            </div>
          </div>

          <div className="p-2 bg-[#0a0c10] border border-white/5 rounded text-[11px] text-neutral-300 font-mono">
            <div>Interval: {source.refresh_interval}</div>
            <div className="truncate text-neutral-400">Audited: {source.last_attempt}</div>
          </div>

          <div className="text-[10px] text-neutral-400 leading-snug">
            {source.license_or_access_notes}
          </div>

          {onOpenSourceDesk && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenSourceDesk(sourceId);
              }}
              className="w-full text-center py-1 text-[11px] font-mono text-amber-400 hover:underline flex items-center justify-center gap-1 border-t border-white/5 pt-1.5"
            >
              <span>Inspect in Source Desk</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
