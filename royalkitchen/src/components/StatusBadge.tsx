import React from 'react';
import { OrderStatus } from '../types';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs: Record<
    OrderStatus,
    { label: string; bg: string; text: string; border: string; dot: string }
  > = {
    NEW: {
      label: 'NEW ORDER',
      bg: 'bg-blue-950/70',
      text: 'text-blue-400',
      border: 'border-blue-500/40',
      dot: 'bg-blue-400',
    },
    CONFIRMED: {
      label: 'CONFIRMED',
      bg: 'bg-indigo-950/70',
      text: 'text-indigo-400',
      border: 'border-indigo-500/40',
      dot: 'bg-indigo-400',
    },
    PREPARING: {
      label: 'PREPARING',
      bg: 'bg-amber-950/70',
      text: 'text-amber-400',
      border: 'border-amber-500/40',
      dot: 'bg-amber-400',
    },
    READY: {
      label: 'READY FOR DISPATCH',
      bg: 'bg-teal-950/70',
      text: 'text-teal-400',
      border: 'border-teal-500/40',
      dot: 'bg-teal-400',
    },
    OUT_FOR_DELIVERY: {
      label: 'OUT FOR DELIVERY',
      bg: 'bg-orange-950/70',
      text: 'text-orange-400',
      border: 'border-orange-500/40',
      dot: 'bg-orange-400',
    },
    DELIVERED: {
      label: 'DELIVERED',
      bg: 'bg-emerald-950/70',
      text: 'text-emerald-400',
      border: 'border-emerald-500/40',
      dot: 'bg-emerald-400',
    },
    CANCELLED: {
      label: 'CANCELLED',
      bg: 'bg-rose-950/70',
      text: 'text-rose-400',
      border: 'border-rose-500/40',
      dot: 'bg-rose-400',
    },
  };

  const config = configs[status] || configs.NEW;
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold uppercase tracking-wider ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
