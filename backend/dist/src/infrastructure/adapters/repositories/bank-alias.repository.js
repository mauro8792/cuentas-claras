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
exports.BankAliasRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../persistence/prisma.service");
const bank_alias_entity_1 = require("../../../domain/entities/bank-alias.entity");
let BankAliasRepository = class BankAliasRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByUserId(userId) {
        const aliases = await this.prisma.bankAlias.findMany({
            where: { userId },
            orderBy: { priority: 'asc' },
        });
        return aliases.map(this.toEntity);
    }
    async findById(id) {
        const alias = await this.prisma.bankAlias.findUnique({
            where: { id },
        });
        return alias ? this.toEntity(alias) : null;
    }
    async findByUserIdAndPriority(userId, priority) {
        const alias = await this.prisma.bankAlias.findUnique({
            where: { userId_priority: { userId, priority } },
        });
        return alias ? this.toEntity(alias) : null;
    }
    async create(userId, alias, bankName, priority) {
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
    async update(id, data) {
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
    async delete(id) {
        await this.prisma.bankAlias.delete({
            where: { id },
        });
    }
    toEntity(data) {
        return new bank_alias_entity_1.BankAlias({
            id: data.id,
            userId: data.userId,
            alias: data.alias,
            bankName: data.bankName,
            priority: data.priority,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });
    }
};
exports.BankAliasRepository = BankAliasRepository;
exports.BankAliasRepository = BankAliasRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BankAliasRepository);
//# sourceMappingURL=bank-alias.repository.js.map