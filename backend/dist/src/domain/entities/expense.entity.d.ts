import { User } from './user.entity';
export declare class ExpenseParticipant {
    readonly id: string;
    readonly expenseId: string;
    readonly userId: string;
    readonly user?: User;
    constructor(props: {
        id: string;
        expenseId: string;
        userId: string;
        user?: User;
    });
}
export interface GuestParticipant {
    id: string;
    guestMemberId: string;
    guestMember?: {
        id: string;
        name: string;
    };
}
export declare class Expense {
    readonly id: string;
    readonly eventId: string;
    readonly paidById?: string;
    readonly paidBy?: User;
    readonly paidByGuestId?: string;
    readonly paidByGuest?: {
        id: string;
        name: string;
    };
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
        paidByGuest?: {
            id: string;
            name: string;
        };
        amount: number;
        description: string;
        participants?: ExpenseParticipant[];
        guestParticipants?: GuestParticipant[];
        createdAt: Date;
        updatedAt?: Date;
    });
    getAmountPerParticipant(): number;
    getParticipantIds(): string[];
    getGuestParticipantIds(): string[];
    getPaidByName(): string;
}
