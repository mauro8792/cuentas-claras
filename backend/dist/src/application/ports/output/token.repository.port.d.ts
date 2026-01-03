export interface RefreshTokenData {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
}
export interface ITokenRepositoryPort {
    createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshTokenData>;
    findRefreshToken(token: string): Promise<RefreshTokenData | null>;
    deleteRefreshToken(token: string): Promise<void>;
    deleteUserRefreshTokens(userId: string): Promise<void>;
}
