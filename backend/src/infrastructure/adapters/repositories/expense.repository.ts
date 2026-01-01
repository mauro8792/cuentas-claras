import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma.service';
import { IExpenseRepositoryPort } from '../../../application/ports/output/expense.repository.port';
import { Expense, ExpenseParticipant } from '../../../domain/entities/expense.entity';
import { Debt } from '../../../domain/entities/debt.entity';
import { User } from '../../../domain/entities/user.entity';

@Injectable()
export class ExpenseRepository implements IExpenseRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    eventId: string;
    paidById?: string;
    paidByGuestId?: string;
    amount: number;
    description: string;
    participantIds?: string[];
    guestParticipantIds?: string[];
  }): Promise<Expense> {
    const expense = await this.prisma.expense.create({
      data: {
        eventId: data.eventId,
        paidById: data.paidById,
        paidByGuestId: data.paidByGuestId,
        amount: data.amount,
        description: data.description,
        participants: data.participantIds?.length ? {
          create: data.participantIds.map((userId) => ({ userId })),
        } : undefined,
        guestParticipants: data.guestParticipantIds?.length ? {
          create: data.guestParticipantIds.map((guestMemberId) => ({ guestMemberId })),
        } : undefined,
      },
      include: {
        paidBy: true,
        paidByGuest: true,
        participants: { include: { user: true } },
        guestParticipants: { include: { guestMember: true } },
      },
    });
    return this.toEntity(expense);
  }

  async findById(id: string): Promise<Expense | null> {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: {
        paidBy: true,
        paidByGuest: true,
        participants: { include: { user: true } },
        guestParticipants: { include: { guestMember: true } },
      },
    });
    return expense ? this.toEntity(expense) : null;
  }

  async findByEventId(eventId: string): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: { eventId },
      include: {
        paidBy: true,
        paidByGuest: true,
        participants: { include: { user: true } },
        guestParticipants: { include: { guestMember: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return expenses.map((e) => this.toEntity(e));
  }

  async update(id: string, data: Partial<Expense> & { participantIds?: string[]; guestParticipantIds?: string[] }): Promise<Expense> {
    // Si hay participantIds o guestParticipantIds, actualizamos los participantes
    if (data.participantIds !== undefined || data.guestParticipantIds !== undefined) {
      // Eliminar todos los participantes actuales (usuarios e invitados)
      await this.prisma.expenseParticipant.deleteMany({
        where: { expenseId: id },
      });
      await this.prisma.guestExpenseParticipant.deleteMany({
        where: { expenseId: id },
      });
      
      // Crear participantes usuarios
      if (data.participantIds && data.participantIds.length > 0) {
        await this.prisma.expenseParticipant.createMany({
          data: data.participantIds.map((userId) => ({ expenseId: id, userId })),
        });
      }
      
      // Crear participantes invitados
      if (data.guestParticipantIds && data.guestParticipantIds.length > 0) {
        await this.prisma.guestExpenseParticipant.createMany({
          data: data.guestParticipantIds.map((guestMemberId) => ({ expenseId: id, guestMemberId })),
        });
      }
    }

    const expense = await this.prisma.expense.update({
      where: { id },
      data: {
        amount: data.amount,
        description: data.description,
      },
      include: {
        paidBy: true,
        paidByGuest: true,
        participants: { include: { user: true } },
        guestParticipants: { include: { guestMember: true } },
      },
    });
    return this.toEntity(expense);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.expense.delete({ where: { id } });
  }

  // Deudas
  async createDebts(
    expenseId: string,
    debts: { fromUserId: string; toUserId: string; amount: number; eventId: string }[],
  ): Promise<Debt[]> {
    const createdDebts = await this.prisma.$transaction(
      debts.map((debt) =>
        this.prisma.debt.create({
          data: {
            expenseId,
            eventId: debt.eventId,
            fromUserId: debt.fromUserId,
            toUserId: debt.toUserId,
            amount: debt.amount,
          },
          include: {
            fromUser: true,
            toUser: true,
            markedPaidBy: true,
          },
        }),
      ),
    );
    return createdDebts.map((d) => this.toDebtEntity(d));
  }

  async findDebtById(id: string): Promise<Debt | null> {
    const debt = await this.prisma.debt.findUnique({
      where: { id },
      include: {
        fromUser: true,
        toUser: true,
        markedPaidBy: true,
      },
    });
    return debt ? this.toDebtEntity(debt) : null;
  }

  async findDebtsByEventId(eventId: string): Promise<Debt[]> {
    const debts = await this.prisma.debt.findMany({
      where: { eventId },
      include: {
        fromUser: true,
        toUser: true,
        markedPaidBy: true,
      },
    });
    return debts.map((d) => this.toDebtEntity(d));
  }

  async findDebtsByUserId(userId: string): Promise<Debt[]> {
    const debts = await this.prisma.debt.findMany({
      where: {
        OR: [{ fromUserId: userId }, { toUserId: userId }],
      },
      include: {
        fromUser: true,
        toUser: true,
        markedPaidBy: true,
      },
    });
    return debts.map((d) => this.toDebtEntity(d));
  }

  async updateDebt(id: string, data: Partial<Debt>): Promise<Debt> {
    const debt = await this.prisma.debt.update({
      where: { id },
      data: {
        isPaid: data.isPaid,
        paidAt: data.paidAt,
        markedPaidById: data.markedPaidById,
      },
      include: {
        fromUser: true,
        toUser: true,
        markedPaidBy: true,
      },
    });
    return this.toDebtEntity(debt);
  }

  async deleteDebtsByExpenseId(expenseId: string): Promise<void> {
    await this.prisma.debt.deleteMany({ where: { expenseId } });
    await this.prisma.guestDebt.deleteMany({ where: { expenseId } });
  }

  // Deudas hacia invitados (cuando un invitado paga)
  async createGuestDebts(
    expenseId: string,
    debts: { 
      fromUserId?: string;
      fromGuestId?: string;
      toGuestId: string;
      amount: number; 
      eventId: string 
    }[],
  ): Promise<any[]> {
    const createdDebts = await this.prisma.$transaction(
      debts.map((debt) =>
        this.prisma.guestDebt.create({
          data: {
            expenseId,
            eventId: debt.eventId,
            fromUserId: debt.fromUserId,
            fromGuestId: debt.fromGuestId,
            toGuestId: debt.toGuestId,
            amount: debt.amount,
          },
          include: {
            fromUser: true,
            fromGuest: true,
            toGuest: true,
          },
        }),
      ),
    );
    return createdDebts;
  }

  async findGuestDebtsByEventId(eventId: string): Promise<any[]> {
    return this.prisma.guestDebt.findMany({
      where: { eventId },
      include: {
        fromUser: true,
        fromGuest: true,
        toGuest: true,
        toUser: true,
      },
    });
  }

  async findGuestDebtsByUserId(userId: string): Promise<any[]> {
    return this.prisma.guestDebt.findMany({
      where: {
        OR: [
          { fromUserId: userId }, // Yo le debo a un invitado
          { toUserId: userId },   // Un invitado me debe
        ],
      },
      include: {
        fromUser: true,
        fromGuest: true,
        toGuest: true,
        toUser: true,
      },
    });
  }

  async findGuestDebtById(id: string): Promise<any> {
    return this.prisma.guestDebt.findUnique({
      where: { id },
      include: {
        fromUser: true,
        fromGuest: true,
        toGuest: true,
        toUser: true,
      },
    });
  }

  async updateGuestDebt(id: string, data: { isPaid?: boolean; paidAt?: Date }): Promise<any> {
    return this.prisma.guestDebt.update({
      where: { id },
      data,
      include: {
        fromUser: true,
        fromGuest: true,
        toGuest: true,
        toUser: true,
      },
    });
  }

  // Marcar todas las deudas normales entre dos personas como pagadas
  async markDebtsAsPaidBetween(fromId: string, toId: string, markedPaidById: string): Promise<void> {
    await this.prisma.debt.updateMany({
      where: {
        fromUserId: fromId,
        toUserId: toId,
        isPaid: false,
      },
      data: {
        isPaid: true,
        paidAt: new Date(),
        markedPaidById,
      },
    });
  }

  // Marcar todas las deudas de invitados entre dos personas como pagadas
  async markGuestDebtsAsPaidBetween(fromId: string, toId: string): Promise<void> {
    // fromId puede ser un userId o guestId, igual que toId
    await this.prisma.guestDebt.updateMany({
      where: {
        OR: [
          { fromUserId: fromId, toUserId: toId },
          { fromUserId: fromId, toGuestId: toId },
          { fromGuestId: fromId, toUserId: toId },
          { fromGuestId: fromId, toGuestId: toId },
        ],
        isPaid: false,
      },
      data: {
        isPaid: true,
        paidAt: new Date(),
      },
    });
  }

  // Deudas de invitados hacia un usuario
  async createGuestDebtsToUser(
    expenseId: string,
    debts: {
      fromGuestId: string;
      toUserId: string;
      amount: number;
      eventId: string;
    }[],
  ): Promise<any[]> {
    const createdDebts = await this.prisma.$transaction(
      debts.map((debt) =>
        this.prisma.guestDebt.create({
          data: {
            expenseId,
            eventId: debt.eventId,
            fromGuestId: debt.fromGuestId,
            toUserId: debt.toUserId,
            amount: debt.amount,
          },
          include: {
            fromGuest: true,
            toUser: true,
          },
        }),
      ),
    );
    return createdDebts;
  }

  private toEntity(data: any): Expense {
    return new Expense({
      id: data.id,
      eventId: data.eventId,
      paidById: data.paidById,
      paidBy: data.paidBy ? this.toUserEntity(data.paidBy) : undefined,
      paidByGuestId: data.paidByGuestId,
      paidByGuest: data.paidByGuest ? { id: data.paidByGuest.id, name: data.paidByGuest.name } : undefined,
      amount: data.amount,
      description: data.description,
      participants: data.participants?.map((p: any) => this.toParticipantEntity(p)),
      guestParticipants: data.guestParticipants?.map((p: any) => ({
        id: p.id,
        guestMemberId: p.guestMemberId,
        guestMember: p.guestMember ? { id: p.guestMember.id, name: p.guestMember.name } : undefined,
      })),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  private toParticipantEntity(data: any): ExpenseParticipant {
    return new ExpenseParticipant({
      id: data.id,
      expenseId: data.expenseId,
      userId: data.userId,
      user: data.user ? this.toUserEntity(data.user) : undefined,
    });
  }

  private toDebtEntity(data: any): Debt {
    return new Debt({
      id: data.id,
      eventId: data.eventId,
      expenseId: data.expenseId,
      fromUserId: data.fromUserId,
      fromUser: data.fromUser ? this.toUserEntity(data.fromUser) : undefined,
      toUserId: data.toUserId,
      toUser: data.toUser ? this.toUserEntity(data.toUser) : undefined,
      amount: data.amount,
      isPaid: data.isPaid,
      paidAt: data.paidAt,
      markedPaidById: data.markedPaidById,
      markedPaidBy: data.markedPaidBy ? this.toUserEntity(data.markedPaidBy) : undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
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

