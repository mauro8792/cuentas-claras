import { PrismaService } from '../../persistence/prisma.service';
import { IBankAliasRepository } from '../../../application/ports/output/bank-alias.repository.port';
import { BankAlias } from '../../../domain/entities/bank-alias.entity';
export declare class BankAliasRepository implements IBankAliasRepository {
    private prisma;
    constructor(prisma: PrismaService);
    findByUserId(userId: string): Promise<BankAlias[]>;
    findById(id: string): Promise<BankAlias | null>;
    findByUserIdAndPriority(userId: string, priority: number): Promise<BankAlias | null>;
    create(userId: string, alias: string, bankName: string | undefined, priority: number): Promise<BankAlias>;
    update(id: string, data: Partial<BankAlias>): Promise<BankAlias>;
    delete(id: string): Promise<void>;
    private toEntity;
}
