import { Wallet, WalletMember, PersonalExpense, ExpenseCategory, Beneficiary } from '../../../domain/entities/wallet.entity';
export interface IWalletRepositoryPort {
    createWallet(data: {
        name: string;
        type: 'PERSONAL' | 'SHARED';
        currency: string;
        createdById: string;
    }): Promise<Wallet>;
    findWalletById(walletId: string): Promise<Wallet | null>;
    findWalletByInviteCode(inviteCode: string): Promise<Wallet | null>;
    findUserWallets(userId: string): Promise<Wallet[]>;
    updateWallet(walletId: string, data: Partial<Wallet>): Promise<Wallet>;
    generateInviteCode(walletId: string): Promise<Wallet>;
    deleteWallet(walletId: string): Promise<void>;
    addMember(walletId: string, userId: string, role: 'OWNER' | 'MEMBER'): Promise<WalletMember>;
    removeMember(walletId: string, userId: string): Promise<void>;
    isMember(walletId: string, userId: string): Promise<boolean>;
    getMemberRole(walletId: string, userId: string): Promise<string | null>;
    createExpense(data: {
        walletId: string;
        categoryId: string;
        amount: number;
        currency: string;
        exchangeRate?: number;
        description: string;
        date: Date;
        type: 'FIXED' | 'VARIABLE';
        paidById: string;
        isRecurring?: boolean;
        recurringId?: string;
    }): Promise<PersonalExpense>;
    findExpenseById(expenseId: string): Promise<PersonalExpense | null>;
    findWalletExpenses(walletId: string, startDate?: Date, endDate?: Date): Promise<PersonalExpense[]>;
    updateExpense(expenseId: string, data: Partial<PersonalExpense>): Promise<PersonalExpense>;
    deleteExpense(expenseId: string): Promise<void>;
    findCategoryById(categoryId: string): Promise<ExpenseCategory | null>;
    findDefaultCategories(): Promise<ExpenseCategory[]>;
    findUserCategories(userId: string): Promise<ExpenseCategory[]>;
    createCategory(data: {
        name: string;
        icon: string;
        color: string;
        userId: string;
    }): Promise<ExpenseCategory>;
    deleteCategory(categoryId: string): Promise<void>;
    findBeneficiariesByWallet(walletId: string): Promise<Beneficiary[]>;
    findBeneficiaryById(beneficiaryId: string): Promise<Beneficiary | null>;
    createBeneficiary(data: {
        walletId: string;
        name: string;
        icon: string;
    }): Promise<Beneficiary>;
    updateBeneficiary(beneficiaryId: string, data: Partial<Beneficiary>): Promise<Beneficiary>;
    deleteBeneficiary(beneficiaryId: string): Promise<void>;
    getExpenseSumByCategory(walletId: string, startDate: Date, endDate: Date): Promise<{
        categoryId: string;
        _sum: {
            amount: number;
        };
    }[]>;
    getExpenseSumByType(walletId: string, startDate: Date, endDate: Date): Promise<{
        type: string;
        _sum: {
            amount: number;
        };
    }[]>;
    getExpenseSumByBeneficiary(walletId: string, startDate: Date, endDate: Date): Promise<{
        beneficiaryId: string | null;
        _sum: {
            amount: number;
        };
    }[]>;
}
