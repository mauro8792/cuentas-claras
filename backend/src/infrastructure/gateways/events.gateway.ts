import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // En producción, limitar a tu dominio
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('EventsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  // Cliente se une a la "sala" de un grupo para recibir actualizaciones
  @SubscribeMessage('joinGroup')
  handleJoinGroup(client: Socket, groupId: string) {
    client.join(`group_${groupId}`);
    this.logger.log(`Cliente ${client.id} se unió al grupo ${groupId}`);
    return { success: true };
  }

  // Cliente se une a la "sala" de un evento
  @SubscribeMessage('joinEvent')
  handleJoinEvent(client: Socket, eventId: string) {
    client.join(`event_${eventId}`);
    this.logger.log(`Cliente ${client.id} se unió al evento ${eventId}`);
    return { success: true };
  }

  // Cliente sale de una sala
  @SubscribeMessage('leaveGroup')
  handleLeaveGroup(client: Socket, groupId: string) {
    client.leave(`group_${groupId}`);
    return { success: true };
  }

  @SubscribeMessage('leaveEvent')
  handleLeaveEvent(client: Socket, eventId: string) {
    client.leave(`event_${eventId}`);
    return { success: true };
  }

  // Métodos para emitir eventos a los clientes

  // Notificar que se creó un gasto
  notifyExpenseCreated(eventId: string, expense: any) {
    this.server.to(`event_${eventId}`).emit('expenseCreated', expense);
    this.logger.log(`Notificando nuevo gasto en evento ${eventId}`);
  }

  // Notificar que se eliminó un gasto
  notifyExpenseDeleted(eventId: string, expenseId: string) {
    this.server.to(`event_${eventId}`).emit('expenseDeleted', { expenseId });
  }

  // Notificar que se liquidó un evento
  notifyEventSettled(eventId: string) {
    this.server.to(`event_${eventId}`).emit('eventSettled', { eventId });
  }

  // Notificar que se marcó una deuda como pagada
  notifyDebtPaid(eventId: string, debtId: string) {
    this.server.to(`event_${eventId}`).emit('debtPaid', { debtId });
    this.logger.log(`💰 Pago registrado en evento ${eventId}`);
  }

  // Notificar cambios en un grupo (nuevo evento, nuevo miembro, etc.)
  notifyGroupUpdated(groupId: string, data: any) {
    this.server.to(`group_${groupId}`).emit('groupUpdated', data);
  }
}

