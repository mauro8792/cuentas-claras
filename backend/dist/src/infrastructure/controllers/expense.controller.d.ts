import { ExpenseUseCase } from '../../application/use-cases/expense.use-case';
import { EventsGateway } from '../gateways/events.gateway';
import { NotificationService } from '../services/notification.service';
import { PrismaService } from '../persistence/prisma.service';
export declare class CreateExpenseDto {
    amount: number;
    description: string;
    paidById?: string;
    paidByGuestId?: string;
    participantIds?: string[];
    guestParticipantIds?: string[];
}
export declare class UpdateExpenseDto {
    amount?: number;
    description?: string;
    participantIds?: string[];
    guestParticipantIds?: string[];
}
export declare class ExpenseController {
    private readonly expenseUseCase;
    private readonly eventsGateway;
    private readonly notificationService;
    private readonly prisma;
    constructor(expenseUseCase: ExpenseUseCase, eventsGateway: EventsGateway, notificationService: NotificationService, prisma: PrismaService);
    create(req: any, eventId: string, dto: CreateExpenseDto): Promise<import("../../domain/entities/expense.entity").Expense>;
    findByEvent(req: any, eventId: string): Promise<import("../../domain/entities/expense.entity").Expense[]>;
    findById(req: any, id: string): Promise<import("../../domain/entities/expense.entity").Expense>;
    update(req: any, id: string, dto: UpdateExpenseDto): Promise<import("../../domain/entities/expense.entity").Expense>;
    delete(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getEventDebts(req: any, eventId: string): Promise<any[]>;
    getSettlement(req: any, eventId: string): Promise<any[]>;
    markPaid(req: any, debtId: string, body: {
        eventId?: string;
    }): Promise<any>;
    getMyBalance(req: any): Promise<{
        totalOwed: number;
        totalOwing: number;
        netBalance: number;
        debts: import("../../domain/entities/debt.entity").Debt[];
    }>;
}
