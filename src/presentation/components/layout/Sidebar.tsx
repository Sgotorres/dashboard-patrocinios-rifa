import React from 'react';
import {
  LayoutDashboard,
  Store,
  AlertTriangle,
  Clock,
  Ticket,
  PlusCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

export type ActiveTab = 'dashboard' | 'all-merchants' | 'debtors' | 'abonos';

interface Props {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  counts: { all: number; paid: number; pending: number; unpaid: number };
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenAddTicket: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  counts,
  isOpenMobile,
  onCloseMobile,
  onOpenAddTicket,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; badge?: number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard General',
      icon: LayoutDashboard,
    },
    {
      id: 'all-merchants',
      label: 'Comercios Totales',
      icon: Store,
      badge: counts.all,
      badgeColor: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300',
    },
    {
      id: 'debtors',
      label: 'Tabla de Deudores',
      icon: AlertTriangle,
      badge: counts.unpaid,
      badgeColor: 'bg-rose-500 text-white font-black',
    },
    {
      id: 'abonos',
      label: 'Tabla de Abonos',
      icon: Clock,
      badge: counts.pending,
      badgeColor: 'bg-amber-400 text-amber-950 font-black',
    },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          {/* Logo Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight flex items-center gap-1">
                  <span>Rifa & Cobranzas</span>
                </h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Control de Patrocinios
                </p>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 md:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Button */}
          <div className="pt-4 pb-2">
            <button
              onClick={() => {
                onOpenAddTicket();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Añadir Ticket / Comercio</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 pt-3 flex-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 px-3">
              Módulos Principales
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Theme Toggle */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Tema Visual
            </span>
            <ThemeToggle showLabel={false} />
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Base Local Offline (Dexie.js)</span>
          </div>
        </div>
      </aside>
    </>
  );
};
