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
exports.GroupController = exports.JoinGroupDto = exports.UpdateGroupDto = exports.CreateGroupDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const group_use_case_1 = require("../../application/use-cases/group.use-case");
const expense_use_case_1 = require("../../application/use-cases/expense.use-case");
const events_gateway_1 = require("../gateways/events.gateway");
class CreateGroupDto {
}
exports.CreateGroupDto = CreateGroupDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateGroupDto.prototype, "name", void 0);
class UpdateGroupDto {
}
exports.UpdateGroupDto = UpdateGroupDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateGroupDto.prototype, "name", void 0);
class JoinGroupDto {
}
exports.JoinGroupDto = JoinGroupDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], JoinGroupDto.prototype, "inviteCode", void 0);
let GroupController = class GroupController {
    constructor(groupUseCase, expenseUseCase, eventsGateway) {
        this.groupUseCase = groupUseCase;
        this.expenseUseCase = expenseUseCase;
        this.eventsGateway = eventsGateway;
    }
    async create(req, dto) {
        return this.groupUseCase.create(req.user.id, dto);
    }
    async findMyGroups(req) {
        return this.groupUseCase.findUserGroups(req.user.id);
    }
    async findById(req, id) {
        return this.groupUseCase.findById(id, req.user.id);
    }
    async update(req, id, dto) {
        const group = await this.groupUseCase.update(req.user.id, id, dto);
        this.eventsGateway.server.to(`group_${id}`).emit('groupUpdated', group);
        return group;
    }
    async join(req, dto) {
        const group = await this.groupUseCase.joinByInviteCode(req.user.id, dto.inviteCode);
        await this.expenseUseCase.recalculateDebtsForNewMember(group.id, req.user.id, false);
        this.eventsGateway.server.to(`group_${group.id}`).emit('memberJoined', {
            groupId: group.id,
            userId: req.user.id,
        });
        console.log(`👤 Nuevo miembro ${req.user.id} se unió al grupo ${group.id} - Deudas recalculadas`);
        return group;
    }
    async findByInviteCode(code) {
        return this.groupUseCase.findByInviteCode(code);
    }
    async leave(req, id) {
        return this.groupUseCase.leave(req.user.id, id);
    }
    async delete(req, id) {
        return this.groupUseCase.delete(req.user.id, id);
    }
};
exports.GroupController = GroupController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nuevo grupo' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateGroupDto]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener mis grupos' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "findMyGroups", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener grupo por ID' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar grupo (solo creador)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, UpdateGroupDto]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('join'),
    (0, swagger_1.ApiOperation)({ summary: 'Unirse a un grupo por código de invitación' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, JoinGroupDto]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "join", null);
__decorate([
    (0, common_1.Get)('invite/:code'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener info de grupo por código de invitación' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "findByInviteCode", null);
__decorate([
    (0, common_1.Delete)(':id/leave'),
    (0, swagger_1.ApiOperation)({ summary: 'Abandonar grupo' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "leave", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar grupo (solo creador)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "delete", null);
exports.GroupController = GroupController = __decorate([
    (0, swagger_1.ApiTags)('Groups'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('groups'),
    __metadata("design:paramtypes", [group_use_case_1.GroupUseCase,
        expense_use_case_1.ExpenseUseCase,
        events_gateway_1.EventsGateway])
], GroupController);
//# sourceMappingURL=group.controller.js.map