import { Module } from '@nestjs/common';
import { GroupController } from '../controllers/group.controller';
import { GuestController } from '../controllers/guest.controller';
import { GroupUseCase } from '../../application/use-cases/group.use-case';
import { GroupRepository } from '../adapters/repositories/group.repository';

@Module({
  controllers: [GroupController, GuestController],
  providers: [
    GroupRepository,
    {
      provide: GroupUseCase,
      useFactory: (groupRepo: GroupRepository) => new GroupUseCase(groupRepo),
      inject: [GroupRepository],
    },
  ],
  exports: [GroupUseCase, GroupRepository],
})
export class GroupModule {}

