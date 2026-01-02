import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './infrastructure/modules/auth.module';
import { GroupModule } from './infrastructure/modules/group.module';
import { EventModule } from './infrastructure/modules/event.module';
import { ExpenseModule } from './infrastructure/modules/expense.module';
import { BankAliasModule } from './infrastructure/modules/bank-alias.module';
import { PrismaModule } from './infrastructure/persistence/prisma.module';
import { GatewaysModule } from './infrastructure/gateways/gateways.module';
import { NotificationModule } from './infrastructure/modules/notification.module';
import { HealthController } from './infrastructure/controllers/health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    GatewaysModule, // WebSocket para tiempo real
    NotificationModule, // Push notifications
    AuthModule,
    GroupModule,
    EventModule,
    ExpenseModule,
    BankAliasModule,
  ],
})
export class AppModule {}

