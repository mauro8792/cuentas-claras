import { Module, Global } from '@nestjs/common';
import { NotificationController } from '../controllers/notification.controller';
import { NotificationService } from '../services/notification.service';
import { PrismaModule } from '../persistence/prisma.module';

@Global() // Hacerlo global para que se pueda inyectar en cualquier módulo
@Module({
  imports: [PrismaModule],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}

