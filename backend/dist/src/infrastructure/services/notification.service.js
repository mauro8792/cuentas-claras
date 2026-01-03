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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const admin = require("firebase-admin");
const prisma_service_1 = require("../persistence/prisma.service");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(NotificationService_1.name);
        this.initialized = false;
        this.initializeFirebase();
    }
    initializeFirebase() {
        if (admin.apps.length === 0) {
            try {
                const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
                    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
                    : null;
                if (serviceAccount) {
                    admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount),
                    });
                    this.initialized = true;
                    this.logger.log('✅ Firebase Admin inicializado correctamente');
                }
                else {
                    this.logger.warn('⚠️ FIREBASE_SERVICE_ACCOUNT no configurado - Notificaciones deshabilitadas');
                }
            }
            catch (error) {
                this.logger.error('❌ Error inicializando Firebase Admin:', error);
            }
        }
        else {
            this.initialized = true;
        }
    }
    async saveToken(userId, token, device) {
        await this.prisma.pushToken.upsert({
            where: { token },
            update: { userId, device, updatedAt: new Date() },
            create: { userId, token, device },
        });
        this.logger.log(`🔔 Token guardado para usuario ${userId}`);
    }
    async removeToken(token) {
        await this.prisma.pushToken.deleteMany({ where: { token } });
    }
    async sendToUser(userId, title, body, data) {
        if (!this.initialized) {
            this.logger.warn('Firebase no inicializado - notificación no enviada');
            return;
        }
        const tokens = await this.prisma.pushToken.findMany({
            where: { userId },
            select: { token: true },
        });
        if (tokens.length === 0) {
            this.logger.log(`Usuario ${userId} no tiene tokens registrados`);
            return;
        }
        const tokenStrings = tokens.map((t) => t.token);
        await this.sendToTokens(tokenStrings, title, body, data);
    }
    async sendToUsers(userIds, title, body, data) {
        if (!this.initialized)
            return;
        const tokens = await this.prisma.pushToken.findMany({
            where: { userId: { in: userIds } },
            select: { token: true },
        });
        if (tokens.length === 0)
            return;
        const tokenStrings = tokens.map((t) => t.token);
        await this.sendToTokens(tokenStrings, title, body, data);
    }
    async sendToGroup(groupId, title, body, data, excludeUserId) {
        if (!this.initialized)
            return;
        const members = await this.prisma.groupMember.findMany({
            where: { groupId },
            select: { userId: true },
        });
        const userIds = members
            .map((m) => m.userId)
            .filter((id) => id !== excludeUserId);
        await this.sendToUsers(userIds, title, body, data);
    }
    async sendToTokens(tokens, title, body, data) {
        if (tokens.length === 0)
            return;
        const message = {
            tokens,
            notification: {
                title,
                body,
            },
            data: data || {},
            webpush: {
                notification: {
                    icon: '/icons/web-app-manifest-192x192.png',
                    badge: '/icons/favicon-96x96.png',
                },
                fcmOptions: {
                    link: data?.url || '/dashboard',
                },
            },
        };
        try {
            const response = await admin.messaging().sendEachForMulticast(message);
            this.logger.log(`📤 Notificaciones enviadas: ${response.successCount} exitosas, ${response.failureCount} fallidas`);
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const error = resp.error;
                    if (error?.code === 'messaging/invalid-registration-token' ||
                        error?.code === 'messaging/registration-token-not-registered') {
                        failedTokens.push(tokens[idx]);
                    }
                }
            });
            if (failedTokens.length > 0) {
                await this.prisma.pushToken.deleteMany({
                    where: { token: { in: failedTokens } },
                });
                this.logger.log(`🗑️ ${failedTokens.length} tokens inválidos eliminados`);
            }
        }
        catch (error) {
            this.logger.error('Error enviando notificaciones:', error);
        }
    }
    async notifyNewExpense(groupId, expenseDescription, amount, paidByName, creatorId, eventId) {
        await this.sendToGroup(groupId, '💸 Nuevo gasto', `${paidByName} pagó $${amount.toLocaleString('es-AR')} - ${expenseDescription}`, { type: 'expense', eventId, url: `/events/${eventId}` }, creatorId);
    }
    async notifyDebtPaid(creditorId, debtorName, amount, eventId) {
        await this.sendToUser(creditorId, '💰 ¡Te pagaron!', `${debtorName} te pagó $${amount.toLocaleString('es-AR')}`, { type: 'payment', eventId, url: `/events/${eventId}` });
    }
    async notifyEventSettled(groupId, eventName, eventId) {
        await this.sendToGroup(groupId, '🎉 Evento liquidado', `"${eventName}" fue liquidado. Revisá cuánto debés.`, {
            type: 'settled',
            eventId,
            url: `/events/${eventId}`,
        });
    }
    async notifyAddedToGroup(userId, groupName, groupId) {
        await this.sendToUser(userId, '👥 Te agregaron a un grupo', `Te sumaron al grupo "${groupName}"`, {
            type: 'group',
            groupId,
            url: `/groups/${groupId}`,
        });
    }
    async notifyDebtReminder(debtorId, creditorName, amount, eventId) {
        await this.sendToUser(debtorId, '⏰ Recordatorio de deuda', `Le debés $${amount.toLocaleString('es-AR')} a ${creditorName}`, { type: 'reminder', eventId, url: `/events/${eventId}` });
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map