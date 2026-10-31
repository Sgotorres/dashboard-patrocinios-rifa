import React, { useState } from 'react';
import { TicketProgressBar } from '../components/dashboard/TicketProgressBar';
import { FinanceSummaryCards } from '../components/dashboard/FinanceSummaryCards';
import { TableFilterBar } from '../components/tables/TableFilterBar';
import { MerchantsDataTable } from '../components/tables/MerchantsDataTable';
import { ExcelExportModal } from '../components/common/ExcelExportModal';
import type { RaffleStats } from '../../domain/models/RaffleStats';
import type { Merchant } from '../../domain/models/Merchant';
import type { CurrencyFilter, CurrencyFinances, FilterStatus, SortOption } from '../hooks/useMerchants';
import { Sparkles, ArrowRight, FileSpreadsheet } from 'lucide-react';

interface Props {
  stats: RaffleStats | null;
  percentage: number;
  remainingTickets: number;
  onOpenConfig: () => void;
  onOpenAddTicket: () => void;
  finances: {
    cop: CurrencyFinances;
    usd: CurrencyFinances;
  };
  todayCashbox: {
    totalTodayCOP: number;
    totalTodayUSD: number;
    countToday: number;
  };
  merchants: Merchant[];
  allMerchants: Merchant[];
  loading: boolean;
  filter: FilterStatus;
  setFilter: (f: FilterStatus) => void;
  currencyFilter: CurrencyFilter;
  setCurrencyFilter: (c: CurrencyFilter) => void;
  search: string;
  setSearch: (s: string) => void;
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
  counts: { all: number; paid: number; pending: number; unpaid: number; cop: number; usd: number };
  onSelectMerchant: (m: Merchant) => void;
  onOpenAbono: (m: Merchant) => void;
  onMarkAsPaid: (id: string) => void;
  onGoToSection: (section: 'all-merchants' | 'debtors' | 'abonos') => void;
}

export const DashboardOverviewPage: React.FC<Props> = ({
  stats,
  percentage,
  remainingTickets,
  onOpenConfig,
  onOpenAddTicket,
  finances,
  todayCashbox,
  merchants,
  allMerchants,
  loading,
  filter,
  setFilter,
  currencyFilter,
  setCurrencyFilter,
  search,
  setSearch,
  sortBy,
  setSortBy,
  counts,
  onSelectMerchant,
  onOpenAbono,
  onMarkAsPaid,
  onGoToSection,
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false);

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
          onClick={() => onGoToSection('debtors')}
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
          onClick={() => onGoToSection('abonos')}
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
          merchants={merchants}
          loading={loading}
          onSelectMerchant={onSelectMerchant}
          onOpenAbono={onOpenAbono}
          onMarkAsPaid={onMarkAsPaid}
          onOpenAddTicket={onOpenAddTicket}
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
