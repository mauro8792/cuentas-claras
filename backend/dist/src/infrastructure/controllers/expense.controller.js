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
exports.ExpenseController = exports.UpdateExpenseDto = exports.CreateExpenseDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const expense_use_case_1 = require("../../application/use-cases/expense.use-case");
const events_gateway_1 = require("../gateways/events.gateway");
const notification_service_1 = require("../services/notification.service");
const prisma_service_1 = require("../persistence/prisma.service");
class CreateExpenseDto {
}
exports.CreateExpenseDto = CreateExpenseDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1, { message: 'El monto debe ser mayor a 0' }),
    __metadata("design:type", Number)
], CreateExpenseDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "paidById", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "paidByGuestId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateExpenseDto.prototype, "participantIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateExpenseDto.prototype, "guestParticipantIds", void 0);
class UpdateExpenseDto {
}
exports.UpdateExpenseDto = UpdateExpenseDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateExpenseDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdateExpenseDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateExpenseDto.prototype, "participantIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateExpenseDto.prototype, "guestParticipantIds", void 0);
let ExpenseController = class ExpenseController {
    constructor(expenseUseCase, eventsGateway, notificationService, prisma) {
        this.expenseUseCase = expenseUseCase;
        this.eventsGateway = eventsGateway;
        this.notificationService = notificationService;
        this.prisma = prisma;
    }
    async create(req, eventId, dto) {
        const expense = await this.expenseUseCase.create(req.user.id, eventId, dto);
        this.eventsGateway.notifyExpenseCreated(eventId, expense);
        try {
            console.log('🔔 Intentando enviar notificación push...');
            const event = await this.prisma.event.findUnique({
                where: { id: eventId },
                select: { groupId: true },
            });
            console.log('📍 Event groupId:', event?.groupId);
            if (event) {
                let paidByName = 'Alguien';
                if (expense.paidById) {
                    const user = await this.prisma.user.findUnique({
                        where: { id: expense.paidById },
                        select: { name: true },
                    });
                    paidByName = user?.name || 'Alguien';
                }
                else if (expense.paidByGuestId) {
                    const guest = await this.prisma.guestMember.findUnique({
                        where: { id: expense.paidByGuestId },
                        select: { name: true },
                    });
                    paidByName = guest?.name || 'Un invitado';
                }
                console.log(`📤 Enviando notificación: ${paidByName} pagó $${expense.amount} - ${expense.description}`);
                await this.notificationService.notifyNewExpense(event.groupId, expense.description, expense.amount, paidByName, req.user.id, eventId);
                console.log('✅ Notificación enviada correctamente');
            }
        }
        catch (error) {
            console.error('❌ Error enviando notificación push:', error);
        }
        return expense;
    }
    async findByEvent(req, eventId) {
        return this.expenseUseCase.findByEventId(req.user.id, eventId);
    }
    async findById(req, id) {
        return this.expenseUseCase.findById(req.user.id, id);
    }
    async update(req, id, dto) {
        const expense = await this.expenseUseCase.update(req.user.id, id, dto);
        this.eventsGateway.server.to(`event_${expense.eventId}`).emit('expenseUpdated', expense);
        return expense;
    }
    async delete(req, id) {
        const expense = await this.expenseUseCase.findById(req.user.id, id);
        await this.expenseUseCase.delete(req.user.id, id);
        this.eventsGateway.notifyExpenseDeleted(expense.eventId, id);
        return { success: true };
    }
    async getEventDebts(req, eventId) {
        return this.expenseUseCase.getEventDebts(req.user.id, eventId);
    }
    async getSettlement(req, eventId) {
        return this.expenseUseCase.getOptimalSettlement(req.user.id, eventId);
    }
    async markPaid(req, debtId, body) {
        const result = await this.expenseUseCase.markDebtAsPaid(req.user.id, debtId);
        if (body.eventId) {
            this.eventsGateway.notifyDebtPaid(body.eventId, debtId);
        }
        return result;
    }
    async getMyBalance(req) {
        return this.expenseUseCase.getUserBalance(req.user.id);
    }
};
exports.ExpenseController = ExpenseController;
__decorate([
    (0, common_1.Post)('event/:eventId'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nuevo gasto' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('eventId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, CreateExpenseDto]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('event/:eventId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener gastos de un evento' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "findByEvent", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener gasto por ID' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar gasto' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, UpdateExpenseDto]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar gasto' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)('event/:eventId/debts'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener deudas de un evento' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "getEventDebts", null);
__decorate([
    (0, common_1.Get)('event/:eventId/settlement'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener liquidación óptima de un evento' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "getSettlement", null);
__decorate([
    (0, common_1.Post)('debt/:debtId/pay'),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar deuda como pagada' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('debtId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "markPaid", null);
__decorate([
    (0, common_1.Get)('balance/me'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener mi balance general' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "getMyBalance", null);
exports.ExpenseController = ExpenseController = __decorate([
    (0, swagger_1.ApiTags)('Expenses'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('expenses'),
    __metadata("design:paramtypes", [expense_use_case_1.ExpenseUseCase,
        events_gateway_1.EventsGateway,
        notification_service_1.NotificationService,
        prisma_service_1.PrismaService])
], ExpenseController);
//# sourceMappingURL=expense.controller.js.map