import { Event, EventType, WishListItem } from '../../../domain/entities/event.entity';
export interface CreateEventDto {
    name: string;
    type: EventType;
    date: Date;
    giftRecipientId?: string;
    giftRecipientGuestId?: string;
}
export interface AddWishListItemDto {
    description: string;
    url?: string;
}
export interface IEventInputPort {
    create(userId: string, groupId: string, dto: CreateEventDto): Promise<Event>;
    findById(userId: string, eventId: string): Promise<Event>;
    findByGroupId(userId: string, groupId: string): Promise<Event[]>;
    settle(userId: string, eventId: string): Promise<Event>;
    delete(userId: string, eventId: string): Promise<void>;
    addWishListItem(userId: string, eventId: string, dto: AddWishListItemDto): Promise<WishListItem>;
    markWishListItemPurchased(userId: string, itemId: string): Promise<WishListItem>;
    removeWishListItem(userId: string, itemId: string): Promise<void>;
}
