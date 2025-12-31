import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma.service';
import { IGroupRepositoryPort } from '../../../application/ports/output/group.repository.port';
import { Group, GroupMember } from '../../../domain/entities/group.entity';
import { User } from '../../../domain/entities/user.entity';

@Injectable()
export class GroupRepository implements IGroupRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; inviteCode: string; createdById: string }): Promise<Group> {
    const group = await this.prisma.group.create({
      data,
      include: {
        createdBy: true,
        members: { include: { user: true } },
      },
    });
    return this.toEntity(group);
  }

  async findById(id: string): Promise<Group | null> {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        createdBy: true,
        members: { include: { user: true } },
      },
    });
    return group ? this.toEntity(group) : null;
  }

  async findByInviteCode(inviteCode: string): Promise<Group | null> {
    const group = await this.prisma.group.findUnique({
      where: { inviteCode },
      include: {
        createdBy: true,
        members: { include: { user: true } },
      },
    });
    return group ? this.toEntity(group) : null;
  }

  async findByUserId(userId: string): Promise<Group[]> {
    const groups = await this.prisma.group.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        createdBy: true,
        members: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return groups.map((g) => this.toEntity(g));
  }

  async update(id: string, data: Partial<Group>): Promise<Group> {
    const group = await this.prisma.group.update({
      where: { id },
      data: { name: data.name },
      include: {
        createdBy: true,
        members: { include: { user: true } },
      },
    });
    return this.toEntity(group);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.group.delete({ where: { id } });
  }

  async addMember(groupId: string, userId: string): Promise<GroupMember> {
    const member = await this.prisma.groupMember.create({
      data: { groupId, userId },
      include: { user: true },
    });
    return this.toMemberEntity(member);
  }

  async removeMember(groupId: string, userId: string): Promise<void> {
    await this.prisma.groupMember.deleteMany({
      where: { groupId, userId },
    });
  }

  async isMember(groupId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });
    return !!member;
  }

  async findGuestMembers(groupId: string): Promise<{ id: string; name: string }[]> {
    const guests = await this.prisma.guestMember.findMany({
      where: { groupId },
      select: { id: true, name: true },
    });
    return guests;
  }

  private toEntity(data: any): Group {
    return new Group({
      id: data.id,
      name: data.name,
      inviteCode: data.inviteCode,
      createdById: data.createdById,
      createdBy: data.createdBy ? this.toUserEntity(data.createdBy) : undefined,
      members: data.members?.map((m: any) => this.toMemberEntity(m)),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  private toMemberEntity(data: any): GroupMember {
    return new GroupMember({
      id: data.id,
      userId: data.userId,
      user: data.user ? this.toUserEntity(data.user) : undefined,
      groupId: data.groupId,
      joinedAt: data.joinedAt,
    });
  }

  private toUserEntity(data: any): User {
    return new User({
      id: data.id,
      email: data.email,
      password: data.password,
      name: data.name,
      avatar: data.avatar,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}

