import { Module } from '@nestjs/common';
import { BankAliasController } from '../controllers/bank-alias.controller';
import { BankAliasUseCase } from '../../application/use-cases/bank-alias.use-case';
import { BankAliasRepository } from '../adapters/repositories/bank-alias.repository';
import { BANK_ALIAS_REPOSITORY } from '../../application/ports/output/bank-alias.repository.port';
import { PrismaModule } from '../persistence/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BankAliasController],
  providers: [
    BankAliasUseCase,
    {
      provide: BANK_ALIAS_REPOSITORY,
      useClass: BankAliasRepository,
    },
  ],
  exports: [BankAliasUseCase],
})
export class BankAliasModule {}

