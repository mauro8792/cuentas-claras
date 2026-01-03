import { User } from './user.entity';
export declare class Debt {
    readonly id: string;
    readonly eventId: string;
    readonly expenseId: string;
    readonly fromUserId: string;
    readonly fromUser?: User;
    readonly toUserId: string;
    readonly toUser?: User;
    readonly amount: number;
    readonly isPaid: boolean;
    readonly paidAt?: Date;
    readonly markedPaidById?: string;
    readonly markedPaidBy?: User;
    readonly createdAt: Date;
    readonly updatedAt?: Date;
    constructor(props: {
        id: string;
        eventId: string;
        expenseId: string;
        fromUserId: string;
        fromUser?: User;
        toUserId: string;
        toUser?: User;
        amount: number;
        isPaid: boolean;
        paidAt?: Date;
        markedPaidById?: string;
        markedPaidBy?: User;
        createdAt: Date;
        updatedAt?: Date;
    });
}
export declare class NetDebt {
    readonly fromUserId: string;
    readonly toUserId: string;
    readonly amount: number;
    constructor(fromUserId: string, toUserId: string, amount: number);
}
export declare class DebtSettlementCalculator {
    static calculateOptimalSettlement(debts: Debt[]): NetDebt[];
}
