import { PrismaService } from '../persistence/prisma.service';
import { ExpenseUseCase } from '../../application/use-cases/expense.use-case';
import { EventsGateway } from '../gateways/events.gateway';
export declare class CreateGuestDto {
    name: string;
}
export declare class GuestController {
    private readonly prisma;
    private readonly expenseUseCase;
    private readonly eventsGateway;
    constructor(prisma: PrismaService, expenseUseCase: ExpenseUseCase, eventsGateway: EventsGateway);
    create(req: any, groupId: string, dto: CreateGuestDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        groupId: string;
        addedById: string;
    }>;
    findAll(req: any, groupId: string): Promise<({
        addedBy: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        groupId: string;
        addedById: string;
    })[]>;
    delete(req: any, groupId: string, guestId: string): Promise<{
        success: boolean;
    }>;
}
