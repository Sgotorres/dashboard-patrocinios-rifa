import React, { useEffect, useMemo, useState } from 'react';
import type { Merchant } from '../../../domain/models/Merchant';
import { LogoAvatar } from './LogoAvatar';
import {
  Search,
  DollarSign,
  MessageCircle,
  X,
  Store,
  Phone,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { formatMoney, getCurrencyBadge } from '../../../core/utils/currencyFormatter';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  merchants: Merchant[];
  onSelectMerchant: (merchant: Merchant) => void;
  onOpenAbono: (merchant: Merchant) => void;
}

interface ContentProps {
  onClose: () => void;
  merchants: Merchant[];
  onSelectMerchant: (merchant: Merchant) => void;
  onOpenAbono: (merchant: Merchant) => void;
}

const QuickSearchContent: React.FC<ContentProps> = ({
  onClose,
  merchants,
  onSelectMerchant,
  onOpenAbono,
}) => {
  const [query, setQuery] = useState('');

  // Listener para cerrar con tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const results = useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (!clean) return merchants.slice(0, 8);

    return merchants.filter(
      (m) =>
        m.name.toLowerCase().includes(clean) ||
        m.phone.toLowerCase().includes(clean) ||
        m.address.toLowerCase().includes(clean) ||
        (m.socialUrl && m.socialUrl.toLowerCase().includes(clean))
    );
  }, [merchants, query]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 flex flex-col max-h-[75vh]">
        {/* Barra de Búsqueda */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Buscar patrocinador, teléfono o dirección... (Esc para salir)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
            ESC
          </span>
        </div>

        {/* Resultados */}
        <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2">
          {results.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Store className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-semibold">No se encontraron patrocinadores con esa búsqueda</p>
            </div>
          ) : (
            results.map((m) => {
              const currency = m.currency || 'COP';
              const remaining = Math.max(0, m.totalFee - m.amountPaid);
              const cleanPhone = m.phone.replace(/[^0-9]/g, '');
              const waMsg = encodeURIComponent(
                `Hola ${m.name}, te escribimos de la Publicidad en Cine & Sorteo a la Playa para coordinar el saldo pendiente de ${formatMoney(remaining, currency, true)}.`
              );
              const waUrl = `https://wa.me/${cleanPhone}?text=${waMsg}`;
              const currBadge = getCurrencyBadge(currency);

              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectMerchant(m);
                      onClose();
                    }}
                    className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                  >
                    <LogoAvatar
                      name={m.name}
                      logoUrl={m.logoUrl}
                      socialUrl={m.socialUrl}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                          {m.name}
                        </p>
                        <span className={`text-[9px] font-extrabold px-1 py-0.1 rounded border ${currBadge.bgClass} ${currBadge.textClass} ${currBadge.borderClass}`}>
                          {currBadge.flag} {currBadge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{m.phone}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 truncate max-w-[150px]">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{m.address}</span>
                        </span>
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {/* Indicador de Deuda */}
                    <div className="text-right text-xs">
                      {remaining > 0 ? (
                        <span className="font-bold text-rose-600 dark:text-rose-400 block">
                          Debe: {formatMoney(remaining, currency)}
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                          Solvente
                        </span>
                      )}
                    </div>

                    {/* Botones de acción directa */}
                    {cleanPhone && remaining > 0 && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                        title="Cobrar por WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}

                    {m.paymentStatus !== 'paid' && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenAbono(m);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-900 dark:text-amber-300 font-bold text-[11px] border border-amber-300 dark:border-amber-500/40 cursor-pointer flex items-center gap-1"
                        title="Registrar Abono"
                      >
                        <DollarSign className="w-3 h-3" />
                        <span>Abonar</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        onSelectMerchant(m);
                        onClose();
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between items-center">
          <span>{results.length} patrocinadores coincidentes</span>
          <span className="text-[10px] text-slate-400">Presiona Enter o haz clic para ver detalle</span>
        </div>
      </div>
    </div>
  );
};

export const QuickSearchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  merchants,
  onSelectMerchant,
  onOpenAbono,
}) => {
  if (!isOpen) return null;

  return (
    <QuickSearchContent
      onClose={onClose}
      merchants={merchants}
      onSelectMerchant={onSelectMerchant}
      onOpenAbono={onOpenAbono}
    />
  );
};
