import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useCurrency } from '../../hooks/useCurrency';
import { RefreshCw, CheckCircle2, Sliders } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ExchangeRateModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    rates,
    loadingRates,
    refreshRates,
    setCustomRate,
    resetToLiveRate,
  } = useCurrency();

  const [customVes, setCustomVes] = useState<string>('');
  const [customCop, setCustomCop] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCustomVes(rates.usdToVes.toString());
      setCustomCop(rates.usdToCop.toString());
      setSavedSuccess(false);
    }
  }, [isOpen, rates]);

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const ves = parseFloat(customVes);
    const cop = parseFloat(customCop);

    if (!isNaN(ves) && ves > 0) {
      setCustomRate('VES', ves);
    }
    if (!isNaN(cop) && cop > 0) {
      setCustomRate('COP', cop);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tasas de Cambio Oficiales & Frontera"
      subtitle="Conexión en vivo con el Banco Central de Venezuela y Pesos COP"
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        {/* Info Banner */}
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-xl flex items-center justify-between">
          <div>
            <p className="font-bold text-indigo-950 dark:text-indigo-200">
              Sincronización Multimoneda
            </p>
            <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 mt-0.5">
              Los cobros, tickets y deudas se calculan automáticamente con estas tasas.
            </p>
          </div>
          <button
            type="button"
            onClick={refreshRates}
            disabled={loadingRates}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingRates ? 'animate-spin' : ''}`} />
            <span>{loadingRates ? 'Actualizando...' : 'Actualizar'}</span>
          </button>
        </div>

        {/* BCV Card */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🇻🇪</span>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Banco Central de Venezuela (BCV)
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {rates.isCustomVes ? 'Tasa manual configurada' : 'Tasa oficial en vivo'}
                </p>
              </div>
            </div>
            {rates.isCustomVes ? (
              <button
                type="button"
                onClick={() => resetToLiveRate('VES')}
                className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-semibold"
              >
                Volver a tasa BCV en vivo
              </button>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-300 dark:border-emerald-800">
                Oficial en vivo
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-lg font-black text-slate-900 dark:text-white">
              Bs. {rates.usdToVes.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </span>
            <span className="text-[11px] text-slate-500 font-semibold">por 1.00 USD</span>
          </div>
        </div>

        {/* COP Card */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🇨🇴</span>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Peso Colombiano (COP)
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {rates.isCustomCop ? 'Tasa manual configurada' : 'Tasa oficial de referencia'}
                </p>
              </div>
            </div>
            {rates.isCustomCop ? (
              <button
                type="button"
                onClick={() => resetToLiveRate('COP')}
                className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-semibold"
              >
                Volver a tasa de mercado
              </button>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-300 dark:border-emerald-800">
                Referencia en vivo
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-lg font-black text-slate-900 dark:text-white">
              ${Math.round(rates.usdToCop).toLocaleString('es-CO')} COP
            </span>
            <span className="text-[11px] text-slate-500 font-semibold">por 1.00 USD</span>
          </div>
        </div>

        {/* Custom Override Form */}
        <form onSubmit={handleSaveCustom} className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-3">
          <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-xs">
            <Sliders className="w-3.5 h-3.5" />
            <span>Ajustar Tasas Personalizadas (Opcional)</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Si tu negocio pactó una tasa fija con clientes o una tasa de frontera específica, puedes escribirla aquí:
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Tasa Bs. (VES / USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={customVes}
                onChange={(e) => setCustomVes(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Tasa COP (Pesos / USD)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={customCop}
                onChange={(e) => setCustomCop(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            {savedSuccess ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ¡Tasas guardadas!
              </span>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              Guardar Tasas Manuales
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
