import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check - mantiene el servidor despierto' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: '🚀 Server is alive!',
    };
  }
}

