import { WalletUseCase } from '../../application/use-cases/wallet.use-case';
import { CreateWalletDto, UpdateWalletDto, CreatePersonalExpenseDto, UpdatePersonalExpenseDto, CreateCategoryDto, InviteMemberDto, JoinWalletDto, CreateBeneficiaryDto, UpdateBeneficiaryDto } from '../../application/ports/input/wallet.port';
export declare class WalletController {
    private readonly walletUseCase;
    constructor(walletUseCase: WalletUseCase);
    getCurrencies(): readonly [{
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
    getCategories(req: any): Promise<import("../../domain/entities/wallet.entity").ExpenseCategory[]>;
    createCategory(req: any, dto: CreateCategoryDto): Promise<import("../../domain/entities/wallet.entity").ExpenseCategory>;
    deleteCategory(req: any, categoryId: string): Promise<{
        message: string;
    }>;
    joinWallet(req: any, dto: JoinWalletDto): Promise<import("../../domain/entities/wallet.entity").Wallet>;
    createWallet(req: any, dto: CreateWalletDto): Promise<import("../../domain/entities/wallet.entity").Wallet>;
    getMyWallets(req: any): Promise<import("../../domain/entities/wallet.entity").Wallet[]>;
    getWallet(req: any, walletId: string): Promise<import("../../domain/entities/wallet.entity").Wallet>;
    updateWallet(req: any, walletId: string, dto: UpdateWalletDto): Promise<import("../../domain/entities/wallet.entity").Wallet>;
    deleteWallet(req: any, walletId: string): Promise<{
        message: string;
    }>;
    inviteMember(req: any, walletId: string, dto: InviteMemberDto): Promise<import("../../domain/entities/wallet.entity").Wallet>;
    removeMember(req: any, walletId: string, memberId: string): Promise<{
        message: string;
    }>;
    getBeneficiaries(req: any, walletId: string): Promise<import("../../domain/entities/wallet.entity").Beneficiary[]>;
    createBeneficiary(req: any, walletId: string, dto: CreateBeneficiaryDto): Promise<import("../../domain/entities/wallet.entity").Beneficiary>;
    updateBeneficiary(req: any, walletId: string, beneficiaryId: string, dto: UpdateBeneficiaryDto): Promise<import("../../domain/entities/wallet.entity").Beneficiary>;
    deleteBeneficiary(req: any, walletId: string, beneficiaryId: string): Promise<{
        message: string;
    }>;
    createExpense(req: any, walletId: string, dto: CreatePersonalExpenseDto): Promise<import("../../domain/entities/wallet.entity").PersonalExpense>;
    getExpenses(req: any, walletId: string, month?: string, year?: string): Promise<import("../../domain/entities/wallet.entity").PersonalExpense[]>;
    getExpense(req: any, walletId: string, expenseId: string): Promise<import("../../domain/entities/wallet.entity").PersonalExpense>;
    updateExpense(req: any, walletId: string, expenseId: string, dto: UpdatePersonalExpenseDto): Promise<import("../../domain/entities/wallet.entity").PersonalExpense>;
    deleteExpense(req: any, walletId: string, expenseId: string): Promise<{
        message: string;
    }>;
    getMonthlySummary(req: any, walletId: string, month: string, year: string): Promise<import("../../domain/entities/wallet.entity").MonthlySummary>;
}
