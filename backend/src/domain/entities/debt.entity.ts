import { User } from './user.entity';

export class Debt {
  readonly id: string;
  readonly eventId: string;
  readonly expenseId: string;
  readonly fromUserId: string;
  readonly fromUser?: User;
  readonly toUserId: string;
  readonly toUser?: User;
  readonly amount: number;
  readonly isPaid: boolean;
  readonly paidAt?: Date;
  readonly markedPaidById?: string;
  readonly markedPaidBy?: User;
  readonly createdAt: Date;
  readonly updatedAt?: Date;

  constructor(props: {
    id: string;
    eventId: string;
    expenseId: string;
    fromUserId: string;
    fromUser?: User;
    toUserId: string;
    toUser?: User;
    amount: number;
    isPaid: boolean;
    paidAt?: Date;
    markedPaidById?: string;
    markedPaidBy?: User;
    createdAt: Date;
    updatedAt?: Date;
  }) {
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

// Value object para representar la deuda neta optimizada entre dos usuarios
export class NetDebt {
  readonly fromUserId: string;
  readonly toUserId: string;
  readonly amount: number;

  constructor(fromUserId: string, toUserId: string, amount: number) {
    this.fromUserId = fromUserId;
    this.toUserId = toUserId;
    this.amount = amount;
  }
}

// Servicio de dominio para calcular la liquidación óptima
export class DebtSettlementCalculator {
  /**
   * Calcula la forma óptima de liquidar deudas minimizando transacciones
   * Algoritmo: calcula balance neto de cada persona y empareja deudores con acreedores
   */
  static calculateOptimalSettlement(debts: Debt[]): NetDebt[] {
    // Calcular balance neto de cada usuario
    const balances = new Map<string, number>();

    for (const debt of debts) {
      if (debt.isPaid) continue;

      const fromBalance = balances.get(debt.fromUserId) || 0;
      const toBalance = balances.get(debt.toUserId) || 0;

      balances.set(debt.fromUserId, fromBalance - debt.amount);
      balances.set(debt.toUserId, toBalance + debt.amount);
    }

    // Separar deudores (balance negativo) y acreedores (balance positivo)
    const debtors: { userId: string; amount: number }[] = [];
    const creditors: { userId: string; amount: number }[] = [];

    for (const [userId, balance] of balances) {
      if (balance < -0.01) {
        // Debe dinero
        debtors.push({ userId, amount: Math.abs(balance) });
      } else if (balance > 0.01) {
        // Le deben dinero
        creditors.push({ userId, amount: balance });
      }
    }

    // Emparejar deudores con acreedores
    const settlements: NetDebt[] = [];
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

      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    return settlements;
  }
}

