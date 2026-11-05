import React from 'react';
import {
  LayoutDashboard,
  Store,
  AlertTriangle,
  Clock,
  Palmtree,
  PlusCircle,
  X,
  Waves,
  Sun,
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
      label: 'Panel General',
      icon: LayoutDashboard,
    },
    {
      id: 'all-merchants',
      label: 'Comercios Totales',
      icon: Store,
      badge: counts.all,
      badgeColor: 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300',
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
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          {/* Brand Logo & Title */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 via-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/25">
                  <Palmtree className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 p-0.5 rounded-full bg-amber-400 text-amber-950 shadow-xs">
                  <Sun className="w-2.5 h-2.5" />
                </div>
              </div>
              <div>
                <h1 className="font-black text-sm text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 leading-tight">
                  <span>Gran Rifa</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-300 font-extrabold uppercase border border-teal-200 dark:border-teal-800">
                    Playa
                  </span>
                </h1>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Viaje a la Playa 🏖️
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
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 cursor-pointer transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Añadir Ticket / Comercio</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 pt-3 flex-1">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400 dark:text-slate-500 px-3">
              Módulos de Cobranza
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
                      ? 'bg-teal-50/80 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-l-4 border-teal-500 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
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
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Tema Visual
            </span>
            <ThemeToggle showLabel={false} />
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Waves className="w-3.5 h-3.5 text-teal-500 shrink-0" />
            <span className="truncate">Rumbo a la Playa &bull; Offline OK</span>
          </div>
        </div>
      </aside>
    </>
  );
};
