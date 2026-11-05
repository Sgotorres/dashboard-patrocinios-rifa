import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { LogoFetcherInput } from './LogoFetcherInput';
import type { CurrencyCode, Merchant, UpdateMerchantDTO } from '../../../domain/models/Merchant';

interface Props {
  isOpen: boolean;
  initialData: Merchant | null;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateMerchantDTO) => Promise<void>;
}

interface FormContentProps {
  initialData: Merchant;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateMerchantDTO) => Promise<void>;
}

const MerchantFormContent: React.FC<FormContentProps> = ({ initialData, onClose, onSubmit }) => {
  const [name, setName] = useState(initialData.name);
  const [address, setAddress] = useState(initialData.address);
  const [phone, setPhone] = useState(initialData.phone);
  const [currency, setCurrency] = useState<CurrencyCode>(initialData.currency || 'COP');
  const [socialUrl, setSocialUrl] = useState(initialData.socialUrl || '');
  const [logoUrl, setLogoUrl] = useState(initialData.logoUrl || '');
  const [ticketsCount, setTicketsCount] = useState(String(initialData.ticketsCount));
  const [ticketPrice, setTicketPrice] = useState(String(initialData.ticketPrice));
  const [submitting, setSubmitting] = useState(false);

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
        currency,
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
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {/* Selector de Moneda */}
      <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-200 block">Moneda del Patrocinio</span>
          <span className="text-[11px] text-slate-400">Modifica si este cliente pautó en Pesos o en Dólares</span>
        </div>
        <div className="inline-flex gap-1 bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setCurrency('COP')}
            className={`px-3 py-1 rounded-md font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 ${
              currency === 'COP' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <span>🇨🇴</span>
            <span>Pesos (COP)</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrency('USD')}
            className={`px-3 py-1 rounded-md font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 ${
              currency === 'USD' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <span>💵</span>
            <span>Dólares (USD)</span>
          </button>
        </div>
      </div>

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
          <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Cantidad de Espacios</label>
          <input
            type="number"
            min="1"
            value={ticketsCount}
            onChange={(e) => setTicketsCount(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Precio por Espacio ({currency})</label>
          <input
            type="number"
            min="0"
            step={currency === 'COP' ? '1000' : '0.5'}
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
  );
};

export const MerchantFormModal: React.FC<Props> = ({
  isOpen,
  initialData,
  onClose,
  onSubmit,
}) => {
  if (!isOpen || !initialData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Información de Patrocinador"
      subtitle={initialData.name}
      maxWidth="md"
    >
      <MerchantFormContent
        key={initialData.id}
        initialData={initialData}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
};
