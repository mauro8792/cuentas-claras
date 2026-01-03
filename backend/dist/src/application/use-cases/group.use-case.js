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
exports.GroupUseCase = void 0;
const common_1 = require("@nestjs/common");
const nanoid_1 = require("nanoid");
let GroupUseCase = class GroupUseCase {
    constructor(groupRepository) {
        this.groupRepository = groupRepository;
    }
    async create(userId, dto) {
        const inviteCode = (0, nanoid_1.nanoid)(10);
        const group = await this.groupRepository.create({
            name: dto.name,
            inviteCode,
            createdById: userId,
        });
        await this.groupRepository.addMember(group.id, userId);
        return this.groupRepository.findById(group.id);
    }
    async findById(groupId, userId) {
        const group = await this.groupRepository.findById(groupId);
        if (!group) {
            throw new common_1.NotFoundException('Grupo no encontrado');
        }
        const isMember = await this.groupRepository.isMember(groupId, userId);
        if (!isMember) {
            throw new common_1.ForbiddenException('No sos miembro de este grupo');
        }
        return group;
    }
    async findByInviteCode(inviteCode) {
        const group = await this.groupRepository.findByInviteCode(inviteCode);
        if (!group) {
            throw new common_1.NotFoundException('Código de invitación inválido');
        }
        return group;
    }
    async findUserGroups(userId) {
        return this.groupRepository.findByUserId(userId);
    }
    async joinByInviteCode(userId, inviteCode) {
        const group = await this.groupRepository.findByInviteCode(inviteCode);
        if (!group) {
            throw new common_1.NotFoundException('Código de invitación inválido');
        }
        const isMember = await this.groupRepository.isMember(group.id, userId);
        if (isMember) {
            throw new common_1.ConflictException('Ya sos miembro de este grupo');
        }
        await this.groupRepository.addMember(group.id, userId);
        return this.groupRepository.findById(group.id);
    }
    async leave(userId, groupId) {
        const group = await this.groupRepository.findById(groupId);
        if (!group) {
            throw new common_1.NotFoundException('Grupo no encontrado');
        }
        const isMember = await this.groupRepository.isMember(groupId, userId);
        if (!isMember) {
            throw new common_1.ForbiddenException('No sos miembro de este grupo');
        }
        if (group.createdById === userId) {
            throw new common_1.ForbiddenException('El creador no puede abandonar el grupo. Eliminá el grupo en su lugar.');
        }
        await this.groupRepository.removeMember(groupId, userId);
    }
    async update(userId, groupId, dto) {
        const group = await this.groupRepository.findById(groupId);
        if (!group) {
            throw new common_1.NotFoundException('Grupo no encontrado');
        }
        if (group.createdById !== userId) {
            throw new common_1.ForbiddenException('Solo el creador puede editar el grupo');
        }
        return this.groupRepository.update(groupId, dto);
    }
    async delete(userId, groupId) {
        const group = await this.groupRepository.findById(groupId);
        if (!group) {
            throw new common_1.NotFoundException('Grupo no encontrado');
        }
        if (group.createdById !== userId) {
            throw new common_1.ForbiddenException('Solo el creador puede eliminar el grupo');
        }
        await this.groupRepository.delete(groupId);
    }
};
exports.GroupUseCase = GroupUseCase;
exports.GroupUseCase = GroupUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], GroupUseCase);
//# sourceMappingURL=group.use-case.js.map