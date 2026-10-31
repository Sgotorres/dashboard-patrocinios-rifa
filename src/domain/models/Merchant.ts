export type PaymentStatus = 'unpaid' | 'pending' | 'paid';
export type CurrencyCode = 'COP' | 'USD';

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  note?: string;
  currency?: CurrencyCode;
}

export interface Merchant {
  id: string;
  name: string;
  address: string;
  phone: string;
  socialUrl?: string; // Red social, usuario o link web
  logoUrl?: string;   // URL o base64 del logotipo
  currency: CurrencyCode; // 'COP' (Pesos Colombianos) o 'USD' (Dólares)
  ticketsCount: number; // Cantidad de tickets / espacios publicitarios
  ticketPrice: number;  // Precio unitario del ticket
  totalFee: number;     // Total facturado (ticketsCount * ticketPrice)
  amountPaid: number;   // Total abonado
  paymentStatus: PaymentStatus; // 'unpaid' (rojo), 'pending' (amarillo), 'paid' (verde)
  paymentHistory: PaymentRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMerchantDTO {
  name: string;
  address: string;
  phone: string;
  socialUrl?: string;
  logoUrl?: string;
  currency?: CurrencyCode;
  ticketsCount: number;
  ticketPrice: number;
  totalFee?: number;
  amountPaid: number;
  paymentStatus?: PaymentStatus;
  initialNote?: string;
}

export type UpdateMerchantDTO = Partial<CreateMerchantDTO>;
