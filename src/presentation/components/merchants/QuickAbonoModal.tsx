import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { Merchant } from '../../../domain/models/Merchant';
import { DollarSign, FileText } from 'lucide-react';

interface Props {
  merchant: Merchant | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, amount: number, note?: string) => Promise<Merchant>;
}

export const QuickAbonoModal: React.FC<Props> = ({
  merchant,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!merchant) return null;

  const remaining = Math.max(0, merchant.totalFee - merchant.amountPaid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    setSubmitting(true);
    try {
      await onSubmit(merchant.id, val, note.trim() || undefined);
      setAmount('');
      setNote('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Abono a Comercio"
      subtitle={merchant.name}
      maxWidth="sm"
    >
      <div className="space-y-4 text-xs">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl space-y-1.5 border border-slate-200 dark:border-slate-700/60">
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Cuota Total:</span>
            <span className="font-bold text-slate-900 dark:text-white">${merchant.totalFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Abonado Previamente:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">${merchant.amountPaid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 font-bold">
            <span className="text-slate-700 dark:text-slate-300">Resta por pagar:</span>
            <span className="text-rose-600 dark:text-rose-400 text-sm">${remaining.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Monto a Abonar ($) *
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                step="0.5"
                min="0.5"
                max={remaining}
                placeholder={`Máx $${remaining.toFixed(2)}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nota o Concepto (Opcional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Ej: Pago Móvil ref 8492 / Efectivo en tienda"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !amount}
              className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold shadow-md shadow-amber-500/20 disabled:opacity-40 transition-colors cursor-pointer"
            >
              {submitting ? 'Guardando...' : 'Aplicar Abono'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
