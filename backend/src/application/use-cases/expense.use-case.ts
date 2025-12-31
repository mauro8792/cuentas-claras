import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  IExpenseInputPort,
  CreateExpenseDto,
  UpdateExpenseDto,
} from '../ports/input/expense.port';
import { IExpenseRepositoryPort } from '../ports/output/expense.repository.port';
import { IEventRepositoryPort } from '../ports/output/event.repository.port';
import { IGroupRepositoryPort } from '../ports/output/group.repository.port';
import { Expense } from '../../domain/entities/expense.entity';
import { Debt, DebtSettlementCalculator, NetDebt } from '../../domain/entities/debt.entity';

@Injectable()
export class ExpenseUseCase implements IExpenseInputPort {
  constructor(
    private readonly expenseRepository: IExpenseRepositoryPort,
    private readonly eventRepository: IEventRepositoryPort,
    private readonly groupRepository: IGroupRepositoryPort,
  ) {}

  async create(userId: string, eventId: string, dto: CreateExpenseDto): Promise<Expense> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    if (event.isSettled) {
      throw new BadRequestException('No podés agregar gastos a un evento liquidado');
    }

    // Verificar que el usuario es miembro del grupo
    const isMember = await this.groupRepository.isMember(event.groupId, userId);
    if (!isMember) {
      throw new ForbiddenException('No sos miembro de este grupo');
    }

    // El agasajado no puede ver ni agregar gastos a su evento de regalo
    if (event.isHiddenFromUser(userId)) {
      throw new ForbiddenException('No podés agregar gastos a este evento');
    }

    // Determinar quién pagó: puede ser un usuario o un invitado
    // Si no se especifica paidById ni paidByGuestId, usa el usuario actual
    const paidById = dto.paidById || (!dto.paidByGuestId ? userId : undefined);
    const paidByGuestId = dto.paidByGuestId;

    // Si no se especifican participantes, usar todos los miembros del grupo
    let participantIds = dto.participantIds;
    let guestParticipantIds = dto.guestParticipantIds;

    if ((!participantIds || participantIds.length === 0) && (!guestParticipantIds || guestParticipantIds.length === 0)) {
      // Obtener todos los miembros del grupo
      const group = await this.groupRepository.findById(event.groupId);
      if (group && group.members) {
        participantIds = group.members.map(m => m.userId);
      }
      
      // Obtener todos los invitados del grupo
      const guestMembers = await this.groupRepository.findGuestMembers(event.groupId);
      if (guestMembers && guestMembers.length > 0) {
        guestParticipantIds = guestMembers.map(g => g.id);
      }
    }

    // Si es un evento de REGALO, excluir al agasajado de los participantes
    // (no va a pagar su propio regalo)
    if (event.isGiftEvent()) {
      if (event.giftRecipientId && participantIds) {
        participantIds = participantIds.filter(id => id !== event.giftRecipientId);
      }
      if (event.giftRecipientGuestId && guestParticipantIds) {
        guestParticipantIds = guestParticipantIds.filter(id => id !== event.giftRecipientGuestId);
      }
    }

    // Crear el gasto
    const expense = await this.expenseRepository.create({
      eventId,
      paidById,
      paidByGuestId,
      amount: dto.amount,
      description: dto.description,
      participantIds,
      guestParticipantIds,
    });

    // Calcular y crear las deudas
    if (paidById) {
      // Usuario pagó -> crear deudas normales hacia usuarios
      await this.createDebtsForExpense(expense, event.id);
      // También crear deudas de invitados hacia el usuario que pagó
      await this.createGuestDebtsToUser(expense, event.id, paidById);
    } else if (paidByGuestId) {
      // Invitado pagó -> crear deudas hacia el invitado
      await this.createGuestDebtsForExpense(expense, event.id, paidByGuestId);
    }

