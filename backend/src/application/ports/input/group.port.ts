import { Group } from '../../../domain/entities/group.entity';

export interface CreateGroupDto {
  name: string;
}

export interface IGroupInputPort {
  create(userId: string, dto: CreateGroupDto): Promise<Group>;
  findById(groupId: string, userId: string): Promise<Group>;
  findByInviteCode(inviteCode: string): Promise<Group>;
  findUserGroups(userId: string): Promise<Group[]>;
  joinByInviteCode(userId: string, inviteCode: string): Promise<Group>;
  leave(userId: string, groupId: string): Promise<void>;
  delete(userId: string, groupId: string): Promise<void>;
}

