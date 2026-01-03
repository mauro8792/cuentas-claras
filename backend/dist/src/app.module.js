"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./infrastructure/modules/auth.module");
const group_module_1 = require("./infrastructure/modules/group.module");
const event_module_1 = require("./infrastructure/modules/event.module");
const expense_module_1 = require("./infrastructure/modules/expense.module");
const bank_alias_module_1 = require("./infrastructure/modules/bank-alias.module");
const wallet_module_1 = require("./infrastructure/modules/wallet.module");
const prisma_module_1 = require("./infrastructure/persistence/prisma.module");
const gateways_module_1 = require("./infrastructure/gateways/gateways.module");
const notification_module_1 = require("./infrastructure/modules/notification.module");
const health_controller_1 = require("./infrastructure/controllers/health.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        controllers: [health_controller_1.HealthController],
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            prisma_module_1.PrismaModule,
            gateways_module_1.GatewaysModule,
            notification_module_1.NotificationModule,
            auth_module_1.AuthModule,
            group_module_1.GroupModule,
            event_module_1.EventModule,
            expense_module_1.ExpenseModule,
            bank_alias_module_1.BankAliasModule,
            wallet_module_1.WalletModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map