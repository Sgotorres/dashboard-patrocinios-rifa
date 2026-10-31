import { LocalMerchantRepo } from '../../data/repositories/LocalMerchantRepo';
import { LocalRaffleRepo } from '../../data/repositories/LocalRaffleRepo';
import type { IMerchantRepository } from '../../domain/repositories/IMerchantRepository';
import type { IRaffleRepository } from '../../domain/repositories/IRaffleRepository';
import { RegisterMerchantUseCase } from '../../domain/usecases/RegisterMerchantUseCase';
import { RegisterPaymentUseCase } from '../../domain/usecases/RegisterPaymentUseCase';

// Repositorios
export const merchantRepository: IMerchantRepository = new LocalMerchantRepo();
export const raffleRepository: IRaffleRepository = new LocalRaffleRepo();

// Casos de Uso
export const registerMerchantUseCase = new RegisterMerchantUseCase(merchantRepository, raffleRepository);
export const registerPaymentUseCase = new RegisterPaymentUseCase(merchantRepository);
