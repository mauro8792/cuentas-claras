import { BankAlias } from '../../../domain/entities/bank-alias.entity';

export interface IBankAliasRepository {
  findByUserId(userId: string): Promise<BankAlias[]>;
  findById(id: string): Promise<BankAlias | null>;
  findByUserIdAndPriority(userId: string, priority: number): Promise<BankAlias | null>;
  create(userId: string, alias: string, bankName: string | undefined, priority: number): Promise<BankAlias>;
  update(id: string, data: Partial<BankAlias>): Promise<BankAlias>;
  delete(id: string): Promise<void>;
}

export const BANK_ALIAS_REPOSITORY = 'BANK_ALIAS_REPOSITORY';

