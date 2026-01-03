import { Wallet, WalletType, PersonalExpense, PersonalExpenseType, ExpenseCategory, MonthlySummary, Beneficiary } from '../../../domain/entities/wallet.entity';
export declare class CreateWalletDto {
    name: string;
    type?: WalletType;
    currency?: string;
}
export declare class UpdateWalletDto {
    name?: string;
    currency?: string;
}
export declare class CreatePersonalExpenseDto {
    amount: number;
    currency?: string;
    exchangeRate?: number;
    description: string;
    date: string;
    type: PersonalExpenseType;
    categoryId: string;
    beneficiaryId?: string;
    isRecurring?: boolean;
}
export declare class UpdatePersonalExpenseDto {
    amount?: number;
    currency?: string;
    exchangeRate?: number;
    description?: string;
    date?: string;
    type?: PersonalExpenseType;
    categoryId?: string;
    beneficiaryId?: string;
}
export declare class CreateCategoryDto {
    name: string;
    icon: string;
    color: string;
}
export declare class InviteMemberDto {
    email: string;
}
export declare class JoinWalletDto {
    inviteCode: string;
}
export declare class CreateBeneficiaryDto {
    name: string;
    icon?: string;
}
export declare class UpdateBeneficiaryDto {
    name?: string;
    icon?: string;
}
export interface IWalletInputPort {
    createWallet(userId: string, dto: CreateWalletDto): Promise<Wallet>;
    getUserWallets(userId: string): Promise<Wallet[]>;
    getWalletById(userId: string, walletId: string): Promise<Wallet>;
    updateWallet(userId: string, walletId: string, dto: UpdateWalletDto): Promise<Wallet>;
    deleteWallet(userId: string, walletId: string): Promise<void>;
    joinByInviteCode(userId: string, dto: JoinWalletDto): Promise<Wallet>;
    inviteMember(userId: string, walletId: string, dto: InviteMemberDto): Promise<Wallet>;
    removeMember(userId: string, walletId: string, memberId: string): Promise<void>;
    createExpense(userId: string, walletId: string, dto: CreatePersonalExpenseDto): Promise<PersonalExpense>;
    getWalletExpenses(userId: string, walletId: string, month?: number, year?: number): Promise<PersonalExpense[]>;
    getExpenseById(userId: string, walletId: string, expenseId: string): Promise<PersonalExpense>;
    updateExpense(userId: string, walletId: string, expenseId: string, dto: UpdatePersonalExpenseDto): Promise<PersonalExpense>;
    deleteExpense(userId: string, walletId: string, expenseId: string): Promise<void>;
    getCategories(userId: string): Promise<ExpenseCategory[]>;
    createCategory(userId: string, dto: CreateCategoryDto): Promise<ExpenseCategory>;
    deleteCategory(userId: string, categoryId: string): Promise<void>;
    getBeneficiaries(userId: string, walletId: string): Promise<Beneficiary[]>;
    createBeneficiary(userId: string, walletId: string, dto: CreateBeneficiaryDto): Promise<Beneficiary>;
    updateBeneficiary(userId: string, walletId: string, beneficiaryId: string, dto: UpdateBeneficiaryDto): Promise<Beneficiary>;
    deleteBeneficiary(userId: string, walletId: string, beneficiaryId: string): Promise<void>;
    getMonthlySummary(userId: string, walletId: string, month: number, year: number): Promise<MonthlySummary>;
}
