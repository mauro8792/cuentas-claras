import { User } from './user.entity';

export class ExpenseParticipant {
  readonly id: string;
  readonly expenseId: string;
  readonly userId: string;
  readonly user?: User;

  constructor(props: {
    id: string;
    expenseId: string;
    userId: string;
    user?: User;
  }) {
    this.id = props.id;
    this.expenseId = props.expenseId;
    this.userId = props.userId;
    this.user = props.user;
  }
}

export interface GuestParticipant {
  id: string;
  guestMemberId: string;
  guestMember?: { id: string; name: string };
}

export class Expense {
  readonly id: string;
  readonly eventId: string;
  readonly paidById?: string;
  readonly paidBy?: User;
  readonly paidByGuestId?: string;
  readonly paidByGuest?: { id: string; name: string };
  readonly amount: number;
  readonly description: string;
  readonly participants?: ExpenseParticipant[];
  readonly guestParticipants?: GuestParticipant[];
  readonly createdAt: Date;
  readonly updatedAt?: Date;

  constructor(props: {
    id: string;
    eventId: string;
    paidById?: string;
    paidBy?: User;
    paidByGuestId?: string;
    paidByGuest?: { id: string; name: string };
    amount: number;
    description: string;
    participants?: ExpenseParticipant[];
    guestParticipants?: GuestParticipant[];
    createdAt: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.eventId = props.eventId;
    this.paidById = props.paidById;
    this.paidBy = props.paidBy;
    this.paidByGuestId = props.paidByGuestId;
    this.paidByGuest = props.paidByGuest;
    this.amount = props.amount;
    this.description = props.description;
    this.participants = props.participants;
    this.guestParticipants = props.guestParticipants;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  getAmountPerParticipant(): number {
    const userCount = this.participants?.length || 0;
    const guestCount = this.guestParticipants?.length || 0;
    const participantCount = userCount + guestCount || 1;
    return this.amount / participantCount;
  }

  getParticipantIds(): string[] {
    return this.participants?.map((p) => p.userId) || [];
  }

  getGuestParticipantIds(): string[] {
    return this.guestParticipants?.map((p) => p.guestMemberId) || [];
  }

  getPaidByName(): string {
    if (this.paidBy) return this.paidBy.name;
    if (this.paidByGuest) return this.paidByGuest.name;
    return 'Desconocido';
  }
}

