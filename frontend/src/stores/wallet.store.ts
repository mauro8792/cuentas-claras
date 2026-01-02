'use client';

import { create } from 'zustand';
import { walletService } from '@/services/api';
import { Wallet, PersonalExpense, ExpenseCategory, MonthlySummary, Currency, Beneficiary } from '@/types';

// Tipo para actualizar gastos (date como string, no Date)
interface UpdateExpenseDto {
  amount?: number;
  currency?: string;
  exchangeRate?: number;
  description?: string;
  date?: string;
  type?: 'FIXED' | 'VARIABLE';
  categoryId?: string;
  beneficiaryId?: string;
}

interface WalletState {
  // Data
  wallets: Wallet[];
  currentWallet: Wallet | null;
  expenses: PersonalExpense[];
  categories: ExpenseCategory[];
  currencies: Currency[];
  beneficiaries: Beneficiary[];
  summary: MonthlySummary | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  selectedMonth: number;
  selectedYear: number;

  // Actions
  fetchWallets: () => Promise<void>;
  fetchWallet: (walletId: string) => Promise<void>;
  fetchExpenses: (walletId: string, month?: number, year?: number) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchCurrencies: () => Promise<void>;
  fetchSummary: (walletId: string, month: number, year: number) => Promise<void>;
  
  createWallet: (name: string, type?: string, currency?: string) => Promise<Wallet>;
  updateWallet: (walletId: string, updates: { name?: string; currency?: string }) => Promise<void>;
  deleteWallet: (walletId: string) => Promise<void>;
  
  createExpense: (walletId: string, expense: {
    amount: number;
    currency?: string;
    exchangeRate?: number;
    description: string;
    date: string;
    type: 'FIXED' | 'VARIABLE';
    categoryId: string;
    beneficiaryId?: string;
  }) => Promise<PersonalExpense>;
  updateExpense: (walletId: string, expenseId: string, updates: UpdateExpenseDto) => Promise<void>;
  deleteExpense: (walletId: string, expenseId: string) => Promise<void>;
  
  // Beneficiarios
  fetchBeneficiaries: (walletId: string) => Promise<void>;
  createBeneficiary: (walletId: string, beneficiary: { name: string; icon?: string }) => Promise<Beneficiary>;
  updateBeneficiary: (walletId: string, beneficiaryId: string, updates: { name?: string; icon?: string }) => Promise<void>;
  deleteBeneficiary: (walletId: string, beneficiaryId: string) => Promise<void>;
  
