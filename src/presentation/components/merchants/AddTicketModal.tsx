import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { LogoFetcherInput } from './LogoFetcherInput';
import { TicketPricingFields } from './TicketPricingFields';
import { PaymentStatusSelector } from './PaymentStatusSelector';
import type { CreateMerchantDTO, CurrencyCode, Merchant, PaymentStatus } from '../../../domain/models/Merchant';
import { Store, PlusCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultTicketPrice: number;
  existingMerchants: Merchant[];
  onRegisterNewMerchant: (dto: CreateMerchantDTO) => Promise<Merchant>;
  onAddTicketsToExisting: (id: string, ticketsCount: number) => Promise<Merchant>;
}

export const AddTicketModal: React.FC<Props> = ({
  isOpen,
  onClose,
  existingMerchants,
  onRegisterNewMerchant,
  onAddTicketsToExisting,
}) => {
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('');
  const [currency, setCurrency] = useState<CurrencyCode>('COP');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [socialUrl, setSocialUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [ticketsCount, setTicketsCount] = useState('1');
  const [ticketPrice, setTicketPrice] = useState('50000');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [initialAbono, setInitialAbono] = useState('0');
  const [submitting, setSubmitting] = useState(false);

  const parsedTickets = Math.max(1, parseInt(ticketsCount, 10) || 1);
  const parsedPrice = Math.max(0, parseFloat(ticketPrice) || 0);
  const totalAmount = parsedTickets * parsedPrice;

  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
    if (newCurrency === 'COP') {
      setTicketPrice('50000');
    } else {
      setTicketPrice('10');
    }
  };

  const handleStatusChange = (status: PaymentStatus) => {
    setPaymentStatus(status);
    if (status === 'paid') setInitialAbono(String(totalAmount));
    else if (status === 'unpaid') setInitialAbono('0');
  };

  const resetForm = () => {
    setName('');
    setAddress('');
    setPhone('');
    setSocialUrl('');
    setLogoUrl('');
    setTicketsCount('1');
    setTicketPrice(currency === 'COP' ? '50000' : '10');
    setPaymentStatus('unpaid');
    setInitialAbono('0');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'new') {
        const abonoVal = paymentStatus === 'paid' ? totalAmount : paymentStatus === 'pending' ? parseFloat(initialAbono) || 0 : 0;
        await onRegisterNewMerchant({
          name: name.trim(),
          address: address.trim(),
          phone: phone.trim(),
          socialUrl: socialUrl.trim(),
          logoUrl: logoUrl.trim(),
          currency,
          ticketsCount: parsedTickets,
          ticketPrice: parsedPrice,
          totalFee: totalAmount,
          amountPaid: abonoVal,
          paymentStatus,
        });
      } else {
        if (!selectedMerchantId) return;
        await onAddTicketsToExisting(selectedMerchantId, parsedTickets);
      }
      resetForm();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Añadir Patrocinador & Boletos"
      subtitle="Publicidad en pantalla antes de las funciones de cine + sorteo a la playa"
      maxWidth="lg"
    >
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMode('new')}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'new'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Registrar Nuevo Patrocinador</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('existing')}
          disabled={existingMerchants.length === 0}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 ${
            mode === 'existing'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Patrocinador Existente ({existingMerchants.length})</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {mode === 'new' ? (
          <>
            {/* Selector de Moneda */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Moneda de Cobro</span>
                <span className="text-[11px] text-slate-400">Selecciona si pautará en Pesos o en Dólares</span>
              </div>
              <div className="inline-flex gap-1 bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleCurrencyChange('COP')}
                  className={`px-3 py-1 rounded-md font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                    currency === 'COP' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span>🇨🇴</span>
                  <span>Pesos (COP)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCurrencyChange('USD')}
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
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nombre del Local / Comercio *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Panadería La Esperanza"
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
                  placeholder="Ej: +57 310 1234567"
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
                placeholder="Ej: Carrera 5 #14-20, Centro"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Seleccionar Patrocinador Afiliado</label>
            <select
              required
              value={selectedMerchantId}
              onChange={(e) => {
                setSelectedMerchantId(e.target.value);
                const found = existingMerchants.find((m) => m.id === e.target.value);
                if (found) {
                  setCurrency(found.currency || 'COP');
                  setTicketPrice(String(found.ticketPrice));
                }
              }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Elige un patrocinador --</option>
              {existingMerchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.ticketsCount} boletos - {m.currency || 'COP'})
                </option>
              ))}
            </select>
          </div>
        )}

        <TicketPricingFields
          ticketsCount={ticketsCount}
          ticketPrice={ticketPrice}
          totalAmount={totalAmount}
          currency={currency}
          onTicketsChange={setTicketsCount}
          onPriceChange={setTicketPrice}
        />

        {mode === 'new' && (
          <PaymentStatusSelector
            status={paymentStatus}
            onChange={handleStatusChange}
            initialAbono={initialAbono}
            onAbonoChange={setInitialAbono}
            totalAmount={totalAmount}
          />
        )}

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
            disabled={submitting || (mode === 'existing' && !selectedMerchantId)}
            className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20 disabled:opacity-40 transition-colors cursor-pointer"
          >
            {submitting ? 'Guardando...' : 'Confirmar Venta de Tickets'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
