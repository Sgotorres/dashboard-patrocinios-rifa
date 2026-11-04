import { create } from 'zustand';
import type { Merchant } from '../../domain/models/Merchant';

interface ModalState {
  isAddTicketOpen: boolean;
  isConfigOpen: boolean;
  isBackupOpen: boolean;
  isSearchOpen: boolean;
  detailMerchant: Merchant | null;
  editMerchant: Merchant | null;
  abonoMerchant: Merchant | null;

  openAddTicket: (open?: boolean) => void;
  openConfig: (open?: boolean) => void;
  openBackup: (open?: boolean) => void;
  openSearch: (open?: boolean) => void;
  openDetail: (merchant: Merchant | null) => void;
  openEdit: (merchant: Merchant | null) => void;
  openAbono: (merchant: Merchant | null) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isAddTicketOpen: false,
  isConfigOpen: false,
  isBackupOpen: false,
  isSearchOpen: false,
  detailMerchant: null,
  editMerchant: null,
  abonoMerchant: null,

  openAddTicket: (open = true) => set({ isAddTicketOpen: open }),
  openConfig: (open = true) => set({ isConfigOpen: open }),
  openBackup: (open = true) => set({ isBackupOpen: open }),
  openSearch: (open = true) => set({ isSearchOpen: open }),
  openDetail: (merchant) => set({ detailMerchant: merchant }),
  openEdit: (merchant) => set({ editMerchant: merchant }),
  openAbono: (merchant) => set({ abonoMerchant: merchant }),
}));
