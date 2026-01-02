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
import { IsString, IsEnum, IsDateString, IsOptional, IsUrl, MinLength, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { EventUseCase } from '../../application/use-cases/event.use-case';
import { EventType } from '../../domain/entities/event.entity';
import { EventsGateway } from '../gateways/events.gateway';

export class CreateEventDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEnum(EventType)
  type: EventType;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  giftRecipientId?: string;

  @IsOptional()
  @IsString()
  giftRecipientGuestId?: string;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}

export class AddWishListItemDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  description: string;

  @IsOptional()
  @IsUrl()
  url?: string;
}

@ApiTags('Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventController {
  constructor(
    private readonly eventUseCase: EventUseCase,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @Post('group/:groupId')
  @ApiOperation({ summary: 'Crear nuevo evento' })
  async create(
    @Request() req: any,
    @Param('groupId') groupId: string,
    @Body() dto: CreateEventDto,
  ) {
    return this.eventUseCase.create(req.user.id, groupId, {
      ...dto,
      date: new Date(dto.date),
    });
  }

  @Get('group/:groupId')
  @ApiOperation({ summary: 'Obtener eventos de un grupo' })
  async findByGroup(@Request() req: any, @Param('groupId') groupId: string) {
    return this.eventUseCase.findByGroupId(req.user.id, groupId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener evento por ID' })
  async findById(@Request() req: any, @Param('id') id: string) {
    return this.eventUseCase.findById(req.user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar evento' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    const event = await this.eventUseCase.update(req.user.id, id, {
      ...dto,
      date: dto.date ? new Date(dto.date) : undefined,
    });
    // Notificar a todos los usuarios conectados
    this.eventsGateway.server.to(`event_${id}`).emit('eventUpdated', event);
    return event;
  }

  @Post(':id/settle')
  @ApiOperation({ summary: 'Liquidar evento' })
  async settle(@Request() req: any, @Param('id') id: string) {
    const result = await this.eventUseCase.settle(req.user.id, id);
    // Notificar a todos los usuarios conectados al evento
    this.eventsGateway.server.to(`event_${id}`).emit('eventSettled', { eventId: id });
    console.log(`🏁 Evento ${id} liquidado - notificando a usuarios`);
    return result;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar evento' })
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.eventUseCase.delete(req.user.id, id);
  }

  // Lista de deseos
  @Post(':id/wishlist')
  @ApiOperation({ summary: 'Agregar item a lista de deseos' })
  async addWishListItem(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: AddWishListItemDto,
  ) {
    return this.eventUseCase.addWishListItem(req.user.id, id, dto);
  }

  @Post('wishlist/:itemId/purchase')
  @ApiOperation({ summary: 'Marcar item como comprado' })
  async markPurchased(@Request() req: any, @Param('itemId') itemId: string) {
    return this.eventUseCase.markWishListItemPurchased(req.user.id, itemId);
  }

  @Delete('wishlist/:itemId')
  @ApiOperation({ summary: 'Eliminar item de lista de deseos' })
  async removeWishListItem(@Request() req: any, @Param('itemId') itemId: string) {
    return this.eventUseCase.removeWishListItem(req.user.id, itemId);
  }
}

