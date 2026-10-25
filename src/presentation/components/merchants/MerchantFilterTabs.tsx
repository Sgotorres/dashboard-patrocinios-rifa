import React from 'react';
import type { FilterStatus } from '../../hooks/useMerchants';
import { Search, Plus } from 'lucide-react';

interface Props {
  activeFilter: FilterStatus;
  onSelectFilter: (filter: FilterStatus) => void;
  search: string;
  onSearchChange: (query: string) => void;
  counts: { all: number; paid: number; pending: number; unpaid: number };
  onOpenCreateModal: () => void;
}

export const MerchantFilterTabs: React.FC<Props> = ({
  activeFilter,
  onSelectFilter,
  search,
  onSearchChange,
  counts,
  onOpenCreateModal,
}) => {
  const tabs: { key: FilterStatus; label: string; count: number }[] = [
    { key: 'all', label: 'Todos', count: counts.all },
    { key: 'paid', label: 'Pagados', count: counts.paid },
    { key: 'pending', label: 'Pendientes', count: counts.pending },
    { key: 'unpaid', label: 'No Pagados', count: counts.unpaid },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectFilter(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-indigo-800/80 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="relative flex-1 md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar comercio o tel..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Comercio</span>
        </button>
      </div>
    </div>
  );
};
