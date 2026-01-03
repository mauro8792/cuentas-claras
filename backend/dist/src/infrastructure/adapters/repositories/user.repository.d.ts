import { PrismaService } from '../../persistence/prisma.service';
import { IUserRepositoryPort } from '../../../application/ports/output/user.repository.port';
import { User } from '../../../domain/entities/user.entity';
export declare class UserRepository implements IUserRepositoryPort {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: {
        email: string;
        password: string;
        name: string;
    }): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    update(id: string, data: Partial<User>): Promise<User>;
    private toEntity;
}
