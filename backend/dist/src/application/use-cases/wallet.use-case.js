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
exports.WalletUseCase = void 0;
const common_1 = require("@nestjs/common");
const wallet_repository_1 = require("../../infrastructure/adapters/repositories/wallet.repository");
const user_repository_1 = require("../../infrastructure/adapters/repositories/user.repository");
const wallet_entity_1 = require("../../domain/entities/wallet.entity");
const wallet_gateway_1 = require("../../infrastructure/gateways/wallet.gateway");
let WalletUseCase = class WalletUseCase {
    constructor(walletRepository, userRepository, walletGateway) {
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
        this.walletGateway = walletGateway;
    }
    async createWallet(userId, dto) {
        const currency = dto.currency || 'ARS';
        const validCurrency = wallet_entity_1.SUPPORTED_CURRENCIES.find((c) => c.code === currency);
        if (!validCurrency) {
            throw new common_1.BadRequestException(`Moneda no soportada. Usa: ${wallet_entity_1.SUPPORTED_CURRENCIES.map((c) => c.code).join(', ')}`);
        }
        return this.walletRepository.createWallet({
            name: dto.name,
            type: dto.type || 'PERSONAL',
            currency,
            createdById: userId,
        });
    }
    async getUserWallets(userId) {
        return this.walletRepository.findUserWallets(userId);
    }
    async getWalletById(userId, walletId) {
        let wallet = await this.walletRepository.findWalletById(walletId);
        if (!wallet) {
            throw new common_1.NotFoundException('Billetera no encontrada');
        }
        const isMember = await this.walletRepository.isMember(walletId, userId);
        if (!isMember) {
            throw new common_1.ForbiddenException('No tienes acceso a esta billetera');
        }
        if (!wallet.inviteCode) {
            wallet = await this.walletRepository.generateInviteCode(walletId);
        }
        return wallet;
    }
    async updateWallet(userId, walletId, dto) {
        const wallet = await this.getWalletById(userId, walletId);
        const role = await this.walletRepository.getMemberRole(walletId, userId);
        if (role !== 'OWNER') {
            throw new common_1.ForbiddenException('Solo el dueño puede editar la billetera');
        }
        if (dto.currency) {
            const validCurrency = wallet_entity_1.SUPPORTED_CURRENCIES.find((c) => c.code === dto.currency);
            if (!validCurrency) {
                throw new common_1.BadRequestException(`Moneda no soportada. Usa: ${wallet_entity_1.SUPPORTED_CURRENCIES.map((c) => c.code).join(', ')}`);
            }
        }
        return this.walletRepository.updateWallet(walletId, dto);
    }
    async deleteWallet(userId, walletId) {
        const wallet = await this.getWalletById(userId, walletId);
        if (wallet.createdById !== userId) {
            throw new common_1.ForbiddenException('Solo el creador puede eliminar la billetera');
        }
        await this.walletRepository.deleteWallet(walletId);
    }
    async joinByInviteCode(userId, dto) {
        const wallet = await this.walletRepository.findWalletByInviteCode(dto.inviteCode);
        if (!wallet) {
            throw new common_1.NotFoundException('Código de invitación inválido');
        }
        const isMember = await this.walletRepository.isMember(wallet.id, userId);
        if (isMember) {
            throw new common_1.BadRequestException('Ya sos miembro de esta billetera');
        }
        await this.walletRepository.addMember(wallet.id, userId, 'MEMBER');
        const user = await this.userRepository.findById(userId);
        this.walletGateway?.emitMemberJoined(wallet.id, {
            userId,
            name: user?.name,
            email: user?.email,
        });
        return this.walletRepository.findWalletById(wallet.id);
    }
    async inviteMember(userId, walletId, dto) {
        const wallet = await this.getWalletById(userId, walletId);
        const role = await this.walletRepository.getMemberRole(walletId, userId);
        if (role !== 'OWNER') {
            throw new common_1.ForbiddenException('Solo el dueño puede invitar miembros');
        }
        const userToInvite = await this.userRepository.findByEmail(dto.email);
        if (!userToInvite) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const isMember = await this.walletRepository.isMember(walletId, userToInvite.id);
        if (isMember) {
            throw new common_1.BadRequestException('El usuario ya es miembro de esta billetera');
        }
        await this.walletRepository.addMember(walletId, userToInvite.id, 'MEMBER');
        this.walletGateway?.emitMemberJoined(walletId, {
            userId: userToInvite.id,
            name: userToInvite.name,
            email: userToInvite.email,
        });
        return this.walletRepository.findWalletById(walletId);
    }
    async removeMember(userId, walletId, memberId) {
        await this.getWalletById(userId, walletId);
        const role = await this.walletRepository.getMemberRole(walletId, userId);
        if (role !== 'OWNER') {
            throw new common_1.ForbiddenException('Solo el dueño puede remover miembros');
        }
        if (memberId === userId) {
            throw new common_1.BadRequestException('No puedes removerte a ti mismo como dueño');
        }
        await this.walletRepository.removeMember(walletId, memberId);
        this.walletGateway?.emitMemberRemoved(walletId, memberId);
    }
    async createExpense(userId, walletId, dto) {
        await this.getWalletById(userId, walletId);
        const category = await this.walletRepository.findCategoryById(dto.categoryId);
        if (!category) {
            throw new common_1.NotFoundException('Categoría no encontrada');
        }
        const currency = dto.currency || 'ARS';
        const validCurrency = wallet_entity_1.SUPPORTED_CURRENCIES.find((c) => c.code === currency);
        if (!validCurrency) {
            throw new common_1.BadRequestException(`Moneda no soportada. Usa: ${wallet_entity_1.SUPPORTED_CURRENCIES.map((c) => c.code).join(', ')}`);
        }
        if (dto.beneficiaryId) {
            const beneficiary = await this.walletRepository.findBeneficiaryById(dto.beneficiaryId);
            if (!beneficiary || beneficiary.walletId !== walletId) {
                throw new common_1.NotFoundException('Beneficiario no encontrado en esta billetera');
            }
        }
        const expense = await this.walletRepository.createExpense({
            walletId,
            categoryId: dto.categoryId,
            beneficiaryId: dto.beneficiaryId,
            amount: dto.amount,
            currency,
            exchangeRate: dto.exchangeRate,
            description: dto.description,
            date: new Date(dto.date),
            type: dto.type,
            paidById: userId,
            isRecurring: dto.isRecurring,
        });
        this.walletGateway?.emitExpenseCreated(walletId, expense);
        return expense;
    }
    async getWalletExpenses(userId, walletId, month, year) {
        await this.getWalletById(userId, walletId);
        let startDate;
        let endDate;
        if (month && year) {
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0, 23, 59, 59);
        }
        return this.walletRepository.findWalletExpenses(walletId, startDate, endDate);
    }
    async getExpenseById(userId, walletId, expenseId) {
        await this.getWalletById(userId, walletId);
        const expense = await this.walletRepository.findExpenseById(expenseId);
        if (!expense || expense.walletId !== walletId) {
            throw new common_1.NotFoundException('Gasto no encontrado');
        }
        return expense;
    }
    async updateExpense(userId, walletId, expenseId, dto) {
        const expense = await this.getExpenseById(userId, walletId, expenseId);
        if (expense.paidById !== userId) {
            throw new common_1.ForbiddenException('Solo quien registró el gasto puede editarlo');
        }
        if (dto.categoryId) {
            const category = await this.walletRepository.findCategoryById(dto.categoryId);
            if (!category) {
                throw new common_1.NotFoundException('Categoría no encontrada');
            }
        }
        if (dto.currency) {
            const validCurrency = wallet_entity_1.SUPPORTED_CURRENCIES.find((c) => c.code === dto.currency);
            if (!validCurrency) {
                throw new common_1.BadRequestException(`Moneda no soportada. Usa: ${wallet_entity_1.SUPPORTED_CURRENCIES.map((c) => c.code).join(', ')}`);
            }
        }
        if (dto.beneficiaryId) {
            const beneficiary = await this.walletRepository.findBeneficiaryById(dto.beneficiaryId);
            if (!beneficiary || beneficiary.walletId !== walletId) {
                throw new common_1.NotFoundException('Beneficiario no encontrado en esta billetera');
            }
        }
        const updateData = {
            ...dto,
            date: dto.date ? new Date(dto.date) : undefined,
        };
        const updatedExpense = await this.walletRepository.updateExpense(expenseId, updateData);
        this.walletGateway?.emitExpenseUpdated(walletId, updatedExpense);
        return updatedExpense;
    }
    async deleteExpense(userId, walletId, expenseId) {
        const expense = await this.getExpenseById(userId, walletId, expenseId);
        const role = await this.walletRepository.getMemberRole(walletId, userId);
        if (expense.paidById !== userId && role !== 'OWNER') {
            throw new common_1.ForbiddenException('No tienes permiso para eliminar este gasto');
        }
        await this.walletRepository.deleteExpense(expenseId);
        this.walletGateway?.emitExpenseDeleted(walletId, expenseId);
    }
    async getCategories(userId) {
        return this.walletRepository.findUserCategories(userId);
    }
    async createCategory(userId, dto) {
        return this.walletRepository.createCategory({
            name: dto.name,
            icon: dto.icon,
            color: dto.color,
            userId,
        });
    }
    async deleteCategory(userId, categoryId) {
        const category = await this.walletRepository.findCategoryById(categoryId);
        if (!category) {
            throw new common_1.NotFoundException('Categoría no encontrada');
        }
        if (category.isDefault) {
            throw new common_1.ForbiddenException('No se pueden eliminar categorías predeterminadas');
        }
        if (category.userId !== userId) {
            throw new common_1.ForbiddenException('Solo puedes eliminar tus propias categorías');
        }
        await this.walletRepository.deleteCategory(categoryId);
    }
    async getBeneficiaries(userId, walletId) {
        await this.getWalletById(userId, walletId);
        return this.walletRepository.findBeneficiariesByWallet(walletId);
    }
    async createBeneficiary(userId, walletId, dto) {
        await this.getWalletById(userId, walletId);
        const beneficiary = await this.walletRepository.createBeneficiary({
            walletId,
            name: dto.name,
            icon: dto.icon || '👤',
        });
        this.walletGateway?.emitBeneficiaryCreated(walletId, beneficiary);
        return beneficiary;
    }
    async updateBeneficiary(userId, walletId, beneficiaryId, dto) {
        await this.getWalletById(userId, walletId);
        const beneficiary = await this.walletRepository.findBeneficiaryById(beneficiaryId);
        if (!beneficiary || beneficiary.walletId !== walletId) {
            throw new common_1.NotFoundException('Beneficiario no encontrado en esta billetera');
        }
        return this.walletRepository.updateBeneficiary(beneficiaryId, dto);
    }
    async deleteBeneficiary(userId, walletId, beneficiaryId) {
        await this.getWalletById(userId, walletId);
        const beneficiary = await this.walletRepository.findBeneficiaryById(beneficiaryId);
        if (!beneficiary || beneficiary.walletId !== walletId) {
            throw new common_1.NotFoundException('Beneficiario no encontrado en esta billetera');
        }
        await this.walletRepository.deleteBeneficiary(beneficiaryId);
        this.walletGateway?.emitBeneficiaryDeleted(walletId, beneficiaryId);
    }
    async getMonthlySummary(userId, walletId, month, year) {
        const wallet = await this.getWalletById(userId, walletId);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const expenses = await this.walletRepository.findWalletExpenses(walletId, startDate, endDate);
        const totalFixed = expenses
            .filter((e) => e.type === 'FIXED')
            .reduce((sum, e) => sum + e.amount, 0);
        const totalVariable = expenses
            .filter((e) => e.type === 'VARIABLE')
            .reduce((sum, e) => sum + e.amount, 0);
        const categoryMap = new Map();
        for (const expense of expenses) {
            const existing = categoryMap.get(expense.categoryId);
            if (existing) {
                existing.total += expense.amount;
                existing.count += 1;
            }
            else if (expense.category) {
                categoryMap.set(expense.categoryId, {
                    categoryId: expense.categoryId,
                    categoryName: expense.category.name,
                    categoryIcon: expense.category.icon,
                    categoryColor: expense.category.color,
                    total: expense.amount,
                    percentage: 0,
                    count: 1,
                });
            }
        }
        const total = totalFixed + totalVariable;
        const byCategory = Array.from(categoryMap.values())
            .map((cat) => ({
            ...cat,
            percentage: total > 0 ? Math.round((cat.total / total) * 100) : 0,
        }))
            .sort((a, b) => b.total - a.total);
        const prevStartDate = new Date(year, month - 2, 1);
        const prevEndDate = new Date(year, month - 1, 0, 23, 59, 59);
        const prevExpenses = await this.walletRepository.findWalletExpenses(walletId, prevStartDate, prevEndDate);
        const previousMonth = prevExpenses.reduce((sum, e) => sum + e.amount, 0);
        const percentageChange = previousMonth > 0
            ? Math.round(((total - previousMonth) / previousMonth) * 100)
            : 0;
        return {
            month,
            year,
            currency: wallet.currency,
            totalFixed,
            totalVariable,
            total,
            byCategory,
            comparison: {
                previousMonth,
                percentageChange,
            },
        };
    }
};
exports.WalletUseCase = WalletUseCase;
exports.WalletUseCase = WalletUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [wallet_repository_1.WalletRepository,
        user_repository_1.UserRepository,
        wallet_gateway_1.WalletGateway])
], WalletUseCase);
//# sourceMappingURL=wallet.use-case.js.map