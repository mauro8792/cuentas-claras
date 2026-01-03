"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseModule = void 0;
const common_1 = require("@nestjs/common");
const expense_controller_1 = require("../controllers/expense.controller");
const expense_use_case_1 = require("../../application/use-cases/expense.use-case");
const expense_repository_1 = require("../adapters/repositories/expense.repository");
const event_module_1 = require("./event.module");
const group_module_1 = require("./group.module");
const event_repository_1 = require("../adapters/repositories/event.repository");
const group_repository_1 = require("../adapters/repositories/group.repository");
const gateways_module_1 = require("../gateways/gateways.module");
let ExpenseModule = class ExpenseModule {
};
exports.ExpenseModule = ExpenseModule;
exports.ExpenseModule = ExpenseModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => event_module_1.EventModule), (0, common_1.forwardRef)(() => group_module_1.GroupModule), gateways_module_1.GatewaysModule],
        controllers: [expense_controller_1.ExpenseController],
        providers: [
            expense_repository_1.ExpenseRepository,
            {
                provide: expense_use_case_1.ExpenseUseCase,
                useFactory: (expenseRepo, eventRepo, groupRepo) => new expense_use_case_1.ExpenseUseCase(expenseRepo, eventRepo, groupRepo),
                inject: [expense_repository_1.ExpenseRepository, event_repository_1.EventRepository, group_repository_1.GroupRepository],
            },
        ],
        exports: [expense_use_case_1.ExpenseUseCase],
    })
], ExpenseModule);
//# sourceMappingURL=expense.module.js.map