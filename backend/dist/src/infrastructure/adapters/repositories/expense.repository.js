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
exports.ExpenseRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../persistence/prisma.service");
const expense_entity_1 = require("../../../domain/entities/expense.entity");
const debt_entity_1 = require("../../../domain/entities/debt.entity");
const user_entity_1 = require("../../../domain/entities/user.entity");
let ExpenseRepository = class ExpenseRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
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
    async findById(id) {
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
    async findByEventId(eventId) {
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
    async update(id, data) {
        if (data.participantIds !== undefined || data.guestParticipantIds !== undefined) {
            await this.prisma.expenseParticipant.deleteMany({
                where: { expenseId: id },
            });
            await this.prisma.guestExpenseParticipant.deleteMany({
                where: { expenseId: id },
            });
            if (data.participantIds && data.participantIds.length > 0) {
                await this.prisma.expenseParticipant.createMany({
                    data: data.participantIds.map((userId) => ({ expenseId: id, userId })),
                });
            }
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
    async delete(id) {
        await this.prisma.expense.delete({ where: { id } });
    }
    async createDebts(expenseId, debts) {
        const createdDebts = await this.prisma.$transaction(debts.map((debt) => this.prisma.debt.create({
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
        })));
        return createdDebts.map((d) => this.toDebtEntity(d));
    }
    async findDebtById(id) {
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
    async findDebtsByEventId(eventId) {
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
    async findDebtsByUserId(userId) {
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
    async updateDebt(id, data) {
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
    async deleteDebtsByExpenseId(expenseId) {
        await this.prisma.debt.deleteMany({ where: { expenseId } });
        await this.prisma.guestDebt.deleteMany({ where: { expenseId } });
    }
    async createGuestDebts(expenseId, debts) {
        const createdDebts = await this.prisma.$transaction(debts.map((debt) => this.prisma.guestDebt.create({
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
        })));
        return createdDebts;
    }
    async findGuestDebtsByEventId(eventId) {
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
    async findGuestDebtsByUserId(userId) {
        return this.prisma.guestDebt.findMany({
            where: {
                OR: [
                    { fromUserId: userId },
                    { toUserId: userId },
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
    async findGuestDebtById(id) {
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
    async updateGuestDebt(id, data) {
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
    async markDebtsAsPaidBetween(fromId, toId, markedPaidById) {
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
    async markGuestDebtsAsPaidBetween(fromId, toId) {
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
    async createGuestDebtsToUser(expenseId, debts) {
        const createdDebts = await this.prisma.$transaction(debts.map((debt) => this.prisma.guestDebt.create({
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
        })));
        return createdDebts;
    }
    toEntity(data) {
        return new expense_entity_1.Expense({
            id: data.id,
            eventId: data.eventId,
            paidById: data.paidById,
            paidBy: data.paidBy ? this.toUserEntity(data.paidBy) : undefined,
            paidByGuestId: data.paidByGuestId,
            paidByGuest: data.paidByGuest ? { id: data.paidByGuest.id, name: data.paidByGuest.name } : undefined,
            amount: data.amount,
            description: data.description,
            participants: data.participants?.map((p) => this.toParticipantEntity(p)),
            guestParticipants: data.guestParticipants?.map((p) => ({
                id: p.id,
                guestMemberId: p.guestMemberId,
                guestMember: p.guestMember ? { id: p.guestMember.id, name: p.guestMember.name } : undefined,
            })),
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });
    }
    toParticipantEntity(data) {
        return new expense_entity_1.ExpenseParticipant({
            id: data.id,
            expenseId: data.expenseId,
            userId: data.userId,
            user: data.user ? this.toUserEntity(data.user) : undefined,
        });
    }
    toDebtEntity(data) {
        return new debt_entity_1.Debt({
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
exports.ExpenseRepository = ExpenseRepository;
exports.ExpenseRepository = ExpenseRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExpenseRepository);
//# sourceMappingURL=expense.repository.js.map