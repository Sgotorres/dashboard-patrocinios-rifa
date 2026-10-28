import React from 'react';
import { Search, ArrowUpDown, Plus, FileSpreadsheet } from 'lucide-react';
import type { FilterStatus, SortOption } from '../../hooks/useMerchants';

interface Props {
  activeFilter: FilterStatus;
  onSelectFilter: (filter: FilterStatus) => void;
  search: string;
  onSearchChange: (val: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  counts: { all: number; paid: number; pending: number; unpaid: number };
  onOpenAddTicket: () => void;
  onExportExcel?: () => void;
  showStatusFilters?: boolean;
}

export const TableFilterBar: React.FC<Props> = ({
  activeFilter,
  onSelectFilter,
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  counts,
  onOpenAddTicket,
  onExportExcel,
  showStatusFilters = true,
}) => {
  const tabs: { key: FilterStatus; label: string; count: number; activeStyle: string }[] = [
    {
      key: 'all',
      label: 'Todos',
      count: counts.all,
      activeStyle: 'bg-indigo-600 text-white shadow-xs',
    },
    {
      key: 'paid',
      label: 'Pagados (Verde)',
      count: counts.paid,
      activeStyle: 'bg-emerald-600 text-white shadow-xs',
    },
    {
      key: 'pending',
      label: 'Abonos (Amarillo)',
      count: counts.pending,
      activeStyle: 'bg-amber-400 text-amber-950 font-black shadow-xs',
    },
    {
      key: 'unpaid',
      label: 'Deudores (Rojo)',
      count: counts.unpaid,
      activeStyle: 'bg-rose-600 text-white shadow-xs',
    },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
      {/* Tabs */}
      {showStatusFilters ? (
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto shadow-xs">
          {tabs.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onSelectFilter(tab.key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? tab.activeStyle
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-black/20 text-inherit' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      ) : <div />}

      {/* Search, Sort and Action controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 sm:w-56">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar comercio o tel..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 shadow-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-transparent text-slate-700 dark:text-slate-300 font-semibold focus:outline-none cursor-pointer py-1"
          >
            <option value="recent">Más recientes</option>
            <option value="debt-desc">Mayor deuda ($)</option>
            <option value="paid-desc">Mayor abono ($)</option>
            <option value="tickets-desc">Más tickets</option>
            <option value="name">Nombre (A-Z)</option>
          </select>
        </div>

        {onExportExcel && (
          <button
            type="button"
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs cursor-pointer whitespace-nowrap transition-colors"
            title="Descargar reporte en formato compatible con Excel (.csv UTF-8)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenAddTicket}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-xs cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Vender Ticket</span>
        </button>
      </div>
    </div>
  );
};
