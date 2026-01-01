import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional, Min, MinLength, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ExpenseUseCase } from '../../application/use-cases/expense.use-case';
import { EventsGateway } from '../gateways/events.gateway';

export class CreateExpenseDto {
  @IsNumber()
  @Min(1, { message: 'El monto debe ser mayor a 0' })
  amount: number;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  description: string;

  @IsOptional()
  @IsString()
  paidById?: string; // Usuario que pagó

  @IsOptional()
  @IsString()
  paidByGuestId?: string; // Invitado que pagó

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  participantIds?: string[]; // Usuarios que participan

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  guestParticipantIds?: string[]; // Invitados que participan
}

export class UpdateExpenseDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  participantIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  guestParticipantIds?: string[];
}

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpenseController {
  constructor(
    private readonly expenseUseCase: ExpenseUseCase,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @Post('event/:eventId')
  @ApiOperation({ summary: 'Crear nuevo gasto' })
  async create(
    @Request() req: any,
    @Param('eventId') eventId: string,
    @Body() dto: CreateExpenseDto,
  ) {
    const expense = await this.expenseUseCase.create(req.user.id, eventId, dto);
    // Notificar a todos los conectados al evento
    this.eventsGateway.notifyExpenseCreated(eventId, expense);
    return expense;
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Obtener gastos de un evento' })
  async findByEvent(@Request() req: any, @Param('eventId') eventId: string) {
    return this.expenseUseCase.findByEventId(req.user.id, eventId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener gasto por ID' })
  async findById(@Request() req: any, @Param('id') id: string) {
    return this.expenseUseCase.findById(req.user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar gasto' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    const expense = await this.expenseUseCase.update(req.user.id, id, dto);
    // Notificar a todos los conectados al evento
    this.eventsGateway.server.to(`event_${expense.eventId}`).emit('expenseUpdated', expense);
    return expense;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar gasto' })
  async delete(@Request() req: any, @Param('id') id: string) {
    // Obtener el gasto primero para saber el eventId
    const expense = await this.expenseUseCase.findById(req.user.id, id);
    await this.expenseUseCase.delete(req.user.id, id);
    // Notificar a todos los conectados al evento
    this.eventsGateway.notifyExpenseDeleted(expense.eventId, id);
    return { success: true };
  }

  // Deudas
  @Get('event/:eventId/debts')
  @ApiOperation({ summary: 'Obtener deudas de un evento' })
  async getEventDebts(@Request() req: any, @Param('eventId') eventId: string) {
    return this.expenseUseCase.getEventDebts(req.user.id, eventId);
  }

  @Get('event/:eventId/settlement')
  @ApiOperation({ summary: 'Obtener liquidación óptima de un evento' })
  async getSettlement(@Request() req: any, @Param('eventId') eventId: string) {
    return this.expenseUseCase.getOptimalSettlement(req.user.id, eventId);
  }

  @Post('debt/:debtId/pay')
  @ApiOperation({ summary: 'Marcar deuda como pagada' })
  async markPaid(
    @Request() req: any, 
    @Param('debtId') debtId: string,
    @Body() body: { eventId?: string },
  ) {
    const result = await this.expenseUseCase.markDebtAsPaid(req.user.id, debtId);
    // Notificar si tenemos el eventId
    if (body.eventId) {
      this.eventsGateway.notifyDebtPaid(body.eventId, debtId);
    }
    return result;
  }

  @Get('balance/me')
  @ApiOperation({ summary: 'Obtener mi balance general' })
  async getMyBalance(@Request() req: any) {
    return this.expenseUseCase.getUserBalance(req.user.id);
  }
}

