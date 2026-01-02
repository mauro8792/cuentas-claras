import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WalletUseCase } from '../../application/use-cases/wallet.use-case';
import {
  CreateWalletDto,
  UpdateWalletDto,
  CreatePersonalExpenseDto,
  UpdatePersonalExpenseDto,
  CreateCategoryDto,
  InviteMemberDto,
  JoinWalletDto,
  CreateBeneficiaryDto,
  UpdateBeneficiaryDto,
} from '../../application/ports/input/wallet.port';
import { SUPPORTED_CURRENCIES } from '../../domain/entities/wallet.entity';

@ApiTags('Wallets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallets')
export class WalletController {
  constructor(private readonly walletUseCase: WalletUseCase) {}

  // ==================== MONEDAS ====================

  @Get('currencies')
  @ApiOperation({ summary: 'Obtener monedas soportadas' })
  getCurrencies() {
    return SUPPORTED_CURRENCIES;
  }

  // ==================== CATEGORÍAS ====================

  @Get('categories')
  @ApiOperation({ summary: 'Obtener categorías de gastos' })
  async getCategories(@Request() req: any) {
    return this.walletUseCase.getCategories(req.user.id);
  }

  @Post('categories')
  @ApiOperation({ summary: 'Crear categoría personalizada' })
  async createCategory(@Request() req: any, @Body() dto: CreateCategoryDto) {
    return this.walletUseCase.createCategory(req.user.id, dto);
  }

  @Delete('categories/:categoryId')
  @ApiOperation({ summary: 'Eliminar categoría personalizada' })
  async deleteCategory(
    @Request() req: any,
    @Param('categoryId') categoryId: string,
  ) {
    await this.walletUseCase.deleteCategory(req.user.id, categoryId);
    return { message: 'Categoría eliminada' };
  }

  // ==================== BILLETERAS ====================

  @Post('join')
  @ApiOperation({ summary: 'Unirse a billetera por código de invitación' })
  async joinWallet(@Request() req: any, @Body() dto: JoinWalletDto) {
    return this.walletUseCase.joinByInviteCode(req.user.id, dto);
  }

