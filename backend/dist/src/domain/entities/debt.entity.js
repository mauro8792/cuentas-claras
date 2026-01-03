"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebtSettlementCalculator = exports.NetDebt = exports.Debt = void 0;
class Debt {
    constructor(props) {
        this.id = props.id;
        this.eventId = props.eventId;
        this.expenseId = props.expenseId;
        this.fromUserId = props.fromUserId;
        this.fromUser = props.fromUser;
        this.toUserId = props.toUserId;
        this.toUser = props.toUser;
        this.amount = props.amount;
        this.isPaid = props.isPaid;
        this.paidAt = props.paidAt;
        this.markedPaidById = props.markedPaidById;
        this.markedPaidBy = props.markedPaidBy;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
}
exports.Debt = Debt;
class NetDebt {
    constructor(fromUserId, toUserId, amount) {
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.amount = amount;
    }
}
exports.NetDebt = NetDebt;
class DebtSettlementCalculator {
    static calculateOptimalSettlement(debts) {
        const balances = new Map();
        for (const debt of debts) {
            if (debt.isPaid)
                continue;
            const fromBalance = balances.get(debt.fromUserId) || 0;
            const toBalance = balances.get(debt.toUserId) || 0;
            balances.set(debt.fromUserId, fromBalance - debt.amount);
            balances.set(debt.toUserId, toBalance + debt.amount);
        }
        const debtors = [];
        const creditors = [];
        for (const [userId, balance] of balances) {
            if (balance < -0.01) {
                debtors.push({ userId, amount: Math.abs(balance) });
            }
            else if (balance > 0.01) {
                creditors.push({ userId, amount: balance });
            }
        }
        const settlements = [];
        let i = 0;
        let j = 0;
        while (i < debtors.length && j < creditors.length) {
            const debtor = debtors[i];
            const creditor = creditors[j];
            const amount = Math.min(debtor.amount, creditor.amount);
            if (amount > 0.01) {
                settlements.push(new NetDebt(debtor.userId, creditor.userId, Math.round(amount * 100) / 100));
            }
            debtor.amount -= amount;
            creditor.amount -= amount;
            if (debtor.amount < 0.01)
                i++;
            if (creditor.amount < 0.01)
                j++;
        }
        return settlements;
    }
}
exports.DebtSettlementCalculator = DebtSettlementCalculator;
//# sourceMappingURL=debt.entity.js.map