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
  constructor(private readonly groupUseCase: GroupUseCase) {}

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
    return this.groupUseCase.joinByInviteCode(req.user.id, dto.inviteCode);
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

