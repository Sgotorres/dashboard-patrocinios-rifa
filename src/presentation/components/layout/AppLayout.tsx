import React, { useState } from 'react';
import { Sidebar, type ActiveTab } from './Sidebar';
import { Header } from './Header';

interface Props {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  counts: { all: number; paid: number; pending: number; unpaid: number };
  campaignName: string;
  onOpenAddTicket: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  counts,
  campaignName,
  onOpenAddTicket,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        counts={counts}
        isOpenMobile={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onOpenAddTicket={onOpenAddTicket}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          onOpenMobileSidebar={() => setMobileOpen(true)}
          onOpenAddTicket={onOpenAddTicket}
          campaignName={campaignName}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
