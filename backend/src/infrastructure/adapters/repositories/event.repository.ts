import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma.service';
import { IEventRepositoryPort } from '../../../application/ports/output/event.repository.port';
import { Event, EventType, WishListItem } from '../../../domain/entities/event.entity';
import { User } from '../../../domain/entities/user.entity';

@Injectable()
export class EventRepository implements IEventRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    groupId: string;
    name: string;
    type: EventType;
    date: Date;
    giftRecipientId?: string;
    giftRecipientGuestId?: string;
  }): Promise<Event> {
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

  async findById(id: string): Promise<Event | null> {
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

  async findByGroupId(groupId: string): Promise<Event[]> {
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

  async update(id: string, data: Partial<Event>): Promise<Event> {
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

  async delete(id: string): Promise<void> {
    await this.prisma.event.delete({ where: { id } });
  }

  // Lista de deseos
  async addWishListItem(eventId: string, data: { description: string; url?: string }): Promise<WishListItem> {
    const item = await this.prisma.wishListItem.create({
      data: { eventId, ...data },
      include: { purchasedBy: true },
    });
    return this.toWishListEntity(item);
  }

  async findWishListItemById(id: string): Promise<WishListItem | null> {
    const item = await this.prisma.wishListItem.findUnique({
      where: { id },
      include: { purchasedBy: true },
    });
    return item ? this.toWishListEntity(item) : null;
  }

  async updateWishListItem(id: string, data: Partial<WishListItem>): Promise<WishListItem> {
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

  async removeWishListItem(id: string): Promise<void> {
    await this.prisma.wishListItem.delete({ where: { id } });
  }

  private toEntity(data: any): Event {
    return new Event({
      id: data.id,
      groupId: data.groupId,
      name: data.name,
      type: data.type as EventType,
      date: data.date,
      giftRecipientId: data.giftRecipientId,
      giftRecipient: data.giftRecipient ? this.toUserEntity(data.giftRecipient) : undefined,
      giftRecipientGuestId: data.giftRecipientGuestId,
      giftRecipientGuest: data.giftRecipientGuest ? { id: data.giftRecipientGuest.id, name: data.giftRecipientGuest.name } : undefined,
      isSettled: data.isSettled,
      settledAt: data.settledAt,
      wishList: data.wishList?.map((w: any) => this.toWishListEntity(w)),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  private toWishListEntity(data: any): WishListItem {
    return new WishListItem({
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

  private toUserEntity(data: any): User {
    return new User({
      id: data.id,
      email: data.email,
      password: data.password,
      name: data.name,
      avatar: data.avatar,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}

