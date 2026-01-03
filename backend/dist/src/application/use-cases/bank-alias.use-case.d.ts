import { IBankAliasUseCase, CreateBankAliasDto, UpdateBankAliasDto } from '../ports/input/bank-alias.port';
import { IBankAliasRepository } from '../ports/output/bank-alias.repository.port';
import { BankAlias } from '../../domain/entities/bank-alias.entity';
export declare class BankAliasUseCase implements IBankAliasUseCase {
    private bankAliasRepository;
    constructor(bankAliasRepository: IBankAliasRepository);
    getUserAliases(userId: string): Promise<BankAlias[]>;
    createAlias(userId: string, dto: CreateBankAliasDto): Promise<BankAlias>;
    updateAlias(userId: string, aliasId: string, dto: UpdateBankAliasDto): Promise<BankAlias>;
    deleteAlias(userId: string, aliasId: string): Promise<void>;
    getAliasesByUserId(userId: string): Promise<BankAlias[]>;
}
