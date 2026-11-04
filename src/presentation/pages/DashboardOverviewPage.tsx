import React, { useDeferredValue, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketProgressBar } from '../components/dashboard/TicketProgressBar';
import { FinanceSummaryCards } from '../components/dashboard/FinanceSummaryCards';
import { TableFilterBar } from '../components/tables/TableFilterBar';
import { MerchantsDataTable } from '../components/tables/MerchantsDataTable';
import { ExcelExportModal } from '../components/common/ExcelExportModal';
import type { RaffleStats } from '../../domain/models/RaffleStats';
import type { Merchant } from '../../domain/models/Merchant';
import type { CurrencyFilter, CurrencyFinances, FilterStatus } from '../hooks/useMerchants';
import { sortMerchants, type SortOption } from '../../core/utils/merchantSorter';
import { Sparkles, ArrowRight, FileSpreadsheet } from 'lucide-react';
import {
  calculateCashboxToday,
  calculateMerchantCounts,
  calculateMerchantFinances,
  useMerchantsStore,
} from '../stores/useMerchantsStore';
import { useModalStore } from '../stores/useModalStore';
import { useTicketStats } from '../hooks/useTicketStats';

interface Props {
  stats?: RaffleStats | null;
  percentage?: number;
  remainingTickets?: number;
  onOpenConfig?: () => void;
  onOpenAddTicket?: () => void;
  finances?: {
    cop: CurrencyFinances;
    usd: CurrencyFinances;
  };
  todayCashbox?: {
    totalTodayCOP: number;
    totalTodayUSD: number;
    countToday: number;
  };
  merchants?: Merchant[];
  allMerchants?: Merchant[];
  loading?: boolean;
  filter?: FilterStatus;
  setFilter?: (f: FilterStatus) => void;
  currencyFilter?: CurrencyFilter;
  setCurrencyFilter?: (c: CurrencyFilter) => void;
  search?: string;
  setSearch?: (s: string) => void;
  sortBy?: SortOption;
  setSortBy?: (s: SortOption) => void;
  counts?: { all: number; paid: number; pending: number; unpaid: number; cop: number; usd: number };
  onSelectMerchant?: (m: Merchant) => void;
  onOpenAbono?: (m: Merchant) => void;
  onMarkAsPaid?: (id: string) => void;
  onGoToSection?: (section: 'all-merchants' | 'debtors' | 'abonos') => void;
}

export const DashboardOverviewPage: React.FC<Props> = (props) => {
  const navigate = useNavigate();
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Hook ticket stats fallback
  const ticketStats = useTicketStats();
  const stats = props.stats !== undefined ? props.stats : ticketStats.stats;
  const percentage = props.percentage !== undefined ? props.percentage : ticketStats.percentage;
  const remainingTickets = props.remainingTickets !== undefined ? props.remainingTickets : ticketStats.remainingTickets;

  // Modal store fallback
  const openConfig = useModalStore((s) => s.openConfig);
  const openAddTicket = useModalStore((s) => s.openAddTicket);
  const openDetailModal = useModalStore((s) => s.openDetail);
  const openAbonoModal = useModalStore((s) => s.openAbono);

  const onOpenConfig = props.onOpenConfig ?? (() => openConfig(true));
  const onOpenAddTicket = props.onOpenAddTicket ?? (() => openAddTicket(true));
  const onSelectMerchant = props.onSelectMerchant ?? openDetailModal;
  const onOpenAbono = props.onOpenAbono ?? openAbonoModal;

  // Merchants store fallback
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
  const onMarkAsPaid = props.onMarkAsPaid ?? storeMarkAsPaid;

  const finances = useMemo(() => {
    if (props.finances) return props.finances;
    return calculateMerchantFinances(allMerchants);
  }, [props.finances, allMerchants]);

  const todayCashbox = useMemo(() => {
    if (props.todayCashbox) return props.todayCashbox;
    return calculateCashboxToday(allMerchants);
  }, [props.todayCashbox, allMerchants]);

  const counts = useMemo(() => {
    if (props.counts) return props.counts;
    return calculateMerchantCounts(allMerchants);
  }, [props.counts, allMerchants]);

  const deferredSearch = useDeferredValue(search);

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

  const handleGoToSection = (section: 'all-merchants' | 'debtors' | 'abonos') => {
    if (props.onGoToSection) {
      props.onGoToSection(section);
      return;
    }
    const routeMap: Record<'all-merchants' | 'debtors' | 'abonos', string> = {
      'all-merchants': '/patrocinadores',
      'debtors': '/deudores',
      'abonos': '/abonos',
    };
    navigate(routeMap[section]);
  };

  return (
    <div className="space-y-6">
      {/* Ticket Progress Card */}
      <TicketProgressBar
        stats={stats}
        percentage={percentage}
        remainingTickets={remainingTickets}
        onOpenConfig={onOpenConfig}
        onOpenAddTicket={onOpenAddTicket}
      />

      {/* Finance KPI Cards con Selector Bimoneda COP / USD */}
      <FinanceSummaryCards
        finances={finances}
        todayCashbox={todayCashbox}
        counts={{
          cop: counts.cop,
          usd: counts.usd,
          all: allMerchants.length,
        }}
      />

      {/* Quick Access Badges for Deudores & Abonos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <button
          onClick={() => handleGoToSection('debtors')}
          className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-left hover:border-rose-400 transition-colors cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
              <span className="font-extrabold text-rose-700 dark:text-rose-400 uppercase tracking-wider text-[11px]">
                Sección Deudores ({counts.unpaid})
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-semibold mt-1">
              Patrocinadores que no han pagado la publicidad (Rojo)
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 ml-2" />
        </button>

        <button
          onClick={() => handleGoToSection('abonos')}
          className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-left hover:border-amber-400 transition-colors cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider text-[11px]">
                Sección Abonos ({counts.pending})
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-semibold mt-1">
              Patrocinadores con abonos parciales y saldo pendiente (Amarillo)
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 ml-2" />
        </button>
      </div>

      {/* Filter, Export and Merchants Data Table */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Control de Cobros & Patrocinadores de Cine
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar Excel</span>
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
          counts={counts}
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
            await ticketStats.refresh();
          }}
        />
      </section>

      <ExcelExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        merchants={allMerchants}
        stats={stats}
        title="Exportar Control General a Excel"
        defaultFileName="reporte-general-patrocinios-cine"
      />
    </div>
  );
};
