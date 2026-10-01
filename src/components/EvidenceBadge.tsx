import React from 'react';
import { EvidenceStatus } from '../types';

interface EvidenceBadgeProps {
  state: EvidenceStatus | string;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({
  state,
  size = 'md',
  showDot = true,
}) => {
  // Map normalized status keys
  let normalized = state.toString().toUpperCase().replace(/ /g, '_');
  let label = state;
  let dotColor = 'bg-amber-400';
  let textColor = 'text-amber-300';
  let borderColor = 'border-amber-500/25';
  let bgColor = 'bg-amber-500/10';

  if (normalized === 'VERIFIED_CURRENT' || normalized === 'VERIFIED_CURRENT_DATA') {
    label = 'VERIFIED CURRENT';
    dotColor = 'bg-emerald-400';
    textColor = 'text-emerald-400';
    borderColor = 'border-emerald-500/25';
    bgColor = 'bg-emerald-500/10';
  } else if (normalized === 'REPORTED_CURRENT' || normalized === 'REPORTED_CURRENT_DATA') {
    label = 'REPORTED CURRENT';
    dotColor = 'bg-sky-400';
    textColor = 'text-sky-300';
    borderColor = 'border-sky-500/25';
    bgColor = 'bg-sky-500/10';
  } else if (normalized === 'CALCULATED' || normalized === 'CALCULATED_ESTIMATE') {
    label = 'CALCULATED';
    dotColor = 'bg-purple-400';
    textColor = 'text-purple-300';
    borderColor = 'border-purple-500/25';
    bgColor = 'bg-purple-500/10';
  } else if (normalized === 'SCENARIO' || normalized === 'CALCULATED_ESTIMATE_/_SCENARIO') {
    label = 'SCENARIO PROJECTION';
    dotColor = 'bg-indigo-400';
    textColor = 'text-indigo-300';
    borderColor = 'border-indigo-500/25';
    bgColor = 'bg-indigo-500/10';
  } else if (normalized === 'INCOMPLETE' || normalized === 'INCOMPLETE_/_UNAVAILABLE') {
    label = 'INCOMPLETE / UNAVAILABLE';
    dotColor = 'bg-neutral-500';
    textColor = 'text-neutral-400';
    borderColor = 'border-neutral-700/60';
    bgColor = 'bg-neutral-800/50';
  } else if (normalized === 'UNAVAILABLE' || normalized === 'DATA_NOT_CONNECTED') {
    label = 'DATA NOT CONNECTED';
    dotColor = 'bg-rose-500';
    textColor = 'text-neutral-400';
    borderColor = 'border-neutral-700/60';
    bgColor = 'bg-neutral-800/50';
  } else if (normalized === 'VERIFICATION_REQUIRED' || normalized === 'SOURCE_PENDING') {
    label = 'SOURCE PENDING';
    dotColor = 'bg-amber-400';
    textColor = 'text-amber-300';
    borderColor = 'border-amber-500/30';
    bgColor = 'bg-amber-500/10';
  }

  const sizeClasses = size === 'sm' 
    ? 'text-[10px] px-2 py-0.5 tracking-wider' 
    : 'text-xs px-2.5 py-1 tracking-wide';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium uppercase border rounded ${borderColor} ${bgColor} ${textColor} ${sizeClasses} select-none`}
      title={`Data Provenance Status: ${state}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0 animate-pulse`} />}
      <span>{label}</span>
    </span>
  );
};
