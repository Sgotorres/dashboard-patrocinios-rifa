import { create } from 'zustand';
import { toast } from 'sonner';
import {
  addTicketsUseCase,
  clearAllMerchantsUseCase,
  deleteMerchantUseCase,
  getAllMerchantsUseCase,
  markAsPaidUseCase,
  registerMerchantUseCase,
  registerPaymentUseCase,
  updateMerchantUseCase,
} from '../../core/di/container';
import { formatMoney } from '../../core/utils/currencyFormatter';
import type { SortOption } from '../../core/utils/merchantSorter';
import type {
  CreateMerchantDTO,
  CurrencyCode,
  Merchant,
  PaymentStatus,
  UpdateMerchantDTO,
} from '../../domain/models/Merchant';

export type FilterStatus = 'all' | PaymentStatus;
export type CurrencyFilter = 'all' | CurrencyCode;

export interface CurrencyFinances {
  totalInvoiced: number;
  totalRaised: number;
  pendingReceivable: number;
  totalTicketsBought: number;
}

export interface CashboxSummary {
  totalTodayCOP: number;
  totalTodayUSD: number;
  countToday: number;
}

export interface MerchantsCounts {
  all: number;
  paid: number;
  pending: number;
  unpaid: number;
  cop: number;
  usd: number;
}

interface MerchantsState {
  merchants: Merchant[];
  loading: boolean;
  error: string | null;
  filter: FilterStatus;
  currencyFilter: CurrencyFilter;
  search: string;
  sortBy: SortOption;

  // Actions
  loadMerchants: () => Promise<void>;
  createMerchant: (dto: CreateMerchantDTO) => Promise<Merchant>;
  updateMerchant: (id: string, dto: UpdateMerchantDTO) => Promise<Merchant>;
  markAsPaid: (id: string) => Promise<Merchant>;
  addPayment: (id: string, amount: number, note?: string) => Promise<Merchant>;
  addTickets: (id: string, delta: number) => Promise<Merchant>;
  deleteMerchant: (id: string) => Promise<void>;
  clearAllMerchants: () => Promise<void>;
  setFilter: (filter: FilterStatus) => void;
  setCurrencyFilter: (currencyFilter: CurrencyFilter) => void;
  setSearch: (search: string) => void;
  setSortBy: (sortBy: SortOption) => void;
}

