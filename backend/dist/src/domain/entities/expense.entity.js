"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Expense = exports.ExpenseParticipant = void 0;
class ExpenseParticipant {
    constructor(props) {
        this.id = props.id;
        this.expenseId = props.expenseId;
        this.userId = props.userId;
        this.user = props.user;
    }
}
exports.ExpenseParticipant = ExpenseParticipant;
class Expense {
    constructor(props) {
        this.id = props.id;
        this.eventId = props.eventId;
        this.paidById = props.paidById;
        this.paidBy = props.paidBy;
        this.paidByGuestId = props.paidByGuestId;
        this.paidByGuest = props.paidByGuest;
        this.amount = props.amount;
        this.description = props.description;
        this.participants = props.participants;
        this.guestParticipants = props.guestParticipants;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
    getAmountPerParticipant() {
        const userCount = this.participants?.length || 0;
        const guestCount = this.guestParticipants?.length || 0;
        const participantCount = userCount + guestCount || 1;
        return this.amount / participantCount;
    }
    getParticipantIds() {
        return this.participants?.map((p) => p.userId) || [];
    }
    getGuestParticipantIds() {
        return this.guestParticipants?.map((p) => p.guestMemberId) || [];
    }
    getPaidByName() {
        if (this.paidBy)
            return this.paidBy.name;
        if (this.paidByGuest)
            return this.paidByGuest.name;
        return 'Desconocido';
    }
}
exports.Expense = Expense;
//# sourceMappingURL=expense.entity.js.map