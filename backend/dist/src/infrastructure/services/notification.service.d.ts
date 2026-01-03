import { PrismaService } from '../persistence/prisma.service';
export declare class NotificationService {
    private readonly prisma;
    private readonly logger;
    private initialized;
    constructor(prisma: PrismaService);
    private initializeFirebase;
    saveToken(userId: string, token: string, device?: string): Promise<void>;
    removeToken(token: string): Promise<void>;
    sendToUser(userId: string, title: string, body: string, data?: Record<string, string>): Promise<void>;
    sendToUsers(userIds: string[], title: string, body: string, data?: Record<string, string>): Promise<void>;
    sendToGroup(groupId: string, title: string, body: string, data?: Record<string, string>, excludeUserId?: string): Promise<void>;
    private sendToTokens;
    notifyNewExpense(groupId: string, expenseDescription: string, amount: number, paidByName: string, creatorId: string, eventId: string): Promise<void>;
    notifyDebtPaid(creditorId: string, debtorName: string, amount: number, eventId: string): Promise<void>;
    notifyEventSettled(groupId: string, eventName: string, eventId: string): Promise<void>;
    notifyAddedToGroup(userId: string, groupName: string, groupId: string): Promise<void>;
    notifyDebtReminder(debtorId: string, creditorName: string, amount: number, eventId: string): Promise<void>;
}