export const useMerchantsStore = create<MerchantsState>((set, get) => ({
  merchants: [],
  loading: true,
  error: null,
  filter: 'all',
  currencyFilter: 'all',
  search: '',
  sortBy: 'recent',

  loadMerchants: async () => {
    try {
      set({ loading: true, error: null });
      const data = await getAllMerchantsUseCase.execute();
      set({ merchants: data, loading: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar los comercios';
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  createMerchant: async (dto: CreateMerchantDTO) => {
    try {
      const created = await registerMerchantUseCase.execute(dto);
      set((state) => ({ merchants: [created, ...state.merchants] }));
      toast.success(`Patrocinador "${created.name}" registrado con éxito`);
      return created;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrar el patrocinador';
      toast.error(msg);
      throw err;
    }
  },

  updateMerchant: async (id: string, dto: UpdateMerchantDTO) => {
    try {
      const updated = await updateMerchantUseCase.execute(id, dto);
      set((state) => ({
        merchants: state.merchants.map((m) => (m.id === id ? updated : m)),
      }));
      toast.success(`Comercio "${updated.name}" actualizado`);
      return updated;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar el comercio';
      toast.error(msg);
      throw err;
    }
  },

  markAsPaid: async (id: string) => {
    try {
      const updated = await markAsPaidUseCase.execute(id);
      set((state) => ({
        merchants: state.merchants.map((m) => (m.id === id ? updated : m)),
      }));
      toast.success(`Comercio "${updated.name}" marcado como pagado`);
      return updated;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al marcar como pagado';
      toast.error(msg);
      throw err;
    }
  },

  addPayment: async (id: string, amount: number, note?: string) => {
    try {
      const updated = await registerPaymentUseCase.execute(id, amount, note);
      set((state) => ({
        merchants: state.merchants.map((m) => (m.id === id ? updated : m)),
      }));
      const formatted = formatMoney(amount, updated.currency || 'COP');
      toast.success(`Abono de ${formatted} registrado a "${updated.name}"`);
      return updated;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrar el abono';
      toast.error(msg);
      throw err;
    }
  },

  addTickets: async (id: string, delta: number) => {
    try {
      const updated = await addTicketsUseCase.execute(id, delta);
      set((state) => ({
        merchants: state.merchants.map((m) => (m.id === id ? updated : m)),
      }));
      toast.success(`Se agregaron ${delta} boletos a "${updated.name}"`);
      return updated;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al agregar boletos';
      toast.error(msg);
      throw err;
    }
  },

  deleteMerchant: async (id: string) => {
    try {
      const target = get().merchants.find((m) => m.id === id);
      await deleteMerchantUseCase.execute(id);
      set((state) => ({
        merchants: state.merchants.filter((m) => m.id !== id),
      }));
      toast.success(`Patrocinador ${target ? `"${target.name}"` : ''} eliminado`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar el comercio';
      toast.error(msg);
      throw err;
    }
  },

  clearAllMerchants: async () => {
    try {
      set({ loading: true, error: null });
      await clearAllMerchantsUseCase.execute();
      set({ merchants: [], loading: false });
      toast.success('Todos los comercios han sido eliminados correctamente');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar todos los comercios';
      set({ error: msg, loading: false });
      toast.error(msg);
      throw err;
    }
  },

  setFilter: (filter) => set({ filter }),
  setCurrencyFilter: (currencyFilter) => set({ currencyFilter }),
  setSearch: (search) => set({ search }),
  setSortBy: (sortBy) => set({ sortBy }),
}));

/**
 * Selectores puros para cálculos derivados (memoizados por referencia)
 */
export function calculateMerchantCounts(merchants: Merchant[]): MerchantsCounts {
  return merchants.reduce(
    (acc, m) => {
      acc[m.paymentStatus] += 1;
      acc.all += 1;
      if (m.currency === 'USD') acc.usd += 1;
      else acc.cop += 1;
      return acc;
    },
    { all: 0, paid: 0, pending: 0, unpaid: 0, cop: 0, usd: 0 },
  );
}

export function calculateMerchantFinances(merchants: Merchant[]): { cop: CurrencyFinances; usd: CurrencyFinances } {
  const cop: CurrencyFinances = { totalInvoiced: 0, totalRaised: 0, pendingReceivable: 0, totalTicketsBought: 0 };
  const usd: CurrencyFinances = { totalInvoiced: 0, totalRaised: 0, pendingReceivable: 0, totalTicketsBought: 0 };

  for (const m of merchants) {
    const target = m.currency === 'USD' ? usd : cop;
    target.totalInvoiced += m.totalFee;
    target.totalRaised += m.amountPaid;
    target.pendingReceivable += Math.max(0, m.totalFee - m.amountPaid);
    target.totalTicketsBought += m.ticketsCount;
  }

  return { cop, usd };
}

export function calculateCashboxToday(merchants: Merchant[], todayDateStr = new Date().toISOString().slice(0, 10)): CashboxSummary {
  let totalTodayCOP = 0;
  let totalTodayUSD = 0;
  let countToday = 0;

  for (const m of merchants) {
    if (m.paymentHistory && Array.isArray(m.paymentHistory)) {
      for (const p of m.paymentHistory) {
        if (p.date && p.date.startsWith(todayDateStr)) {
          if (m.currency === 'USD') {
            totalTodayUSD += p.amount;
          } else {
            totalTodayCOP += p.amount;
          }
          countToday += 1;
        }
      }
    }
  }

  return {
    totalTodayCOP: Math.round(totalTodayCOP),
    totalTodayUSD: Math.round((totalTodayUSD + Number.EPSILON) * 100) / 100,
    countToday,
  };
}
