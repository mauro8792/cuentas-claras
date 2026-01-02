'use client';

import { io, Socket } from 'socket.io-client';

// El backend corre en puerto 3001 (sin /api para WebSockets)
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private currentWalletId: string | null = null;
  private isConnecting: boolean = false;
  private reconnectTimer: NodeJS.Timeout | null = null;

  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  connect(): Promise<void> {
    return new Promise((resolve) => {
      // Si ya está conectado, resolver inmediatamente
      if (this.socket?.connected) {
        resolve();
        return;
      }

      // Si ya está intentando conectar, esperar
      if (this.isConnecting) {
        const checkInterval = setInterval(() => {
          if (this.socket?.connected) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        return;
      }

      this.isConnecting = true;
      console.log('🔌 Conectando a WebSocket:', `${SOCKET_URL}/wallets`);
      
      this.socket = io(`${SOCKET_URL}/wallets`, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
        timeout: 10000,
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket conectado:', this.socket?.id);
        this.isConnecting = false;
        
        // Reconectar a la wallet si estábamos en una
        if (this.currentWalletId) {
          this.socket?.emit('joinWallet', { walletId: this.currentWalletId });
        }
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Socket desconectado:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('🔌 Error de conexión:', error.message);
        this.isConnecting = false;
      });
    });
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentWalletId = null;
    this.isConnecting = false;
  }

  async joinWallet(walletId: string) {
    // Evitar unirse a la misma wallet múltiples veces
    if (this.currentWalletId === walletId && this.socket?.connected) {
      console.log('🏠 Ya unido a wallet:', walletId);
      return;
    }

    // Asegurar conexión
    await this.connect();

    // Si estábamos en otra wallet, salir
    if (this.currentWalletId && this.currentWalletId !== walletId) {
      this.socket?.emit('leaveWallet', { walletId: this.currentWalletId });
    }

    this.currentWalletId = walletId;
    this.socket?.emit('joinWallet', { walletId });
    console.log('🏠 Unido a wallet:', walletId);
  }

  leaveWallet(walletId: string) {
    if (this.currentWalletId === walletId) {
      this.socket?.emit('leaveWallet', { walletId });
      this.currentWalletId = null;
      console.log('👋 Salí de wallet:', walletId);
    }
  }

  // ==================== LISTENERS ====================
  // Cada método retorna función de cleanup

  onExpenseCreated(callback: (expense: any) => void) {
    const handler = (data: any) => {
      console.log('📥 expenseCreated:', data);
      callback(data);
    };
    this.socket?.off('expenseCreated'); // Remover listeners anteriores
    this.socket?.on('expenseCreated', handler);
    return () => this.socket?.off('expenseCreated', handler);
  }

  onExpenseUpdated(callback: (expense: any) => void) {
    this.socket?.off('expenseUpdated');
    this.socket?.on('expenseUpdated', callback);
    return () => this.socket?.off('expenseUpdated', callback);
  }

  onExpenseDeleted(callback: (data: { expenseId: string }) => void) {
    this.socket?.off('expenseDeleted');
    this.socket?.on('expenseDeleted', callback);
    return () => this.socket?.off('expenseDeleted', callback);
  }

  onMemberJoined(callback: (member: any) => void) {
    this.socket?.off('memberJoined');
    this.socket?.on('memberJoined', callback);
    return () => this.socket?.off('memberJoined', callback);
  }

  onMemberRemoved(callback: (data: { memberId: string }) => void) {
    this.socket?.off('memberRemoved');
    this.socket?.on('memberRemoved', callback);
    return () => this.socket?.off('memberRemoved', callback);
  }

  onBeneficiaryCreated(callback: (beneficiary: any) => void) {
    this.socket?.off('beneficiaryCreated');
    this.socket?.on('beneficiaryCreated', callback);
    return () => this.socket?.off('beneficiaryCreated', callback);
  }

  onBeneficiaryDeleted(callback: (data: { beneficiaryId: string }) => void) {
    this.socket?.off('beneficiaryDeleted');
    this.socket?.on('beneficiaryDeleted', callback);
    return () => this.socket?.off('beneficiaryDeleted', callback);
  }
}

// Singleton - una sola instancia para toda la app
export const socketService = new SocketService();
