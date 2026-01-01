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
import { GroupUseCase } from '../../application/use-cases/group.use-case';
import { ExpenseUseCase } from '../../application/use-cases/expense.use-case';
import { EventsGateway } from '../gateways/events.gateway';

export class CreateGroupDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100)
  name: string;
}

export class JoinGroupDto {
  @IsString()
  inviteCode: string;
}

@ApiTags('Groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupController {
  constructor(
    private readonly groupUseCase: GroupUseCase,
    private readonly expenseUseCase: ExpenseUseCase,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo grupo' })
  async create(@Request() req: any, @Body() dto: CreateGroupDto) {
    return this.groupUseCase.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener mis grupos' })
  async findMyGroups(@Request() req: any) {
    return this.groupUseCase.findUserGroups(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener grupo por ID' })
  async findById(@Request() req: any, @Param('id') id: string) {
    return this.groupUseCase.findById(id, req.user.id);
  }

  @Post('join')
  @ApiOperation({ summary: 'Unirse a un grupo por código de invitación' })
  async join(@Request() req: any, @Body() dto: JoinGroupDto) {
    const group = await this.groupUseCase.joinByInviteCode(req.user.id, dto.inviteCode);
    
    // Recalcular deudas para incluir al nuevo miembro en todos los gastos
    await this.expenseUseCase.recalculateDebtsForNewMember(group.id, req.user.id, false);
    
    // Notificar a todos los miembros del grupo
    this.eventsGateway.server.to(`group_${group.id}`).emit('memberJoined', {
      groupId: group.id,
      userId: req.user.id,
    });
    
    console.log(`👤 Nuevo miembro ${req.user.id} se unió al grupo ${group.id} - Deudas recalculadas`);
    
    return group;
  }

  @Get('invite/:code')
  @ApiOperation({ summary: 'Obtener info de grupo por código de invitación' })
  async findByInviteCode(@Param('code') code: string) {
    return this.groupUseCase.findByInviteCode(code);
  }

  @Delete(':id/leave')
  @ApiOperation({ summary: 'Abandonar grupo' })
  async leave(@Request() req: any, @Param('id') id: string) {
    return this.groupUseCase.leave(req.user.id, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar grupo (solo creador)' })
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.groupUseCase.delete(req.user.id, id);
  }
}

