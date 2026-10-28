import React, { useState } from 'react';
import { Modal } from './Modal';
import { FileSpreadsheet, Check, Download, Table } from 'lucide-react';
import type { Merchant } from '../../../domain/models/Merchant';
import type { RaffleStats } from '../../../domain/models/RaffleStats';
import { exportMerchantsToExcel, type ExportFormat } from '../../../core/utils/excelExport';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  merchants: Merchant[];
  stats: RaffleStats | null;
  title?: string;
  defaultFileName?: string;
}

export const ExcelExportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  merchants,
  stats,
  title = 'Exportar a Excel',
  defaultFileName = 'reporte-cobranza',
}) => {
  const [format, setFormat] = useState<ExportFormat>('styled-xls');

  const handleDownload = () => {
    exportMerchantsToExcel(merchants, stats, defaultFileName, format);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={`Exportando ${merchants.length} establecimientos con conteo ordenado`}
      maxWidth="sm"
    >
      <div className="space-y-4 text-xs">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
          <p className="font-semibold text-slate-800 dark:text-slate-200">Columnas incluidas (Formato Limpio):</p>
          <p className="text-slate-500 dark:text-slate-400">
            Comercio &bull; Teléfono &bull; Tickets &bull; Total a Pagar &bull; Abonado &bull; Saldo Deudor &bull; Estado
          </p>
        </div>

        <div className="space-y-2">
          <label className="block font-bold text-slate-700 dark:text-slate-300">
            Selecciona el Formato de Descarga:
          </label>

          {/* Option 1: Styled XLS */}
          <button
            type="button"
            onClick={() => setFormat('styled-xls')}
            className={`w-full p-3 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer ${
              format === 'styled-xls'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Excel Estilizado (.xls)</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold">
                    Recomendado
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Con colores verde, amarillo y rojo en el estado, bordes limpios y totales destacados.
                </p>
              </div>
            </div>
            {format === 'styled-xls' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />}
          </button>

          {/* Option 2: Clean CSV */}
          <button
            type="button"
            onClick={() => setFormat('clean-csv')}
            className={`w-full p-3 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer ${
              format === 'clean-csv'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <Table className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  Excel CSV Directo (.csv)
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Delimitado por punto y coma con formato de texto para teléfonos (evita notación científica).
                </p>
              </div>
            </div>
            {format === 'clean-csv' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />}
          </button>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Archivo</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
