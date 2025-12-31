import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma.service';
import { IBankAliasRepository } from '../../../application/ports/output/bank-alias.repository.port';
import { BankAlias } from '../../../domain/entities/bank-alias.entity';

@Injectable()
export class BankAliasRepository implements IBankAliasRepository {
  constructor(private prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<BankAlias[]> {
    const aliases = await this.prisma.bankAlias.findMany({
      where: { userId },
      orderBy: { priority: 'asc' },
    });
    return aliases.map(this.toEntity);
  }

  async findById(id: string): Promise<BankAlias | null> {
    const alias = await this.prisma.bankAlias.findUnique({
      where: { id },
    });
    return alias ? this.toEntity(alias) : null;
  }

  async findByUserIdAndPriority(userId: string, priority: number): Promise<BankAlias | null> {
    const alias = await this.prisma.bankAlias.findUnique({
      where: { userId_priority: { userId, priority } },
    });
    return alias ? this.toEntity(alias) : null;
  }

  async create(userId: string, alias: string, bankName: string | undefined, priority: number): Promise<BankAlias> {
    const created = await this.prisma.bankAlias.create({
      data: {
        userId,
        alias,
        bankName,
        priority,
      },
    });
    return this.toEntity(created);
  }

  async update(id: string, data: Partial<BankAlias>): Promise<BankAlias> {
    const updated = await this.prisma.bankAlias.update({
      where: { id },
      data: {
        alias: data.alias,
        bankName: data.bankName,
        priority: data.priority,
      },
    });
    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.bankAlias.delete({
      where: { id },
    });
  }

  private toEntity(data: any): BankAlias {
    return new BankAlias({
      id: data.id,
      userId: data.userId,
      alias: data.alias,
      bankName: data.bankName,
      priority: data.priority,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}

