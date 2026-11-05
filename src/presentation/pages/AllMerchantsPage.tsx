import React, { useDeferredValue, useMemo, useState } from 'react';
import { TableFilterBar } from '../components/tables/TableFilterBar';
import { MerchantsDataTable } from '../components/tables/MerchantsDataTable';
import { ExcelExportModal } from '../components/common/ExcelExportModal';
import type { Merchant } from '../../domain/models/Merchant';
import type { RaffleStats } from '../../domain/models/RaffleStats';
import { sortMerchants, type SortOption } from '../../core/utils/merchantSorter';
import type { CurrencyFilter, FilterStatus } from '../hooks/useMerchants';
import { Store, Plus, FileSpreadsheet, Trash2 } from 'lucide-react';
import { calculateMerchantCounts, useMerchantsStore } from '../stores/useMerchantsStore';
import { useModalStore } from '../stores/useModalStore';

interface Props {
  merchants?: Merchant[];
  allMerchants?: Merchant[];
  stats?: RaffleStats | null;
  loading?: boolean;
  filter?: FilterStatus;
  setFilter?: (f: FilterStatus) => void;
  currencyFilter?: CurrencyFilter;
  setCurrencyFilter?: (c: CurrencyFilter) => void;
  search?: string;
  setSearch?: (s: string) => void;
  sortBy?: SortOption;
  setSortBy?: (s: SortOption) => void;
  counts?: { all: number; paid: number; pending: number; unpaid: number; cop?: number; usd?: number };
  onSelectMerchant?: (m: Merchant) => void;
  onOpenAbono?: (m: Merchant) => void;
  onMarkAsPaid?: (id: string) => void;
  onOpenAddTicket?: () => void;
}

export const AllMerchantsPage: React.FC<Props> = (props) => {
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Store fallback
  const storeMerchants = useMerchantsStore((s) => s.merchants);
  const storeLoading = useMerchantsStore((s) => s.loading);
  const storeFilter = useMerchantsStore((s) => s.filter);
  const storeSetFilter = useMerchantsStore((s) => s.setFilter);
  const storeCurrencyFilter = useMerchantsStore((s) => s.currencyFilter);
  const storeSetCurrencyFilter = useMerchantsStore((s) => s.setCurrencyFilter);
  const storeSearch = useMerchantsStore((s) => s.search);
  const storeSetSearch = useMerchantsStore((s) => s.setSearch);
  const storeSortBy = useMerchantsStore((s) => s.sortBy);
  const storeSetSortBy = useMerchantsStore((s) => s.setSortBy);
  const storeMarkAsPaid = useMerchantsStore((s) => s.markAsPaid);
  const storeDeleteMerchant = useMerchantsStore((s) => s.deleteMerchant);
  const storeClearAllMerchants = useMerchantsStore((s) => s.clearAllMerchants);

  const openDetail = useModalStore((s) => s.openDetail);
  const openAbono = useModalStore((s) => s.openAbono);
  const openAddTicket = useModalStore((s) => s.openAddTicket);

  const allMerchants = props.allMerchants ?? storeMerchants;
  const loading = props.loading ?? storeLoading;
  const filter = props.filter ?? storeFilter;
  const setFilter = props.setFilter ?? storeSetFilter;
  const currencyFilter = props.currencyFilter ?? storeCurrencyFilter;
  const setCurrencyFilter = props.setCurrencyFilter ?? storeSetCurrencyFilter;
  const search = props.search ?? storeSearch;
  const setSearch = props.setSearch ?? storeSetSearch;
  const sortBy = props.sortBy ?? storeSortBy;
  const setSortBy = props.setSortBy ?? storeSetSortBy;
  const onSelectMerchant = props.onSelectMerchant ?? openDetail;
  const onOpenAbono = props.onOpenAbono ?? openAbono;
  const onMarkAsPaid = props.onMarkAsPaid ?? storeMarkAsPaid;
  const onOpenAddTicket = props.onOpenAddTicket ?? (() => openAddTicket(true));

  const deferredSearch = useDeferredValue(search);

  // Computed displayed list
  const displayMerchants = useMemo(() => {
    if (props.merchants && !props.allMerchants) {
      return props.merchants;
    }

    const query = deferredSearch.toLowerCase().trim();
    const filtered = allMerchants.filter((m) => {
      const matchesFilter = filter === 'all' || m.paymentStatus === filter;
      const matchesCurrency = currencyFilter === 'all' || (m.currency || 'COP') === currencyFilter;
      const matchesSearch =
        !query ||
        m.name.toLowerCase().includes(query) ||
        m.phone.toLowerCase().includes(query) ||
        m.address.toLowerCase().includes(query) ||
        (m.socialUrl && m.socialUrl.toLowerCase().includes(query));
      return matchesFilter && matchesCurrency && matchesSearch;
    });

    return sortMerchants(filtered, sortBy);
  }, [props.merchants, props.allMerchants, allMerchants, deferredSearch, filter, currencyFilter, sortBy]);

  const derivedCounts = useMemo(() => {
    if (props.counts) return props.counts;
    return calculateMerchantCounts(allMerchants);
  }, [props.counts, allMerchants]);

  const handleClearAll = async () => {
    const confirmed = window.confirm(
      `¿ATENCIÓN: Estás a punto de eliminar TODOS los anunciantes (${allMerchants.length})?\nEsta acción no se puede deshacer y reiniciará el conteo de espacios asignados.`
    );
    if (!confirmed) return;
    await storeClearAllMerchants();
  };

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Todos los Anunciantes Registrados
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Listado completo de clientes y espacios de publicidad pautados
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {allMerchants.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-700 dark:text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
              title="Eliminar todos los comercios registrados"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar Todos</span>
            </button>
          )}
          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel</span>
          </button>
          <button
            onClick={onOpenAddTicket}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Anunciante</span>
          </button>
        </div>
      </div>

      <TableFilterBar
        activeFilter={filter}
        onSelectFilter={setFilter}
        currencyFilter={currencyFilter}
        onSelectCurrencyFilter={setCurrencyFilter}
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
        counts={derivedCounts}
        onOpenAddTicket={onOpenAddTicket}
        onExportExcel={() => setIsExportOpen(true)}
      />

      <MerchantsDataTable
        merchants={displayMerchants}
        loading={loading}
        onSelectMerchant={onSelectMerchant}
        onOpenAbono={onOpenAbono}
        onMarkAsPaid={onMarkAsPaid}
        onOpenAddTicket={onOpenAddTicket}
        onDeleteMerchant={async (id) => {
          await storeDeleteMerchant(id);
        }}
      />

      <ExcelExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        merchants={displayMerchants}
        stats={props.stats ?? null}
        title="Exportar Todos los Patrocinadores"
        defaultFileName="todos-patrocinadores-cine"
      />
    </div>
  );
};
