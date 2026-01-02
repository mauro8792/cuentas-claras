import {
  Controller,
  Post,
  Delete,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { NotificationService } from '../services/notification.service';

class SaveTokenDto {
  @IsString()
  token: string;

  @IsOptional()
  @IsString()
  device?: string;
}

class RemoveTokenDto {
  @IsString()
  token: string;
}

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('token')
  @ApiOperation({ summary: 'Guardar token de notificaciones push' })
  async saveToken(@Request() req: any, @Body() dto: SaveTokenDto) {
    await this.notificationService.saveToken(req.user.id, dto.token, dto.device);
    return { success: true, message: 'Token guardado correctamente' };
  }

  @Delete('token')
  @ApiOperation({ summary: 'Eliminar token de notificaciones push' })
  async removeToken(@Body() dto: RemoveTokenDto) {
    await this.notificationService.removeToken(dto.token);
    return { success: true, message: 'Token eliminado correctamente' };
  }
}

