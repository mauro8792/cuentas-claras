import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma.service';
import { IWalletRepositoryPort } from '../../../application/ports/output/wallet.repository.port';
import {
  Wallet,
  WalletMember,
  PersonalExpense,
  ExpenseCategory,
  Beneficiary,
} from '../../../domain/entities/wallet.entity';

@Injectable()
export class WalletRepository implements IWalletRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== BILLETERAS ====================

  async createWallet(data: {
    name: string;
    type: 'PERSONAL' | 'SHARED';
    currency: string;
    createdById: string;
  }): Promise<Wallet> {
    // Generar código de invitación único (8 caracteres alfanuméricos)
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    return this.prisma.wallet.create({
      data: {
        name: data.name,
        type: data.type,
        currency: data.currency,
        createdById: data.createdById,
        inviteCode,
        members: {
          create: {
            userId: data.createdById,
            role: 'OWNER',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
      },
    }) as unknown as Wallet;
  }

  async findWalletById(walletId: string): Promise<Wallet | null> {
    return this.prisma.wallet.findUnique({
      where: { id: walletId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    }) as unknown as Wallet | null;
  }

  async findWalletByInviteCode(inviteCode: string): Promise<Wallet | null> {
    return this.prisma.wallet.findUnique({
      where: { inviteCode },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    }) as unknown as Wallet | null;
  }

  async findUserWallets(userId: string): Promise<Wallet[]> {
    return this.prisma.wallet.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        _count: {
          select: { expenses: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }) as unknown as Wallet[];
  }

  async updateWallet(walletId: string, data: Partial<Wallet>): Promise<Wallet> {
    return this.prisma.wallet.update({
      where: { id: walletId },
      data: {
        name: data.name,
        currency: data.currency,
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
      },
    }) as unknown as Wallet;
  }

  async generateInviteCode(walletId: string): Promise<Wallet> {
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    return this.prisma.wallet.update({
      where: { id: walletId },
      data: { inviteCode },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
      },
    }) as unknown as Wallet;
  }

  async deleteWallet(walletId: string): Promise<void> {
    await this.prisma.wallet.delete({
      where: { id: walletId },
    });
  }

  // ==================== MIEMBROS ====================

  async addMember(
    walletId: string,
    userId: string,
    role: 'OWNER' | 'MEMBER',
  ): Promise<WalletMember> {
    return this.prisma.walletMember.create({
      data: {
        walletId,
        userId,
        role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    }) as unknown as WalletMember;
  }

  async removeMember(walletId: string, userId: string): Promise<void> {
    await this.prisma.walletMember.delete({
      where: {
        walletId_userId: { walletId, userId },
      },
    });
  }

  async isMember(walletId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.walletMember.findUnique({
      where: {
        walletId_userId: { walletId, userId },
      },
    });
    return !!member;
  }

  async getMemberRole(walletId: string, userId: string): Promise<string | null> {
    const member = await this.prisma.walletMember.findUnique({
      where: {
        walletId_userId: { walletId, userId },
      },
    });
    return member?.role || null;
  }

  // ==================== GASTOS PERSONALES ====================

  async createExpense(data: {
    walletId: string;
    categoryId: string;
    beneficiaryId?: string;
    amount: number;
    currency: string;
    exchangeRate?: number;
    description: string;
    date: Date;
    type: 'FIXED' | 'VARIABLE';
    paidById: string;
    isRecurring?: boolean;
    recurringId?: string;
  }): Promise<PersonalExpense> {
    return this.prisma.personalExpense.create({
      data: {
        walletId: data.walletId,
        categoryId: data.categoryId,
        beneficiaryId: data.beneficiaryId,
        amount: data.amount,
        currency: data.currency,
        exchangeRate: data.exchangeRate,
        description: data.description,
        date: data.date,
        type: data.type,
        paidById: data.paidById,
        isRecurring: data.isRecurring || false,
        recurringId: data.recurringId,
      },
      include: {
        category: true,
        beneficiary: true,
        paidBy: {
          select: { id: true, name: true },
        },
      },
    }) as unknown as PersonalExpense;
  }

  async findExpenseById(expenseId: string): Promise<PersonalExpense | null> {
    return this.prisma.personalExpense.findUnique({
      where: { id: expenseId },
      include: {
        category: true,
        beneficiary: true,
        paidBy: {
          select: { id: true, name: true },
        },
      },
    }) as unknown as PersonalExpense | null;
  }

  async findWalletExpenses(
    walletId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<PersonalExpense[]> {
    const where: any = { walletId };

    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    return this.prisma.personalExpense.findMany({
      where,
      include: {
        category: true,
        beneficiary: true,
        paidBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: 'desc' },
    }) as unknown as PersonalExpense[];
  }

  async updateExpense(
    expenseId: string,
    data: Partial<PersonalExpense>,
  ): Promise<PersonalExpense> {
    return this.prisma.personalExpense.update({
      where: { id: expenseId },
      data: {
        amount: data.amount,
        currency: data.currency,
        exchangeRate: data.exchangeRate,
        description: data.description,
        date: data.date,
        type: data.type,
        categoryId: data.categoryId,
        beneficiaryId: data.beneficiaryId,
      },
      include: {
        category: true,
        beneficiary: true,
        paidBy: {
          select: { id: true, name: true },
        },
      },
    }) as unknown as PersonalExpense;
  }

  async deleteExpense(expenseId: string): Promise<void> {
    await this.prisma.personalExpense.delete({
      where: { id: expenseId },
    });
  }

  // ==================== CATEGORÍAS ====================

  async findCategoryById(categoryId: string): Promise<ExpenseCategory | null> {
    return this.prisma.expenseCategory.findUnique({
      where: { id: categoryId },
    }) as unknown as ExpenseCategory | null;
  }

  async findDefaultCategories(): Promise<ExpenseCategory[]> {
    return this.prisma.expenseCategory.findMany({
      where: { isDefault: true },
      orderBy: { name: 'asc' },
    }) as unknown as ExpenseCategory[];
  }

  async findUserCategories(userId: string): Promise<ExpenseCategory[]> {
    return this.prisma.expenseCategory.findMany({
      where: {
        OR: [{ isDefault: true }, { userId }],
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    }) as unknown as ExpenseCategory[];
  }

  async createCategory(data: {
    name: string;
    icon: string;
    color: string;
    userId: string;
  }): Promise<ExpenseCategory> {
    return this.prisma.expenseCategory.create({
      data: {
        name: data.name,
        icon: data.icon,
        color: data.color,
        userId: data.userId,
        isDefault: false,
      },
    }) as unknown as ExpenseCategory;
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await this.prisma.expenseCategory.delete({
      where: { id: categoryId },
    });
  }

  // ==================== ESTADÍSTICAS ====================

  async getExpenseSumByCategory(
    walletId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ categoryId: string; _sum: { amount: number } }[]> {
    const result = await this.prisma.personalExpense.groupBy({
      by: ['categoryId'],
      where: {
        walletId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });
    return result as any;
  }

  async getExpenseSumByType(
    walletId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ type: string; _sum: { amount: number } }[]> {
    const result = await this.prisma.personalExpense.groupBy({
      by: ['type'],
      where: {
        walletId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });
    return result as any;
  }

  async getExpenseSumByBeneficiary(
    walletId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ beneficiaryId: string | null; _sum: { amount: number } }[]> {
    const result = await this.prisma.personalExpense.groupBy({
      by: ['beneficiaryId'],
      where: {
        walletId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });
    return result as any;
  }

  // ==================== BENEFICIARIOS ====================

  async findBeneficiariesByWallet(walletId: string): Promise<Beneficiary[]> {
    return this.prisma.beneficiary.findMany({
      where: { walletId },
      orderBy: { name: 'asc' },
    }) as unknown as Beneficiary[];
  }

  async findBeneficiaryById(beneficiaryId: string): Promise<Beneficiary | null> {
    return this.prisma.beneficiary.findUnique({
      where: { id: beneficiaryId },
    }) as unknown as Beneficiary | null;
  }

  async createBeneficiary(data: {
    walletId: string;
    name: string;
    icon: string;
  }): Promise<Beneficiary> {
    return this.prisma.beneficiary.create({
      data: {
        walletId: data.walletId,
        name: data.name,
        icon: data.icon,
      },
    }) as unknown as Beneficiary;
  }

  async updateBeneficiary(
    beneficiaryId: string,
    data: Partial<Beneficiary>,
  ): Promise<Beneficiary> {
    return this.prisma.beneficiary.update({
      where: { id: beneficiaryId },
      data: {
        name: data.name,
        icon: data.icon,
      },
    }) as unknown as Beneficiary;
  }

  async deleteBeneficiary(beneficiaryId: string): Promise<void> {
    await this.prisma.beneficiary.delete({
      where: { id: beneficiaryId },
    });
  }
}

