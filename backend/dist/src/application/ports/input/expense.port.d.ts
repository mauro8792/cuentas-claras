import { Expense } from '../../../domain/entities/expense.entity';
import { Debt, NetDebt } from '../../../domain/entities/debt.entity';
export interface CreateExpenseDto {
    amount: number;
    description: string;
    paidById?: string;
    paidByGuestId?: string;
    participantIds?: string[];
    guestParticipantIds?: string[];
}
export interface UpdateExpenseDto {
    amount?: number;
    description?: string;
    participantIds?: string[];
}
export interface IExpenseInputPort {
    create(userId: string, eventId: string, dto: CreateExpenseDto): Promise<Expense>;
    findById(userId: string, expenseId: string): Promise<Expense>;
    findByEventId(userId: string, eventId: string): Promise<Expense[]>;
    update(userId: string, expenseId: string, dto: UpdateExpenseDto): Promise<Expense>;
    delete(userId: string, expenseId: string): Promise<void>;
    getEventDebts(userId: string, eventId: string): Promise<Debt[]>;
    getOptimalSettlement(userId: string, eventId: string): Promise<NetDebt[]>;
    markDebtAsPaid(userId: string, debtId: string): Promise<Debt>;
    getUserBalance(userId: string): Promise<{
        totalOwed: number;
        totalOwing: number;
        netBalance: number;
        debts: Debt[];
    }>;
}
