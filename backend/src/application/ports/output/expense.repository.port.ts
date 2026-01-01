import { Expense } from '../../../domain/entities/expense.entity';
import { Debt } from '../../../domain/entities/debt.entity';

export interface IExpenseRepositoryPort {
  create(data: {
    eventId: string;
    paidById?: string;
    paidByGuestId?: string;
    amount: number;
    description: string;
    participantIds?: string[];
    guestParticipantIds?: string[];
  }): Promise<Expense>;
  findById(id: string): Promise<Expense | null>;
  findByEventId(eventId: string): Promise<Expense[]>;
  update(id: string, data: Partial<Expense> & { participantIds?: string[]; guestParticipantIds?: string[] }): Promise<Expense>;
  delete(id: string): Promise<void>;
  
  // Deudas
  createDebts(expenseId: string, debts: { fromUserId: string; toUserId: string; amount: number; eventId: string }[]): Promise<Debt[]>;
  findDebtById(id: string): Promise<Debt | null>;
  findDebtsByEventId(eventId: string): Promise<Debt[]>;
  findDebtsByUserId(userId: string): Promise<Debt[]>;
  updateDebt(id: string, data: Partial<Debt>): Promise<Debt>;
  deleteDebtsByExpenseId(expenseId: string): Promise<void>;
  
  // Deudas hacia invitados
  createGuestDebts(expenseId: string, debts: { fromUserId?: string; fromGuestId?: string; toGuestId: string; amount: number; eventId: string }[]): Promise<any[]>;
  createGuestDebtsToUser(expenseId: string, debts: { fromGuestId: string; toUserId: string; amount: number; eventId: string }[]): Promise<any[]>;
  findGuestDebtsByEventId(eventId: string): Promise<any[]>;
  findGuestDebtsByUserId(userId: string): Promise<any[]>;
  findGuestDebtById(id: string): Promise<any>;
  updateGuestDebt(id: string, data: { isPaid?: boolean; paidAt?: Date }): Promise<any>;
  markDebtsAsPaidBetween(fromId: string, toId: string, markedPaidById: string): Promise<void>;
  markGuestDebtsAsPaidBetween(fromId: string, toId: string): Promise<void>;
}

