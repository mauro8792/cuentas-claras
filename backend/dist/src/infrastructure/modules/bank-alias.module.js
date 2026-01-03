"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankAliasModule = void 0;
const common_1 = require("@nestjs/common");
const bank_alias_controller_1 = require("../controllers/bank-alias.controller");
const bank_alias_use_case_1 = require("../../application/use-cases/bank-alias.use-case");
const bank_alias_repository_1 = require("../adapters/repositories/bank-alias.repository");
const bank_alias_repository_port_1 = require("../../application/ports/output/bank-alias.repository.port");
const prisma_module_1 = require("../persistence/prisma.module");
let BankAliasModule = class BankAliasModule {
};
exports.BankAliasModule = BankAliasModule;
exports.BankAliasModule = BankAliasModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [bank_alias_controller_1.BankAliasController],
        providers: [
            bank_alias_use_case_1.BankAliasUseCase,
            {
                provide: bank_alias_repository_port_1.BANK_ALIAS_REPOSITORY,
                useClass: bank_alias_repository_1.BankAliasRepository,
            },
        ],
        exports: [bank_alias_use_case_1.BankAliasUseCase],
    })
], BankAliasModule);
//# sourceMappingURL=bank-alias.module.js.map