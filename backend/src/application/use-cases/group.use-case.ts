import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { nanoid } from 'nanoid';
import { IGroupInputPort, CreateGroupDto } from '../ports/input/group.port';
import { IGroupRepositoryPort } from '../ports/output/group.repository.port';
import { Group } from '../../domain/entities/group.entity';

@Injectable()
export class GroupUseCase implements IGroupInputPort {
  constructor(private readonly groupRepository: IGroupRepositoryPort) {}

  async create(userId: string, dto: CreateGroupDto): Promise<Group> {
    // Generar código de invitación único
    const inviteCode = nanoid(10);

    // Crear grupo
    const group = await this.groupRepository.create({
      name: dto.name,
      inviteCode,
      createdById: userId,
    });

    // Agregar al creador como miembro
    await this.groupRepository.addMember(group.id, userId);

    // Retornar grupo con el miembro
    return this.groupRepository.findById(group.id) as Promise<Group>;
  }

  async findById(groupId: string, userId: string): Promise<Group> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new NotFoundException('Grupo no encontrado');
    }

    // Verificar que el usuario es miembro
    const isMember = await this.groupRepository.isMember(groupId, userId);
    if (!isMember) {
      throw new ForbiddenException('No sos miembro de este grupo');
    }

    return group;
  }

  async findByInviteCode(inviteCode: string): Promise<Group> {
    const group = await this.groupRepository.findByInviteCode(inviteCode);
    if (!group) {
      throw new NotFoundException('Código de invitación inválido');
    }
    return group;
  }

  async findUserGroups(userId: string): Promise<Group[]> {
    return this.groupRepository.findByUserId(userId);
  }

  async joinByInviteCode(userId: string, inviteCode: string): Promise<Group> {
    const group = await this.groupRepository.findByInviteCode(inviteCode);
    if (!group) {
      throw new NotFoundException('Código de invitación inválido');
    }

    // Verificar si ya es miembro
    const isMember = await this.groupRepository.isMember(group.id, userId);
    if (isMember) {
      throw new ConflictException('Ya sos miembro de este grupo');
    }

    // Agregar como miembro
    await this.groupRepository.addMember(group.id, userId);

    return this.groupRepository.findById(group.id) as Promise<Group>;
  }

  async leave(userId: string, groupId: string): Promise<void> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new NotFoundException('Grupo no encontrado');
    }

    const isMember = await this.groupRepository.isMember(groupId, userId);
    if (!isMember) {
      throw new ForbiddenException('No sos miembro de este grupo');
    }

    // No permitir que el creador abandone el grupo
    if (group.createdById === userId) {
      throw new ForbiddenException('El creador no puede abandonar el grupo. Eliminá el grupo en su lugar.');
    }

    await this.groupRepository.removeMember(groupId, userId);
  }

  async update(userId: string, groupId: string, dto: { name?: string }): Promise<Group> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new NotFoundException('Grupo no encontrado');
    }

    // Solo el creador puede editar el grupo
    if (group.createdById !== userId) {
      throw new ForbiddenException('Solo el creador puede editar el grupo');
    }

    return this.groupRepository.update(groupId, dto);
  }

  async delete(userId: string, groupId: string): Promise<void> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new NotFoundException('Grupo no encontrado');
    }

    // Solo el creador puede eliminar el grupo
    if (group.createdById !== userId) {
      throw new ForbiddenException('Solo el creador puede eliminar el grupo');
    }

    await this.groupRepository.delete(groupId);
  }
}

