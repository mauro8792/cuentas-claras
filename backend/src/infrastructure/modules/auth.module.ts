import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from '../controllers/auth.controller';
import { AuthUseCase } from '../../application/use-cases/auth.use-case';
import { UserRepository } from '../adapters/repositories/user.repository';
import { TokenRepository } from '../adapters/repositories/token.repository';
import { JwtStrategy } from '../guards/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION') || '7d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    UserRepository,
    TokenRepository,
    {
      provide: 'IUserRepositoryPort',
      useClass: UserRepository,
    },
    {
      provide: 'ITokenRepositoryPort',
      useClass: TokenRepository,
    },
    {
      provide: AuthUseCase,
      useFactory: (
        userRepo: UserRepository,
        tokenRepo: TokenRepository,
        jwtService: JwtService,
        configService: ConfigService,
      ) => new AuthUseCase(userRepo, tokenRepo, jwtService, configService),
      inject: [UserRepository, TokenRepository, JwtService, ConfigService],
    },
  ],
  exports: [AuthUseCase, JwtStrategy, PassportModule],
})
export class AuthModule {}

