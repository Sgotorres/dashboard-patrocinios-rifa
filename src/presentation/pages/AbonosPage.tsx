import React, { useDeferredValue, useMemo, useState } from 'react';
import { TableFilterBar } from '../components/tables/TableFilterBar';
import { MerchantsDataTable } from '../components/tables/MerchantsDataTable';
import { ExcelExportModal } from '../components/common/ExcelExportModal';
import type { Merchant } from '../../domain/models/Merchant';
import type { RaffleStats } from '../../domain/models/RaffleStats';
import { sortMerchants, type SortOption } from '../../core/utils/merchantSorter';
import type { CurrencyFilter } from '../hooks/useMerchants';
import { Clock, DollarSign, FileSpreadsheet } from 'lucide-react';
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

export const AbonosPage: React.FC<Props> = (props) => {
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

  // React 19 useDeferredValue para evitar congelamientos en búsquedas
  const deferredSearch = useDeferredValue(search);

  // Filtrado y ORDENAMIENTO (CORREGIDO: incluye sortMerchants y dependencia sortBy)
  const abonosMerchants = useMemo(() => {
    const query = deferredSearch.toLowerCase().trim();
    const filtered = allMerchants
      .filter((m) => m.paymentStatus === 'pending')
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

  const totalAbonadoCOP = useMemo(() => {
    return abonosMerchants
      .filter((m) => (m.currency || 'COP') === 'COP')
      .reduce((sum, m) => sum + m.amountPaid, 0);
  }, [abonosMerchants]);

  const totalAbonadoUSD = useMemo(() => {
    return abonosMerchants
      .filter((m) => m.currency === 'USD')
      .reduce((sum, m) => sum + m.amountPaid, 0);
  }, [abonosMerchants]);

  const totalRestanteCOP = useMemo(() => {
    return abonosMerchants
      .filter((m) => (m.currency || 'COP') === 'COP')
      .reduce((sum, m) => sum + (m.totalFee - m.amountPaid), 0);
  }, [abonosMerchants]);

  const totalRestanteUSD = useMemo(() => {
    return abonosMerchants
      .filter((m) => m.currency === 'USD')
      .reduce((sum, m) => sum + (m.totalFee - m.amountPaid), 0);
  }, [abonosMerchants]);

  const derivedCounts = useMemo(() => {
    if (props.counts) return props.counts;
    return calculateMerchantCounts(allMerchants);
  }, [props.counts, allMerchants]);

  return (
    <div className="space-y-5">
      {/* Yellow / Amber Highlight Header */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-amber-950/20 border border-amber-300 dark:border-amber-900/60 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-400 text-amber-950 font-black shadow-md shadow-amber-400/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Tabla de Abonos Realizados
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black uppercase">
                Abono Parcial (Amarillo)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Anunciantes con abonos recibidos y saldos pendientes por liquidar
            </p>
          </div>
        </div>

        {/* Cajas de Métricas Bimoneda */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* COP Box */}
          <div className="bg-white dark:bg-slate-900/90 border border-amber-300 dark:border-amber-800 p-2.5 rounded-xl flex items-center gap-2.5 shadow-xs">
            <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">
                COP Abonado / Por Cobrar
              </span>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black">
                <span className="text-amber-600 dark:text-amber-400">
                  {formatMoney(totalAbonadoCOP, 'COP', true)}
                </span>
                <span className="text-slate-400">/</span>
                <span className="text-rose-600 dark:text-rose-400">
                  {formatMoney(totalRestanteCOP, 'COP', true)}
                </span>
              </div>
            </div>
          </div>

          {/* USD Box */}
          <div className="bg-white dark:bg-slate-900/90 border border-amber-300 dark:border-amber-800 p-2.5 rounded-xl flex items-center gap-2.5 shadow-xs">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">
                USD Abonado / Por Cobrar
              </span>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black">
                <span className="text-amber-600 dark:text-amber-400">
                  {formatMoney(totalAbonadoUSD, 'USD', true)}
                </span>
                <span className="text-slate-400">/</span>
                <span className="text-rose-600 dark:text-rose-400">
                  {formatMoney(totalRestanteUSD, 'USD', true)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsExportOpen(true)}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Exportar abonos a Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden md:inline">Descargar</span>
          </button>
        </div>
      </div>

      <TableFilterBar
        activeFilter="pending"
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
        merchants={abonosMerchants}
        loading={loading}
        onSelectMerchant={onSelectMerchant}
        onOpenAbono={onOpenAbono}
        onMarkAsPaid={onMarkAsPaid}
        onOpenAddTicket={onOpenAddTicket}
      />

      <ExcelExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        merchants={abonosMerchants}
        stats={props.stats ?? null}
        title="Exportar Lista de Abonos"
        defaultFileName="abonos-patrocinios-cine"
      />
    </div>
  );
};
