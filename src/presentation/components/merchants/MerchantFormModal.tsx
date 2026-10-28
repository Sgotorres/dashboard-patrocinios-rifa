import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { LogoFetcherInput } from './LogoFetcherInput';
import type { Merchant, UpdateMerchantDTO } from '../../../domain/models/Merchant';

interface Props {
  isOpen: boolean;
  initialData: Merchant | null;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateMerchantDTO) => Promise<void>;
}

export const MerchantFormModal: React.FC<Props> = ({
  isOpen,
  initialData,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [socialUrl, setSocialUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [ticketsCount, setTicketsCount] = useState('1');
  const [ticketPrice, setTicketPrice] = useState('10');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAddress(initialData.address);
      setPhone(initialData.phone);
      setSocialUrl(initialData.socialUrl || '');
      setLogoUrl(initialData.logoUrl || '');
      setTicketsCount(String(initialData.ticketsCount));
      setTicketPrice(String(initialData.ticketPrice));
    }
  }, [initialData, isOpen]);

  if (!initialData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const tickets = Math.max(1, parseInt(ticketsCount, 10) || 1);
      const price = Math.max(0, parseFloat(ticketPrice) || 0);
      await onSubmit(initialData.id, {
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        socialUrl: socialUrl.trim(),
        logoUrl: logoUrl.trim(),
        ticketsCount: tickets,
        ticketPrice: price,
        totalFee: tickets * price,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Información de Comercio"
      subtitle={initialData.name}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <LogoFetcherInput
          businessName={name}
          logoUrl={logoUrl}
          socialUrl={socialUrl}
          onLogoChange={setLogoUrl}
          onSocialChange={setSocialUrl}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nombre del Comercio *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Teléfono / WhatsApp *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Dirección del Establecimiento *</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Cantidad Tickets</label>
            <input
              type="number"
              min="1"
              value={ticketsCount}
              onChange={(e) => setTicketsCount(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Precio Unitario ($)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={ticketPrice}
              onChange={(e) => setTicketPrice(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-40 cursor-pointer shadow-xs"
          >
            {submitting ? 'Guardando...' : 'Actualizar Cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
