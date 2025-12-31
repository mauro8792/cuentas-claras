import { BankAlias } from '../../../domain/entities/bank-alias.entity';

export interface CreateBankAliasDto {
  alias: string;
  bankName?: string;
  priority: number; // 1, 2 o 3
}

export interface UpdateBankAliasDto {
  alias?: string;
  bankName?: string;
  priority?: number;
}

export interface IBankAliasUseCase {
  getUserAliases(userId: string): Promise<BankAlias[]>;
  createAlias(userId: string, dto: CreateBankAliasDto): Promise<BankAlias>;
  updateAlias(userId: string, aliasId: string, dto: UpdateBankAliasDto): Promise<BankAlias>;
  deleteAlias(userId: string, aliasId: string): Promise<void>;
  getAliasesByUserId(userId: string): Promise<BankAlias[]>; // Para ver alias de otro usuario
}

