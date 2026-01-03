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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let WalletGateway = class WalletGateway {
    constructor() {
        this.logger = new common_1.Logger('WalletGateway');
        this.userSockets = new Map();
    }
    handleConnection(client) {
        this.logger.log(`Cliente conectado: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Cliente desconectado: ${client.id}`);
        this.userSockets.forEach((sockets, odId) => {
            sockets.delete(client.id);
            if (sockets.size === 0) {
                this.userSockets.delete(odId);
            }
        });
    }
    handleJoinWallet(client, data) {
        client.join(`wallet:${data.walletId}`);
        if (!this.userSockets.has(data.userId)) {
            this.userSockets.set(data.userId, new Set());
        }
        this.userSockets.get(data.userId)?.add(client.id);
        this.logger.log(`Usuario ${data.userId} se unió a wallet:${data.walletId}`);
        return { success: true };
    }
    handleLeaveWallet(client, data) {
        client.leave(`wallet:${data.walletId}`);
        this.logger.log(`Cliente ${client.id} salió de wallet:${data.walletId}`);
        return { success: true };
    }
    emitExpenseCreated(walletId, expense) {
        this.server.to(`wallet:${walletId}`).emit('expenseCreated', expense);
        this.logger.log(`Emitido expenseCreated a wallet:${walletId}`);
    }
    emitExpenseUpdated(walletId, expense) {
        this.server.to(`wallet:${walletId}`).emit('expenseUpdated', expense);
        this.logger.log(`Emitido expenseUpdated a wallet:${walletId}`);
    }
    emitExpenseDeleted(walletId, expenseId) {
        this.server.to(`wallet:${walletId}`).emit('expenseDeleted', { expenseId });
        this.logger.log(`Emitido expenseDeleted a wallet:${walletId}`);
    }
    emitMemberJoined(walletId, member) {
        this.server.to(`wallet:${walletId}`).emit('memberJoined', member);
        this.logger.log(`Emitido memberJoined a wallet:${walletId}`);
    }
    emitMemberRemoved(walletId, memberId) {
        this.server.to(`wallet:${walletId}`).emit('memberRemoved', { memberId });
        this.logger.log(`Emitido memberRemoved a wallet:${walletId}`);
    }
    emitBeneficiaryCreated(walletId, beneficiary) {
        this.server.to(`wallet:${walletId}`).emit('beneficiaryCreated', beneficiary);
        this.logger.log(`Emitido beneficiaryCreated a wallet:${walletId}`);
    }
    emitBeneficiaryDeleted(walletId, beneficiaryId) {
        this.server.to(`wallet:${walletId}`).emit('beneficiaryDeleted', { beneficiaryId });
        this.logger.log(`Emitido beneficiaryDeleted a wallet:${walletId}`);
    }
    emitWalletUpdated(walletId) {
        this.server.to(`wallet:${walletId}`).emit('walletUpdated', { walletId });
        this.logger.log(`Emitido walletUpdated a wallet:${walletId}`);
    }
};
exports.WalletGateway = WalletGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WalletGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinWallet'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], WalletGateway.prototype, "handleJoinWallet", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveWallet'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], WalletGateway.prototype, "handleLeaveWallet", null);
exports.WalletGateway = WalletGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: '/wallets',
    })
], WalletGateway);
//# sourceMappingURL=wallet.gateway.js.map