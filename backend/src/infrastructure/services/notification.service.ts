import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from '../persistence/prisma.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private initialized = false;

  constructor(private readonly prisma: PrismaService) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    if (admin.apps.length === 0) {
      try {
        // Usar credenciales de variable de entorno o archivo
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
          ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
          : null;

        if (serviceAccount) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          this.initialized = true;
          this.logger.log('✅ Firebase Admin inicializado correctamente');
        } else {
          this.logger.warn('⚠️ FIREBASE_SERVICE_ACCOUNT no configurado - Notificaciones deshabilitadas');
        }
      } catch (error) {
        this.logger.error('❌ Error inicializando Firebase Admin:', error);
      }
    } else {
      this.initialized = true;
    }
  }

  /**
   * Guarda o actualiza el token push de un usuario
   */
  async saveToken(userId: string, token: string, device?: string): Promise<void> {
    await this.prisma.pushToken.upsert({
      where: { token },
      update: { userId, device, updatedAt: new Date() },
      create: { userId, token, device },
    });
    this.logger.log(`🔔 Token guardado para usuario ${userId}`);
  }

  /**
   * Elimina un token (cuando el usuario cierra sesión)
   */
  async removeToken(token: string): Promise<void> {
    await this.prisma.pushToken.deleteMany({ where: { token } });
  }

  /**
   * Envía notificación a un usuario específico
   */
  async sendToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
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

  /**
   * Envía notificación a múltiples usuarios
   */
  async sendToUsers(
    userIds: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    if (!this.initialized) return;

    const tokens = await this.prisma.pushToken.findMany({
      where: { userId: { in: userIds } },
      select: { token: true },
    });

    if (tokens.length === 0) return;

    const tokenStrings = tokens.map((t) => t.token);
    await this.sendToTokens(tokenStrings, title, body, data);
  }

  /**
   * Envía notificación a todos los miembros de un grupo
   */
  async sendToGroup(
    groupId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
    excludeUserId?: string,
  ): Promise<void> {
    if (!this.initialized) return;

    const members = await this.prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });

    const userIds = members
      .map((m) => m.userId)
      .filter((id) => id !== excludeUserId);

    await this.sendToUsers(userIds, title, body, data);
  }

  /**
   * Envía notificación a tokens específicos
   */
  private async sendToTokens(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    if (tokens.length === 0) return;

    const message: admin.messaging.MulticastMessage = {
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
      this.logger.log(
        `📤 Notificaciones enviadas: ${response.successCount} exitosas, ${response.failureCount} fallidas`,
      );

      // Eliminar tokens inválidos
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const error = resp.error;
          if (
            error?.code === 'messaging/invalid-registration-token' ||
            error?.code === 'messaging/registration-token-not-registered'
          ) {
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
    } catch (error) {
      this.logger.error('Error enviando notificaciones:', error);
    }
  }

  // ==================== NOTIFICACIONES ESPECÍFICAS ====================

  async notifyNewExpense(
    groupId: string,
    expenseDescription: string,
    amount: number,
    paidByName: string,
    creatorId: string,
    eventId: string,
  ): Promise<void> {
    await this.sendToGroup(
      groupId,
      '💸 Nuevo gasto',
      `${paidByName} pagó $${amount.toLocaleString('es-AR')} - ${expenseDescription}`,
      { type: 'expense', eventId, url: `/events/${eventId}` },
      creatorId,
    );
  }

  async notifyDebtPaid(
    creditorId: string,
    debtorName: string,
    amount: number,
    eventId: string,
  ): Promise<void> {
    await this.sendToUser(
      creditorId,
      '💰 ¡Te pagaron!',
      `${debtorName} te pagó $${amount.toLocaleString('es-AR')}`,
      { type: 'payment', eventId, url: `/events/${eventId}` },
    );
  }

  async notifyEventSettled(groupId: string, eventName: string, eventId: string): Promise<void> {
    await this.sendToGroup(groupId, '🎉 Evento liquidado', `"${eventName}" fue liquidado. Revisá cuánto debés.`, {
      type: 'settled',
      eventId,
      url: `/events/${eventId}`,
    });
  }

  async notifyAddedToGroup(userId: string, groupName: string, groupId: string): Promise<void> {
    await this.sendToUser(userId, '👥 Te agregaron a un grupo', `Te sumaron al grupo "${groupName}"`, {
      type: 'group',
      groupId,
      url: `/groups/${groupId}`,
    });
  }

  async notifyDebtReminder(
    debtorId: string,
    creditorName: string,
    amount: number,
    eventId: string,
  ): Promise<void> {
    await this.sendToUser(
      debtorId,
      '⏰ Recordatorio de deuda',
      `Le debés $${amount.toLocaleString('es-AR')} a ${creditorName}`,
      { type: 'reminder', eventId, url: `/events/${eventId}` },
    );
  }
}

