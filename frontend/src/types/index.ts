// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

export interface AuthUser extends User {
  accessToken: string;
  refreshToken: string;
}

// Guest Member (participante manual sin cuenta)
export interface GuestMember {
  id: string;
  name: string;
  groupId: string;
  addedById: string;
  createdAt: Date;
}

// Group types
export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  createdById: string;
  createdBy: User;
  members: User[];
  guestMembers?: GuestMember[];
  createdAt: Date;
}

export interface GroupMember {
  userId: string;
  user: User;
  joinedAt: Date;
}

// Event types
export type EventType = 'GIFT' | 'GATHERING';

export interface Event {
  id: string;
  groupId: string;
  name: string;
  type: EventType;
  date: Date;
  giftRecipientId?: string; // Solo para tipo GIFT (usuario)
  giftRecipient?: User;
  giftRecipientGuestId?: string; // Solo para tipo GIFT (invitado)
  giftRecipientGuest?: GuestMember;
  wishList?: WishListItem[];
  isSettled: boolean;
  settledAt?: Date;
  expenses: Expense[];
  createdAt: Date;
}

export interface WishListItem {
  id: string;
  eventId: string;
  description: string;
  url?: string;
  isPurchased: boolean;
  purchasedBy?: User;
}

// Expense types
export interface Expense {
  id: string;
  eventId: string;
  paidBy?: User;
  paidById?: string;
  paidByGuest?: GuestMember;
  paidByGuestId?: string;
  amount: number;
  description: string;
  participants?: User[];
  participantIds?: string[];
  guestParticipants?: GuestMember[];
  guestParticipantIds?: string[];
  createdAt: Date;
}

// Payment/Debt types
export interface Debt {
  fromUser: User;
  fromUserId: string;
  toUser: User;
  toUserId: string;
  amount: number;
  isPaid: boolean;
  paidAt?: Date;
}

export interface Settlement {
  eventId: string;
  debts: Debt[];
  totalAmount: number;
  perPersonAmount: number;
}

// Balance types (para vista de resumen)
export interface UserBalance {
  userId: string;
  user: User;
  owes: { toUser: User; amount: number }[];
  isOwed: { fromUser: User; amount: number }[];
  netBalance: number; // Positivo = le deben, Negativo = debe
}

export interface GroupBalance {
  groupId: string;
  balances: UserBalance[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface CreateGroupForm {
  name: string;
}

export interface CreateEventForm {
  name: string;
  type: EventType;
  date: Date;
  giftRecipientId?: string;
}

export interface CreateExpenseForm {
  amount: number;
  description: string;
  paidById?: string;
  paidByGuestId?: string;
  participantIds?: string[];
  guestParticipantIds?: string[];
}

export interface AddWishListItemForm {
  description: string;
  url?: string;
}

// ==================== WALLET TYPES (Gastos Personales) ====================

export type WalletType = 'PERSONAL' | 'SHARED';
export type PersonalExpenseType = 'FIXED' | 'VARIABLE';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  currency: string;
  inviteCode?: string;
  createdById: string;
  createdBy?: User;
  members?: WalletMember[];
  _count?: {
    expenses: number;
  };
  createdAt: Date;
  updatedAt: Date;
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

// Beneficiario/Dependiente (mascota, hijo, auto, etc.)
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
  category?: ExpenseCategory;
  beneficiary?: Beneficiary;
  paidBy?: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
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

export interface CreateWalletForm {
  name: string;
  type?: WalletType;
  currency?: string;
}

export interface CreatePersonalExpenseForm {
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

export interface CreateBeneficiaryForm {
  name: string;
  icon?: string;
}

