import React from 'react';
import { Menu, Plus } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import type { ActiveTab } from './Sidebar';

interface Props {
  activeTab: ActiveTab;
  onOpenMobileSidebar: () => void;
  onOpenAddTicket: () => void;
  campaignName: string;
}

export const Header: React.FC<Props> = ({
  activeTab,
  onOpenMobileSidebar,
  onOpenAddTicket,
  campaignName,
}) => {
  const titles: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Panel General de Rifa',
      subtitle: campaignName || 'Seguimiento de ventas, recaudación y patrocinios',
    },
    'all-merchants': {
      title: 'Comercios Totales',
      subtitle: 'Listado completo de establecimientos que adquirieron tickets',
    },
    debtors: {
      title: 'Tabla de Deudores',
      subtitle: 'Comercios con pago pendiente (Alerta en Rojo)',
    },
    abonos: {
      title: 'Tabla de Abonos',
      subtitle: 'Comercios con pagos parciales y saldos a liquidar (Amarillo)',
    },
  };

  const { title, subtitle } = titles[activeTab];

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 -ml-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl md:hidden cursor-pointer"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
            {title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle className="hidden sm:flex" />

        <button
          onClick={onOpenAddTicket}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Añadir Ticket</span>
          <span className="sm:hidden">Ticket</span>
        </button>
      </div>
    </header>
  );
};
