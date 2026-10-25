import React from 'react';
import type { PaymentStatus } from '../../../domain/models/Merchant';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface Props {
  status: PaymentStatus;
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const config = {
    paid: {
      label: 'Pagado',
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2,
    },
    pending: {
      label: 'Pendiente',
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: Clock,
    },
    unpaid: {
      label: 'No ha pagado',
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      icon: AlertCircle,
    },
  }[status];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};
