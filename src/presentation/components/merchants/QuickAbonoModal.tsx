import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import type { Merchant } from '../../../domain/models/Merchant';
import type { CurrencyCode } from '../../../domain/models/Currency';
import { useCurrency } from '../../hooks/useCurrency';
import { DollarSign, FileText, ArrowRightLeft } from 'lucide-react';

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
  const { activeCurrency, rates, convertToUsd, getTriBreakdown } = useCurrency();
  const [payCurrency, setPayCurrency] = useState<CurrencyCode>(activeCurrency);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPayCurrency(activeCurrency);
      setAmount('');
      setNote('');
    }
  }, [isOpen, activeCurrency]);

  if (!merchant) return null;

  const remainingUsd = Math.max(0, merchant.totalFee - merchant.amountPaid);
  const breakdown = getTriBreakdown(remainingUsd);

  // Límite máximo según la moneda seleccionada
  const maxInSelectedCurrency =
    payCurrency === 'VES'
      ? remainingUsd * rates.usdToVes
      : payCurrency === 'COP'
      ? remainingUsd * rates.usdToCop
      : remainingUsd;

  const numericInput = parseFloat(amount) || 0;
  const calculatedUsd = convertToUsd(numericInput, payCurrency);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numericInput <= 0 || calculatedUsd <= 0) return;
    setSubmitting(true);
    try {
      let finalNote = note.trim();
      if (payCurrency === 'VES') {
        const vesTag = `[Pago Bs. ${numericInput.toLocaleString('es-VE')} @ BCV ${rates.usdToVes.toFixed(2)}]`;
        finalNote = finalNote ? `${finalNote} ${vesTag}` : vesTag;
      } else if (payCurrency === 'COP') {
        const copTag = `[Pago COP $${Math.round(numericInput).toLocaleString('es-CO')} @ ${Math.round(rates.usdToCop)}]`;
        finalNote = finalNote ? `${finalNote} ${copTag}` : copTag;
      }

      let finalUsdAmount = Math.round(calculatedUsd * 100) / 100;
      if (Math.abs(remainingUsd - finalUsdAmount) <= 0.05) {
        finalUsdAmount = remainingUsd;
      }

      await onSubmit(merchant.id, finalUsdAmount, finalNote || undefined);
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
        {/* Resumen del saldo en las 3 monedas */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl space-y-1.5 border border-slate-200 dark:border-slate-700/60">
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Cuota Total:</span>
            <span className="font-bold text-slate-900 dark:text-white">${merchant.totalFee.toFixed(2)} USD</span>
          </div>
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Abonado Previamente:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">${merchant.amountPaid.toFixed(2)} USD</span>
          </div>
          <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-200 dark:border-slate-700 font-bold">
            <span className="text-slate-700 dark:text-slate-300">Resta por pagar:</span>
            <div className="text-right">
              <span className="text-rose-600 dark:text-rose-400 text-sm font-black">{breakdown.usd}</span>
              <p className="text-[10px] text-slate-400">{breakdown.ves} • {breakdown.cop}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Selector de moneda del abono */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              ¿En qué moneda recibió el pago?
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setPayCurrency('USD')}
                className={`py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                  payCurrency === 'USD'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                🇺🇸 USD ($)
              </button>
              <button
                type="button"
                onClick={() => setPayCurrency('VES')}
                className={`py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                  payCurrency === 'VES'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                🇻🇪 Bs. (BCV)
              </button>
              <button
                type="button"
                onClick={() => setPayCurrency('COP')}
                className={`py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                  payCurrency === 'COP'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                🇨🇴 COP ($)
              </button>
            </div>
          </div>

          {/* Campo de Monto */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Monto recibido en {payCurrency === 'VES' ? 'Bolívares (Bs.)' : payCurrency === 'COP' ? 'Pesos (COP)' : 'Dólares (USD)'} *
              </label>
              <button
                type="button"
                onClick={() => setAmount(Math.round(maxInSelectedCurrency * 100) / 100 + '')}
                className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Pagar Totalidad
              </button>
            </div>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                step={payCurrency === 'COP' ? '100' : '0.01'}
                min="0.01"
                max={Math.ceil(maxInSelectedCurrency * 100) / 100}
                placeholder={`Máx ${maxInSelectedCurrency.toLocaleString()} ${payCurrency}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Conversión en tiempo real */}
            {numericInput > 0 && (
              <div className="mt-1.5 p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-900/40 flex items-center gap-1.5 text-indigo-900 dark:text-indigo-300">
                <ArrowRightLeft className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                <span className="text-[11px] font-semibold">
                  Equivale a <strong className="font-black text-indigo-600 dark:text-indigo-400">${calculatedUsd.toFixed(2)} USD</strong>
                  {payCurrency === 'VES' && ` (Tasa BCV: Bs. ${rates.usdToVes.toFixed(2)})`}
                  {payCurrency === 'COP' && ` (Tasa COP: $${Math.round(rates.usdToCop)})`}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nota o Referencia (Opcional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Ej: Pago Móvil Banesco 4930 / Efectivo en tienda"
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
              disabled={submitting || !amount || numericInput <= 0}
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
