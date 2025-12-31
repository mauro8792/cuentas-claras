import { Module, Global } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Global() // Hace que el gateway esté disponible en toda la app
@Module({
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class GatewaysModule {}

