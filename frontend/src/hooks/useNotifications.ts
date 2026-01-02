'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { requestNotificationPermission, onForegroundMessage } from '@/lib/firebase';
import { notificationService } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';

export function useNotifications() {
  const { isAuthenticated } = useAuthStore();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Verificar soporte y permiso actual, y si ya tiene permiso, obtener el token
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // Si ya tiene permiso pero no tenemos token, obtenerlo automáticamente
      if (Notification.permission === 'granted' && isAuthenticated && !token) {
        console.log('🔄 Permiso ya otorgado, obteniendo token automáticamente...');
        requestNotificationPermission().then(async (fcmToken) => {
          if (fcmToken) {
            console.log('📱 Token obtenido:', fcmToken.substring(0, 20) + '...');
            try {
              await notificationService.saveToken(fcmToken);
              setToken(fcmToken);
              console.log('✅ Token guardado en backend');
            } catch (error) {
              console.error('❌ Error guardando token:', error);
            }
          } else {
            console.log('❌ No se pudo obtener token FCM');
          }
        });
      }
    }
  }, [isAuthenticated, token]);

  // Escuchar mensajes en primer plano
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = onForegroundMessage((payload) => {
      const { title, body } = payload.notification || {};
      
      // Mostrar toast con la notificación
      toast(body || 'Nueva notificación', {
        icon: '🔔',
        duration: 5000,
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '1px solid #334155',
        },
      });
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [isAuthenticated]);

  // Solicitar permiso y registrar token
  const enableNotifications = useCallback(async () => {
    console.log('🔔 enableNotifications llamado');
    console.log('isSupported:', isSupported, 'isAuthenticated:', isAuthenticated);
    
    if (!isSupported || !isAuthenticated) {
      toast.error('Las notificaciones no están disponibles');
      return false;
    }

    setIsLoading(true);

    try {
      console.log('📱 Solicitando token FCM...');
      const fcmToken = await requestNotificationPermission();
      console.log('📱 Token FCM recibido:', fcmToken ? 'Sí (longitud: ' + fcmToken.length + ')' : 'No');
      
      if (fcmToken) {
        // Guardar token en el backend
        console.log('💾 Guardando token en backend...');
        await notificationService.saveToken(fcmToken);
        console.log('✅ Token guardado correctamente');
        setToken(fcmToken);
        setPermission('granted');
        toast.success('¡Notificaciones activadas!', { icon: '🔔' });
        return true;
      } else {
        console.log('❌ No se obtuvo token FCM');
        setPermission(Notification.permission);
        if (Notification.permission === 'denied') {
          toast.error('Las notificaciones están bloqueadas. Habilitálas en la configuración del navegador.');
        }
        return false;
      }
    } catch (error) {
      console.error('❌ Error al activar notificaciones:', error);
      toast.error('Error al activar notificaciones');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, isAuthenticated]);

  // Desactivar notificaciones
  const disableNotifications = useCallback(async () => {
    if (token) {
      try {
        await notificationService.removeToken(token);
        setToken(null);
        toast.success('Notificaciones desactivadas');
      } catch (error) {
        console.error('Error al desactivar notificaciones:', error);
      }
    }
  }, [token]);

  return {
    isSupported,
    permission,
    isEnabled: permission === 'granted' && !!token,
    isLoading,
    enableNotifications,
    disableNotifications,
  };
}

