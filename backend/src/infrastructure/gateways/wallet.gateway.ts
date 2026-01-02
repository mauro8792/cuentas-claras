import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // En producción, especificar el dominio del frontend
  },
  namespace: '/wallets',
})
export class WalletGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('WalletGateway');

  // Mapa de usuarios conectados: odId -> socketId
  private userSockets = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
    // Limpiar el socket de todos los usuarios
    this.userSockets.forEach((sockets, odId) => {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.userSockets.delete(odId);
      }
    });
  }

  // El cliente se une a una sala de billetera para recibir updates
  @SubscribeMessage('joinWallet')
  handleJoinWallet(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { walletId: string; userId: string },
  ) {
    client.join(`wallet:${data.walletId}`);
    
    // Guardar referencia del usuario
    if (!this.userSockets.has(data.userId)) {
      this.userSockets.set(data.userId, new Set());
    }
    this.userSockets.get(data.userId)?.add(client.id);
    
    this.logger.log(`Usuario ${data.userId} se unió a wallet:${data.walletId}`);
    return { success: true };
  }

  // El cliente sale de una sala
  @SubscribeMessage('leaveWallet')
  handleLeaveWallet(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { walletId: string },
  ) {
    client.leave(`wallet:${data.walletId}`);
    this.logger.log(`Cliente ${client.id} salió de wallet:${data.walletId}`);
    return { success: true };
  }

  // ==================== MÉTODOS PARA EMITIR EVENTOS ====================

  // Emitir cuando se crea un nuevo gasto
  emitExpenseCreated(walletId: string, expense: any) {
    this.server.to(`wallet:${walletId}`).emit('expenseCreated', expense);
    this.logger.log(`Emitido expenseCreated a wallet:${walletId}`);
  }

  // Emitir cuando se actualiza un gasto
  emitExpenseUpdated(walletId: string, expense: any) {
    this.server.to(`wallet:${walletId}`).emit('expenseUpdated', expense);
    this.logger.log(`Emitido expenseUpdated a wallet:${walletId}`);
  }

  // Emitir cuando se elimina un gasto
  emitExpenseDeleted(walletId: string, expenseId: string) {
    this.server.to(`wallet:${walletId}`).emit('expenseDeleted', { expenseId });
    this.logger.log(`Emitido expenseDeleted a wallet:${walletId}`);
  }

  // Emitir cuando un nuevo miembro se une
  emitMemberJoined(walletId: string, member: any) {
    this.server.to(`wallet:${walletId}`).emit('memberJoined', member);
    this.logger.log(`Emitido memberJoined a wallet:${walletId}`);
  }

  // Emitir cuando un miembro es removido
  emitMemberRemoved(walletId: string, memberId: string) {
    this.server.to(`wallet:${walletId}`).emit('memberRemoved', { memberId });
    this.logger.log(`Emitido memberRemoved a wallet:${walletId}`);
  }

  // Emitir cuando se crea un beneficiario
  emitBeneficiaryCreated(walletId: string, beneficiary: any) {
    this.server.to(`wallet:${walletId}`).emit('beneficiaryCreated', beneficiary);
    this.logger.log(`Emitido beneficiaryCreated a wallet:${walletId}`);
  }

  // Emitir cuando se elimina un beneficiario
  emitBeneficiaryDeleted(walletId: string, beneficiaryId: string) {
    this.server.to(`wallet:${walletId}`).emit('beneficiaryDeleted', { beneficiaryId });
    this.logger.log(`Emitido beneficiaryDeleted a wallet:${walletId}`);
  }

  // Emitir refresh general (para cuando se necesita recargar todo)
  emitWalletUpdated(walletId: string) {
    this.server.to(`wallet:${walletId}`).emit('walletUpdated', { walletId });
    this.logger.log(`Emitido walletUpdated a wallet:${walletId}`);
  }
}

