import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class WalletGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private logger;
    private userSockets;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinWallet(client: Socket, data: {
        walletId: string;
        userId: string;
    }): {
        success: boolean;
    };
    handleLeaveWallet(client: Socket, data: {
        walletId: string;
    }): {
        success: boolean;
    };
    emitExpenseCreated(walletId: string, expense: any): void;
    emitExpenseUpdated(walletId: string, expense: any): void;
    emitExpenseDeleted(walletId: string, expenseId: string): void;
    emitMemberJoined(walletId: string, member: any): void;
    emitMemberRemoved(walletId: string, memberId: string): void;
    emitBeneficiaryCreated(walletId: string, beneficiary: any): void;
    emitBeneficiaryDeleted(walletId: string, beneficiaryId: string): void;
    emitWalletUpdated(walletId: string): void;
}
