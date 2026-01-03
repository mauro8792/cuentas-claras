"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_use_case_1 = require("../../application/use-cases/auth.use-case");
const user_repository_1 = require("../adapters/repositories/user.repository");
const token_repository_1 = require("../adapters/repositories/token.repository");
const jwt_strategy_1 = require("../guards/jwt.strategy");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: {
                        expiresIn: configService.get('JWT_EXPIRATION') || '7d',
                    },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            jwt_strategy_1.JwtStrategy,
            user_repository_1.UserRepository,
            token_repository_1.TokenRepository,
            {
                provide: 'IUserRepositoryPort',
                useClass: user_repository_1.UserRepository,
            },
            {
                provide: 'ITokenRepositoryPort',
                useClass: token_repository_1.TokenRepository,
            },
            {
                provide: auth_use_case_1.AuthUseCase,
                useFactory: (userRepo, tokenRepo, jwtService, configService) => new auth_use_case_1.AuthUseCase(userRepo, tokenRepo, jwtService, configService),
                inject: [user_repository_1.UserRepository, token_repository_1.TokenRepository, jwt_1.JwtService, config_1.ConfigService],
            },
        ],
        exports: [auth_use_case_1.AuthUseCase, jwt_strategy_1.JwtStrategy, passport_1.PassportModule],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map