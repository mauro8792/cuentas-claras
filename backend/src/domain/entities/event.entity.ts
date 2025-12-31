import { User } from './user.entity';
import { Expense } from './expense.entity';

export enum EventType {
  GIFT = 'GIFT',
  GATHERING = 'GATHERING',
}

export class WishListItem {
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
  }) {
    this.id = props.id;
    this.eventId = props.eventId;
    this.description = props.description;
    this.url = props.url;
    this.isPurchased = props.isPurchased;
    this.purchasedById = props.purchasedById;
    this.purchasedBy = props.purchasedBy;
    this.createdAt = props.createdAt;
  }
}

export interface GuestMemberRef {
  id: string;
  name: string;
}

export class Event {
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
  }) {
    this.id = props.id;
    this.groupId = props.groupId;
    this.name = props.name;
    this.type = props.type;
    this.date = props.date;
    this.giftRecipientId = props.giftRecipientId;
    this.giftRecipient = props.giftRecipient;
    this.giftRecipientGuestId = props.giftRecipientGuestId;
    this.giftRecipientGuest = props.giftRecipientGuest;
    this.isSettled = props.isSettled;
    this.settledAt = props.settledAt;
    this.wishList = props.wishList;
    this.expenses = props.expenses;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isGiftEvent(): boolean {
    return this.type === EventType.GIFT;
  }

  isHiddenFromUser(userId: string): boolean {
    // Solo ocultar para usuarios, los invitados no tienen acceso a la app
    return this.isGiftEvent() && this.giftRecipientId === userId;
  }

  canBeModified(): boolean {
    return !this.isSettled;
  }
  
  getRecipientName(): string | undefined {
    return this.giftRecipient?.name || this.giftRecipientGuest?.name;
  }
}

