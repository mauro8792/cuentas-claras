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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const wallet_use_case_1 = require("../../application/use-cases/wallet.use-case");
const wallet_port_1 = require("../../application/ports/input/wallet.port");
const wallet_entity_1 = require("../../domain/entities/wallet.entity");
let WalletController = class WalletController {
    constructor(walletUseCase) {
        this.walletUseCase = walletUseCase;
    }
    getCurrencies() {
        return wallet_entity_1.SUPPORTED_CURRENCIES;
    }
    async getCategories(req) {
        return this.walletUseCase.getCategories(req.user.id);
    }
    async createCategory(req, dto) {
        return this.walletUseCase.createCategory(req.user.id, dto);
    }
    async deleteCategory(req, categoryId) {
        await this.walletUseCase.deleteCategory(req.user.id, categoryId);
        return { message: 'Categoría eliminada' };
    }
    async joinWallet(req, dto) {
        return this.walletUseCase.joinByInviteCode(req.user.id, dto);
    }
    async createWallet(req, dto) {
        return this.walletUseCase.createWallet(req.user.id, dto);
    }
    async getMyWallets(req) {
        return this.walletUseCase.getUserWallets(req.user.id);
    }
    async getWallet(req, walletId) {
        return this.walletUseCase.getWalletById(req.user.id, walletId);
    }
    async updateWallet(req, walletId, dto) {
        return this.walletUseCase.updateWallet(req.user.id, walletId, dto);
    }
    async deleteWallet(req, walletId) {
        await this.walletUseCase.deleteWallet(req.user.id, walletId);
        return { message: 'Billetera eliminada' };
    }
    async inviteMember(req, walletId, dto) {
        return this.walletUseCase.inviteMember(req.user.id, walletId, dto);
    }
    async removeMember(req, walletId, memberId) {
        await this.walletUseCase.removeMember(req.user.id, walletId, memberId);
        return { message: 'Miembro removido' };
    }
    async getBeneficiaries(req, walletId) {
        return this.walletUseCase.getBeneficiaries(req.user.id, walletId);
    }
    async createBeneficiary(req, walletId, dto) {
        return this.walletUseCase.createBeneficiary(req.user.id, walletId, dto);
    }
    async updateBeneficiary(req, walletId, beneficiaryId, dto) {
        return this.walletUseCase.updateBeneficiary(req.user.id, walletId, beneficiaryId, dto);
    }
    async deleteBeneficiary(req, walletId, beneficiaryId) {
        await this.walletUseCase.deleteBeneficiary(req.user.id, walletId, beneficiaryId);
        return { message: 'Beneficiario eliminado' };
    }
    async createExpense(req, walletId, dto) {
        return this.walletUseCase.createExpense(req.user.id, walletId, dto);
    }
    async getExpenses(req, walletId, month, year) {
        return this.walletUseCase.getWalletExpenses(req.user.id, walletId, month ? parseInt(month) : undefined, year ? parseInt(year) : undefined);
    }
    async getExpense(req, walletId, expenseId) {
        return this.walletUseCase.getExpenseById(req.user.id, walletId, expenseId);
    }
    async updateExpense(req, walletId, expenseId, dto) {
        return this.walletUseCase.updateExpense(req.user.id, walletId, expenseId, dto);
    }
    async deleteExpense(req, walletId, expenseId) {
        await this.walletUseCase.deleteExpense(req.user.id, walletId, expenseId);
        return { message: 'Gasto eliminado' };
    }
    async getMonthlySummary(req, walletId, month, year) {
        return this.walletUseCase.getMonthlySummary(req.user.id, walletId, parseInt(month), parseInt(year));
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Get)('currencies'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener monedas soportadas' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "getCurrencies", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener categorías de gastos' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Post)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear categoría personalizada' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, wallet_port_1.CreateCategoryDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:categoryId'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar categoría personalizada' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Post)('join'),
    (0, swagger_1.ApiOperation)({ summary: 'Unirse a billetera por código de invitación' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, wallet_port_1.JoinWalletDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "joinWallet", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear billetera' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, wallet_port_1.CreateWalletDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "createWallet", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener mis billeteras' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getMyWallets", null);
__decorate([
    (0, common_1.Get)(':walletId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener billetera por ID' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('walletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getWallet", null);
__decorate([
    (0, common_1.Put)(':walletId'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar billetera' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('walletId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, wallet_port_1.UpdateWalletDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "updateWallet", null);
__decorate([
    (0, common_1.Delete)(':walletId'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar billetera' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('walletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "deleteWallet", null);
__decorate([
    (0, common_1.Post)(':walletId/members'),
    (0, swagger_1.ApiOperation)({ summary: 'Invitar miembro a billetera' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('walletId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, wallet_port_1.InviteMemberDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "inviteMember", null);
__decorate([
    (0, common_1.Delete)(':walletId/members/:memberId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover miembro de billetera' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('walletId')),
    __param(2, (0, common_1.Param)('memberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Get)(':walletId/beneficiaries'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener beneficiarios de billetera' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('walletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getBeneficiaries", null);
__decorate([
    (0, common_1.Post)(':walletId/beneficiaries'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear beneficiario (mascota, hijo, auto, etc.)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('walletId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, wallet_port_1.CreateBeneficiaryDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "createBeneficiary", null);
__decorate([
    (0, common_1.Put)(':walletId/beneficiaries/:beneficiaryId'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar beneficiario' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('walletId')),
    __param(2, (0, common_1.Param)('beneficiaryId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, wallet_port_1.UpdateBeneficiaryDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "updateBeneficiary", null);
__decorate([
    (0, common_1.Delete)(':walletId/beneficiaries/:beneficiaryId'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar beneficiario' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('walletId')),
    __param(2, (0, common_1.Param)('beneficiaryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "deleteBeneficiary", null);
__decorate([
    (0, common_1.Post)(':walletId/expenses'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear gasto' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('walletId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, wallet_port_1.CreatePersonalExpenseDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "createExpense", null);
__decorate([
    (0, common_1.Get)(':walletId/expenses'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener gastos de billetera' }),
    (0, swagger_1.ApiQuery)({ name: 'month', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'year', required: false, type: Number }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('walletId')),
    __param(2, (0, common_1.Query)('month')),
    __param(3, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getExpenses", null);
__decorate([
    (0, common_1.Get)(':walletId/expenses/:expenseId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener gasto por ID' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('walletId')),
    __param(2, (0, common_1.Param)('expenseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getExpense", null);
__decorate([
    (0, common_1.Put)(':walletId/expenses/:expenseId'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar gasto' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('walletId')),
    __param(2, (0, common_1.Param)('expenseId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, wallet_port_1.UpdatePersonalExpenseDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "updateExpense", null);
__decorate([
    (0, common_1.Delete)(':walletId/expenses/:expenseId'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar gasto' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('walletId')),
    __param(2, (0, common_1.Param)('expenseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "deleteExpense", null);
__decorate([
    (0, common_1.Get)(':walletId/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener resumen mensual' }),
    (0, swagger_1.ApiQuery)({ name: 'month', required: true, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'year', required: true, type: Number }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('walletId')),
    __param(2, (0, common_1.Query)('month')),
    __param(3, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getMonthlySummary", null);
exports.WalletController = WalletController = __decorate([
    (0, swagger_1.ApiTags)('Wallets'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('wallets'),
    __metadata("design:paramtypes", [wallet_use_case_1.WalletUseCase])
], WalletController);
//# sourceMappingURL=wallet.controller.js.map