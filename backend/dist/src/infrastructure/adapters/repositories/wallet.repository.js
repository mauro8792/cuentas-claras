"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../persistence/prisma.service");
let WalletRepository = class WalletRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createWallet(data) {
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
        });
    }
    async findWalletById(walletId) {
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
        });
    }
    async findWalletByInviteCode(inviteCode) {
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
        });
    }
    async findUserWallets(userId) {
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
        });
    }
    async updateWallet(walletId, data) {
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
        });
    }
    async generateInviteCode(walletId) {
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
        });
    }
    async deleteWallet(walletId) {
        await this.prisma.wallet.delete({
            where: { id: walletId },
        });
    }
    async addMember(walletId, userId, role) {
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
        });
    }
    async removeMember(walletId, userId) {
        await this.prisma.walletMember.delete({
            where: {
                walletId_userId: { walletId, userId },
            },
        });
    }
    async isMember(walletId, userId) {
        const member = await this.prisma.walletMember.findUnique({
            where: {
                walletId_userId: { walletId, userId },
            },
        });
        return !!member;
    }
    async getMemberRole(walletId, userId) {
        const member = await this.prisma.walletMember.findUnique({
            where: {
                walletId_userId: { walletId, userId },
            },
        });
        return member?.role || null;
    }
    async createExpense(data) {
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
        });
    }
    async findExpenseById(expenseId) {
        return this.prisma.personalExpense.findUnique({
            where: { id: expenseId },
            include: {
                category: true,
                beneficiary: true,
                paidBy: {
                    select: { id: true, name: true },
                },
            },
        });
    }
    async findWalletExpenses(walletId, startDate, endDate) {
        const where = { walletId };
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
        });
    }
    async updateExpense(expenseId, data) {
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
        });
    }
    async deleteExpense(expenseId) {
        await this.prisma.personalExpense.delete({
            where: { id: expenseId },
        });
    }
    async findCategoryById(categoryId) {
        return this.prisma.expenseCategory.findUnique({
            where: { id: categoryId },
        });
    }
    async findDefaultCategories() {
        return this.prisma.expenseCategory.findMany({
            where: { isDefault: true },
            orderBy: { name: 'asc' },
        });
    }
    async findUserCategories(userId) {
        return this.prisma.expenseCategory.findMany({
            where: {
                OR: [{ isDefault: true }, { userId }],
            },
            orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
        });
    }
    async createCategory(data) {
        return this.prisma.expenseCategory.create({
            data: {
                name: data.name,
                icon: data.icon,
                color: data.color,
                userId: data.userId,
                isDefault: false,
            },
        });
    }
    async deleteCategory(categoryId) {
        await this.prisma.expenseCategory.delete({
            where: { id: categoryId },
        });
    }
    async getExpenseSumByCategory(walletId, startDate, endDate) {
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
        return result;
    }
    async getExpenseSumByType(walletId, startDate, endDate) {
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
        return result;
    }
    async getExpenseSumByBeneficiary(walletId, startDate, endDate) {
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
        return result;
    }
    async findBeneficiariesByWallet(walletId) {
        return this.prisma.beneficiary.findMany({
            where: { walletId },
            orderBy: { name: 'asc' },
        });
    }
    async findBeneficiaryById(beneficiaryId) {
        return this.prisma.beneficiary.findUnique({
            where: { id: beneficiaryId },
        });
    }
    async createBeneficiary(data) {
        return this.prisma.beneficiary.create({
            data: {
                walletId: data.walletId,
                name: data.name,
                icon: data.icon,
            },
        });
    }
    async updateBeneficiary(beneficiaryId, data) {
        return this.prisma.beneficiary.update({
            where: { id: beneficiaryId },
            data: {
                name: data.name,
                icon: data.icon,
            },
        });
    }
    async deleteBeneficiary(beneficiaryId) {
        await this.prisma.beneficiary.delete({
            where: { id: beneficiaryId },
        });
    }
};
exports.WalletRepository = WalletRepository;
exports.WalletRepository = WalletRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WalletRepository);
//# sourceMappingURL=wallet.repository.js.map