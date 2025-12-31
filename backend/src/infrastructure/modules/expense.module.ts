import { Module } from '@nestjs/common';
import { ExpenseController } from '../controllers/expense.controller';
import { ExpenseUseCase } from '../../application/use-cases/expense.use-case';
import { ExpenseRepository } from '../adapters/repositories/expense.repository';
import { EventModule } from './event.module';
import { GroupModule } from './group.module';
import { EventRepository } from '../adapters/repositories/event.repository';
import { GroupRepository } from '../adapters/repositories/group.repository';

@Module({
  imports: [EventModule, GroupModule],
  controllers: [ExpenseController],
  providers: [
    ExpenseRepository,
    {
      provide: ExpenseUseCase,
      useFactory: (
        expenseRepo: ExpenseRepository,
        eventRepo: EventRepository,
        groupRepo: GroupRepository,
      ) => new ExpenseUseCase(expenseRepo, eventRepo, groupRepo),
      inject: [ExpenseRepository, EventRepository, GroupRepository],
    },
  ],
  exports: [ExpenseUseCase],
})
export class ExpenseModule {}

