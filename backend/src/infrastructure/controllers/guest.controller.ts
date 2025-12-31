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
  constructor(private readonly prisma: PrismaService) {}

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

    await this.prisma.guestMember.delete({ where: { id: guestId } });

    return { success: true };
  }
}

