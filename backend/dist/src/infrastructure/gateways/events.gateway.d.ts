import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private logger;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinGroup(client: Socket, groupId: string): {
        success: boolean;
    };
    handleJoinEvent(client: Socket, eventId: string): {
        success: boolean;
    };
    handleLeaveGroup(client: Socket, groupId: string): {
        success: boolean;
    };
    handleLeaveEvent(client: Socket, eventId: string): {
        success: boolean;
    };
    notifyExpenseCreated(eventId: string, expense: any): void;
    notifyExpenseDeleted(eventId: string, expenseId: string): void;
    notifyEventSettled(eventId: string): void;
    notifyDebtPaid(eventId: string, debtId: string): void;
    notifyGroupUpdated(groupId: string, data: any): void;
}
