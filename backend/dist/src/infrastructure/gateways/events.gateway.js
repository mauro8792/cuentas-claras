"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let EventsGateway = class EventsGateway {
    constructor() {
        this.logger = new common_1.Logger('EventsGateway');
    }
    handleConnection(client) {
        this.logger.log(`Cliente conectado: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Cliente desconectado: ${client.id}`);
    }
    handleJoinGroup(client, groupId) {
        client.join(`group_${groupId}`);
        this.logger.log(`Cliente ${client.id} se unió al grupo ${groupId}`);
        return { success: true };
    }
    handleJoinEvent(client, eventId) {
        client.join(`event_${eventId}`);
        this.logger.log(`Cliente ${client.id} se unió al evento ${eventId}`);
        return { success: true };
    }
    handleLeaveGroup(client, groupId) {
        client.leave(`group_${groupId}`);
        return { success: true };
    }
    handleLeaveEvent(client, eventId) {
        client.leave(`event_${eventId}`);
        return { success: true };
    }
    notifyExpenseCreated(eventId, expense) {
        this.server.to(`event_${eventId}`).emit('expenseCreated', expense);
        this.logger.log(`Notificando nuevo gasto en evento ${eventId}`);
    }
    notifyExpenseDeleted(eventId, expenseId) {
        this.server.to(`event_${eventId}`).emit('expenseDeleted', { expenseId });
    }
    notifyEventSettled(eventId) {
        this.server.to(`event_${eventId}`).emit('eventSettled', { eventId });
    }
    notifyDebtPaid(eventId, debtId) {
        this.server.to(`event_${eventId}`).emit('debtPaid', { debtId });
        this.logger.log(`💰 Pago registrado en evento ${eventId}`);
    }
    notifyGroupUpdated(groupId, data) {
        this.server.to(`group_${groupId}`).emit('groupUpdated', data);
    }
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinGroup'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleJoinGroup", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinEvent'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleJoinEvent", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveGroup'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleLeaveGroup", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveEvent'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleLeaveEvent", null);
exports.EventsGateway = EventsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    })
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map