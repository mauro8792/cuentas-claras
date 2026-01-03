import { PrismaService } from '../../persistence/prisma.service';
import { ITokenRepositoryPort, RefreshTokenData } from '../../../application/ports/output/token.repository.port';
export declare class TokenRepository implements ITokenRepositoryPort {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshTokenData>;
    findRefreshToken(token: string): Promise<RefreshTokenData | null>;
    deleteRefreshToken(token: string): Promise<void>;
    deleteUserRefreshTokens(userId: string): Promise<void>;
}
