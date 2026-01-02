import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Wallet,
  WalletType,
  PersonalExpense,
  PersonalExpenseType,
  ExpenseCategory,
  MonthlySummary,
  Beneficiary,
} from '../../../domain/entities/wallet.entity';

// ==================== DTOs ====================

export class CreateWalletDto {
  @ApiProperty({ example: 'Gastos Personales' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ enum: ['PERSONAL', 'SHARED'], default: 'PERSONAL' })
  @IsOptional()
  @IsEnum(['PERSONAL', 'SHARED'])
  type?: WalletType;

  @ApiPropertyOptional({ example: 'ARS', default: 'ARS' })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class UpdateWalletDto {
  @ApiPropertyOptional({ example: 'Mi Billetera' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class CreatePersonalExpenseDto {
  @ApiProperty({ example: 15000 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ example: 'ARS', default: 'ARS' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 1050 })
  @IsOptional()
  @IsNumber()
  exchangeRate?: number;

  @ApiProperty({ example: 'Alquiler departamento' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  description: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ enum: ['FIXED', 'VARIABLE'] })
  @IsEnum(['FIXED', 'VARIABLE'])
  type: PersonalExpenseType;

  @ApiProperty({ example: 'category-id-here' })
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({ example: 'beneficiary-id-here' })
  @IsOptional()
  @IsString()
  beneficiaryId?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;
}

export class UpdatePersonalExpenseDto {
  @ApiPropertyOptional({ example: 15000 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiPropertyOptional({ example: 'ARS' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 1050 })
  @IsOptional()
  @IsNumber()
  exchangeRate?: number;

  @ApiPropertyOptional({ example: 'Alquiler actualizado' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  description?: string;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ enum: ['FIXED', 'VARIABLE'] })
  @IsOptional()
  @IsEnum(['FIXED', 'VARIABLE'])
  type?: PersonalExpenseType;

  @ApiPropertyOptional({ example: 'category-id-here' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'beneficiary-id-here' })
  @IsOptional()
  @IsString()
  beneficiaryId?: string;
}

export class CreateCategoryDto {
  @ApiProperty({ example: 'Gimnasio' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: '💪' })
  @IsString()
  icon: string;

  @ApiProperty({ example: '#FF5733' })
  @IsString()
  color: string;
}

export class InviteMemberDto {
  @ApiProperty({ example: 'usuario@email.com' })
  @IsString()
  email: string;
}

export class JoinWalletDto {
  @ApiProperty({ example: 'abc123xyz' })
  @IsString()
  inviteCode: string;
}

// ==================== Beneficiarios DTOs ====================

export class CreateBeneficiaryDto {
  @ApiProperty({ example: 'Pepe' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ example: '🐕', default: '👤' })
  @IsOptional()
  @IsString()
  icon?: string;
}

export class UpdateBeneficiaryDto {
  @ApiPropertyOptional({ example: 'Pepe' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ example: '🐕' })
  @IsOptional()
  @IsString()
  icon?: string;
}

// ==================== Input Port ====================

export interface IWalletInputPort {
  // Billeteras
  createWallet(userId: string, dto: CreateWalletDto): Promise<Wallet>;
  getUserWallets(userId: string): Promise<Wallet[]>;
  getWalletById(userId: string, walletId: string): Promise<Wallet>;
  updateWallet(userId: string, walletId: string, dto: UpdateWalletDto): Promise<Wallet>;
  deleteWallet(userId: string, walletId: string): Promise<void>;
  joinByInviteCode(userId: string, dto: JoinWalletDto): Promise<Wallet>;
  inviteMember(userId: string, walletId: string, dto: InviteMemberDto): Promise<Wallet>;
  removeMember(userId: string, walletId: string, memberId: string): Promise<void>;

  // Gastos personales
  createExpense(userId: string, walletId: string, dto: CreatePersonalExpenseDto): Promise<PersonalExpense>;
  getWalletExpenses(userId: string, walletId: string, month?: number, year?: number): Promise<PersonalExpense[]>;
  getExpenseById(userId: string, walletId: string, expenseId: string): Promise<PersonalExpense>;
  updateExpense(userId: string, walletId: string, expenseId: string, dto: UpdatePersonalExpenseDto): Promise<PersonalExpense>;
  deleteExpense(userId: string, walletId: string, expenseId: string): Promise<void>;

  // Categorías
  getCategories(userId: string): Promise<ExpenseCategory[]>;
  createCategory(userId: string, dto: CreateCategoryDto): Promise<ExpenseCategory>;
  deleteCategory(userId: string, categoryId: string): Promise<void>;

  // Beneficiarios
  getBeneficiaries(userId: string, walletId: string): Promise<Beneficiary[]>;
  createBeneficiary(userId: string, walletId: string, dto: CreateBeneficiaryDto): Promise<Beneficiary>;
  updateBeneficiary(userId: string, walletId: string, beneficiaryId: string, dto: UpdateBeneficiaryDto): Promise<Beneficiary>;
  deleteBeneficiary(userId: string, walletId: string, beneficiaryId: string): Promise<void>;

  // Resumen
  getMonthlySummary(userId: string, walletId: string, month: number, year: number): Promise<MonthlySummary>;
}

