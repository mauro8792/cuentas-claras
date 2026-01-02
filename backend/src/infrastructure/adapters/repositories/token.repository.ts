import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma.service';
import {
  ITokenRepositoryPort,
  RefreshTokenData,
} from '../../../application/ports/output/token.repository.port';

@Injectable()
export class TokenRepository implements ITokenRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshTokenData> {
    // Usar upsert para evitar error de unicidad si el token ya existe
    return this.prisma.refreshToken.upsert({
      where: { token },
      update: {
        userId,
        expiresAt,
      },
      create: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  async findRefreshToken(token: string): Promise<RefreshTokenData | null> {
    return this.prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  async deleteUserRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}

