import React from 'react';
import type { PaymentStatus } from '../../../domain/models/Merchant';

interface Props {
  status: PaymentStatus;
  onChange: (status: PaymentStatus) => void;
  initialAbono: string;
  onAbonoChange: (val: string) => void;
  totalAmount: number;
}

export const PaymentStatusSelector: React.FC<Props> = ({
  status,
  onChange,
  initialAbono,
  onAbonoChange,
  totalAmount,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Estado de Pago Inicial
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onChange('unpaid')}
            className={`py-2 px-2 rounded-xl font-bold border text-center transition-all cursor-pointer ${
              status === 'unpaid'
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            Rojo (Deudor)
          </button>
          <button
            type="button"
            onClick={() => onChange('pending')}
            className={`py-2 px-2 rounded-xl font-bold border text-center transition-all cursor-pointer ${
              status === 'pending'
                ? 'bg-amber-400 text-amber-950 border-amber-400 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            Amarillo (Abono)
          </button>
          <button
            type="button"
            onClick={() => onChange('paid')}
            className={`py-2 px-2 rounded-xl font-bold border text-center transition-all cursor-pointer ${
              status === 'paid'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            Verde (Pagado)
          </button>
        </div>
      </div>

      {status === 'pending' && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
          <label className="block font-semibold text-amber-700 dark:text-amber-300">
            Monto Abonado ($)
          </label>
          <input
            type="number"
            step="0.5"
            min="0.5"
            max={totalAmount}
            value={initialAbono}
            onChange={(e) => onAbonoChange(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-amber-400 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white font-bold"
          />
        </div>
      )}
    </div>
  );
};
