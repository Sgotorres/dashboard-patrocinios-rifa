import React, { useRef, useState } from 'react';
import { Modal } from './Modal';
import { exportDatabaseToJSON, importDatabaseFromJSON } from '../../../core/utils/backupManager';
import { Download, Upload, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => Promise<void>;
}

export const BackupModal: React.FC<Props> = ({ isOpen, onClose, onDataRestored }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleExport = async () => {
    try {
      setLoading(true);
      await exportDatabaseToJSON();
      setFeedback({ type: 'success', message: 'Copia de seguridad descargada exitosamente en formato JSON.' });
    } catch {
      setFeedback({ type: 'error', message: 'Error al exportar la copia de seguridad.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('¿Seguro que deseas restaurar este respaldo? Esta acción reemplazará la información actual por la del archivo.')) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setLoading(true);
      setFeedback(null);
      const res = await importDatabaseFromJSON(file);
      if (res.success) {
        await onDataRestored();
        setFeedback({
          type: 'success',
          message: `¡Restauración exitosa! Se restauraron ${res.count} comercios y la configuración de la campaña.`,
        });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Error al procesar el archivo.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Ocurrió un error inesperado durante la restauración.' });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Copia de Seguridad y Restauración"
      subtitle="Protege tu información y muévela entre computadoras fácilmente"
      maxWidth="sm"
    >
      <div className="space-y-4 text-xs">
        {feedback && (
          <div
            className={`p-3 rounded-xl flex items-start gap-2.5 border ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            )}
            <p className="font-semibold leading-relaxed">{feedback.message}</p>
          </div>
        )}

        {/* Sección 1: Descargar Copia */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center gap-2 mb-1.5">
            <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="font-bold text-slate-900 dark:text-white">Exportar Respaldo</h4>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-3 leading-relaxed">
            Descarga un archivo <code>.json</code> con todos los comercios, deudas, tickets y abonos registrados.
          </p>
          <button
            type="button"
            onClick={handleExport}
            disabled={loading}
            className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'Generando...' : 'Descargar Archivo de Respaldo'}</span>
          </button>
        </div>

        {/* Sección 2: Restaurar Copia */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center gap-2 mb-1.5">
            <Upload className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h4 className="font-bold text-slate-900 dark:text-white">Restaurar Respaldo</h4>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-3 leading-relaxed">
            Sube un archivo de respaldo previo para restablecer los datos en esta máquina.
          </p>
          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="w-full py-2 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>Seleccionar Archivo JSON</span>
          </button>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};
