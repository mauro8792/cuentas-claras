import { GroupUseCase } from '../../application/use-cases/group.use-case';
import { ExpenseUseCase } from '../../application/use-cases/expense.use-case';
import { EventsGateway } from '../gateways/events.gateway';
export declare class CreateGroupDto {
    name: string;
}
export declare class UpdateGroupDto {
    name?: string;
}
export declare class JoinGroupDto {
    inviteCode: string;
}
export declare class GroupController {
    private readonly groupUseCase;
    private readonly expenseUseCase;
    private readonly eventsGateway;
    constructor(groupUseCase: GroupUseCase, expenseUseCase: ExpenseUseCase, eventsGateway: EventsGateway);
    create(req: any, dto: CreateGroupDto): Promise<import("../../domain/entities/group.entity").Group>;
    findMyGroups(req: any): Promise<import("../../domain/entities/group.entity").Group[]>;
    findById(req: any, id: string): Promise<import("../../domain/entities/group.entity").Group>;
    update(req: any, id: string, dto: UpdateGroupDto): Promise<import("../../domain/entities/group.entity").Group>;
    join(req: any, dto: JoinGroupDto): Promise<import("../../domain/entities/group.entity").Group>;
    findByInviteCode(code: string): Promise<import("../../domain/entities/group.entity").Group>;
    leave(req: any, id: string): Promise<void>;
    delete(req: any, id: string): Promise<void>;
}
