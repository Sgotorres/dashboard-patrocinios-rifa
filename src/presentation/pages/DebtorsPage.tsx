import React, { useMemo, useState } from 'react';
import { TableFilterBar } from '../components/tables/TableFilterBar';
import { MerchantsDataTable } from '../components/tables/MerchantsDataTable';
import { ExcelExportModal } from '../components/common/ExcelExportModal';
import type { Merchant } from '../../domain/models/Merchant';
import type { RaffleStats } from '../../domain/models/RaffleStats';
import type { SortOption } from '../hooks/useMerchants';
import { AlertTriangle, DollarSign, FileSpreadsheet } from 'lucide-react';

interface Props {
  allMerchants: Merchant[];
  stats: RaffleStats | null;
  loading: boolean;
  search: string;
  setSearch: (s: string) => void;
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
  counts: { all: number; paid: number; pending: number; unpaid: number };
  onSelectMerchant: (m: Merchant) => void;
  onOpenAbono: (m: Merchant) => void;
  onMarkAsPaid: (id: string) => void;
  onOpenAddTicket: () => void;
}

export const DebtorsPage: React.FC<Props> = ({
  allMerchants,
  stats,
  loading,
  search,
  setSearch,
  sortBy,
  setSortBy,
  counts,
  onSelectMerchant,
  onOpenAbono,
  onMarkAsPaid,
  onOpenAddTicket,
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false);

  const debtors = useMemo(() => {
    const query = search.toLowerCase().trim();
    return allMerchants
      .filter((m) => m.paymentStatus === 'unpaid')
      .filter((m) => {
        if (!query) return true;
        return (
          m.name.toLowerCase().includes(query) ||
          m.phone.toLowerCase().includes(query) ||
          m.address.toLowerCase().includes(query)
        );
      });
  }, [allMerchants, search]);

  const totalDebt = useMemo(() => {
    return debtors.reduce((sum, m) => sum + (m.totalFee - m.amountPaid), 0);
  }, [debtors]);

  return (
    <div className="space-y-5">
      {/* Red Highlight Header */}
      <div className="bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent dark:from-rose-950/40 dark:via-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Tabla de Deudores (No Pagados)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase">
                Alerta Roja
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Establecimientos que retiraron boletos pero tienen saldo $0 abonado
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="bg-white dark:bg-slate-900/90 border border-rose-200 dark:border-rose-800 p-3 rounded-xl flex items-center gap-3 shadow-xs">
            <DollarSign className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Cartera Vencida
              </span>
              <div className="text-xl font-black text-rose-600 dark:text-rose-400">
                ${totalDebt.toFixed(2)}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            title="Exportar lista de deudores a Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Excel Deudores</span>
          </button>
        </div>
      </div>

      <TableFilterBar
        activeFilter="unpaid"
        onSelectFilter={() => {}}
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
        counts={counts}
        onOpenAddTicket={onOpenAddTicket}
        onExportExcel={() => setIsExportOpen(true)}
        showStatusFilters={false}
      />

      <MerchantsDataTable
        merchants={debtors}
        loading={loading}
        onSelectMerchant={onSelectMerchant}
        onOpenAbono={onOpenAbono}
        onMarkAsPaid={onMarkAsPaid}
        onOpenAddTicket={onOpenAddTicket}
      />

      <ExcelExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        merchants={debtors}
        stats={stats}
        title="Exportar Lista de Deudores"
        defaultFileName="reporte-deudores-rifa"
      />
    </div>
  );
};