    return this.expenseRepository.findById(expense.id) as Promise<Expense>;
  }

  async findById(userId: string, expenseId: string): Promise<Expense> {
    const expense = await this.expenseRepository.findById(expenseId);
    if (!expense) {
      throw new NotFoundException('Gasto no encontrado');
    }

    const event = await this.eventRepository.findById(expense.eventId);
    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    // Verificar permisos
    const isMember = await this.groupRepository.isMember(event.groupId, userId);
    if (!isMember) {
      throw new ForbiddenException('No sos miembro de este grupo');
    }

    if (event.isHiddenFromUser(userId)) {
      throw new ForbiddenException('No podés ver este gasto');
    }

    return expense;
  }

  async findByEventId(userId: string, eventId: string): Promise<Expense[]> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    const isMember = await this.groupRepository.isMember(event.groupId, userId);
    if (!isMember) {
      throw new ForbiddenException('No sos miembro de este grupo');
    }

    if (event.isHiddenFromUser(userId)) {
      throw new ForbiddenException('No podés ver los gastos de este evento');
    }

    return this.expenseRepository.findByEventId(eventId);
  }

  async update(userId: string, expenseId: string, dto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.findById(userId, expenseId);
    const event = await this.eventRepository.findById(expense.eventId);

    if (!event || event.isSettled) {
      throw new BadRequestException('No podés modificar gastos de un evento liquidado');
    }

    // Solo quien pagó puede editar el gasto
    if (expense.paidById !== userId) {
      throw new ForbiddenException('Solo quien pagó puede editar el gasto');
    }

    // Eliminar deudas anteriores
    await this.expenseRepository.deleteDebtsByExpenseId(expenseId);

    // Actualizar gasto
    const updatedExpense = await this.expenseRepository.update(expenseId, dto);

    // Recalcular deudas
    await this.createDebtsForExpense(updatedExpense, event.id);

    return this.expenseRepository.findById(expenseId) as Promise<Expense>;
  }

  async delete(userId: string, expenseId: string): Promise<void> {
    const expense = await this.findById(userId, expenseId);
    const event = await this.eventRepository.findById(expense.eventId);

    if (!event || event.isSettled) {
      throw new BadRequestException('No podés eliminar gastos de un evento liquidado');
    }

    // Si pagó un usuario, solo ese usuario puede eliminar
    // Si pagó un invitado, cualquier miembro del grupo puede eliminar
    if (expense.paidById && expense.paidById !== userId) {
      throw new ForbiddenException('Solo quien pagó puede eliminar el gasto');
    }

    await this.expenseRepository.delete(expenseId);
  }

  // ==================== Deudas ====================

  async getEventDebts(userId: string, eventId: string): Promise<any[]> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    const isMember = await this.groupRepository.isMember(event.groupId, userId);
    if (!isMember) {
      throw new ForbiddenException('No sos miembro de este grupo');
    }

    if (event.isHiddenFromUser(userId)) {
      throw new ForbiddenException('No podés ver las deudas de este evento');
    }

    // Obtener deudas normales y hacia invitados
    const [normalDebts, guestDebts] = await Promise.all([
      this.expenseRepository.findDebtsByEventId(eventId),
      this.expenseRepository.findGuestDebtsByEventId(eventId),
    ]);

    // Unificar formato para el frontend
    const allDebts = [
      ...normalDebts.map(d => ({
        id: d.id,
        fromUser: d.fromUser,
        fromUserId: d.fromUserId,
        toUser: d.toUser,
        toUserId: d.toUserId,
        amount: d.amount,
        isPaid: d.isPaid,
        paidAt: d.paidAt,
        isGuestDebt: false,
      })),
      ...guestDebts.map((d: any) => ({
        id: d.id,
        fromUser: d.fromUser,
        fromUserId: d.fromUserId,
        fromGuest: d.fromGuest,
        fromGuestId: d.fromGuestId,
        toGuest: d.toGuest,
        toGuestId: d.toGuestId,
        toUser: d.toUser,
        toUserId: d.toUserId,
        amount: d.amount,
        isPaid: d.isPaid,
        paidAt: d.paidAt,
        isGuestDebt: true,
      })),
    ];

    return allDebts;
  }

  async getOptimalSettlement(userId: string, eventId: string): Promise<any[]> {
    const allDebts = await this.getEventDebts(userId, eventId);
    
    // Agrupar deudas por par de personas (simplificado)
    const debtMap = new Map<string, any>();
    
    for (const debt of allDebts) {
      if (debt.isPaid) continue;
      
      // Crear identificadores únicos para from y to
      const fromId = debt.fromUserId || debt.fromGuestId;
      const toId = debt.toUserId || debt.toGuestId;
      const fromName = debt.fromUser?.name || debt.fromGuest?.name || '?';
      const toName = debt.toUser?.name || debt.toGuest?.name || '?';
      const isFromGuest = !!debt.fromGuestId;
      const isToGuest = !!debt.toGuestId || (!!debt.toGuest);
      
      if (!fromId || !toId) continue;
      
      const key = `${fromId}->${toId}`;
      const reverseKey = `${toId}->${fromId}`;
      
      if (debtMap.has(reverseKey)) {
        // Hay deuda en sentido contrario, restar
        const existing = debtMap.get(reverseKey);
        existing.amount -= debt.amount;
        if (existing.amount < 0) {
          // La deuda se invierte
          debtMap.delete(reverseKey);
          debtMap.set(key, {
            fromUserId: fromId,
            fromUser: { name: fromName },
            fromGuestId: isFromGuest ? fromId : undefined,
            toUserId: toId,
            toUser: { name: toName },
            toGuestId: isToGuest ? toId : undefined,
            amount: Math.abs(existing.amount),
          });
        }
      } else if (debtMap.has(key)) {
        debtMap.get(key).amount += debt.amount;
      } else {
        debtMap.set(key, {
          fromUserId: fromId,
          fromUser: { name: fromName },
          fromGuestId: isFromGuest ? fromId : undefined,
          toUserId: toId,
          toUser: { name: toName },
          toGuestId: isToGuest ? toId : undefined,
          amount: debt.amount,
        });
      }
    }
    
    // Filtrar deudas con monto > 0 y redondear
    return Array.from(debtMap.values())
      .filter(d => d.amount > 0.01)
      .map((d, idx) => ({
        ...d,
        // Crear un ID único basado en from y to para poder marcar como pagado
        // Usar :: como delimitador para evitar confusión con underscores de CUIDs
        id: `settlement::${d.fromUserId}::${d.toUserId}`,
        amount: Math.round(d.amount * 100) / 100,
        isPaid: false,
      }));
  }

  async markDebtAsPaid(userId: string, debtId: string): Promise<any> {
    // Verificar si es un ID de settlement simplificado (formato: settlement::fromId::toId)
    if (debtId.startsWith('settlement::')) {
      const parts = debtId.split('::');
      if (parts.length === 3) {
        const fromId = parts[1];
        const toId = parts[2];
        
        // Marcar todas las deudas EN AMBAS DIRECCIONES como pagadas
        // (porque el settlement ya compensó las deudas cruzadas)
        
        // Dirección: from -> to
        await this.expenseRepository.markDebtsAsPaidBetween(fromId, toId, userId);
        await this.expenseRepository.markGuestDebtsAsPaidBetween(fromId, toId);
        
        // Dirección inversa: to -> from (también se considera pagada por compensación)
        await this.expenseRepository.markDebtsAsPaidBetween(toId, fromId, userId);
        await this.expenseRepository.markGuestDebtsAsPaidBetween(toId, fromId);
        
        return { success: true, message: 'Deudas marcadas como pagadas' };
      }
    }

    // Primero buscar en deudas normales
    const debt = await this.expenseRepository.findDebtById(debtId);
    if (debt) {
      // Solo el acreedor (a quien le deben) puede marcar como pagada
      if (debt.toUserId !== userId) {
        throw new ForbiddenException('Solo quien recibe el pago puede marcarlo como pagado');
      }

      return this.expenseRepository.updateDebt(debtId, {
        isPaid: true,
        paidAt: new Date(),
        markedPaidById: userId,
      });
    }

    // Si no está en deudas normales, buscar en deudas de invitados
    const guestDebt = await this.expenseRepository.findGuestDebtById(debtId);
    if (guestDebt) {
      // Si el acreedor es un usuario, solo ese usuario puede marcar como pagada
      if (guestDebt.toUserId && guestDebt.toUserId !== userId) {
        throw new ForbiddenException('Solo quien recibe el pago puede marcarlo como pagado');
      }
      
      // Si el acreedor es un invitado (toGuestId), solo el CREADOR del grupo puede marcar
      if (guestDebt.toGuestId) {
        const event = await this.eventRepository.findById(guestDebt.eventId);
        if (event) {
          const group = await this.groupRepository.findById(event.groupId);
          if (group && group.createdById !== userId) {
            throw new ForbiddenException('Solo el creador del grupo puede marcar pagos de invitados');
          }
        }
      }

      return this.expenseRepository.updateGuestDebt(debtId, {
        isPaid: true,
        paidAt: new Date(),
      });
    }

    throw new NotFoundException('Deuda no encontrada');
  }

  async getUserBalance(userId: string): Promise<{
    totalOwed: number;
    totalOwing: number;
    netBalance: number;
    debts: Debt[];
  }> {
    // Obtener deudas usuario-usuario Y deudas con invitados
    const [debts, guestDebts] = await Promise.all([
      this.expenseRepository.findDebtsByUserId(userId),
      this.expenseRepository.findGuestDebtsByUserId(userId),
    ]);

    let totalOwed = 0; // Lo que le deben
    let totalOwing = 0; // Lo que debe

    // Deudas entre usuarios
    for (const debt of debts) {
      if (debt.isPaid) continue;

      if (debt.toUserId === userId) {
        totalOwed += debt.amount;
      } else if (debt.fromUserId === userId) {
        totalOwing += debt.amount;
      }
    }

    // Deudas con invitados
    for (const gd of guestDebts) {
      if (gd.isPaid) continue;

      // Si un invitado me debe (toUserId = yo)
      if (gd.toUserId === userId) {
        totalOwed += gd.amount;
      }
      // Si yo le debo a un invitado (fromUserId = yo)
      if (gd.fromUserId === userId) {
        totalOwing += gd.amount;
      }
    }

    return {
      totalOwed: Math.round(totalOwed * 100) / 100,
      totalOwing: Math.round(totalOwing * 100) / 100,
      netBalance: Math.round((totalOwed - totalOwing) * 100) / 100,
      debts,
    };
  }

  // ==================== Helpers privados ====================

  private async createDebtsForExpense(expense: Expense, eventId: string): Promise<void> {
    // Solo crear deudas si pagó un usuario (no un invitado)
    if (!expense.paidById) return;

    const participantIds = expense.getParticipantIds();
    if (participantIds.length === 0) return;

    const amountPerPerson = expense.getAmountPerParticipant();
    const debtsToCreate: { fromUserId: string; toUserId: string; amount: number; eventId: string }[] = [];

    for (const participantId of participantIds) {
      // El que pagó no se debe a sí mismo
      if (participantId === expense.paidById) continue;

      debtsToCreate.push({
        fromUserId: participantId,
        toUserId: expense.paidById,
        amount: Math.round(amountPerPerson * 100) / 100,
        eventId,
      });
    }

    if (debtsToCreate.length > 0) {
      await this.expenseRepository.createDebts(expense.id, debtsToCreate);
    }
  }

  // Crear deudas de invitados hacia un usuario que pagó
  private async createGuestDebtsToUser(
    expense: Expense,
    eventId: string,
    paidByUserId: string
  ): Promise<void> {
    const guestParticipantIds = expense.getGuestParticipantIds();
    if (guestParticipantIds.length === 0) return;

    const totalParticipants = expense.getParticipantIds().length + guestParticipantIds.length;
    const amountPerPerson = expense.amount / totalParticipants;

    const debtsToCreate: {
      fromGuestId: string;
      toUserId: string;
      amount: number;
      eventId: string;
    }[] = [];

    for (const guestId of guestParticipantIds) {
      debtsToCreate.push({
        fromGuestId: guestId,
        toUserId: paidByUserId,
        amount: Math.round(amountPerPerson * 100) / 100,
        eventId,
      });
    }

    if (debtsToCreate.length > 0) {
      await this.expenseRepository.createGuestDebtsToUser(expense.id, debtsToCreate);
    }
  }

  // Crear deudas cuando un invitado paga
  private async createGuestDebtsForExpense(
    expense: Expense, 
    eventId: string, 
    paidByGuestId: string
  ): Promise<void> {
    const userParticipantIds = expense.getParticipantIds();
    const guestParticipantIds = expense.getGuestParticipantIds();
    
    const totalParticipants = userParticipantIds.length + guestParticipantIds.length;
    if (totalParticipants === 0) return;

    const amountPerPerson = expense.amount / totalParticipants;
    const debtsToCreate: { 
      fromUserId?: string;
      fromGuestId?: string;
      toGuestId: string;
      amount: number; 
      eventId: string 
    }[] = [];

    // Deudas de usuarios hacia el invitado
    for (const userId of userParticipantIds) {
      debtsToCreate.push({
        fromUserId: userId,
        toGuestId: paidByGuestId,
        amount: Math.round(amountPerPerson * 100) / 100,
        eventId,
      });
    }

    // Deudas de otros invitados hacia el invitado que pagó
    for (const guestId of guestParticipantIds) {
      // El que pagó no se debe a sí mismo
      if (guestId === paidByGuestId) continue;

      debtsToCreate.push({
        fromGuestId: guestId,
        toGuestId: paidByGuestId,
        amount: Math.round(amountPerPerson * 100) / 100,
        eventId,
      });
    }

    if (debtsToCreate.length > 0) {
      await this.expenseRepository.createGuestDebts(expense.id, debtsToCreate);
    }
  }
}

