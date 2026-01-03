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
exports.EventUseCase = void 0;
const common_1 = require("@nestjs/common");
const event_entity_1 = require("../../domain/entities/event.entity");
let EventUseCase = class EventUseCase {
    constructor(eventRepository, groupRepository) {
        this.eventRepository = eventRepository;
        this.groupRepository = groupRepository;
    }
    async create(userId, groupId, dto) {
        const isMember = await this.groupRepository.isMember(groupId, userId);
        if (!isMember) {
            throw new common_1.ForbiddenException('No sos miembro de este grupo');
        }
        if (dto.type === event_entity_1.EventType.GIFT) {
            if (!dto.giftRecipientId && !dto.giftRecipientGuestId) {
                throw new common_1.BadRequestException('Debés seleccionar un agasajado para eventos de regalo');
            }
            if (dto.giftRecipientId) {
                const isRecipientMember = await this.groupRepository.isMember(groupId, dto.giftRecipientId);
                if (!isRecipientMember) {
                    throw new common_1.BadRequestException('El agasajado debe ser miembro del grupo');
                }
            }
        }
        return this.eventRepository.create({
            groupId,
            name: dto.name,
            type: dto.type,
            date: dto.date,
            giftRecipientId: dto.giftRecipientId,
            giftRecipientGuestId: dto.giftRecipientGuestId,
        });
    }
    async findById(userId, eventId) {
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw new common_1.NotFoundException('Evento no encontrado');
        }
        const isMember = await this.groupRepository.isMember(event.groupId, userId);
        if (!isMember) {
            throw new common_1.ForbiddenException('No sos miembro de este grupo');
        }
        if (event.isHiddenFromUser(userId)) {
            throw new common_1.ForbiddenException('No podés ver este evento (¡es sorpresa!)');
        }
        return event;
    }
    async findByGroupId(userId, groupId) {
        const isMember = await this.groupRepository.isMember(groupId, userId);
        if (!isMember) {
            throw new common_1.ForbiddenException('No sos miembro de este grupo');
        }
        const events = await this.eventRepository.findByGroupId(groupId);
        return events.filter((event) => !event.isHiddenFromUser(userId));
    }
    async settle(userId, eventId) {
        const event = await this.findById(userId, eventId);
        if (event.isSettled) {
            throw new common_1.BadRequestException('Este evento ya fue liquidado');
        }
        return this.eventRepository.update(eventId, {
            isSettled: true,
            settledAt: new Date(),
        });
    }
    async update(userId, eventId, dto) {
        const event = await this.findById(userId, eventId);
        if (event.isSettled) {
            throw new common_1.BadRequestException('No podés editar un evento liquidado');
        }
        const groupCreatorId = await this.groupRepository.getGroupCreatorId(event.groupId);
        if (groupCreatorId !== userId) {
            throw new common_1.ForbiddenException('Solo el creador del grupo puede editar eventos');
        }
        return this.eventRepository.update(eventId, dto);
    }
    async delete(userId, eventId) {
        const event = await this.findById(userId, eventId);
        if (event.isSettled) {
            throw new common_1.BadRequestException('No podés eliminar un evento liquidado');
        }
        await this.eventRepository.delete(eventId);
    }
    async addWishListItem(userId, eventId, dto) {
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw new common_1.NotFoundException('Evento no encontrado');
        }
        if (!event.isGiftEvent()) {
            throw new common_1.BadRequestException('Solo los eventos de regalo pueden tener lista de deseos');
        }
        if (event.giftRecipientId !== userId) {
            throw new common_1.ForbiddenException('Solo el agasajado puede agregar items a la lista de deseos');
        }
        return this.eventRepository.addWishListItem(eventId, {
            description: dto.description,
            url: dto.url,
        });
    }
    async markWishListItemPurchased(userId, itemId) {
        const item = await this.eventRepository.findWishListItemById(itemId);
        if (!item) {
            throw new common_1.NotFoundException('Item no encontrado');
        }
        const event = await this.eventRepository.findById(item.eventId);
        if (!event) {
            throw new common_1.NotFoundException('Evento no encontrado');
        }
        if (event.giftRecipientId === userId) {
            throw new common_1.ForbiddenException('El agasajado no puede marcar items como comprados');
        }
        const isMember = await this.groupRepository.isMember(event.groupId, userId);
        if (!isMember) {
            throw new common_1.ForbiddenException('No sos miembro de este grupo');
        }
        return this.eventRepository.updateWishListItem(itemId, {
            isPurchased: true,
            purchasedById: userId,
        });
    }
    async removeWishListItem(userId, itemId) {
        const item = await this.eventRepository.findWishListItemById(itemId);
        if (!item) {
            throw new common_1.NotFoundException('Item no encontrado');
        }
        const event = await this.eventRepository.findById(item.eventId);
        if (!event) {
            throw new common_1.NotFoundException('Evento no encontrado');
        }
        if (event.giftRecipientId !== userId) {
            throw new common_1.ForbiddenException('Solo el agasajado puede eliminar items de la lista de deseos');
        }
        await this.eventRepository.removeWishListItem(itemId);
    }
};
exports.EventUseCase = EventUseCase;
exports.EventUseCase = EventUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object, Object])
], EventUseCase);
//# sourceMappingURL=event.use-case.js.map