import React, { useState } from 'react';
import { useTicketStats } from '../hooks/useTicketStats';
import { useMerchants } from '../hooks/useMerchants';
import { TicketProgressCard } from '../components/tickets/TicketProgressCard';
import { MerchantFilterTabs } from '../components/merchants/MerchantFilterTabs';
import { MerchantGrid } from '../components/merchants/MerchantGrid';
import { MerchantFormModal } from '../components/merchants/MerchantFormModal';
import { QuickAbonoModal } from '../components/merchants/QuickAbonoModal';
import type { Merchant, CreateMerchantDTO } from '../../domain/models/Merchant';
import { Database, Sparkles } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { stats, percentage, adjustSold } = useTicketStats();
  const {
    merchants, allMerchants, loading, filter, setFilter, search, setSearch,
    counts, finances, createMerchant, updateMerchant, markAsPaid, addPayment, deleteMerchant,
  } = useMerchants();

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [abonoMerchant, setAbonoMerchant] = useState<Merchant | null>(null);

  const handleOpenCreate = () => { setSelectedMerchant(null); setFormModalOpen(true); };
  const handleOpenEdit = (m: Merchant) => { setSelectedMerchant(m); setFormModalOpen(true); };

  const handleFormSubmit = async (dto: CreateMerchantDTO) => {
    if (selectedMerchant) await updateMerchant(selectedMerchant.id, dto);
    else await createMerchant(dto);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Panel de Rifa & Patrocinios
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">Control de tickets y gestión de cobros en comercios</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-400">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Base Local (Dexie.js / IndexedDB)</span>
            </span>
          </div>
        </header>

        <TicketProgressCard
          stats={stats}
          percentage={percentage}
          totalRaised={finances.totalRaised}
          pendingReceivable={finances.pendingReceivable}
          merchantsCount={allMerchants.length}
          onAdjustSold={adjustSold}
        />

        <section className="space-y-4 pt-2">
          <MerchantFilterTabs
            activeFilter={filter}
            onSelectFilter={setFilter}
            search={search}
            onSearchChange={setSearch}
            counts={counts}
            onOpenCreateModal={handleOpenCreate}
          />

          <MerchantGrid
            merchants={merchants}
            loading={loading}
            onEdit={handleOpenEdit}
            onDelete={deleteMerchant}
            onMarkAsPaid={markAsPaid}
            onOpenQuickAbono={setAbonoMerchant}
            onOpenCreate={handleOpenCreate}
          />
        </section>
      </div>

      <MerchantFormModal
        isOpen={formModalOpen}
        initialData={selectedMerchant}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <QuickAbonoModal
        merchant={abonoMerchant}
        onClose={() => setAbonoMerchant(null)}
        onSubmit={addPayment}
      />
    </div>
  );
};
