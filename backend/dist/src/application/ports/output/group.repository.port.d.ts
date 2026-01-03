import { Group, GroupMember } from '../../../domain/entities/group.entity';
export interface IGroupRepositoryPort {
    create(data: {
        name: string;
        inviteCode: string;
        createdById: string;
    }): Promise<Group>;
    findById(id: string): Promise<Group | null>;
    findByInviteCode(inviteCode: string): Promise<Group | null>;
    findByUserId(userId: string): Promise<Group[]>;
    update(id: string, data: Partial<Group>): Promise<Group>;
    delete(id: string): Promise<void>;
    addMember(groupId: string, userId: string): Promise<GroupMember>;
    removeMember(groupId: string, userId: string): Promise<void>;
    isMember(groupId: string, userId: string): Promise<boolean>;
    findGuestMembers(groupId: string): Promise<{
        id: string;
        name: string;
    }[]>;
    getGroupCreatorId(groupId: string): Promise<string | null>;
}