  // Miembros
  inviteMember: (walletId: string, email: string) => Promise<void>;
  removeMember: (walletId: string, memberId: string) => Promise<void>;
  
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  clearError: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  // Initial state
  wallets: [],
  currentWallet: null,
  expenses: [],
  categories: [],
  currencies: [],
  beneficiaries: [],
  summary: null,
  isLoading: false,
  error: null,
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),

  // Actions
  fetchWallets: async () => {
    set({ isLoading: true, error: null });
    try {
      const wallets = await walletService.getMyWallets();
      set({ wallets, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar billeteras', isLoading: false });
    }
  },

  fetchWallet: async (walletId: string) => {
    set({ isLoading: true, error: null });
    try {
      const wallet = await walletService.getById(walletId);
      set({ currentWallet: wallet, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar billetera', isLoading: false });
    }
  },

  fetchExpenses: async (walletId: string, month?: number, year?: number) => {
    set({ isLoading: true, error: null });
    try {
      const { selectedMonth, selectedYear } = get();
      const expenses = await walletService.getExpenses(
        walletId,
        month || selectedMonth,
        year || selectedYear
      );
      set({ expenses, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar gastos', isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await walletService.getCategories();
      set({ categories });
    } catch (error: any) {
      console.error('Error al cargar categorías:', error);
    }
  },

  fetchCurrencies: async () => {
    try {
      const currencies = await walletService.getCurrencies();
      set({ currencies });
    } catch (error: any) {
      console.error('Error al cargar monedas:', error);
    }
  },

  fetchSummary: async (walletId: string, month: number, year: number) => {
    set({ isLoading: true, error: null });
    try {
      const summary = await walletService.getMonthlySummary(walletId, month, year);
      set({ summary, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar resumen', isLoading: false });
    }
  },

  createWallet: async (name: string, type?: string, currency?: string) => {
    set({ isLoading: true, error: null });
    try {
      const wallet = await walletService.create({ name, type, currency });
      set((state) => ({ wallets: [wallet, ...state.wallets], isLoading: false }));
      return wallet;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear billetera', isLoading: false });
      throw error;
    }
  },

  updateWallet: async (walletId: string, updates: { name?: string; currency?: string }) => {
    set({ isLoading: true, error: null });
    try {
      const updatedWallet = await walletService.update(walletId, updates);
      set((state) => ({
        wallets: state.wallets.map((w) => (w.id === walletId ? updatedWallet : w)),
        currentWallet: state.currentWallet?.id === walletId ? updatedWallet : state.currentWallet,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar billetera', isLoading: false });
      throw error;
    }
  },

  deleteWallet: async (walletId: string) => {
    set({ isLoading: true, error: null });
    try {
      await walletService.delete(walletId);
      set((state) => ({
        wallets: state.wallets.filter((w) => w.id !== walletId),
        currentWallet: state.currentWallet?.id === walletId ? null : state.currentWallet,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar billetera', isLoading: false });
      throw error;
    }
  },

  createExpense: async (walletId: string, expense) => {
    set({ isLoading: true, error: null });
    try {
      const newExpense = await walletService.createExpense(walletId, expense);
      set((state) => ({
        expenses: [newExpense, ...state.expenses],
        isLoading: false,
      }));
      return newExpense;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear gasto', isLoading: false });
      throw error;
    }
  },

  updateExpense: async (walletId: string, expenseId: string, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedExpense = await walletService.updateExpense(walletId, expenseId, updates);
      set((state) => ({
        expenses: state.expenses.map((e) => (e.id === expenseId ? updatedExpense : e)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar gasto', isLoading: false });
      throw error;
    }
  },

  deleteExpense: async (walletId: string, expenseId: string) => {
    set({ isLoading: true, error: null });
    try {
      await walletService.deleteExpense(walletId, expenseId);
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== expenseId),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar gasto', isLoading: false });
      throw error;
    }
  },

  // Beneficiarios
  fetchBeneficiaries: async (walletId: string) => {
    try {
      const beneficiaries = await walletService.getBeneficiaries(walletId);
      set({ beneficiaries });
    } catch (error: any) {
      console.error('Error al cargar beneficiarios:', error);
    }
  },

  createBeneficiary: async (walletId: string, beneficiary) => {
    set({ isLoading: true, error: null });
    try {
      const newBeneficiary = await walletService.createBeneficiary(walletId, beneficiary);
      set((state) => ({
        beneficiaries: [...state.beneficiaries, newBeneficiary],
        isLoading: false,
      }));
      return newBeneficiary;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear beneficiario', isLoading: false });
      throw error;
    }
  },

  updateBeneficiary: async (walletId: string, beneficiaryId: string, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedBeneficiary = await walletService.updateBeneficiary(walletId, beneficiaryId, updates);
      set((state) => ({
        beneficiaries: state.beneficiaries.map((b) => (b.id === beneficiaryId ? updatedBeneficiary : b)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar beneficiario', isLoading: false });
      throw error;
    }
  },

  deleteBeneficiary: async (walletId: string, beneficiaryId: string) => {
    set({ isLoading: true, error: null });
    try {
      await walletService.deleteBeneficiary(walletId, beneficiaryId);
      set((state) => ({
        beneficiaries: state.beneficiaries.filter((b) => b.id !== beneficiaryId),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar beneficiario', isLoading: false });
      throw error;
    }
  },

  // Miembros
  inviteMember: async (walletId: string, email: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedWallet = await walletService.inviteMember(walletId, email);
      set((state) => ({
        currentWallet: updatedWallet,
        wallets: state.wallets.map((w) => (w.id === walletId ? updatedWallet : w)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al invitar miembro', isLoading: false });
      throw error;
    }
  },

  removeMember: async (walletId: string, memberId: string) => {
    set({ isLoading: true, error: null });
    try {
      await walletService.removeMember(walletId, memberId);
      set((state) => ({
        currentWallet: state.currentWallet ? {
          ...state.currentWallet,
          members: state.currentWallet.members?.filter((m) => m.userId !== memberId),
        } : null,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al remover miembro', isLoading: false });
      throw error;
    }
  },

  setSelectedMonth: (month: number) => set({ selectedMonth: month }),
  setSelectedYear: (year: number) => set({ selectedYear: year }),
  clearError: () => set({ error: null }),
}));

