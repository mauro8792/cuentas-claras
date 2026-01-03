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
exports.BankAliasController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const bank_alias_use_case_1 = require("../../application/use-cases/bank-alias.use-case");
let BankAliasController = class BankAliasController {
    constructor(bankAliasUseCase) {
        this.bankAliasUseCase = bankAliasUseCase;
    }
    async getMyAliases(req) {
        return this.bankAliasUseCase.getUserAliases(req.user.id);
    }
    async getUserAliases(userId) {
        return this.bankAliasUseCase.getAliasesByUserId(userId);
    }
    async createAlias(req, dto) {
        return this.bankAliasUseCase.createAlias(req.user.id, dto);
    }
    async updateAlias(req, aliasId, dto) {
        return this.bankAliasUseCase.updateAlias(req.user.id, aliasId, dto);
    }
    async deleteAlias(req, aliasId) {
        await this.bankAliasUseCase.deleteAlias(req.user.id, aliasId);
        return { message: 'Alias eliminado correctamente' };
    }
};
exports.BankAliasController = BankAliasController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener mis alias bancarios' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BankAliasController.prototype, "getMyAliases", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener alias bancarios de otro usuario' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BankAliasController.prototype, "getUserAliases", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear un nuevo alias bancario' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BankAliasController.prototype, "createAlias", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar un alias bancario' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], BankAliasController.prototype, "updateAlias", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar un alias bancario' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BankAliasController.prototype, "deleteAlias", null);
exports.BankAliasController = BankAliasController = __decorate([
    (0, swagger_1.ApiTags)('Bank Aliases'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('bank-aliases'),
    __metadata("design:paramtypes", [bank_alias_use_case_1.BankAliasUseCase])
], BankAliasController);
//# sourceMappingURL=bank-alias.controller.js.map