import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  IEventInputPort,
  CreateEventDto,
  AddWishListItemDto,
} from '../ports/input/event.port';
import { IEventRepositoryPort } from '../ports/output/event.repository.port';
import { IGroupRepositoryPort } from '../ports/output/group.repository.port';
import { Event, EventType, WishListItem } from '../../domain/entities/event.entity';

@Injectable()
export class EventUseCase implements IEventInputPort {
  constructor(
    private readonly eventRepository: IEventRepositoryPort,
    private readonly groupRepository: IGroupRepositoryPort,
  ) {}

  async create(userId: string, groupId: string, dto: CreateEventDto): Promise<Event> {
    // Verificar que el usuario es miembro del grupo
    const isMember = await this.groupRepository.isMember(groupId, userId);
    if (!isMember) {
      throw new ForbiddenException('No sos miembro de este grupo');
    }

    // Si es un evento de regalo, verificar que hay un agasajado (usuario o invitado)
    if (dto.type === EventType.GIFT) {
      if (!dto.giftRecipientId && !dto.giftRecipientGuestId) {
        throw new BadRequestException('Debés seleccionar un agasajado para eventos de regalo');
      }
      
      // Si es un usuario, verificar que es miembro del grupo
      if (dto.giftRecipientId) {
        const isRecipientMember = await this.groupRepository.isMember(groupId, dto.giftRecipientId);
        if (!isRecipientMember) {
          throw new BadRequestException('El agasajado debe ser miembro del grupo');
        }
      }
      // Si es un invitado, no necesitamos verificar (ya está asociado al grupo)
    }

    return this.eventRepository.create({
      groupId,
      name: dto.name,
      type: dto.type,
      date: dto.date,
      giftRecipientId: dto.giftRecipientId,
      giftRecipientGuestId: dto.giftRecipientGuestId,
    });
  }

  async findById(userId: string, eventId: string): Promise<Event> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    // Verificar que el usuario es miembro del grupo
    const isMember = await this.groupRepository.isMember(event.groupId, userId);
    if (!isMember) {
      throw new ForbiddenException('No sos miembro de este grupo');
    }

    // Si es un evento de regalo y el usuario es el agasajado, no puede verlo
    if (event.isHiddenFromUser(userId)) {
      throw new ForbiddenException('No podés ver este evento (¡es sorpresa!)');
    }

    return event;
  }

  async findByGroupId(userId: string, groupId: string): Promise<Event[]> {
    // Verificar que el usuario es miembro del grupo
    const isMember = await this.groupRepository.isMember(groupId, userId);
    if (!isMember) {
      throw new ForbiddenException('No sos miembro de este grupo');
    }

    const events = await this.eventRepository.findByGroupId(groupId);

    // Filtrar eventos donde el usuario es el agasajado
    return events.filter((event) => !event.isHiddenFromUser(userId));
  }

  async settle(userId: string, eventId: string): Promise<Event> {
    const event = await this.findById(userId, eventId);

    if (event.isSettled) {
      throw new BadRequestException('Este evento ya fue liquidado');
    }

    return this.eventRepository.update(eventId, {
      isSettled: true,
      settledAt: new Date(),
    });
  }

  async update(userId: string, eventId: string, dto: { name?: string; date?: Date }): Promise<Event> {
    const event = await this.findById(userId, eventId);

    if (event.isSettled) {
      throw new BadRequestException('No podés editar un evento liquidado');
    }

    // Solo el creador del grupo puede editar eventos
    const groupCreatorId = await this.groupRepository.getGroupCreatorId(event.groupId);
    if (groupCreatorId !== userId) {
      throw new ForbiddenException('Solo el creador del grupo puede editar eventos');
    }

    return this.eventRepository.update(eventId, dto);
  }

  async delete(userId: string, eventId: string): Promise<void> {
    const event = await this.findById(userId, eventId);

    if (event.isSettled) {
      throw new BadRequestException('No podés eliminar un evento liquidado');
    }

    await this.eventRepository.delete(eventId);
  }

  // ==================== Lista de deseos ====================

  async addWishListItem(userId: string, eventId: string, dto: AddWishListItemDto): Promise<WishListItem> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    if (!event.isGiftEvent()) {
      throw new BadRequestException('Solo los eventos de regalo pueden tener lista de deseos');
    }

    // Solo el agasajado puede agregar items a su lista de deseos
    if (event.giftRecipientId !== userId) {
      throw new ForbiddenException('Solo el agasajado puede agregar items a la lista de deseos');
    }

    return this.eventRepository.addWishListItem(eventId, {
      description: dto.description,
      url: dto.url,
    });
  }

  async markWishListItemPurchased(userId: string, itemId: string): Promise<WishListItem> {
    const item = await this.eventRepository.findWishListItemById(itemId);
    if (!item) {
      throw new NotFoundException('Item no encontrado');
    }

    const event = await this.eventRepository.findById(item.eventId);
    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    // El agasajado no puede marcar items como comprados
    if (event.giftRecipientId === userId) {
      throw new ForbiddenException('El agasajado no puede marcar items como comprados');
    }

    // Verificar que el usuario es miembro del grupo
    const isMember = await this.groupRepository.isMember(event.groupId, userId);
    if (!isMember) {
      throw new ForbiddenException('No sos miembro de este grupo');
    }

    return this.eventRepository.updateWishListItem(itemId, {
      isPurchased: true,
      purchasedById: userId,
    });
  }

  async removeWishListItem(userId: string, itemId: string): Promise<void> {
    const item = await this.eventRepository.findWishListItemById(itemId);
    if (!item) {
      throw new NotFoundException('Item no encontrado');
    }

    const event = await this.eventRepository.findById(item.eventId);
    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    // Solo el agasajado puede eliminar items de su lista
    if (event.giftRecipientId !== userId) {
      throw new ForbiddenException('Solo el agasajado puede eliminar items de la lista de deseos');
    }

    await this.eventRepository.removeWishListItem(itemId);
  }
}