  @Post()
  @ApiOperation({ summary: 'Crear billetera' })
  async createWallet(@Request() req: any, @Body() dto: CreateWalletDto) {
    return this.walletUseCase.createWallet(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener mis billeteras' })
  async getMyWallets(@Request() req: any) {
    return this.walletUseCase.getUserWallets(req.user.id);
  }

  @Get(':walletId')
  @ApiOperation({ summary: 'Obtener billetera por ID' })
  async getWallet(@Request() req: any, @Param('walletId') walletId: string) {
    return this.walletUseCase.getWalletById(req.user.id, walletId);
  }

  @Put(':walletId')
  @ApiOperation({ summary: 'Actualizar billetera' })
  async updateWallet(
    @Request() req: any,
    @Param('walletId') walletId: string,
    @Body() dto: UpdateWalletDto,
  ) {
    return this.walletUseCase.updateWallet(req.user.id, walletId, dto);
  }

  @Delete(':walletId')
  @ApiOperation({ summary: 'Eliminar billetera' })
  async deleteWallet(@Request() req: any, @Param('walletId') walletId: string) {
    await this.walletUseCase.deleteWallet(req.user.id, walletId);
    return { message: 'Billetera eliminada' };
  }

  // ==================== MIEMBROS ====================

  @Post(':walletId/members')
  @ApiOperation({ summary: 'Invitar miembro a billetera' })
  async inviteMember(
    @Request() req: any,
    @Param('walletId') walletId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.walletUseCase.inviteMember(req.user.id, walletId, dto);
  }

  @Delete(':walletId/members/:memberId')
  @ApiOperation({ summary: 'Remover miembro de billetera' })
  async removeMember(
    @Request() req: any,
    @Param('walletId') walletId: string,
    @Param('memberId') memberId: string,
  ) {
    await this.walletUseCase.removeMember(req.user.id, walletId, memberId);
    return { message: 'Miembro removido' };
  }

  // ==================== BENEFICIARIOS ====================

  @Get(':walletId/beneficiaries')
  @ApiOperation({ summary: 'Obtener beneficiarios de billetera' })
  async getBeneficiaries(
    @Request() req: any,
    @Param('walletId') walletId: string,
  ) {
    return this.walletUseCase.getBeneficiaries(req.user.id, walletId);
  }

  @Post(':walletId/beneficiaries')
  @ApiOperation({ summary: 'Crear beneficiario (mascota, hijo, auto, etc.)' })
  async createBeneficiary(
    @Request() req: any,
    @Param('walletId') walletId: string,
    @Body() dto: CreateBeneficiaryDto,
  ) {
    return this.walletUseCase.createBeneficiary(req.user.id, walletId, dto);
  }

  @Put(':walletId/beneficiaries/:beneficiaryId')
  @ApiOperation({ summary: 'Actualizar beneficiario' })
  async updateBeneficiary(
    @Request() req: any,
    @Param('walletId') walletId: string,
    @Param('beneficiaryId') beneficiaryId: string,
    @Body() dto: UpdateBeneficiaryDto,
  ) {
    return this.walletUseCase.updateBeneficiary(req.user.id, walletId, beneficiaryId, dto);
  }

  @Delete(':walletId/beneficiaries/:beneficiaryId')
  @ApiOperation({ summary: 'Eliminar beneficiario' })
  async deleteBeneficiary(
    @Request() req: any,
    @Param('walletId') walletId: string,
    @Param('beneficiaryId') beneficiaryId: string,
  ) {
    await this.walletUseCase.deleteBeneficiary(req.user.id, walletId, beneficiaryId);
    return { message: 'Beneficiario eliminado' };
  }

  // ==================== GASTOS ====================

  @Post(':walletId/expenses')
  @ApiOperation({ summary: 'Crear gasto' })
  async createExpense(
    @Request() req: any,
    @Param('walletId') walletId: string,
    @Body() dto: CreatePersonalExpenseDto,
  ) {
    return this.walletUseCase.createExpense(req.user.id, walletId, dto);
  }

  @Get(':walletId/expenses')
  @ApiOperation({ summary: 'Obtener gastos de billetera' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  async getExpenses(
    @Request() req: any,
    @Param('walletId') walletId: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.walletUseCase.getWalletExpenses(
      req.user.id,
      walletId,
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
  }

  @Get(':walletId/expenses/:expenseId')
  @ApiOperation({ summary: 'Obtener gasto por ID' })
  async getExpense(
    @Request() req: any,
    @Param('walletId') walletId: string,
    @Param('expenseId') expenseId: string,
  ) {
    return this.walletUseCase.getExpenseById(req.user.id, walletId, expenseId);
  }

  @Put(':walletId/expenses/:expenseId')
  @ApiOperation({ summary: 'Actualizar gasto' })
  async updateExpense(
    @Request() req: any,
    @Param('walletId') walletId: string,
    @Param('expenseId') expenseId: string,
    @Body() dto: UpdatePersonalExpenseDto,
  ) {
    return this.walletUseCase.updateExpense(req.user.id, walletId, expenseId, dto);
  }

  @Delete(':walletId/expenses/:expenseId')
  @ApiOperation({ summary: 'Eliminar gasto' })
  async deleteExpense(
    @Request() req: any,
    @Param('walletId') walletId: string,
    @Param('expenseId') expenseId: string,
  ) {
    await this.walletUseCase.deleteExpense(req.user.id, walletId, expenseId);
    return { message: 'Gasto eliminado' };
  }

  // ==================== RESUMEN ====================

  @Get(':walletId/summary')
  @ApiOperation({ summary: 'Obtener resumen mensual' })
  @ApiQuery({ name: 'month', required: true, type: Number })
  @ApiQuery({ name: 'year', required: true, type: Number })
  async getMonthlySummary(
    @Request() req: any,
    @Param('walletId') walletId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.walletUseCase.getMonthlySummary(
      req.user.id,
      walletId,
      parseInt(month),
      parseInt(year),
    );
  }
}

