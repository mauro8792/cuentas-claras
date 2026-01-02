import { Module } from '@nestjs/common';
import { WalletController } from '../controllers/wallet.controller';
import { WalletUseCase } from '../../application/use-cases/wallet.use-case';
import { WalletRepository } from '../adapters/repositories/wallet.repository';
import { UserRepository } from '../adapters/repositories/user.repository';
import { WalletGateway } from '../gateways/wallet.gateway';
import { PrismaModule } from '../persistence/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WalletController],
  providers: [
    WalletRepository,
    UserRepository,
    WalletGateway,
    {
      provide: WalletUseCase,
      useFactory: (
        walletRepo: WalletRepository,
        userRepo: UserRepository,
        walletGateway: WalletGateway,
      ) => new WalletUseCase(walletRepo, userRepo, walletGateway),
      inject: [WalletRepository, UserRepository, WalletGateway],
    },
  ],
  exports: [WalletUseCase, WalletRepository, WalletGateway],
})
export class WalletModule {}

