import { IExpenseInputPort, CreateExpenseDto, UpdateExpenseDto } from '../ports/input/expense.port';
import { IExpenseRepositoryPort } from '../ports/output/expense.repository.port';
import { IEventRepositoryPort } from '../ports/output/event.repository.port';
import { IGroupRepositoryPort } from '../ports/output/group.repository.port';
import { Expense } from '../../domain/entities/expense.entity';
import { Debt } from '../../domain/entities/debt.entity';
export declare class ExpenseUseCase implements IExpenseInputPort {
    private readonly expenseRepository;
    private readonly eventRepository;
    private readonly groupRepository;
    constructor(expenseRepository: IExpenseRepositoryPort, eventRepository: IEventRepositoryPort, groupRepository: IGroupRepositoryPort);
    create(userId: string, eventId: string, dto: CreateExpenseDto): Promise<Expense>;
    findById(userId: string, expenseId: string): Promise<Expense>;
    findByEventId(userId: string, eventId: string): Promise<Expense[]>;
    update(userId: string, expenseId: string, dto: UpdateExpenseDto): Promise<Expense>;
    delete(userId: string, expenseId: string): Promise<void>;
    getEventDebts(userId: string, eventId: string): Promise<any[]>;
    getOptimalSettlement(userId: string, eventId: string): Promise<any[]>;
    markDebtAsPaid(userId: string, debtId: string): Promise<any>;
    getUserBalance(userId: string): Promise<{
        totalOwed: number;
        totalOwing: number;
        netBalance: number;
        debts: Debt[];
    }>;
    private createDebtsForExpense;
    private createGuestDebtsToUser;
    private createGuestDebtsForExpense;
    recalculateDebtsForNewMember(groupId: string, newMemberId: string, isGuest?: boolean): Promise<void>;
    recalculateDebtsOnMemberLeave(groupId: string, memberId: string, isGuest: boolean): Promise<void>;
}
