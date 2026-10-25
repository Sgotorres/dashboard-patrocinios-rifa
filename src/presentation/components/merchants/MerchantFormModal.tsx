import React, { useEffect, useState } from 'react';
import type { CreateMerchantDTO, Merchant, PaymentStatus } from '../../../domain/models/Merchant';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  initialData: Merchant | null;
  onClose: () => void;
  onSubmit: (data: CreateMerchantDTO) => Promise<void>;
}

export const MerchantFormModal: React.FC<Props> = ({ isOpen, initialData, onClose, onSubmit }) => {
  const [form, setForm] = useState({ name: '', address: '', phone: '', status: 'unpaid' as PaymentStatus, fee: '50', paid: '0' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({ name: initialData.name, address: initialData.address, phone: initialData.phone, status: initialData.paymentStatus, fee: String(initialData.totalFee), paid: String(initialData.amountPaid) });
    } else {
      setForm({ name: '', address: '', phone: '', status: 'unpaid', fee: '50', paid: '0' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleStatusChange = (status: PaymentStatus) => {
    const feeNum = parseFloat(form.fee) || 50;
    const paidVal = status === 'paid' ? String(feeNum) : status === 'unpaid' ? '0' : form.paid;
    setForm(prev => ({ ...prev, status, paid: paidVal }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ name: form.name, address: form.address, phone: form.phone, paymentStatus: form.status, totalFee: parseFloat(form.fee) || 0, amountPaid: parseFloat(form.paid) || 0 });
      onClose();
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white p-1"><X className="w-5 h-5" /></button>
        <h3 className="text-lg font-bold text-white mb-4">{initialData ? 'Editar Comercio' : 'Registrar Nuevo Comercio'}</h3>
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Nombre del Comercio *</label>
            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Panadería San Juan" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block font-medium text-slate-300 mb-1">Dirección *</label>
            <input type="text" required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Ej: Av. Bolívar #142" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block font-medium text-slate-300 mb-1">Teléfono / WhatsApp *</label>
            <input type="tel" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Ej: +58 412 1234567" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Estado de Pago</label>
              <select value={form.status} onChange={e => handleStatusChange(e.target.value as PaymentStatus)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500">
                <option value="unpaid">No ha pagado</option>
                <option value="pending">Pendiente (abono)</option>
                <option value="paid">Pagado</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Cuota Total ($)</label>
              <input type="number" min="1" step="0.01" value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          {form.status === 'pending' && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <label className="block font-medium text-amber-300 mb-1">Monto Abonado Actualmente ($)</label>
              <input type="number" step="0.01" min="0.01" max={parseFloat(form.fee) || 50} value={form.paid} onChange={e => setForm({ ...form, paid: e.target.value })} className="w-full bg-slate-800 border border-amber-500/40 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400" />
            </div>
          )}
          <div className="flex gap-2 pt-3">
            <button type="button" onClick={onClose} className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700">Cancelar</button>
            <button type="submit" disabled={submitting} className="flex-1 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40">{submitting ? 'Guardando...' : initialData ? 'Actualizar' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
