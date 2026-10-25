import React, { useState } from 'react';
import type { Merchant } from '../../../domain/models/Merchant';
import { X, DollarSign } from 'lucide-react';

interface Props {
  merchant: Merchant | null;
  onClose: () => void;
  onSubmit: (id: string, amount: number) => Promise<void>;
}

export const QuickAbonoModal: React.FC<Props> = ({ merchant, onClose, onSubmit }) => {
  const [amount, setAmount] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  if (!merchant) return null;
  const remaining = Math.max(0, merchant.totalFee - merchant.amountPaid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    setSubmitting(true);
    try {
      await onSubmit(merchant.id, val);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-base font-bold text-white mb-1">Registrar Abono</h3>
        <p className="text-xs text-slate-400 mb-4">{merchant.name}</p>

        <div className="bg-slate-800/60 p-3 rounded-xl mb-4 text-xs space-y-1">
          <div className="flex justify-between text-slate-300">
            <span>Cuota Total:</span>
            <span className="font-semibold">${merchant.totalFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Abonado:</span>
            <span className="font-semibold text-emerald-400">${merchant.amountPaid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-700/60">
            <span>Resta por pagar:</span>
            <span className="font-bold text-amber-400">${remaining.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Monto a Abonar ($)
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={remaining}
                placeholder={`Máx $${remaining}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !amount}
              className="flex-1 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40"
            >
              {submitting ? 'Guardando...' : 'Aplicar Abono'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
