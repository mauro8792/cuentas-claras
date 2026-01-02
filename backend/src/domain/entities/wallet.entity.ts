// Tipos de billetera
export type WalletType = 'PERSONAL' | 'SHARED';

// Tipos de gasto personal
export type PersonalExpenseType = 'FIXED' | 'VARIABLE';

// Monedas soportadas
export const SUPPORTED_CURRENCIES = [
  { code: 'ARS', name: 'Peso Argentino', symbol: '$', flag: '🇦🇷' },
  { code: 'USD', name: 'Dólar Estadounidense', symbol: 'US$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'BRL', name: 'Real Brasileño', symbol: 'R$', flag: '🇧🇷' },
  { code: 'UYU', name: 'Peso Uruguayo', symbol: '$U', flag: '🇺🇾' },
  { code: 'CLP', name: 'Peso Chileno', symbol: 'CLP$', flag: '🇨🇱' },
] as const;

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]['code'];

// Billetera
export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  currency: string;
  inviteCode?: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  members?: WalletMember[];
  expenses?: PersonalExpense[];
}

// Miembro de billetera
export interface WalletMember {
  id: string;
  walletId: string;
  userId: string;
  role: 'OWNER' | 'MEMBER';
  joinedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

// Categoría de gastos
export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  userId?: string;
  createdAt: Date;
}

// Beneficiario/Dependiente (mascota, hijo, auto, etc.)
export interface Beneficiary {
  id: string;
  walletId: string;
  name: string;
  icon: string;
  createdAt: Date;
}

// Gasto personal
export interface PersonalExpense {
  id: string;
  walletId: string;
  categoryId: string;
  beneficiaryId?: string;
  amount: number;
  currency: string;
  exchangeRate?: number;
  description: string;
  date: Date;
  type: PersonalExpenseType;
  paidById: string;
  isRecurring: boolean;
  recurringId?: string;
  createdAt: Date;
  updatedAt: Date;
  category?: ExpenseCategory;
  beneficiary?: Beneficiary;
  paidBy?: {
    id: string;
    name: string;
  };
}

// Gasto recurrente
export interface RecurringExpense {
  id: string;
  walletId: string;
  categoryId: string;
  amount: number;
  currency: string;
  description: string;
  dayOfMonth: number;
  type: PersonalExpenseType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Resumen mensual
export interface MonthlySummary {
  month: number;
  year: number;
  currency: string;
  totalFixed: number;
  totalVariable: number;
  total: number;
  byCategory: CategorySummary[];
  comparison?: {
    previousMonth: number;
    percentageChange: number;
  };
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  total: number;
  percentage: number;
  count: number;
}

