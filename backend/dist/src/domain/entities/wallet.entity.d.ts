export type WalletType = 'PERSONAL' | 'SHARED';
export type PersonalExpenseType = 'FIXED' | 'VARIABLE';
export declare const SUPPORTED_CURRENCIES: readonly [{
    readonly code: "ARS";
    readonly name: "Peso Argentino";
    readonly symbol: "$";
    readonly flag: "🇦🇷";
}, {
    readonly code: "USD";
    readonly name: "Dólar Estadounidense";
    readonly symbol: "US$";
    readonly flag: "🇺🇸";
}, {
    readonly code: "EUR";
    readonly name: "Euro";
    readonly symbol: "€";
    readonly flag: "🇪🇺";
}, {
    readonly code: "BRL";
    readonly name: "Real Brasileño";
    readonly symbol: "R$";
    readonly flag: "🇧🇷";
}, {
    readonly code: "UYU";
    readonly name: "Peso Uruguayo";
    readonly symbol: "$U";
    readonly flag: "🇺🇾";
}, {
    readonly code: "CLP";
    readonly name: "Peso Chileno";
    readonly symbol: "CLP$";
    readonly flag: "🇨🇱";
}];
export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]['code'];
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
export interface ExpenseCategory {
    id: string;
    name: string;
    icon: string;
    color: string;
    isDefault: boolean;
    userId?: string;
    createdAt: Date;
}
export interface Beneficiary {
    id: string;
    walletId: string;
    name: string;
    icon: string;
    createdAt: Date;
}
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
