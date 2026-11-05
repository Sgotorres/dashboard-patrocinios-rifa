import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { LogoFetcherInput } from './LogoFetcherInput';
import { TicketPricingFields } from './TicketPricingFields';
import { PaymentStatusSelector } from './PaymentStatusSelector';
import type { CreateMerchantDTO, Merchant, PaymentStatus } from '../../../domain/models/Merchant';
import { isPhoneDuplicate } from '../../../core/utils/textUtils';
import { Store, PlusCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultTicketPrice: number;
  existingMerchants: Merchant[];
  onRegisterNewMerchant: (dto: CreateMerchantDTO) => Promise<Merchant>;
  onAddTicketsToExisting: (
    id: string,
    count: number,
    price?: number,
    paid?: number,
    note?: string
  ) => Promise<Merchant>;
}

export const AddTicketModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultTicketPrice,
  existingMerchants,
  onRegisterNewMerchant,
  onAddTicketsToExisting,
}) => {
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [socialUrl, setSocialUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [ticketsCount, setTicketsCount] = useState('1');
  const [ticketPrice, setTicketPrice] = useState(String(defaultTicketPrice || 10));
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [initialAbono, setInitialAbono] = useState('0');
  const [submitting, setSubmitting] = useState(false);

  const parsedTickets = Math.max(1, parseInt(ticketsCount, 10) || 1);
  const parsedPrice = Math.max(0, parseFloat(ticketPrice) || 0);
  const totalAmount = parsedTickets * parsedPrice;

  const duplicate = mode === 'new' && phone.trim().length >= 7
    ? existingMerchants.find((m) => isPhoneDuplicate(m.phone, phone))
    : null;

  const handleSelectExisting = (id: string) => {
    setSelectedMerchantId(id);
    const found = existingMerchants.find((m) => m.id === id);
    if (found) setTicketPrice(String(found.ticketPrice));
  };

  const handleStatusChange = (status: PaymentStatus) => {
    setPaymentStatus(status);
    if (status === 'paid') setInitialAbono(String(totalAmount));
    else if (status === 'unpaid') setInitialAbono('0');
  };

  const resetForm = () => {
    setName(''); setAddress(''); setPhone(''); setSocialUrl(''); setLogoUrl('');
    setTicketsCount('1'); setPaymentStatus('unpaid'); setInitialAbono('0');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const abonoVal = paymentStatus === 'paid' ? totalAmount : paymentStatus === 'pending' ? parseFloat(initialAbono) || 0 : 0;
      if (mode === 'new') {
        await onRegisterNewMerchant({
          name: name.trim(), address: address.trim(), phone: phone.trim(),
          socialUrl: socialUrl.trim(), logoUrl: logoUrl.trim(), ticketsCount: parsedTickets,
          ticketPrice: parsedPrice, totalFee: totalAmount, amountPaid: abonoVal, paymentStatus,
        });
      } else {
        if (!selectedMerchantId) return;
        await onAddTicketsToExisting(
          selectedMerchantId, parsedTickets, parsedPrice, abonoVal,
          paymentStatus === 'paid' ? `Cancelación de ${parsedTickets} tickets adicionales` : undefined
        );
      }
      resetForm();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Añadir Venta de Ticket" subtitle="Registra el establecimiento comercial con dirección y teléfono" maxWidth="lg">
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-3 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMode('new')}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'new' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Registrar Nuevo Comercio</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('existing')}
          disabled={existingMerchants.length === 0}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 ${
            mode === 'existing' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Comercio Existente ({existingMerchants.length})</span>
        </button>
      </div>

      {duplicate && (
        <div className="mb-3 p-2 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-center justify-between gap-2 text-amber-900 dark:text-amber-200 text-xs">
          <span className="truncate">⚠️ Ya registrado: <strong>{duplicate.name}</strong> ({duplicate.phone})</span>
          <button
            type="button"
            onClick={() => { setMode('existing'); handleSelectExisting(duplicate.id); }}
            className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] cursor-pointer shrink-0"
          >
            Sumar a este local
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        {mode === 'new' ? (
          <>
            <LogoFetcherInput businessName={name} logoUrl={logoUrl} socialUrl={socialUrl} onLogoChange={setLogoUrl} onSocialChange={setSocialUrl} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nombre del Local *</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Panadería La Esperanza" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-slate-100" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Teléfono / WhatsApp *</label>
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ej: +58 412 1234567" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-slate-100" />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Dirección del Establecimiento *</label>
              <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ej: Av. Bolívar #142" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-slate-100" />
            </div>
          </>
        ) : (
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Seleccionar Comercio Afiliado</label>
            <select required value={selectedMerchantId} onChange={(e) => handleSelectExisting(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100">
              <option value="">-- Elige un comercio --</option>
              {existingMerchants.map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.ticketsCount} tickets comprados - cuota ${m.ticketPrice})</option>
              ))}
            </select>
          </div>
        )}

        <TicketPricingFields ticketsCount={ticketsCount} ticketPrice={ticketPrice} totalAmount={totalAmount} onTicketsChange={setTicketsCount} onPriceChange={setTicketPrice} />
        <PaymentStatusSelector status={paymentStatus} onChange={handleStatusChange} initialAbono={initialAbono} onAbonoChange={setInitialAbono} totalAmount={totalAmount} />

        <div className="flex gap-2 pt-1.5">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 cursor-pointer">Cancelar</button>
          <button type="submit" disabled={submitting || (mode === 'existing' && !selectedMerchantId)} className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20 disabled:opacity-40 cursor-pointer">
            {submitting ? 'Guardando...' : 'Confirmar Venta de Tickets'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
