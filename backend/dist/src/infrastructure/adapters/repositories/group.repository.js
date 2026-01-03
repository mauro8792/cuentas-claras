"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../persistence/prisma.service");
const group_entity_1 = require("../../../domain/entities/group.entity");
const user_entity_1 = require("../../../domain/entities/user.entity");
let GroupRepository = class GroupRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const group = await this.prisma.group.create({
            data,
            include: {
                createdBy: true,
                members: { include: { user: true } },
            },
        });
        return this.toEntity(group);
    }
    async findById(id) {
        const group = await this.prisma.group.findUnique({
            where: { id },
            include: {
                createdBy: true,
                members: { include: { user: true } },
            },
        });
        return group ? this.toEntity(group) : null;
    }
    async findByInviteCode(inviteCode) {
        const group = await this.prisma.group.findUnique({
            where: { inviteCode },
            include: {
                createdBy: true,
                members: { include: { user: true } },
            },
        });
        return group ? this.toEntity(group) : null;
    }
    async findByUserId(userId) {
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
    async update(id, data) {
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
    async delete(id) {
        await this.prisma.group.delete({ where: { id } });
    }
    async addMember(groupId, userId) {
        const member = await this.prisma.groupMember.create({
            data: { groupId, userId },
            include: { user: true },
        });
        return this.toMemberEntity(member);
    }
    async removeMember(groupId, userId) {
        await this.prisma.groupMember.deleteMany({
            where: { groupId, userId },
        });
    }
    async isMember(groupId, userId) {
        const member = await this.prisma.groupMember.findUnique({
            where: { userId_groupId: { userId, groupId } },
        });
        return !!member;
    }
    async findGuestMembers(groupId) {
        const guests = await this.prisma.guestMember.findMany({
            where: { groupId },
            select: { id: true, name: true },
        });
        return guests;
    }
    async getGroupCreatorId(groupId) {
        const group = await this.prisma.group.findUnique({
            where: { id: groupId },
            select: { createdById: true },
        });
        return group?.createdById || null;
    }
    toEntity(data) {
        return new group_entity_1.Group({
            id: data.id,
            name: data.name,
            inviteCode: data.inviteCode,
            createdById: data.createdById,
            createdBy: data.createdBy ? this.toUserEntity(data.createdBy) : undefined,
            members: data.members?.map((m) => this.toMemberEntity(m)),
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });
    }
    toMemberEntity(data) {
        return new group_entity_1.GroupMember({
            id: data.id,
            userId: data.userId,
            user: data.user ? this.toUserEntity(data.user) : undefined,
            groupId: data.groupId,
            joinedAt: data.joinedAt,
        });
    }
    toUserEntity(data) {
        return new user_entity_1.User({
            id: data.id,
            email: data.email,
            password: data.password,
            name: data.name,
            avatar: data.avatar,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });
    }
};
exports.GroupRepository = GroupRepository;
exports.GroupRepository = GroupRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GroupRepository);
//# sourceMappingURL=group.repository.js.map