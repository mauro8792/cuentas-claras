import { Event, EventType, WishListItem } from '../../../domain/entities/event.entity';

export interface IEventRepositoryPort {
  create(data: {
    groupId: string;
    name: string;
    type: EventType;
    date: Date;
    giftRecipientId?: string;
    giftRecipientGuestId?: string;
  }): Promise<Event>;
  findById(id: string): Promise<Event | null>;
  findByGroupId(groupId: string): Promise<Event[]>;
  update(id: string, data: Partial<Event>): Promise<Event>;
  delete(id: string): Promise<void>;
  
  // Lista de deseos
  addWishListItem(eventId: string, data: { description: string; url?: string }): Promise<WishListItem>;
  findWishListItemById(id: string): Promise<WishListItem | null>;
  updateWishListItem(id: string, data: Partial<WishListItem>): Promise<WishListItem>;
  removeWishListItem(id: string): Promise<void>;
}

