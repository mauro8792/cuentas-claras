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
exports.GuestController = exports.CreateGuestDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const prisma_service_1 = require("../persistence/prisma.service");
const expense_use_case_1 = require("../../application/use-cases/expense.use-case");
const events_gateway_1 = require("../gateways/events.gateway");
class CreateGuestDto {
}
exports.CreateGuestDto = CreateGuestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateGuestDto.prototype, "name", void 0);
let GuestController = class GuestController {
    constructor(prisma, expenseUseCase, eventsGateway) {
        this.prisma = prisma;
        this.expenseUseCase = expenseUseCase;
        this.eventsGateway = eventsGateway;
    }
    async create(req, groupId, dto) {
        const membership = await this.prisma.groupMember.findUnique({
            where: { userId_groupId: { userId: req.user.id, groupId } },
        });
        if (!membership) {
            throw new Error('No sos miembro de este grupo');
        }
        const guest = await this.prisma.guestMember.create({
            data: {
                name: dto.name,
                groupId,
                addedById: req.user.id,
            },
        });
        await this.expenseUseCase.recalculateDebtsForNewMember(groupId, guest.id, true);
        this.eventsGateway.server.to(`group_${groupId}`).emit('guestAdded', {
            groupId,
            guest,
        });
        console.log(`👤 Nuevo invitado ${guest.name} agregado al grupo ${groupId} - Deudas recalculadas`);
        return guest;
    }
    async findAll(req, groupId) {
        const membership = await this.prisma.groupMember.findUnique({
            where: { userId_groupId: { userId: req.user.id, groupId } },
        });
        if (!membership) {
            throw new Error('No sos miembro de este grupo');
        }
        return this.prisma.guestMember.findMany({
            where: { groupId },
            include: { addedBy: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'asc' },
        });
    }
    async delete(req, groupId, guestId) {
        const membership = await this.prisma.groupMember.findUnique({
            where: { userId_groupId: { userId: req.user.id, groupId } },
        });
        if (!membership) {
            throw new Error('No sos miembro de este grupo');
        }
        const guest = await this.prisma.guestMember.findFirst({
            where: { id: guestId, groupId },
        });
        if (!guest) {
            throw new Error('Participante no encontrado');
        }
        await this.expenseUseCase.recalculateDebtsOnMemberLeave(groupId, guestId, true);
        await this.prisma.guestMember.delete({ where: { id: guestId } });
        this.eventsGateway.server.to(`group_${groupId}`).emit('guestRemoved', {
            groupId,
            guestId,
            guestName: guest.name,
        });
        console.log(`👤 Invitado ${guest.name} eliminado del grupo ${groupId} - Deudas recalculadas`);
        return { success: true };
    }
};
exports.GuestController = GuestController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Agregar participante manual al grupo' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('groupId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, CreateGuestDto]),
    __metadata("design:returntype", Promise)
], GuestController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener participantes manuales del grupo' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GuestController.prototype, "findAll", null);
__decorate([
    (0, common_1.Delete)(':guestId'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar participante manual' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('groupId')),
    __param(2, (0, common_1.Param)('guestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], GuestController.prototype, "delete", null);
exports.GuestController = GuestController = __decorate([
    (0, swagger_1.ApiTags)('Guests'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('groups/:groupId/guests'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        expense_use_case_1.ExpenseUseCase,
        events_gateway_1.EventsGateway])
], GuestController);
//# sourceMappingURL=guest.controller.js.map