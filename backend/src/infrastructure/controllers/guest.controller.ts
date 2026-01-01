import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PrismaService } from '../persistence/prisma.service';
import { ExpenseUseCase } from '../../application/use-cases/expense.use-case';
import { EventsGateway } from '../gateways/events.gateway';

export class CreateGuestDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100)
  name: string;
}

@ApiTags('Guests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('groups/:groupId/guests')
export class GuestController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly expenseUseCase: ExpenseUseCase,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Agregar participante manual al grupo' })
  async create(
    @Request() req: any,
    @Param('groupId') groupId: string,
    @Body() dto: CreateGuestDto,
  ) {
    // Verificar que el usuario es miembro del grupo
    const membership = await this.prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: req.user.id, groupId } },
    });

    if (!membership) {
      throw new Error('No sos miembro de este grupo');
    }

    // Crear el participante invitado
    const guest = await this.prisma.guestMember.create({
      data: {
        name: dto.name,
        groupId,
        addedById: req.user.id,
      },
    });

    // Recalcular deudas para incluir al nuevo invitado en todos los gastos
    await this.expenseUseCase.recalculateDebtsForNewMember(groupId, guest.id, true);

    // Notificar a todos los miembros del grupo
    this.eventsGateway.server.to(`group_${groupId}`).emit('guestAdded', {
      groupId,
      guest,
    });

    console.log(`👤 Nuevo invitado ${guest.name} agregado al grupo ${groupId} - Deudas recalculadas`);

    return guest;
  }

  @Get()
  @ApiOperation({ summary: 'Obtener participantes manuales del grupo' })
  async findAll(@Request() req: any, @Param('groupId') groupId: string) {
    // Verificar que el usuario es miembro del grupo
    const membership = await this.prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: req.user.id, groupId } },
    });

    if (!membership) {
      throw new Error('No sos miembro de este grupo');
    }

    return this.prisma.guestMember.findMany({
      where: { groupId },
      include: { addedBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  @Delete(':guestId')
  @ApiOperation({ summary: 'Eliminar participante manual' })
  async delete(
    @Request() req: any,
    @Param('groupId') groupId: string,
    @Param('guestId') guestId: string,
  ) {
    // Verificar que el usuario es miembro del grupo
    const membership = await this.prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: req.user.id, groupId } },
    });

    if (!membership) {
      throw new Error('No sos miembro de este grupo');
    }

    // Verificar que el guest existe y pertenece al grupo
    const guest = await this.prisma.guestMember.findFirst({
      where: { id: guestId, groupId },
    });

    if (!guest) {
      throw new Error('Participante no encontrado');
    }

    // PRIMERO: Recalcular deudas quitando a este invitado de los gastos
    await this.expenseUseCase.recalculateDebtsOnMemberLeave(groupId, guestId, true);

    // LUEGO: Eliminar al invitado
    await this.prisma.guestMember.delete({ where: { id: guestId } });

    // Notificar a todos los miembros del grupo
    this.eventsGateway.server.to(`group_${groupId}`).emit('guestRemoved', {
      groupId,
      guestId,
      guestName: guest.name,
    });

    console.log(`👤 Invitado ${guest.name} eliminado del grupo ${groupId} - Deudas recalculadas`);

    return { success: true };
  }
}

