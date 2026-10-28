import React, { useMemo, useState } from 'react';
import { TableFilterBar } from '../components/tables/TableFilterBar';
import { MerchantsDataTable } from '../components/tables/MerchantsDataTable';
import { ExcelExportModal } from '../components/common/ExcelExportModal';
import type { Merchant } from '../../domain/models/Merchant';
import type { RaffleStats } from '../../domain/models/RaffleStats';
import type { SortOption } from '../hooks/useMerchants';
import { Clock, DollarSign, FileSpreadsheet } from 'lucide-react';

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

  const abonosMerchants = useMemo(() => {
    const query = search.toLowerCase().trim();
    return allMerchants
      .filter((m) => m.paymentStatus === 'pending')
      .filter((m) => {
        if (!query) return true;
        return (
          m.name.toLowerCase().includes(query) ||
          m.phone.toLowerCase().includes(query) ||
          m.address.toLowerCase().includes(query)
        );
      });
  }, [allMerchants, search]);

  const totalAbonado = useMemo(() => {
    return abonosMerchants.reduce((sum, m) => sum + m.amountPaid, 0);
  }, [abonosMerchants]);

  const totalRestante = useMemo(() => {
    return abonosMerchants.reduce((sum, m) => sum + (m.totalFee - m.amountPaid), 0);
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
              Establecimientos que han dado cuotas iniciales y registran saldo pendiente
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <div className="bg-white dark:bg-slate-900/90 border border-amber-300 dark:border-amber-800 p-2.5 rounded-xl flex items-center gap-2 shadow-xs">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Total Abonado</span>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                ${totalAbonado.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/90 border border-amber-300 dark:border-amber-800 p-2.5 rounded-xl flex items-center gap-2 shadow-xs">
            <DollarSign className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Por Cobrar</span>
              <div className="text-base font-black text-amber-500 dark:text-amber-400">
                ${totalRestante.toFixed(2)}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold transition-colors cursor-pointer shadow-xs"
            title="Exportar abonos a Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Excel Abonos</span>
          </button>
        </div>
      </div>

      <TableFilterBar
        activeFilter="pending"
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
        title="Exportar Lista de Abonos"
        defaultFileName="reporte-abonos-rifa"
      />
    </div>
  );
};
