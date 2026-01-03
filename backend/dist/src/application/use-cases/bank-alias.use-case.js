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
exports.BankAliasUseCase = void 0;
const common_1 = require("@nestjs/common");
const bank_alias_repository_port_1 = require("../ports/output/bank-alias.repository.port");
let BankAliasUseCase = class BankAliasUseCase {
    constructor(bankAliasRepository) {
        this.bankAliasRepository = bankAliasRepository;
    }
    async getUserAliases(userId) {
        return this.bankAliasRepository.findByUserId(userId);
    }
    async createAlias(userId, dto) {
        if (dto.priority < 1 || dto.priority > 3) {
            throw new common_1.BadRequestException('La prioridad debe ser 1, 2 o 3');
        }
        const existingAliases = await this.bankAliasRepository.findByUserId(userId);
        if (existingAliases.length >= 3) {
            throw new common_1.BadRequestException('Solo podés tener hasta 3 alias bancarios');
        }
        const existingPriority = existingAliases.find(a => a.priority === dto.priority);
        if (existingPriority) {
            throw new common_1.BadRequestException(`Ya tenés un alias con prioridad ${dto.priority}`);
        }
        return this.bankAliasRepository.create(userId, dto.alias, dto.bankName, dto.priority);
    }
    async updateAlias(userId, aliasId, dto) {
        const alias = await this.bankAliasRepository.findById(aliasId);
        if (!alias) {
            throw new common_1.NotFoundException('Alias no encontrado');
        }
        if (alias.userId !== userId) {
            throw new common_1.ForbiddenException('No podés editar este alias');
        }
        if (dto.priority && dto.priority !== alias.priority) {
            if (dto.priority < 1 || dto.priority > 3) {
                throw new common_1.BadRequestException('La prioridad debe ser 1, 2 o 3');
            }
            const existingPriority = await this.bankAliasRepository.findByUserIdAndPriority(userId, dto.priority);
            if (existingPriority) {
                throw new common_1.BadRequestException(`Ya tenés un alias con prioridad ${dto.priority}`);
            }
        }
        return this.bankAliasRepository.update(aliasId, dto);
    }
    async deleteAlias(userId, aliasId) {
        const alias = await this.bankAliasRepository.findById(aliasId);
        if (!alias) {
            throw new common_1.NotFoundException('Alias no encontrado');
        }
        if (alias.userId !== userId) {
            throw new common_1.ForbiddenException('No podés eliminar este alias');
        }
        await this.bankAliasRepository.delete(aliasId);
    }
    async getAliasesByUserId(userId) {
        return this.bankAliasRepository.findByUserId(userId);
    }
};
exports.BankAliasUseCase = BankAliasUseCase;
exports.BankAliasUseCase = BankAliasUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(bank_alias_repository_port_1.BANK_ALIAS_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], BankAliasUseCase);
//# sourceMappingURL=bank-alias.use-case.js.map