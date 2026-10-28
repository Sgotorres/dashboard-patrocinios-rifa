import React, { useState } from 'react';
import { TableFilterBar } from '../components/tables/TableFilterBar';
import { MerchantsDataTable } from '../components/tables/MerchantsDataTable';
import { ExcelExportModal } from '../components/common/ExcelExportModal';
import type { Merchant } from '../../domain/models/Merchant';
import type { RaffleStats } from '../../domain/models/RaffleStats';
import type { FilterStatus, SortOption } from '../hooks/useMerchants';
import { Store, Plus, FileSpreadsheet } from 'lucide-react';

interface Props {
  merchants: Merchant[];
  allMerchants: Merchant[];
  stats: RaffleStats | null;
  loading: boolean;
  filter: FilterStatus;
  setFilter: (f: FilterStatus) => void;
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

export const AllMerchantsPage: React.FC<Props> = ({
  merchants,
  allMerchants,
  stats,
  loading,
  filter,
  setFilter,
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

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Directorio General de Comercios Patrocinadores
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {allMerchants.length} locales registrados comprando tickets de rifa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Exportar Excel</span>
          </button>
          <button
            onClick={onOpenAddTicket}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Comercio / Ticket</span>
          </button>
        </div>
      </div>

      <TableFilterBar
        activeFilter={filter}
        onSelectFilter={setFilter}
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
        counts={counts}
        onOpenAddTicket={onOpenAddTicket}
        onExportExcel={() => setIsExportOpen(true)}
        showStatusFilters={true}
      />

      <MerchantsDataTable
        merchants={merchants}
        loading={loading}
        onSelectMerchant={onSelectMerchant}
        onOpenAbono={onOpenAbono}
        onMarkAsPaid={onMarkAsPaid}
        onOpenAddTicket={onOpenAddTicket}
      />

      <ExcelExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        merchants={allMerchants}
        stats={stats}
        title="Exportar Directorio a Excel"
        defaultFileName="directorio-comercios-totales"
      />
    </div>
  );
};
