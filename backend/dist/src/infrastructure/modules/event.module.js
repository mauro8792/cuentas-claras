"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventModule = void 0;
const common_1 = require("@nestjs/common");
const event_controller_1 = require("../controllers/event.controller");
const event_use_case_1 = require("../../application/use-cases/event.use-case");
const event_repository_1 = require("../adapters/repositories/event.repository");
const group_module_1 = require("./group.module");
const group_repository_1 = require("../adapters/repositories/group.repository");
const gateways_module_1 = require("../gateways/gateways.module");
let EventModule = class EventModule {
};
exports.EventModule = EventModule;
exports.EventModule = EventModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => group_module_1.GroupModule), gateways_module_1.GatewaysModule],
        controllers: [event_controller_1.EventController],
        providers: [
            event_repository_1.EventRepository,
            {
                provide: event_use_case_1.EventUseCase,
                useFactory: (eventRepo, groupRepo) => new event_use_case_1.EventUseCase(eventRepo, groupRepo),
                inject: [event_repository_1.EventRepository, group_repository_1.GroupRepository],
            },
        ],
        exports: [event_use_case_1.EventUseCase, event_repository_1.EventRepository],
    })
], EventModule);
//# sourceMappingURL=event.module.js.map