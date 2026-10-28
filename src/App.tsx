import { useState } from 'react';
import { ThemeProvider } from './core/context/ThemeContext';
import { AppLayout } from './presentation/components/layout/AppLayout';
import type { ActiveTab } from './presentation/components/layout/Sidebar';
import { useMerchants } from './presentation/hooks/useMerchants';
import { useTicketStats } from './presentation/hooks/useTicketStats';
import { DashboardOverviewPage } from './presentation/pages/DashboardOverviewPage';
import { AllMerchantsPage } from './presentation/pages/AllMerchantsPage';
import { DebtorsPage } from './presentation/pages/DebtorsPage';
import { AbonosPage } from './presentation/pages/AbonosPage';
import { AddTicketModal } from './presentation/components/merchants/AddTicketModal';
import { MerchantDetailModal } from './presentation/components/merchants/MerchantDetailModal';
import { QuickAbonoModal } from './presentation/components/merchants/QuickAbonoModal';
import { MerchantFormModal } from './presentation/components/merchants/MerchantFormModal';
import { CampaignConfigModal } from './presentation/components/dashboard/CampaignConfigModal';
import type { Merchant } from './domain/models/Merchant';

function DashboardApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const {
    merchants,
    allMerchants,
    loading: loadingMerchants,
    filter,
    setFilter,
    search,
    setSearch,
    sortBy,
    setSortBy,
    counts,
    finances,
    createMerchant,
    updateMerchant,
    markAsPaid,
    addPayment,
    addTickets,
    deleteMerchant,
  } = useMerchants();

  const {
    stats,
    percentage,
    remainingTickets,
    updateCampaign,
  } = useTicketStats();

  // Modals state
  const [isAddTicketOpen, setIsAddTicketOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [detailMerchant, setDetailMerchant] = useState<Merchant | null>(null);
  const [editMerchant, setEditMerchant] = useState<Merchant | null>(null);
  const [abonoMerchant, setAbonoMerchant] = useState<Merchant | null>(null);

  // Keep selected merchant detail in sync with latest allMerchants state
  const currentDetailMerchant = detailMerchant
    ? allMerchants.find((m) => m.id === detailMerchant.id) || detailMerchant
    : null;

  return (
    <AppLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      counts={counts}
      campaignName={stats?.campaignName || 'Gran Rifa y Patrocinios'}
      onOpenAddTicket={() => setIsAddTicketOpen(true)}
    >
      {activeTab === 'dashboard' && (
        <DashboardOverviewPage
          stats={stats}
          percentage={percentage}
          remainingTickets={remainingTickets}
          onOpenConfig={() => setIsConfigOpen(true)}
          onOpenAddTicket={() => setIsAddTicketOpen(true)}
          finances={finances}
          merchants={merchants}
          allMerchants={allMerchants}
          loading={loadingMerchants}
          filter={filter}
          setFilter={setFilter}
          search={search}
          setSearch={setSearch}
          sortBy={sortBy}
          setSortBy={setSortBy}
          counts={counts}
          onSelectMerchant={setDetailMerchant}
          onOpenAbono={setAbonoMerchant}
          onMarkAsPaid={markAsPaid}
          onGoToSection={setActiveTab}
        />
      )}

      {activeTab === 'all-merchants' && (
        <AllMerchantsPage
          merchants={merchants}
          allMerchants={allMerchants}
          stats={stats}
          loading={loadingMerchants}
          filter={filter}
          setFilter={setFilter}
          search={search}
          setSearch={setSearch}
          sortBy={sortBy}
          setSortBy={setSortBy}
          counts={counts}
          onSelectMerchant={setDetailMerchant}
          onOpenAbono={setAbonoMerchant}
          onMarkAsPaid={markAsPaid}
          onOpenAddTicket={() => setIsAddTicketOpen(true)}
        />
      )}

      {activeTab === 'debtors' && (
        <DebtorsPage
          allMerchants={allMerchants}
          stats={stats}
          loading={loadingMerchants}
          search={search}
          setSearch={setSearch}
          sortBy={sortBy}
          setSortBy={setSortBy}
          counts={counts}
          onSelectMerchant={setDetailMerchant}
          onOpenAbono={setAbonoMerchant}
          onMarkAsPaid={markAsPaid}
          onOpenAddTicket={() => setIsAddTicketOpen(true)}
        />
      )}

      {activeTab === 'abonos' && (
        <AbonosPage
          allMerchants={allMerchants}
          stats={stats}
          loading={loadingMerchants}
          search={search}
          setSearch={setSearch}
          sortBy={sortBy}
          setSortBy={setSortBy}
          counts={counts}
          onSelectMerchant={setDetailMerchant}
          onOpenAbono={setAbonoMerchant}
          onMarkAsPaid={markAsPaid}
          onOpenAddTicket={() => setIsAddTicketOpen(true)}
        />
      )}

      {/* Add Ticket / Register Merchant Modal */}
      <AddTicketModal
        isOpen={isAddTicketOpen}
        onClose={() => setIsAddTicketOpen(false)}
        defaultTicketPrice={stats?.ticketPrice || 10}
        existingMerchants={allMerchants}
        onRegisterNewMerchant={createMerchant}
        onAddTicketsToExisting={(id, count) => addTickets(id, count)}
      />

      {/* Merchant Detail Modal */}
      <MerchantDetailModal
        merchant={currentDetailMerchant}
        isOpen={Boolean(detailMerchant)}
        onClose={() => setDetailMerchant(null)}
        onOpenAbono={setAbonoMerchant}
        onMarkAsPaid={markAsPaid}
        onEdit={setEditMerchant}
        onDelete={deleteMerchant}
        onAddTicket={() => setIsAddTicketOpen(true)}
      />

      {/* Quick Abono Modal */}
      <QuickAbonoModal
        merchant={abonoMerchant}
        isOpen={Boolean(abonoMerchant)}
        onClose={() => setAbonoMerchant(null)}
        onSubmit={addPayment}
      />

      {/* Edit Merchant Modal */}
      <MerchantFormModal
        isOpen={Boolean(editMerchant)}
        initialData={editMerchant}
        onClose={() => setEditMerchant(null)}
        onSubmit={async (id, data) => {
          await updateMerchant(id, data);
        }}
      />

      {/* Campaign Config Modal */}
      <CampaignConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        stats={stats}
        onSave={updateCampaign}
      />
    </AppLayout>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <DashboardApp />
    </ThemeProvider>
  );
}

export default App;
