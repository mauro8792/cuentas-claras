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
exports.ExpenseUseCase = void 0;
const common_1 = require("@nestjs/common");
let ExpenseUseCase = class ExpenseUseCase {
    constructor(expenseRepository, eventRepository, groupRepository) {
        this.expenseRepository = expenseRepository;
        this.eventRepository = eventRepository;
        this.groupRepository = groupRepository;
    }
    async create(userId, eventId, dto) {
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw new common_1.NotFoundException('Evento no encontrado');
        }
        if (event.isSettled) {
            throw new common_1.BadRequestException('No podés agregar gastos a un evento liquidado');
        }
        const isMember = await this.groupRepository.isMember(event.groupId, userId);
        if (!isMember) {
            throw new common_1.ForbiddenException('No sos miembro de este grupo');
        }
        if (event.isHiddenFromUser(userId)) {
            throw new common_1.ForbiddenException('No podés agregar gastos a este evento');
        }
        const paidById = dto.paidById || (!dto.paidByGuestId ? userId : undefined);
        const paidByGuestId = dto.paidByGuestId;
        let participantIds = dto.participantIds;
        let guestParticipantIds = dto.guestParticipantIds;
        if ((!participantIds || participantIds.length === 0) && (!guestParticipantIds || guestParticipantIds.length === 0)) {
            const group = await this.groupRepository.findById(event.groupId);
            if (group && group.members) {
                participantIds = group.members.map(m => m.userId);
            }
            const guestMembers = await this.groupRepository.findGuestMembers(event.groupId);
            if (guestMembers && guestMembers.length > 0) {
                guestParticipantIds = guestMembers.map(g => g.id);
            }
        }
        if (event.isGiftEvent()) {
            if (event.giftRecipientId && participantIds) {
                participantIds = participantIds.filter(id => id !== event.giftRecipientId);
            }
            if (event.giftRecipientGuestId && guestParticipantIds) {
                guestParticipantIds = guestParticipantIds.filter(id => id !== event.giftRecipientGuestId);
            }
        }
        const expense = await this.expenseRepository.create({
            eventId,
            paidById,
            paidByGuestId,
            amount: dto.amount,
            description: dto.description,
            participantIds,
            guestParticipantIds,
        });
        if (paidById) {
            await this.createDebtsForExpense(expense, event.id);
        }
        else if (paidByGuestId) {
            await this.createGuestDebtsForExpense(expense, event.id, paidByGuestId);
        }
        return this.expenseRepository.findById(expense.id);
    }
    async findById(userId, expenseId) {
        const expense = await this.expenseRepository.findById(expenseId);
        if (!expense) {
            throw new common_1.NotFoundException('Gasto no encontrado');
        }
        const event = await this.eventRepository.findById(expense.eventId);
        if (!event) {
            throw new common_1.NotFoundException('Evento no encontrado');
        }
        const isMember = await this.groupRepository.isMember(event.groupId, userId);
        if (!isMember) {
            throw new common_1.ForbiddenException('No sos miembro de este grupo');
        }
        if (event.isHiddenFromUser(userId)) {
            throw new common_1.ForbiddenException('No podés ver este gasto');
        }
        return expense;
    }
    async findByEventId(userId, eventId) {
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw new common_1.NotFoundException('Evento no encontrado');
        }
        const isMember = await this.groupRepository.isMember(event.groupId, userId);
        if (!isMember) {
            throw new common_1.ForbiddenException('No sos miembro de este grupo');
        }
        if (event.isHiddenFromUser(userId)) {
            throw new common_1.ForbiddenException('No podés ver los gastos de este evento');
        }
        return this.expenseRepository.findByEventId(eventId);
    }
    async update(userId, expenseId, dto) {
        const expense = await this.findById(userId, expenseId);
        const event = await this.eventRepository.findById(expense.eventId);
        if (!event || event.isSettled) {
            throw new common_1.BadRequestException('No podés modificar gastos de un evento liquidado');
        }
        const groupCreatorId = await this.groupRepository.getGroupCreatorId(event.groupId);
        const canEdit = expense.paidById === userId || expense.paidByGuestId || groupCreatorId === userId;
        if (!canEdit) {
            throw new common_1.ForbiddenException('Solo quien pagó o el dueño del grupo puede editar el gasto');
        }
        await this.expenseRepository.deleteDebtsByExpenseId(expenseId);
        const updatedExpense = await this.expenseRepository.update(expenseId, dto);
        if (updatedExpense.paidById) {
            await this.createDebtsForExpense(updatedExpense, event.id);
        }
        else if (updatedExpense.paidByGuestId) {
            await this.createGuestDebtsForExpense(updatedExpense, event.id, updatedExpense.paidByGuestId);
        }
        return this.expenseRepository.findById(expenseId);
    }
    async delete(userId, expenseId) {
        const expense = await this.findById(userId, expenseId);
        const event = await this.eventRepository.findById(expense.eventId);
        if (!event || event.isSettled) {
            throw new common_1.BadRequestException('No podés eliminar gastos de un evento liquidado');
        }
        if (expense.paidById && expense.paidById !== userId) {
            throw new common_1.ForbiddenException('Solo quien pagó puede eliminar el gasto');
        }
        await this.expenseRepository.delete(expenseId);
    }
    async getEventDebts(userId, eventId) {
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw new common_1.NotFoundException('Evento no encontrado');
        }
        const isMember = await this.groupRepository.isMember(event.groupId, userId);
        if (!isMember) {
            throw new common_1.ForbiddenException('No sos miembro de este grupo');
        }
        if (event.isHiddenFromUser(userId)) {
            throw new common_1.ForbiddenException('No podés ver las deudas de este evento');
        }
        const [normalDebts, guestDebts] = await Promise.all([
            this.expenseRepository.findDebtsByEventId(eventId),
            this.expenseRepository.findGuestDebtsByEventId(eventId),
        ]);
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
            ...guestDebts.map((d) => ({
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
    async getOptimalSettlement(userId, eventId) {
        const allDebts = await this.getEventDebts(userId, eventId);
        const debtMap = new Map();
        for (const debt of allDebts) {
            if (debt.isPaid)
                continue;
            const fromId = debt.fromUserId || debt.fromGuestId;
            const toId = debt.toUserId || debt.toGuestId;
            const fromName = debt.fromUser?.name || debt.fromGuest?.name || '?';
            const toName = debt.toUser?.name || debt.toGuest?.name || '?';
            const isFromGuest = !!debt.fromGuestId;
            const isToGuest = !!debt.toGuestId || (!!debt.toGuest);
            if (!fromId || !toId)
                continue;
            const key = `${fromId}->${toId}`;
            const reverseKey = `${toId}->${fromId}`;
            if (debtMap.has(reverseKey)) {
                const existing = debtMap.get(reverseKey);
                existing.amount -= debt.amount;
                if (existing.amount < 0) {
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
            }
            else if (debtMap.has(key)) {
                debtMap.get(key).amount += debt.amount;
            }
            else {
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
        return Array.from(debtMap.values())
            .filter(d => d.amount > 0.01)
            .map((d, idx) => ({
            ...d,
            id: `settlement::${d.fromUserId}::${d.toUserId}`,
            amount: Math.round(d.amount * 100) / 100,
            isPaid: false,
        }));
    }
    async markDebtAsPaid(userId, debtId) {
        if (debtId.startsWith('settlement::')) {
            const parts = debtId.split('::');
            if (parts.length === 3) {
                const fromId = parts[1];
                const toId = parts[2];
                await this.expenseRepository.markDebtsAsPaidBetween(fromId, toId, userId);
                await this.expenseRepository.markGuestDebtsAsPaidBetween(fromId, toId);
                await this.expenseRepository.markDebtsAsPaidBetween(toId, fromId, userId);
                await this.expenseRepository.markGuestDebtsAsPaidBetween(toId, fromId);
                return { success: true, message: 'Deudas marcadas como pagadas' };
            }
        }
        const debt = await this.expenseRepository.findDebtById(debtId);
        if (debt) {
            if (debt.toUserId !== userId) {
                throw new common_1.ForbiddenException('Solo quien recibe el pago puede marcarlo como pagado');
            }
            return this.expenseRepository.updateDebt(debtId, {
                isPaid: true,
                paidAt: new Date(),
                markedPaidById: userId,
            });
        }
        const guestDebt = await this.expenseRepository.findGuestDebtById(debtId);
        if (guestDebt) {
            if (guestDebt.toUserId && guestDebt.toUserId !== userId) {
                throw new common_1.ForbiddenException('Solo quien recibe el pago puede marcarlo como pagado');
            }
            if (guestDebt.toGuestId) {
                const event = await this.eventRepository.findById(guestDebt.eventId);
                if (event) {
                    const group = await this.groupRepository.findById(event.groupId);
                    if (group && group.createdById !== userId) {
                        throw new common_1.ForbiddenException('Solo el creador del grupo puede marcar pagos de invitados');
                    }
                }
            }
            return this.expenseRepository.updateGuestDebt(debtId, {
                isPaid: true,
                paidAt: new Date(),
            });
        }
        throw new common_1.NotFoundException('Deuda no encontrada');
    }
    async getUserBalance(userId) {
        const [debts, guestDebts] = await Promise.all([
            this.expenseRepository.findDebtsByUserId(userId),
            this.expenseRepository.findGuestDebtsByUserId(userId),
        ]);
        let totalOwed = 0;
        let totalOwing = 0;
        for (const debt of debts) {
            if (debt.isPaid)
                continue;
            if (debt.toUserId === userId) {
                totalOwed += debt.amount;
            }
            else if (debt.fromUserId === userId) {
                totalOwing += debt.amount;
            }
        }
        for (const gd of guestDebts) {
            if (gd.isPaid)
                continue;
            if (gd.toUserId === userId) {
                totalOwed += gd.amount;
            }
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
    async createDebtsForExpense(expense, eventId) {
        if (!expense.paidById)
            return;
        const participantIds = expense.getParticipantIds();
        const guestParticipantIds = expense.getGuestParticipantIds();
        const totalParticipants = participantIds.length + guestParticipantIds.length;
        if (totalParticipants === 0)
            return;
        const amountPerPerson = expense.amount / totalParticipants;
        const debtsToCreate = [];
        for (const participantId of participantIds) {
            if (participantId === expense.paidById)
                continue;
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
        if (guestParticipantIds.length > 0) {
            await this.createGuestDebtsToUser(expense, eventId, expense.paidById);
        }
    }
    async createGuestDebtsToUser(expense, eventId, paidByUserId) {
        const guestParticipantIds = expense.getGuestParticipantIds();
        if (guestParticipantIds.length === 0)
            return;
        const totalParticipants = expense.getParticipantIds().length + guestParticipantIds.length;
        const amountPerPerson = expense.amount / totalParticipants;
        const debtsToCreate = [];
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
    async createGuestDebtsForExpense(expense, eventId, paidByGuestId) {
        const userParticipantIds = expense.getParticipantIds();
        const guestParticipantIds = expense.getGuestParticipantIds();
        const totalParticipants = userParticipantIds.length + guestParticipantIds.length;
        if (totalParticipants === 0)
            return;
        const amountPerPerson = expense.amount / totalParticipants;
        const debtsToCreate = [];
        for (const userId of userParticipantIds) {
            debtsToCreate.push({
                fromUserId: userId,
                toGuestId: paidByGuestId,
                amount: Math.round(amountPerPerson * 100) / 100,
                eventId,
            });
        }
        for (const guestId of guestParticipantIds) {
            if (guestId === paidByGuestId)
                continue;
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
    async recalculateDebtsForNewMember(groupId, newMemberId, isGuest = false) {
        const events = await this.eventRepository.findByGroupId(groupId);
        const activeEvents = events.filter(e => !e.isSettled);
        for (const event of activeEvents) {
            const expenses = await this.expenseRepository.findByEventId(event.id);
            for (const expense of expenses) {
                const currentParticipantIds = expense.getParticipantIds();
                const currentGuestParticipantIds = expense.getGuestParticipantIds();
                let newParticipantIds = [...currentParticipantIds];
                let newGuestParticipantIds = [...currentGuestParticipantIds];
                if (isGuest) {
                    if (!newGuestParticipantIds.includes(newMemberId)) {
                        newGuestParticipantIds.push(newMemberId);
                    }
                }
                else {
                    if (!newParticipantIds.includes(newMemberId)) {
                        newParticipantIds.push(newMemberId);
                    }
                }
                if (event.type === 'GIFT') {
                    if (event.giftRecipientId === newMemberId || event.giftRecipientGuestId === newMemberId) {
                        continue;
                    }
                }
                await this.expenseRepository.deleteDebtsByExpenseId(expense.id);
                await this.expenseRepository.update(expense.id, {
                    participantIds: newParticipantIds,
                    guestParticipantIds: newGuestParticipantIds,
                });
                const updatedExpense = await this.expenseRepository.findById(expense.id);
                if (!updatedExpense)
                    continue;
                if (updatedExpense.paidById) {
                    await this.createDebtsForExpense(updatedExpense, event.id);
                }
                else if (updatedExpense.paidByGuestId) {
                    await this.createGuestDebtsForExpense(updatedExpense, event.id, updatedExpense.paidByGuestId);
                }
            }
        }
    }
    async recalculateDebtsOnMemberLeave(groupId, memberId, isGuest) {
        const events = await this.eventRepository.findByGroupId(groupId);
        const unsettledEvents = events.filter(e => !e.isSettled);
        for (const event of unsettledEvents) {
            const expenses = await this.expenseRepository.findByEventId(event.id);
            for (const expense of expenses) {
                if (isGuest && expense.paidByGuestId === memberId) {
                    continue;
                }
                if (!isGuest && expense.paidById === memberId) {
                    continue;
                }
                const currentParticipantIds = expense.getParticipantIds();
                const currentGuestParticipantIds = expense.getGuestParticipantIds();
                let newParticipantIds = [...currentParticipantIds];
                let newGuestParticipantIds = [...currentGuestParticipantIds];
                if (isGuest) {
                    newGuestParticipantIds = newGuestParticipantIds.filter(id => id !== memberId);
                }
                else {
                    newParticipantIds = newParticipantIds.filter(id => id !== memberId);
                }
                if (newParticipantIds.length === 0 && newGuestParticipantIds.length === 0) {
                    continue;
                }
                await this.expenseRepository.deleteDebtsByExpenseId(expense.id);
                await this.expenseRepository.update(expense.id, {
                    participantIds: newParticipantIds,
                    guestParticipantIds: newGuestParticipantIds,
                });
                const updatedExpense = await this.expenseRepository.findById(expense.id);
                if (!updatedExpense)
                    continue;
                if (updatedExpense.paidById) {
                    await this.createDebtsForExpense(updatedExpense, event.id);
                }
                else if (updatedExpense.paidByGuestId) {
                    await this.createGuestDebtsForExpense(updatedExpense, event.id, updatedExpense.paidByGuestId);
                }
            }
        }
    }
};
exports.ExpenseUseCase = ExpenseUseCase;
exports.ExpenseUseCase = ExpenseUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object, Object, Object])
], ExpenseUseCase);
//# sourceMappingURL=expense.use-case.js.map