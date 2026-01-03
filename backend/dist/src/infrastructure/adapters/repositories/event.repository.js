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
exports.EventRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../persistence/prisma.service");
const event_entity_1 = require("../../../domain/entities/event.entity");
const user_entity_1 = require("../../../domain/entities/user.entity");
let EventRepository = class EventRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const event = await this.prisma.event.create({
            data: {
                groupId: data.groupId,
                name: data.name,
                type: data.type,
                date: data.date,
                giftRecipientId: data.giftRecipientId,
                giftRecipientGuestId: data.giftRecipientGuestId,
            },
            include: {
                giftRecipient: true,
                giftRecipientGuest: true,
                wishList: { include: { purchasedBy: true } },
                expenses: {
                    include: {
                        paidBy: true,
                        participants: { include: { user: true } },
                    },
                },
            },
        });
        return this.toEntity(event);
    }
    async findById(id) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: {
                giftRecipient: true,
                giftRecipientGuest: true,
                wishList: { include: { purchasedBy: true } },
                expenses: {
                    include: {
                        paidBy: true,
                        participants: { include: { user: true } },
                    },
                },
            },
        });
        return event ? this.toEntity(event) : null;
    }
    async findByGroupId(groupId) {
        const events = await this.prisma.event.findMany({
            where: { groupId },
            include: {
                giftRecipient: true,
                giftRecipientGuest: true,
                wishList: { include: { purchasedBy: true } },
                expenses: {
                    include: {
                        paidBy: true,
                        participants: { include: { user: true } },
                    },
                },
            },
            orderBy: { date: 'desc' },
        });
        return events.map((e) => this.toEntity(e));
    }
    async update(id, data) {
        const event = await this.prisma.event.update({
            where: { id },
            data: {
                name: data.name,
                isSettled: data.isSettled,
                settledAt: data.settledAt,
            },
            include: {
                giftRecipient: true,
                wishList: { include: { purchasedBy: true } },
                expenses: {
                    include: {
                        paidBy: true,
                        participants: { include: { user: true } },
                    },
                },
            },
        });
        return this.toEntity(event);
    }
    async delete(id) {
        await this.prisma.event.delete({ where: { id } });
    }
    async addWishListItem(eventId, data) {
        const item = await this.prisma.wishListItem.create({
            data: { eventId, ...data },
            include: { purchasedBy: true },
        });
        return this.toWishListEntity(item);
    }
    async findWishListItemById(id) {
        const item = await this.prisma.wishListItem.findUnique({
            where: { id },
            include: { purchasedBy: true },
        });
        return item ? this.toWishListEntity(item) : null;
    }
    async updateWishListItem(id, data) {
        const item = await this.prisma.wishListItem.update({
            where: { id },
            data: {
                isPurchased: data.isPurchased,
                purchasedById: data.purchasedById,
            },
            include: { purchasedBy: true },
        });
        return this.toWishListEntity(item);
    }
    async removeWishListItem(id) {
        await this.prisma.wishListItem.delete({ where: { id } });
    }
    toEntity(data) {
        return new event_entity_1.Event({
            id: data.id,
            groupId: data.groupId,
            name: data.name,
            type: data.type,
            date: data.date,
            giftRecipientId: data.giftRecipientId,
            giftRecipient: data.giftRecipient ? this.toUserEntity(data.giftRecipient) : undefined,
            giftRecipientGuestId: data.giftRecipientGuestId,
            giftRecipientGuest: data.giftRecipientGuest ? { id: data.giftRecipientGuest.id, name: data.giftRecipientGuest.name } : undefined,
            isSettled: data.isSettled,
            settledAt: data.settledAt,
            wishList: data.wishList?.map((w) => this.toWishListEntity(w)),
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });
    }
    toWishListEntity(data) {
        return new event_entity_1.WishListItem({
            id: data.id,
            eventId: data.eventId,
            description: data.description,
            url: data.url,
            isPurchased: data.isPurchased,
            purchasedById: data.purchasedById,
            purchasedBy: data.purchasedBy ? this.toUserEntity(data.purchasedBy) : undefined,
            createdAt: data.createdAt,
        });
    }
    toUserEntity(data) {
        return new user_entity_1.User({
            id: data.id,
            email: data.email,
            password: data.password,
            name: data.name,
            avatar: data.avatar,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });
    }
};
exports.EventRepository = EventRepository;
exports.EventRepository = EventRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EventRepository);
//# sourceMappingURL=event.repository.js.map