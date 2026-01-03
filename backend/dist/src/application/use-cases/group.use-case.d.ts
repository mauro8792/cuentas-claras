import { IGroupInputPort, CreateGroupDto } from '../ports/input/group.port';
import { IGroupRepositoryPort } from '../ports/output/group.repository.port';
import { Group } from '../../domain/entities/group.entity';
export declare class GroupUseCase implements IGroupInputPort {
    private readonly groupRepository;
    constructor(groupRepository: IGroupRepositoryPort);
    create(userId: string, dto: CreateGroupDto): Promise<Group>;
    findById(groupId: string, userId: string): Promise<Group>;
    findByInviteCode(inviteCode: string): Promise<Group>;
    findUserGroups(userId: string): Promise<Group[]>;
    joinByInviteCode(userId: string, inviteCode: string): Promise<Group>;
    leave(userId: string, groupId: string): Promise<void>;
    update(userId: string, groupId: string, dto: {
        name?: string;
    }): Promise<Group>;
    delete(userId: string, groupId: string): Promise<void>;
}
