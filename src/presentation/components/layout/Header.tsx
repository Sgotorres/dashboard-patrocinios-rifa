import React from 'react';
import { Menu, Plus } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { CurrencySelector } from '../currency/CurrencySelector';
import { RateBadge } from '../currency/RateBadge';
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
    <header className="sticky top-0 z-20 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2.5 sm:py-3.5 flex flex-wrap items-center justify-between gap-2.5">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 -ml-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl md:hidden cursor-pointer"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-snug truncate">
            {title}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2 sm:gap-2.5 ml-auto">
        {/* Tasa BCV y COP en vivo */}
        <RateBadge />

        {/* Selector de moneda activa: USD | VES | COP */}
        <CurrencySelector compact />

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
