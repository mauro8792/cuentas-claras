import { User } from './user.entity';
import { Expense } from './expense.entity';
export declare enum EventType {
    GIFT = "GIFT",
    GATHERING = "GATHERING"
}
export declare class WishListItem {
    readonly id: string;
    readonly eventId: string;
    readonly description: string;
    readonly url?: string;
    readonly isPurchased: boolean;
    readonly purchasedById?: string;
    readonly purchasedBy?: User;
    readonly createdAt: Date;
    constructor(props: {
        id: string;
        eventId: string;
        description: string;
        url?: string;
        isPurchased: boolean;
        purchasedById?: string;
        purchasedBy?: User;
        createdAt: Date;
    });
}
export interface GuestMemberRef {
    id: string;
    name: string;
}
export declare class Event {
    readonly id: string;
    readonly groupId: string;
    readonly name: string;
    readonly type: EventType;
    readonly date: Date;
    readonly giftRecipientId?: string;
    readonly giftRecipient?: User;
    readonly giftRecipientGuestId?: string;
    readonly giftRecipientGuest?: GuestMemberRef;
    readonly isSettled: boolean;
    readonly settledAt?: Date;
    readonly wishList?: WishListItem[];
    readonly expenses?: Expense[];
    readonly createdAt: Date;
    readonly updatedAt?: Date;
    constructor(props: {
        id: string;
        groupId: string;
        name: string;
        type: EventType;
        date: Date;
        giftRecipientId?: string;
        giftRecipient?: User;
        giftRecipientGuestId?: string;
        giftRecipientGuest?: GuestMemberRef;
        isSettled: boolean;
        settledAt?: Date;
        wishList?: WishListItem[];
        expenses?: Expense[];
        createdAt: Date;
        updatedAt?: Date;
    });
    isGiftEvent(): boolean;
    isHiddenFromUser(userId: string): boolean;
    canBeModified(): boolean;
    getRecipientName(): string | undefined;
}
