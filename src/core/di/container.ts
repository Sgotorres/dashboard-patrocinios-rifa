import { LocalMerchantRepo } from '../../data/repositories/LocalMerchantRepo';
import { LocalRaffleRepo } from '../../data/repositories/LocalRaffleRepo';
import type { IMerchantRepository } from '../../domain/repositories/IMerchantRepository';
import type { IRaffleRepository } from '../../domain/repositories/IRaffleRepository';
import { RegisterMerchantUseCase } from '../../domain/usecases/RegisterMerchantUseCase';
import { RegisterPaymentUseCase } from '../../domain/usecases/RegisterPaymentUseCase';
import { GetAllMerchantsUseCase } from '../../domain/usecases/GetAllMerchantsUseCase';
import { UpdateMerchantUseCase } from '../../domain/usecases/UpdateMerchantUseCase';
import { MarkAsPaidUseCase } from '../../domain/usecases/MarkAsPaidUseCase';
import { AddTicketsUseCase } from '../../domain/usecases/AddTicketsUseCase';
import { DeleteMerchantUseCase } from '../../domain/usecases/DeleteMerchantUseCase';
import { ClearAllMerchantsUseCase } from '../../domain/usecases/ClearAllMerchantsUseCase';

// Repositorios
export const merchantRepository: IMerchantRepository = new LocalMerchantRepo();
export const raffleRepository: IRaffleRepository = new LocalRaffleRepo();

// Casos de Uso
export const getAllMerchantsUseCase = new GetAllMerchantsUseCase(merchantRepository, raffleRepository);
export const registerMerchantUseCase = new RegisterMerchantUseCase(merchantRepository, raffleRepository);
export const registerPaymentUseCase = new RegisterPaymentUseCase(merchantRepository);
export const updateMerchantUseCase = new UpdateMerchantUseCase(merchantRepository, raffleRepository);
export const markAsPaidUseCase = new MarkAsPaidUseCase(merchantRepository);
export const addTicketsUseCase = new AddTicketsUseCase(merchantRepository, raffleRepository);
export const deleteMerchantUseCase = new DeleteMerchantUseCase(merchantRepository, raffleRepository);
export const clearAllMerchantsUseCase = new ClearAllMerchantsUseCase(merchantRepository, raffleRepository);
