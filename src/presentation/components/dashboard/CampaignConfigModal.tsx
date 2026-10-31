import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { RaffleStats, UpdateRaffleStatsDTO } from '../../../domain/models/RaffleStats';
import { Target, Film } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  stats: RaffleStats | null;
  onSave: (dto: UpdateRaffleStatsDTO) => Promise<RaffleStats>;
}

interface FormProps {
  stats: RaffleStats | null;
  onClose: () => void;
  onSave: (dto: UpdateRaffleStatsDTO) => Promise<RaffleStats>;
}

const CampaignConfigForm: React.FC<FormProps> = ({ stats, onClose, onSave }) => {
  const [name, setName] = useState(stats?.campaignName || 'Publicidad de Cine & Sorteo a la Playa');
  const [total, setTotal] = useState(String(stats?.totalTickets ?? 1000));
  const [priceCOP, setPriceCOP] = useState(String(stats?.ticketPriceCOP ?? 50000));
  const [priceUSD, setPriceUSD] = useState(String(stats?.ticketPriceUSD ?? 10));
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const tickets = Math.max(1, parseInt(total, 10) || 1000);
      const cop = Math.max(0, parseInt(priceCOP, 10) || 50000);
      const usd = Math.max(0, parseFloat(priceUSD) || 10);

      await onSave({
        campaignName: name.trim(),
        totalTickets: tickets,
        ticketPrice: cop,
        ticketPriceCOP: cop,
        ticketPriceUSD: usd,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div>
        <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-indigo-500" />
          <span>Nombre de la Campaña / Actividad</span>
        </label>
        <input
          type="text"
          required
          placeholder="Ej: Publicidad de Cine & Sorteo a la Playa 2026"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-indigo-500" />
          <span>Meta Libre de Boletos / Espacios a Vender *</span>
        </label>
        <input
          type="number"
          min="1"
          step="1"
          required
          placeholder="Ej: 1000, 2000, 5000..."
          value={total}
          onChange={(e) => setTotal(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-indigo-500 text-sm"
        />
        <p className="text-[11px] text-slate-400 mt-1">
          No hay límite predeterminado. Define libremente la meta de boletos para el sorteo del viaje a la playa.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <span>🇨🇴</span>
            <span>Precio Base en COP ($)</span>
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            required
            value={priceCOP}
            onChange={(e) => setPriceCOP(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 dark:text-white"
          />
          <span className="text-[10px] text-slate-400">Ej: 50.000 COP</span>
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <span>💵</span>
            <span>Precio Base en USD ($)</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.5"
            required
            value={priceUSD}
            onChange={(e) => setPriceUSD(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 dark:text-white"
          />
          <span className="text-[10px] text-slate-400">Ej: 10.00 USD</span>
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
          disabled={saving}
          className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-40 cursor-pointer shadow-xs"
        >
          {saving ? 'Guardando...' : 'Guardar Meta'}
        </button>
      </div>
    </form>
  );
};

export const CampaignConfigModal: React.FC<Props> = ({
  isOpen,
  onClose,
  stats,
  onSave,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuración de la Campaña & Sorteo"
      subtitle="Publicidad de Cine, meta de tickets y precios por moneda"
      maxWidth="sm"
    >
      {isOpen && (
        <CampaignConfigForm
          key={stats ? stats.id + stats.campaignName + stats.totalTickets : 'config'}
          stats={stats}
          onClose={onClose}
          onSave={onSave}
        />
      )}
    </Modal>
  );
};
