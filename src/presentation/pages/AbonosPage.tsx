import React, { useMemo, useState } from 'react';
import { TableFilterBar } from '../components/tables/TableFilterBar';
import { MerchantsDataTable } from '../components/tables/MerchantsDataTable';
import { ExcelExportModal } from '../components/common/ExcelExportModal';
import type { Merchant } from '../../domain/models/Merchant';
import type { RaffleStats } from '../../domain/models/RaffleStats';
import type { CurrencyFilter, SortOption } from '../hooks/useMerchants';
import { Clock, DollarSign, FileSpreadsheet } from 'lucide-react';
import { formatMoney } from '../../core/utils/currencyFormatter';

interface Props {
  allMerchants: Merchant[];
  stats: RaffleStats | null;
  loading: boolean;
  search: string;
  setSearch: (s: string) => void;
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
  counts: { all: number; paid: number; pending: number; unpaid: number; cop?: number; usd?: number };
  onSelectMerchant: (m: Merchant) => void;
  onOpenAbono: (m: Merchant) => void;
  onMarkAsPaid: (id: string) => void;
  onOpenAddTicket: () => void;
}

export const AbonosPage: React.FC<Props> = ({
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
  const [currencyFilter, setCurrencyFilter] = useState<CurrencyFilter>('all');

  const abonosMerchants = useMemo(() => {
    const query = search.toLowerCase().trim();
    return allMerchants
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
  }, [allMerchants, search, currencyFilter]);

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
              Patrocinadores con cuotas iniciales recibidas y saldos por liquidar
            </p>
          </div>
        </div>

        {/* Cajas Bimoneda de Abonos */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <div className="bg-white dark:bg-slate-900/90 border border-amber-300 dark:border-amber-800 p-2.5 rounded-xl flex items-center gap-2 shadow-xs">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Abonado (COP / USD)</span>
              <div className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                {formatMoney(totalAbonadoCOP, 'COP', true)} • {formatMoney(totalAbonadoUSD, 'USD', true)}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/90 border border-amber-300 dark:border-amber-800 p-2.5 rounded-xl flex items-center gap-2 shadow-xs">
            <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Por Cobrar (COP / USD)</span>
              <div className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400">
                {formatMoney(totalRestanteCOP, 'COP', true)} • {formatMoney(totalRestanteUSD, 'USD', true)}
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
        counts={counts}
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
        stats={stats}
        title="Exportar Reporte de Abonos"
        defaultFileName="abonos-patrocinios-cine"
      />
    </div>
  );
};
