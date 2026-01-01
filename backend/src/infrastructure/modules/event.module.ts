import { Module, forwardRef } from '@nestjs/common';
import { EventController } from '../controllers/event.controller';
import { EventUseCase } from '../../application/use-cases/event.use-case';
import { EventRepository } from '../adapters/repositories/event.repository';
import { GroupModule } from './group.module';
import { GroupRepository } from '../adapters/repositories/group.repository';
import { GatewaysModule } from '../gateways/gateways.module';

@Module({
  imports: [forwardRef(() => GroupModule), GatewaysModule],
  controllers: [EventController],
  providers: [
    EventRepository,
    {
      provide: EventUseCase,
      useFactory: (eventRepo: EventRepository, groupRepo: GroupRepository) =>
        new EventUseCase(eventRepo, groupRepo),
      inject: [EventRepository, GroupRepository],
    },
  ],
  exports: [EventUseCase, EventRepository],
})
export class EventModule {}

