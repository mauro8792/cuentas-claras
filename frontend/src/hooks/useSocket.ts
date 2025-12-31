import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Conectar al servidor de WebSocket
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('🔌 Conectado al servidor WebSocket');
    });

    socketRef.current.on('disconnect', () => {
      console.log('🔌 Desconectado del servidor WebSocket');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const joinEvent = useCallback((eventId: string) => {
    socketRef.current?.emit('joinEvent', eventId);
  }, []);

  const leaveEvent = useCallback((eventId: string) => {
    socketRef.current?.emit('leaveEvent', eventId);
  }, []);

  const joinGroup = useCallback((groupId: string) => {
    socketRef.current?.emit('joinGroup', groupId);
  }, []);

  const leaveGroup = useCallback((groupId: string) => {
    socketRef.current?.emit('leaveGroup', groupId);
  }, []);

  const onExpenseCreated = useCallback((callback: (expense: any) => void) => {
    socketRef.current?.on('expenseCreated', callback);
    return () => {
      socketRef.current?.off('expenseCreated', callback);
    };
  }, []);

  const onExpenseDeleted = useCallback((callback: (data: { expenseId: string }) => void) => {
    socketRef.current?.on('expenseDeleted', callback);
    return () => {
      socketRef.current?.off('expenseDeleted', callback);
    };
  }, []);

  const onEventSettled = useCallback((callback: (data: { eventId: string }) => void) => {
    socketRef.current?.on('eventSettled', callback);
    return () => {
      socketRef.current?.off('eventSettled', callback);
    };
  }, []);

  const onDebtPaid = useCallback((callback: (data: { debtId: string }) => void) => {
    socketRef.current?.on('debtPaid', callback);
    return () => {
      socketRef.current?.off('debtPaid', callback);
    };
  }, []);

  const onGroupUpdated = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on('groupUpdated', callback);
    return () => {
      socketRef.current?.off('groupUpdated', callback);
    };
  }, []);

  return {
    socket: socketRef.current,
    joinEvent,
    leaveEvent,
    joinGroup,
    leaveGroup,
    onExpenseCreated,
    onExpenseDeleted,
    onEventSettled,
    onDebtPaid,
    onGroupUpdated,
  };
}

