"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletModule = void 0;
const common_1 = require("@nestjs/common");
const wallet_controller_1 = require("../controllers/wallet.controller");
const wallet_use_case_1 = require("../../application/use-cases/wallet.use-case");
const wallet_repository_1 = require("../adapters/repositories/wallet.repository");
const user_repository_1 = require("../adapters/repositories/user.repository");
const wallet_gateway_1 = require("../gateways/wallet.gateway");
const prisma_module_1 = require("../persistence/prisma.module");
let WalletModule = class WalletModule {
};
exports.WalletModule = WalletModule;
exports.WalletModule = WalletModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [wallet_controller_1.WalletController],
        providers: [
            wallet_repository_1.WalletRepository,
            user_repository_1.UserRepository,
            wallet_gateway_1.WalletGateway,
            {
                provide: wallet_use_case_1.WalletUseCase,
                useFactory: (walletRepo, userRepo, walletGateway) => new wallet_use_case_1.WalletUseCase(walletRepo, userRepo, walletGateway),
                inject: [wallet_repository_1.WalletRepository, user_repository_1.UserRepository, wallet_gateway_1.WalletGateway],
            },
        ],
        exports: [wallet_use_case_1.WalletUseCase, wallet_repository_1.WalletRepository, wallet_gateway_1.WalletGateway],
    })
], WalletModule);
//# sourceMappingURL=wallet.module.js.map