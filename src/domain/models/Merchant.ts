export type PaymentStatus = 'unpaid' | 'pending' | 'paid';

export interface Merchant {
  id: string;
  name: string;
  address: string;
  phone: string;
  logoUrl?: string;
  paymentStatus: PaymentStatus;
  totalFee: number;
  amountPaid: number;
  createdAt: string;
}

export interface CreateMerchantDTO {
  name: string;
  address: string;
  phone: string;
  logoUrl?: string;
  paymentStatus: PaymentStatus;
  totalFee: number;
  amountPaid: number;
}
