import React, { useDeferredValue, useMemo, useState } from 'react';
import { TableFilterBar } from '../components/tables/TableFilterBar';
import { MerchantsDataTable } from '../components/tables/MerchantsDataTable';
import { ExcelExportModal } from '../components/common/ExcelExportModal';
import type { Merchant } from '../../domain/models/Merchant';
import type { RaffleStats } from '../../domain/models/RaffleStats';
import { sortMerchants, type SortOption } from '../../core/utils/merchantSorter';
import type { CurrencyFilter } from '../hooks/useMerchants';
import { AlertTriangle, DollarSign, FileSpreadsheet } from 'lucide-react';
import { formatMoney } from '../../core/utils/currencyFormatter';
import { calculateMerchantCounts, useMerchantsStore } from '../stores/useMerchantsStore';
import { useModalStore } from '../stores/useModalStore';

interface Props {
  allMerchants?: Merchant[];
  stats?: RaffleStats | null;
  loading?: boolean;
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

export const DebtorsPage: React.FC<Props> = (props) => {
  // Store fallback
  const storeMerchants = useMerchantsStore((s) => s.merchants);
  const storeLoading = useMerchantsStore((s) => s.loading);
  const storeSearch = useMerchantsStore((s) => s.search);
  const storeSetSearch = useMerchantsStore((s) => s.setSearch);
  const storeSortBy = useMerchantsStore((s) => s.sortBy);
  const storeSetSortBy = useMerchantsStore((s) => s.setSortBy);
  const storeMarkAsPaid = useMerchantsStore((s) => s.markAsPaid);

  const openDetail = useModalStore((s) => s.openDetail);
  const openAbono = useModalStore((s) => s.openAbono);
  const openAddTicket = useModalStore((s) => s.openAddTicket);

  const allMerchants = props.allMerchants ?? storeMerchants;
  const loading = props.loading ?? storeLoading;
  const search = props.search ?? storeSearch;
  const setSearch = props.setSearch ?? storeSetSearch;
  const sortBy = props.sortBy ?? storeSortBy;
  const setSortBy = props.setSortBy ?? storeSetSortBy;
  const onSelectMerchant = props.onSelectMerchant ?? openDetail;
  const onOpenAbono = props.onOpenAbono ?? openAbono;
  const onMarkAsPaid = props.onMarkAsPaid ?? storeMarkAsPaid;
  const onOpenAddTicket = props.onOpenAddTicket ?? (() => openAddTicket(true));

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [currencyFilter, setCurrencyFilter] = useState<CurrencyFilter>('all');

  // React 19 useDeferredValue para debounce nativo en la búsqueda
  const deferredSearch = useDeferredValue(search);

  // Filtrado y ORDENAMIENTO (CORREGIDO: incluye sortMerchants y dependencia sortBy)
  const debtors = useMemo(() => {
    const query = deferredSearch.toLowerCase().trim();
    const filtered = allMerchants
      .filter((m) => m.paymentStatus === 'unpaid')
      .filter((m) => currencyFilter === 'all' || (m.currency || 'COP') === currencyFilter)
      .filter((m) => {
        if (!query) return true;
        return (
          m.name.toLowerCase().includes(query) ||
          m.phone.toLowerCase().includes(query) ||
          m.address.toLowerCase().includes(query)
        );
      });

    return sortMerchants(filtered, sortBy);
  }, [allMerchants, deferredSearch, currencyFilter, sortBy]);

  const totalDebtCOP = useMemo(() => {
    return debtors
      .filter((m) => (m.currency || 'COP') === 'COP')
      .reduce((sum, m) => sum + (m.totalFee - m.amountPaid), 0);
  }, [debtors]);

  const totalDebtUSD = useMemo(() => {
    return debtors
      .filter((m) => m.currency === 'USD')
      .reduce((sum, m) => sum + (m.totalFee - m.amountPaid), 0);
  }, [debtors]);

  const derivedCounts = useMemo(() => {
    if (props.counts) return props.counts;
    return calculateMerchantCounts(allMerchants);
  }, [props.counts, allMerchants]);

  return (
    <div className="space-y-5">
      {/* Red Highlight Header */}
      <div className="bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent dark:from-rose-950/40 dark:via-rose-950/20 border border-rose-300 dark:border-rose-900/60 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Tabla de Deudores Críticos
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase">
                Pendientes (Rojo)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Anunciantes con espacios contratados pero que aún no registran abono inicial
            </p>
          </div>
        </div>

        {/* Cajas de Deuda por Moneda */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <div className="bg-white dark:bg-slate-900/90 border border-rose-300 dark:border-rose-800 p-2.5 rounded-xl flex items-center gap-2 shadow-xs">
            <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Deuda en COP</span>
              <div className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400">
                {formatMoney(totalDebtCOP, 'COP', true)}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/90 border border-rose-300 dark:border-rose-800 p-2.5 rounded-xl flex items-center gap-2 shadow-xs">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Deuda en USD</span>
              <div className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400">
                {formatMoney(totalDebtUSD, 'USD', true)}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsExportOpen(true)}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Exportar lista de deudores a Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden md:inline">Descargar</span>
          </button>
        </div>
      </div>

      <TableFilterBar
        activeFilter="unpaid"
        onSelectFilter={() => {}}
        currencyFilter={currencyFilter}
        onSelectCurrencyFilter={setCurrencyFilter}
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
        counts={derivedCounts}
        onOpenAddTicket={onOpenAddTicket}
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
        stats={props.stats ?? null}
        title="Exportar Lista de Deudores"
        defaultFileName="deudores-patrocinios-cine"
      />
    </div>
  );
};
