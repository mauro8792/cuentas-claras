import { BankAliasUseCase } from '../../application/use-cases/bank-alias.use-case';
import { CreateBankAliasDto, UpdateBankAliasDto } from '../../application/ports/input/bank-alias.port';
export declare class BankAliasController {
    private readonly bankAliasUseCase;
    constructor(bankAliasUseCase: BankAliasUseCase);
    getMyAliases(req: any): Promise<import("../../domain/entities/bank-alias.entity").BankAlias[]>;
    getUserAliases(userId: string): Promise<import("../../domain/entities/bank-alias.entity").BankAlias[]>;
    createAlias(req: any, dto: CreateBankAliasDto): Promise<import("../../domain/entities/bank-alias.entity").BankAlias>;
    updateAlias(req: any, aliasId: string, dto: UpdateBankAliasDto): Promise<import("../../domain/entities/bank-alias.entity").BankAlias>;
    deleteAlias(req: any, aliasId: string): Promise<{
        message: string;
    }>;
}
