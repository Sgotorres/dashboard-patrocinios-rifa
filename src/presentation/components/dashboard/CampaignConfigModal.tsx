import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import type { RaffleStats, UpdateRaffleStatsDTO } from '../../../domain/models/RaffleStats';
import { useCurrency } from '../../hooks/useCurrency';
import { exportDatabaseBackup, importDatabaseBackup } from '../../../core/utils/backupService';
import { Target, DollarSign, Tag, Download, Upload, ShieldCheck } from 'lucide-react';

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
  const { getTriBreakdown } = useCurrency();
  const [name, setName] = useState('');
  const [total, setTotal] = useState('500');
  const [price, setPrice] = useState('10');
  const [saving, setSaving] = useState(false);
  const [backupMsg, setBackupMsg] = useState<string | null>(null);

  useEffect(() => {
    if (stats) {
      setName(stats.campaignName);
      setTotal(String(stats.totalTickets));
      setPrice(String(stats.ticketPrice));
    }
  }, [stats, isOpen]);

  const priceNum = parseFloat(price) || 0;
  const breakdown = getTriBreakdown(priceNum);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        campaignName: name.trim(),
        totalTickets: Math.max(1, parseInt(total, 10) || 500),
        ticketPrice: Math.max(0, priceNum),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      await exportDatabaseBackup();
      setBackupMsg('Copia de seguridad descargada.');
      setTimeout(() => setBackupMsg(null), 3000);
    } catch {
      setBackupMsg('Error al exportar respaldo.');
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (confirm('¿Restaurar esta copia de seguridad? Se reemplazarán los comercios actuales con los del archivo.')) {
      try {
        const { count } = await importDatabaseBackup(file);
        setBackupMsg(`¡Restaurados ${count} comercios con éxito!`);
        setTimeout(() => window.location.reload(), 1200);
      } catch (err: unknown) {
        setBackupMsg(err instanceof Error ? err.message : 'Error al restaurar');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuración de la Campaña de Rifa"
      subtitle="Ajusta la meta de boletos, precio y respaldo de datos"
      maxWidth="sm"
    >
      <div className="space-y-4 text-xs">
        <form onSubmit={handleSubmit} className="space-y-3.5">
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
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
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
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
              <span>Precio Estándar por Ticket ($ USD)</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Equivale en vivo a <strong>{breakdown.ves}</strong> (BCV) &bull; <strong>{breakdown.cop}</strong>
            </p>
          </div>

          <div className="pt-1 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>

        {/* Respaldo de Seguridad JSON */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Copia de Seguridad de la Base de Datos</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Exporta tus comercios y abonos a un archivo seguro para no perder datos si limpias el navegador:
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Backup</span>
            </button>

            <label className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold flex items-center justify-center gap-1.5 cursor-pointer text-center">
              <Upload className="w-3.5 h-3.5" />
              <span>Restaurar Backup</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>

          {backupMsg && (
            <p className="text-[11px] text-center font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">
              {backupMsg}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};
