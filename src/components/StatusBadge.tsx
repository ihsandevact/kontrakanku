import React from 'react';
import { LeaseStatus } from '@/types/database';
import { getStatusBadge } from '@/lib/formatters';

interface StatusBadgeProps {
  status: LeaseStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const badge = getStatusBadge(status);
  const isUrgent = status === 'due_soon' || status === 'overdue';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold border backdrop-blur-xs transition whitespace-nowrap shrink-0 ${badge.bgClass} ${badge.colorClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor} ${isUrgent ? 'animate-pulse' : ''}`} />
      <span>{badge.label}</span>
    </span>
  );
};
