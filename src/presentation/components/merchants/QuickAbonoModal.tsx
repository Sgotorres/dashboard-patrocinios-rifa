import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { Merchant } from '../../../domain/models/Merchant';
import { DollarSign, FileText, CheckCircle2, MessageCircle } from 'lucide-react';
import { formatMoney } from '../../../core/utils/currencyFormatter';

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
  const [receipt, setReceipt] = useState<{ amount: number; remaining: number; totalFee: number } | null>(null);

  if (!merchant) return null;

  const currency = merchant.currency || 'COP';
  const remaining = Math.max(0, merchant.totalFee - merchant.amountPaid);

  const handleClose = () => {
    setAmount('');
    setNote('');
    setReceipt(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    setSubmitting(true);
    try {
      const updated = await onSubmit(merchant.id, val, note.trim() || undefined);
      const newRemaining = Math.max(0, updated.totalFee - updated.amountPaid);
      setReceipt({
        amount: val,
        remaining: newRemaining,
        totalFee: updated.totalFee,
      });
      setAmount('');
      setNote('');
    } finally {
      setSubmitting(false);
    }
  };

  // Mensaje y link para WhatsApp
  const cleanPhone = merchant.phone.replace(/[^0-9]/g, '');
  const waReceiptMsg = receipt
    ? encodeURIComponent(
        `¡Hola *${merchant.name}*! 👋\n\n` +
        `Le confirmamos la recepción de su abono por un valor de *${formatMoney(receipt.amount, currency, true)}* para su publicidad en pantalla de cine y boletos del sorteo para el viaje a la playa.\n\n` +
        `📊 *Resumen de Cuenta:*\n` +
        `• Cuota Total: ${formatMoney(receipt.totalFee, currency, true)}\n` +
        `• Nuevo Saldo Pendiente: ${formatMoney(receipt.remaining, currency, true)}\n` +
        (receipt.remaining <= 0
          ? `🎉 *¡Felicidades! Su patrocinio ha quedado completamente solvente.*\n\n`
          : `\n`) +
        `¡Muchas gracias por su valioso apoyo a nuestra actividad de cine!`
      )
    : '';
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${waReceiptMsg}` : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={receipt ? '¡Abono Registrado Exitosamente!' : 'Registrar Abono a Patrocinador'}
      subtitle={`${merchant.name} (${currency})`}
      maxWidth="sm"
    >
      <div className="space-y-4 text-xs">
        {receipt ? (
          /* Pantalla de Confirmación y Recibo */
          <div className="space-y-4 py-2 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                Se registró el abono de {formatMoney(receipt.amount, currency, true)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {receipt.remaining > 0
                  ? `Nuevo saldo pendiente: ${formatMoney(receipt.remaining, currency, true)}`
                  : '🎉 El patrocinador ha quedado totalmente solvente (Pagado)'}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-left text-[11px] space-y-1">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Patrocinador:</span>
                <span className="font-bold text-slate-900 dark:text-white">{merchant.name}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Moneda:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{currency}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Teléfono:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{merchant.phone || 'No registrado'}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>Monto Abonado:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  +{formatMoney(receipt.amount, currency, true)}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {cleanPhone && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-colors shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar Recibo por WhatsApp</span>
                </a>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                Listo / Cerrar
              </button>
            </div>
          </div>
        ) : (
          /* Formulario de Abono */
          <>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl space-y-1.5 border border-slate-200 dark:border-slate-700/60">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Total Publicidad:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatMoney(merchant.totalFee, currency, true)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Abonado Previamente:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(merchant.amountPaid, currency, true)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 font-bold">
                <span className="text-slate-700 dark:text-slate-300">Resta por pagar:</span>
                <span className="text-rose-600 dark:text-rose-400 text-sm">{formatMoney(remaining, currency, true)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monto a Abonar ({currency}) *
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step={currency === 'COP' ? '1000' : '0.5'}
                    min={currency === 'COP' ? '1000' : '0.5'}
                    max={remaining}
                    placeholder={`Máx ${formatMoney(remaining, currency)}`}
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
                    placeholder="Ej: Transferencia Bancolombia / Efectivo taquilla cine"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
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
          </>
        )}
      </div>
    </Modal>
  );
};
