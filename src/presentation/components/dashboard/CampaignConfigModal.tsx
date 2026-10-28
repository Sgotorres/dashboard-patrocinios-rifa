import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import type { RaffleStats, UpdateRaffleStatsDTO } from '../../../domain/models/RaffleStats';
import { Target, DollarSign, Tag } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  stats: RaffleStats | null;
  onSave: (dto: UpdateRaffleStatsDTO) => Promise<RaffleStats>;
}

export const CampaignConfigModal: React.FC<Props> = ({
  isOpen,
  onClose,
  stats,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [total, setTotal] = useState('500');
  const [price, setPrice] = useState('10');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (stats) {
      setName(stats.campaignName);
      setTotal(String(stats.totalTickets));
      setPrice(String(stats.ticketPrice));
    }
  }, [stats, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        campaignName: name.trim(),
        totalTickets: Math.max(1, parseInt(total, 10) || 500),
        ticketPrice: Math.max(0, parseFloat(price) || 10),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuración de la Campaña de Rifa"
      subtitle="Ajusta la meta impuesta de boletos y precio de venta"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-500" />
            <span>Nombre de la Campaña</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-500" />
            <span>Meta Impuesta de Tickets (Cantidad a Vender) *</span>
          </label>
          <input
            type="number"
            min="1"
            required
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-indigo-500"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Esta cantidad define el 100% de la barra de progreso en el dashboard.
          </p>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
            <span>Precio Estándar por Ticket ($)</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.5"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-indigo-500"
          />
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
    </Modal>
  );
};
