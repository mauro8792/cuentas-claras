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
exports.EventController = exports.AddWishListItemDto = exports.UpdateEventDto = exports.CreateEventDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const event_use_case_1 = require("../../application/use-cases/event.use-case");
const event_entity_1 = require("../../domain/entities/event.entity");
const events_gateway_1 = require("../gateways/events.gateway");
class CreateEventDto {
}
exports.CreateEventDto = CreateEventDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateEventDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(event_entity_1.EventType),
    __metadata("design:type", String)
], CreateEventDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "giftRecipientId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "giftRecipientGuestId", void 0);
class UpdateEventDto {
}
exports.UpdateEventDto = UpdateEventDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateEventDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateEventDto.prototype, "date", void 0);
class AddWishListItemDto {
}
exports.AddWishListItemDto = AddWishListItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], AddWishListItemDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], AddWishListItemDto.prototype, "url", void 0);
let EventController = class EventController {
    constructor(eventUseCase, eventsGateway) {
        this.eventUseCase = eventUseCase;
        this.eventsGateway = eventsGateway;
    }
    async create(req, groupId, dto) {
        return this.eventUseCase.create(req.user.id, groupId, {
            ...dto,
            date: new Date(dto.date),
        });
    }
    async findByGroup(req, groupId) {
        return this.eventUseCase.findByGroupId(req.user.id, groupId);
    }
    async findById(req, id) {
        return this.eventUseCase.findById(req.user.id, id);
    }
    async update(req, id, dto) {
        const event = await this.eventUseCase.update(req.user.id, id, {
            ...dto,
            date: dto.date ? new Date(dto.date) : undefined,
        });
        this.eventsGateway.server.to(`event_${id}`).emit('eventUpdated', event);
        return event;
    }
    async settle(req, id) {
        const result = await this.eventUseCase.settle(req.user.id, id);
        this.eventsGateway.server.to(`event_${id}`).emit('eventSettled', { eventId: id });
        console.log(`🏁 Evento ${id} liquidado - notificando a usuarios`);
        return result;
    }
    async delete(req, id) {
        return this.eventUseCase.delete(req.user.id, id);
    }
    async addWishListItem(req, id, dto) {
        return this.eventUseCase.addWishListItem(req.user.id, id, dto);
    }
    async markPurchased(req, itemId) {
        return this.eventUseCase.markWishListItemPurchased(req.user.id, itemId);
    }
    async removeWishListItem(req, itemId) {
        return this.eventUseCase.removeWishListItem(req.user.id, itemId);
    }
};
exports.EventController = EventController;
__decorate([
    (0, common_1.Post)('group/:groupId'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nuevo evento' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('groupId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, CreateEventDto]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('group/:groupId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener eventos de un grupo' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "findByGroup", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener evento por ID' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar evento' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, UpdateEventDto]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/settle'),
    (0, swagger_1.ApiOperation)({ summary: 'Liquidar evento' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "settle", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar evento' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/wishlist'),
    (0, swagger_1.ApiOperation)({ summary: 'Agregar item a lista de deseos' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, AddWishListItemDto]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "addWishListItem", null);
__decorate([
    (0, common_1.Post)('wishlist/:itemId/purchase'),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar item como comprado' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "markPurchased", null);
__decorate([
    (0, common_1.Delete)('wishlist/:itemId'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar item de lista de deseos' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "removeWishListItem", null);
exports.EventController = EventController = __decorate([
    (0, swagger_1.ApiTags)('Events'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('events'),
    __metadata("design:paramtypes", [event_use_case_1.EventUseCase,
        events_gateway_1.EventsGateway])
], EventController);
//# sourceMappingURL=event.controller.js.map