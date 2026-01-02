import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  IWalletInputPort,
  CreateWalletDto,
  UpdateWalletDto,
  CreatePersonalExpenseDto,
  UpdatePersonalExpenseDto,
  CreateCategoryDto,
  InviteMemberDto,
  JoinWalletDto,
  CreateBeneficiaryDto,
  UpdateBeneficiaryDto,
} from '../ports/input/wallet.port';
import { WalletRepository } from '../../infrastructure/adapters/repositories/wallet.repository';
import { UserRepository } from '../../infrastructure/adapters/repositories/user.repository';
import {
  Wallet,
  PersonalExpense,
  ExpenseCategory,
  MonthlySummary,
  CategorySummary,
  SUPPORTED_CURRENCIES,
  Beneficiary,
} from '../../domain/entities/wallet.entity';
import { WalletGateway } from '../../infrastructure/gateways/wallet.gateway';

@Injectable()
export class WalletUseCase implements IWalletInputPort {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly userRepository: UserRepository,
    private readonly walletGateway?: WalletGateway, // Opcional para tests
  ) {}

  // ==================== BILLETERAS ====================

  async createWallet(userId: string, dto: CreateWalletDto): Promise<Wallet> {
    // Validar moneda
    const currency = dto.currency || 'ARS';
    const validCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === currency);
    if (!validCurrency) {
      throw new BadRequestException(
        `Moneda no soportada. Usa: ${SUPPORTED_CURRENCIES.map((c) => c.code).join(', ')}`,
      );
    }

    return this.walletRepository.createWallet({
      name: dto.name,
      type: dto.type || 'PERSONAL',
      currency,
      createdById: userId,
    });
  }

  async getUserWallets(userId: string): Promise<Wallet[]> {
    return this.walletRepository.findUserWallets(userId);
  }

  async getWalletById(userId: string, walletId: string): Promise<Wallet> {
    let wallet = await this.walletRepository.findWalletById(walletId);
    if (!wallet) {
      throw new NotFoundException('Billetera no encontrada');
    }

    const isMember = await this.walletRepository.isMember(walletId, userId);
    if (!isMember) {
      throw new ForbiddenException('No tienes acceso a esta billetera');
    }

    // Generar código de invitación si no existe (para billeteras antiguas)
    if (!wallet.inviteCode) {
      wallet = await this.walletRepository.generateInviteCode(walletId);
    }

    return wallet;
  }

  async updateWallet(
    userId: string,
    walletId: string,
    dto: UpdateWalletDto,
  ): Promise<Wallet> {
    const wallet = await this.getWalletById(userId, walletId);

    // Solo el owner puede actualizar
    const role = await this.walletRepository.getMemberRole(walletId, userId);
    if (role !== 'OWNER') {
      throw new ForbiddenException('Solo el dueño puede editar la billetera');
    }

    // Validar moneda si se cambia
    if (dto.currency) {
      const validCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === dto.currency);
      if (!validCurrency) {
        throw new BadRequestException(
          `Moneda no soportada. Usa: ${SUPPORTED_CURRENCIES.map((c) => c.code).join(', ')}`,
        );
      }
    }

    return this.walletRepository.updateWallet(walletId, dto);
  }

  async deleteWallet(userId: string, walletId: string): Promise<void> {
    const wallet = await this.getWalletById(userId, walletId);

    // Solo el owner puede eliminar
    if (wallet.createdById !== userId) {
      throw new ForbiddenException('Solo el creador puede eliminar la billetera');
    }

    await this.walletRepository.deleteWallet(walletId);
  }

  async joinByInviteCode(userId: string, dto: JoinWalletDto): Promise<Wallet> {
    const wallet = await this.walletRepository.findWalletByInviteCode(dto.inviteCode);
    if (!wallet) {
      throw new NotFoundException('Código de invitación inválido');
    }

    // Verificar que no sea ya miembro
    const isMember = await this.walletRepository.isMember(wallet.id, userId);
    if (isMember) {
      throw new BadRequestException('Ya sos miembro de esta billetera');
    }

    await this.walletRepository.addMember(wallet.id, userId, 'MEMBER');

    // Obtener datos del nuevo miembro para emitir
    const user = await this.userRepository.findById(userId);
    this.walletGateway?.emitMemberJoined(wallet.id, {
      userId,
      name: user?.name,
      email: user?.email,
    });

    return this.walletRepository.findWalletById(wallet.id) as Promise<Wallet>;
  }

  async inviteMember(
    userId: string,
    walletId: string,
    dto: InviteMemberDto,
  ): Promise<Wallet> {
    const wallet = await this.getWalletById(userId, walletId);

    // Solo el owner puede invitar
    const role = await this.walletRepository.getMemberRole(walletId, userId);
    if (role !== 'OWNER') {
      throw new ForbiddenException('Solo el dueño puede invitar miembros');
    }

    // Buscar usuario por email
    const userToInvite = await this.userRepository.findByEmail(dto.email);
    if (!userToInvite) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que no sea ya miembro
    const isMember = await this.walletRepository.isMember(walletId, userToInvite.id);
    if (isMember) {
      throw new BadRequestException('El usuario ya es miembro de esta billetera');
    }

    await this.walletRepository.addMember(walletId, userToInvite.id, 'MEMBER');

    // Emitir evento de nuevo miembro
    this.walletGateway?.emitMemberJoined(walletId, {
      userId: userToInvite.id,
      name: userToInvite.name,
      email: userToInvite.email,
    });

    return this.walletRepository.findWalletById(walletId) as Promise<Wallet>;
  }

  async removeMember(
    userId: string,
    walletId: string,
    memberId: string,
  ): Promise<void> {
    await this.getWalletById(userId, walletId);

    // Solo el owner puede remover
    const role = await this.walletRepository.getMemberRole(walletId, userId);
    if (role !== 'OWNER') {
      throw new ForbiddenException('Solo el dueño puede remover miembros');
    }

    // No puede removerse a sí mismo si es owner
    if (memberId === userId) {
      throw new BadRequestException('No puedes removerte a ti mismo como dueño');
    }

    await this.walletRepository.removeMember(walletId, memberId);

    // Emitir evento de miembro removido
    this.walletGateway?.emitMemberRemoved(walletId, memberId);
  }

  // ==================== GASTOS PERSONALES ====================

  async createExpense(
    userId: string,
    walletId: string,
    dto: CreatePersonalExpenseDto,
  ): Promise<PersonalExpense> {
    await this.getWalletById(userId, walletId);

    // Validar categoría
    const category = await this.walletRepository.findCategoryById(dto.categoryId);
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Validar moneda
    const currency = dto.currency || 'ARS';
    const validCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === currency);
    if (!validCurrency) {
      throw new BadRequestException(
        `Moneda no soportada. Usa: ${SUPPORTED_CURRENCIES.map((c) => c.code).join(', ')}`,
      );
    }

    // Validar beneficiario si se especifica
    if (dto.beneficiaryId) {
      const beneficiary = await this.walletRepository.findBeneficiaryById(dto.beneficiaryId);
      if (!beneficiary || beneficiary.walletId !== walletId) {
        throw new NotFoundException('Beneficiario no encontrado en esta billetera');
      }
    }

    const expense = await this.walletRepository.createExpense({
      walletId,
      categoryId: dto.categoryId,
      beneficiaryId: dto.beneficiaryId,
      amount: dto.amount,
      currency,
      exchangeRate: dto.exchangeRate,
      description: dto.description,
      date: new Date(dto.date),
      type: dto.type,
      paidById: userId,
      isRecurring: dto.isRecurring,
    });

    // Emitir evento de WebSocket
    this.walletGateway?.emitExpenseCreated(walletId, expense);

    return expense;
  }

  async getWalletExpenses(
    userId: string,
    walletId: string,
    month?: number,
    year?: number,
  ): Promise<PersonalExpense[]> {
    await this.getWalletById(userId, walletId);

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (month && year) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59);
    }

    return this.walletRepository.findWalletExpenses(walletId, startDate, endDate);
  }

  async getExpenseById(
    userId: string,
    walletId: string,
    expenseId: string,
  ): Promise<PersonalExpense> {
    await this.getWalletById(userId, walletId);

    const expense = await this.walletRepository.findExpenseById(expenseId);
    if (!expense || expense.walletId !== walletId) {
      throw new NotFoundException('Gasto no encontrado');
    }

    return expense;
  }

  async updateExpense(
    userId: string,
    walletId: string,
    expenseId: string,
    dto: UpdatePersonalExpenseDto,
  ): Promise<PersonalExpense> {
    const expense = await this.getExpenseById(userId, walletId, expenseId);

    // Solo quien creó el gasto puede editarlo
    if (expense.paidById !== userId) {
      throw new ForbiddenException('Solo quien registró el gasto puede editarlo');
    }

    // Validar categoría si se cambia
    if (dto.categoryId) {
      const category = await this.walletRepository.findCategoryById(dto.categoryId);
      if (!category) {
        throw new NotFoundException('Categoría no encontrada');
      }
    }

    // Validar moneda si se cambia
    if (dto.currency) {
      const validCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === dto.currency);
      if (!validCurrency) {
        throw new BadRequestException(
          `Moneda no soportada. Usa: ${SUPPORTED_CURRENCIES.map((c) => c.code).join(', ')}`,
        );
      }
    }

    // Validar beneficiario si se especifica
    if (dto.beneficiaryId) {
      const beneficiary = await this.walletRepository.findBeneficiaryById(dto.beneficiaryId);
      if (!beneficiary || beneficiary.walletId !== walletId) {
        throw new NotFoundException('Beneficiario no encontrado en esta billetera');
      }
    }

    const updateData: Partial<PersonalExpense> = {
      ...dto,
      date: dto.date ? new Date(dto.date) : undefined,
    };

    const updatedExpense = await this.walletRepository.updateExpense(expenseId, updateData);

    // Emitir evento de WebSocket
    this.walletGateway?.emitExpenseUpdated(walletId, updatedExpense);

    return updatedExpense;
  }

  async deleteExpense(
    userId: string,
    walletId: string,
    expenseId: string,
  ): Promise<void> {
    const expense = await this.getExpenseById(userId, walletId, expenseId);

    // Solo quien creó el gasto puede eliminarlo (o el owner)
    const role = await this.walletRepository.getMemberRole(walletId, userId);
    if (expense.paidById !== userId && role !== 'OWNER') {
      throw new ForbiddenException('No tienes permiso para eliminar este gasto');
    }

    await this.walletRepository.deleteExpense(expenseId);

    // Emitir evento de WebSocket
    this.walletGateway?.emitExpenseDeleted(walletId, expenseId);
  }

  // ==================== CATEGORÍAS ====================

  async getCategories(userId: string): Promise<ExpenseCategory[]> {
    return this.walletRepository.findUserCategories(userId);
  }

  async createCategory(userId: string, dto: CreateCategoryDto): Promise<ExpenseCategory> {
    return this.walletRepository.createCategory({
      name: dto.name,
      icon: dto.icon,
      color: dto.color,
      userId,
    });
  }

  async deleteCategory(userId: string, categoryId: string): Promise<void> {
    const category = await this.walletRepository.findCategoryById(categoryId);
    
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    if (category.isDefault) {
      throw new ForbiddenException('No se pueden eliminar categorías predeterminadas');
    }

    if (category.userId !== userId) {
      throw new ForbiddenException('Solo puedes eliminar tus propias categorías');
    }

    await this.walletRepository.deleteCategory(categoryId);
  }

  // ==================== BENEFICIARIOS ====================

  async getBeneficiaries(userId: string, walletId: string): Promise<Beneficiary[]> {
    await this.getWalletById(userId, walletId);
    return this.walletRepository.findBeneficiariesByWallet(walletId);
  }

  async createBeneficiary(
    userId: string,
    walletId: string,
    dto: CreateBeneficiaryDto,
  ): Promise<Beneficiary> {
    await this.getWalletById(userId, walletId);

    const beneficiary = await this.walletRepository.createBeneficiary({
      walletId,
      name: dto.name,
      icon: dto.icon || '👤',
    });

    // Emitir evento de WebSocket
    this.walletGateway?.emitBeneficiaryCreated(walletId, beneficiary);

    return beneficiary;
  }

  async updateBeneficiary(
    userId: string,
    walletId: string,
    beneficiaryId: string,
    dto: UpdateBeneficiaryDto,
  ): Promise<Beneficiary> {
    await this.getWalletById(userId, walletId);

    const beneficiary = await this.walletRepository.findBeneficiaryById(beneficiaryId);
    if (!beneficiary || beneficiary.walletId !== walletId) {
      throw new NotFoundException('Beneficiario no encontrado en esta billetera');
    }

    return this.walletRepository.updateBeneficiary(beneficiaryId, dto);
  }

  async deleteBeneficiary(
    userId: string,
    walletId: string,
    beneficiaryId: string,
  ): Promise<void> {
    await this.getWalletById(userId, walletId);

    const beneficiary = await this.walletRepository.findBeneficiaryById(beneficiaryId);
    if (!beneficiary || beneficiary.walletId !== walletId) {
      throw new NotFoundException('Beneficiario no encontrado en esta billetera');
    }

    await this.walletRepository.deleteBeneficiary(beneficiaryId);

    // Emitir evento de WebSocket
    this.walletGateway?.emitBeneficiaryDeleted(walletId, beneficiaryId);
  }

  // ==================== RESUMEN ====================

  async getMonthlySummary(
    userId: string,
    walletId: string,
    month: number,
    year: number,
  ): Promise<MonthlySummary> {
    const wallet = await this.getWalletById(userId, walletId);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Obtener gastos del mes
    const expenses = await this.walletRepository.findWalletExpenses(
      walletId,
      startDate,
      endDate,
    );

    // Calcular totales por tipo
    const totalFixed = expenses
      .filter((e) => e.type === 'FIXED')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalVariable = expenses
      .filter((e) => e.type === 'VARIABLE')
      .reduce((sum, e) => sum + e.amount, 0);

    // Calcular totales por categoría
    const categoryMap = new Map<string, CategorySummary>();
    
    for (const expense of expenses) {
      const existing = categoryMap.get(expense.categoryId);
      if (existing) {
        existing.total += expense.amount;
        existing.count += 1;
      } else if (expense.category) {
        categoryMap.set(expense.categoryId, {
          categoryId: expense.categoryId,
          categoryName: expense.category.name,
          categoryIcon: expense.category.icon,
          categoryColor: expense.category.color,
          total: expense.amount,
          percentage: 0,
          count: 1,
        });
      }
    }

    const total = totalFixed + totalVariable;
    const byCategory = Array.from(categoryMap.values())
      .map((cat) => ({
        ...cat,
        percentage: total > 0 ? Math.round((cat.total / total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // Calcular comparación con mes anterior
    const prevStartDate = new Date(year, month - 2, 1);
    const prevEndDate = new Date(year, month - 1, 0, 23, 59, 59);
    const prevExpenses = await this.walletRepository.findWalletExpenses(
      walletId,
      prevStartDate,
      prevEndDate,
    );
    const previousMonth = prevExpenses.reduce((sum, e) => sum + e.amount, 0);

    const percentageChange = previousMonth > 0
      ? Math.round(((total - previousMonth) / previousMonth) * 100)
      : 0;

    return {
      month,
      year,
      currency: wallet.currency,
      totalFixed,
      totalVariable,
      total,
      byCategory,
      comparison: {
        previousMonth,
        percentageChange,
      },
    };
  }
}

