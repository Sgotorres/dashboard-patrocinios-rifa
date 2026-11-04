import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from './core/context/ThemeContext';
import { AppLayout } from './presentation/components/layout/AppLayout';
import { useTicketStats } from './presentation/hooks/useTicketStats';
import { useMerchantsStore } from './presentation/stores/useMerchantsStore';
import { useModalStore } from './presentation/stores/useModalStore';

// Vistas
import { DashboardOverviewPage } from './presentation/pages/DashboardOverviewPage';
import { AllMerchantsPage } from './presentation/pages/AllMerchantsPage';
import { DebtorsPage } from './presentation/pages/DebtorsPage';
import { AbonosPage } from './presentation/pages/AbonosPage';

// Modales globales
import { AddTicketModal } from './presentation/components/merchants/AddTicketModal';
import { MerchantDetailModal } from './presentation/components/merchants/MerchantDetailModal';
import { QuickAbonoModal } from './presentation/components/merchants/QuickAbonoModal';
import { MerchantFormModal } from './presentation/components/merchants/MerchantFormModal';
import { CampaignConfigModal } from './presentation/components/dashboard/CampaignConfigModal';
import { BackupModal } from './presentation/components/common/BackupModal';
import { QuickSearchModal } from './presentation/components/common/QuickSearchModal';
import { ErrorBoundary } from './presentation/components/common/ErrorBoundary';

function DashboardApp() {
  const {
    stats,
    updateCampaign,
    refresh: refreshStats,
  } = useTicketStats();

  const merchants = useMerchantsStore((s) => s.merchants);
  const loadMerchants = useMerchantsStore((s) => s.loadMerchants);
  const createMerchant = useMerchantsStore((s) => s.createMerchant);
  const updateMerchant = useMerchantsStore((s) => s.updateMerchant);
  const markAsPaid = useMerchantsStore((s) => s.markAsPaid);
  const addPayment = useMerchantsStore((s) => s.addPayment);
  const addTickets = useMerchantsStore((s) => s.addTickets);
  const deleteMerchant = useMerchantsStore((s) => s.deleteMerchant);

  // Modal store state
  const isAddTicketOpen = useModalStore((s) => s.isAddTicketOpen);
  const isConfigOpen = useModalStore((s) => s.isConfigOpen);
  const isBackupOpen = useModalStore((s) => s.isBackupOpen);
  const isSearchOpen = useModalStore((s) => s.isSearchOpen);
  const detailMerchant = useModalStore((s) => s.detailMerchant);
  const editMerchant = useModalStore((s) => s.editMerchant);
  const abonoMerchant = useModalStore((s) => s.abonoMerchant);

  const openAddTicket = useModalStore((s) => s.openAddTicket);
  const openConfig = useModalStore((s) => s.openConfig);
  const openBackup = useModalStore((s) => s.openBackup);
  const openSearch = useModalStore((s) => s.openSearch);
  const openDetail = useModalStore((s) => s.openDetail);
  const openEdit = useModalStore((s) => s.openEdit);
  const openAbono = useModalStore((s) => s.openAbono);

  // Carga inicial
  useEffect(() => {
    loadMerchants();
  }, [loadMerchants]);

  // Atajo global Ctrl+K / Cmd+K para abrir el buscador rápido
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openSearch]);

  // Sincronizar el comercio seleccionado en detalle con el estado más reciente
  const currentDetailMerchant = detailMerchant
    ? merchants.find((m) => m.id === detailMerchant.id) || detailMerchant
    : null;

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardOverviewPage />} />
        <Route path="/patrocinadores" element={<AllMerchantsPage />} />
        <Route path="/deudores" element={<DebtorsPage />} />
        <Route path="/debtors" element={<Navigate to="/deudores" replace />} />
        <Route path="/abonos" element={<AbonosPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Add Ticket / Register Merchant Modal */}
      <AddTicketModal
        isOpen={isAddTicketOpen}
        onClose={() => openAddTicket(false)}
        defaultTicketPrice={stats?.ticketPriceCOP || 50000}
        existingMerchants={merchants}
        onRegisterNewMerchant={async (dto) => {
          const res = await createMerchant(dto);
          await refreshStats();
          return res;
        }}
        onAddTicketsToExisting={async (id, count) => {
          const res = await addTickets(id, count);
          await refreshStats();
          return res;
        }}
      />

      {/* Merchant Detail Modal */}
      <MerchantDetailModal
        merchant={currentDetailMerchant}
        isOpen={Boolean(detailMerchant)}
        onClose={() => openDetail(null)}
        onOpenAbono={openAbono}
        onMarkAsPaid={markAsPaid}
        onEdit={openEdit}
        onDelete={async (id) => {
          await deleteMerchant(id);
          await refreshStats();
        }}
        onAddTicket={() => openAddTicket(true)}
      />

      {/* Quick Abono Modal con Recibo WhatsApp */}
      <QuickAbonoModal
        merchant={abonoMerchant}
        isOpen={Boolean(abonoMerchant)}
        onClose={() => openAbono(null)}
        onSubmit={addPayment}
      />

      {/* Edit Merchant Modal */}
      <MerchantFormModal
        isOpen={Boolean(editMerchant)}
        initialData={editMerchant}
        onClose={() => openEdit(null)}
        onSubmit={async (id, data) => {
          await updateMerchant(id, data);
          await refreshStats();
        }}
      />

      {/* Campaign Config Modal */}
      <CampaignConfigModal
        isOpen={isConfigOpen}
        onClose={() => openConfig(false)}
        stats={stats}
        onSave={updateCampaign}
      />

      {/* Backup and Restore Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => openBackup(false)}
        onDataRestored={async () => {
          await loadMerchants();
          await refreshStats();
        }}
      />

      {/* Quick Search Spotlight Modal (Ctrl+K) */}
      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => openSearch(false)}
        merchants={merchants}
        onSelectMerchant={openDetail}
        onOpenAbono={openAbono}
      />
    </AppLayout>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <DashboardApp />
          <Toaster richColors position="top-right" closeButton />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
