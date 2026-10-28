import React from 'react';
import type { PaymentStatus } from '../../../domain/models/Merchant';
import { CheckCircle2, Clock, AlertTriangle, Eye } from 'lucide-react';

interface Props {
  status: PaymentStatus;
  amountPaid: number;
  totalFee: number;
  onClick?: () => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusCell: React.FC<Props> = ({
  status,
  amountPaid,
  totalFee,
  onClick,
  interactive = true,
  size = 'md',
  className = '',
}) => {
  const remaining = Math.max(0, totalFee - amountPaid);

  const configs = {
    paid: {
      label: 'PAGADO',
      subtitle: `$${amountPaid.toFixed(0)} / $${totalFee.toFixed(0)}`,
      icon: CheckCircle2,
      // Filled vibrant Green
      bgClasses:
        'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-700/20 border-emerald-500',
      badgeClass: 'bg-emerald-700/40 text-emerald-100',
    },
    pending: {
      label: 'ABONO',
      subtitle: `Resta $${remaining.toFixed(0)}`,
      icon: Clock,
      // Filled vibrant Yellow / Amber
      bgClasses:
        'bg-amber-400 hover:bg-amber-300 text-amber-950 shadow-md shadow-amber-500/20 border-amber-300 font-extrabold',
      badgeClass: 'bg-amber-500/30 text-amber-950',
    },
    unpaid: {
      label: 'DEUDOR',
      subtitle: `Debe $${totalFee.toFixed(0)}`,
      icon: AlertTriangle,
      // Filled vibrant Red
      bgClasses:
        'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-700/20 border-rose-500 font-extrabold',
      badgeClass: 'bg-rose-700/40 text-rose-100',
    },
  }[status];

  const Icon = configs.icon;

  const sizeClasses = {
    sm: 'py-1 px-2.5 text-xs',
    md: 'py-2 px-3 text-xs',
    lg: 'py-3 px-4 text-sm',
  }[size];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive || !onClick}
      aria-label={`Estado: ${configs.label}. Presiona para ver detalle del comercio`}
      className={`w-full text-left rounded-xl font-bold border transition-all duration-150 select-none flex items-center justify-between gap-2 ${
        configs.bgClasses
      } ${sizeClasses} ${
        interactive ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'
      } ${className}`}
      title="Presiona la casilla para abrir detalle del establecimiento"
    >
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="w-4 h-4 shrink-0" />
        <div className="leading-tight truncate">
          <div className="tracking-wider uppercase text-[11px] font-black">{configs.label}</div>
          <div className="text-[10px] opacity-90 font-medium truncate">{configs.subtitle}</div>
        </div>
      </div>

      {interactive && (
        <span
          className={`shrink-0 flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-semibold ${configs.badgeClass}`}
        >
          <Eye className="w-3 h-3" />
          <span className="hidden sm:inline">Ver</span>
        </span>
      )}
    </button>
  );
};
