"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupModule = void 0;
const common_1 = require("@nestjs/common");
const group_controller_1 = require("../controllers/group.controller");
const guest_controller_1 = require("../controllers/guest.controller");
const group_use_case_1 = require("../../application/use-cases/group.use-case");
const group_repository_1 = require("../adapters/repositories/group.repository");
const expense_module_1 = require("./expense.module");
const gateways_module_1 = require("../gateways/gateways.module");
let GroupModule = class GroupModule {
};
exports.GroupModule = GroupModule;
exports.GroupModule = GroupModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => expense_module_1.ExpenseModule), gateways_module_1.GatewaysModule],
        controllers: [group_controller_1.GroupController, guest_controller_1.GuestController],
        providers: [
            group_repository_1.GroupRepository,
            {
                provide: group_use_case_1.GroupUseCase,
                useFactory: (groupRepo) => new group_use_case_1.GroupUseCase(groupRepo),
                inject: [group_repository_1.GroupRepository],
            },
        ],
        exports: [group_use_case_1.GroupUseCase, group_repository_1.GroupRepository],
    })
], GroupModule);
//# sourceMappingURL=group.module.js.map