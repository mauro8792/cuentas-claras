'use client';

import { useEffect, useState, useCallback } from 'react';

interface ServiceWorkerState {
  isUpdateAvailable: boolean;
  isOffline: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isUpdateAvailable: false,
    isOffline: !navigator.onLine,
    registration: null,
  });

  const updateServiceWorker = useCallback(() => {
    if (state.registration?.waiting) {
      // Decirle al service worker que se active
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    // Recargar la página para obtener la nueva versión
    window.location.reload();
  }, [state.registration]);

  useEffect(() => {
    // Solo en producción y si soporta service workers
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const handleOnline = () => setState(prev => ({ ...prev, isOffline: false }));
    const handleOffline = () => setState(prev => ({ ...prev, isOffline: true }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Registrar y monitorear el service worker
    navigator.serviceWorker.ready.then((registration) => {
      setState(prev => ({ ...prev, registration }));

      // Verificar si ya hay una actualización esperando
      if (registration.waiting) {
        setState(prev => ({ ...prev, isUpdateAvailable: true }));
      }

      // Escuchar nuevas actualizaciones
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nueva versión disponible
              console.log('🆕 Nueva versión de la app disponible!');
              setState(prev => ({ ...prev, isUpdateAvailable: true }));
            }
          });
        }
      });
    });

    // Escuchar cuando el SW toma el control (después de skipWaiting)
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    // Verificar actualizaciones cada 5 minutos
    const checkInterval = setInterval(() => {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update().catch(console.error);
      });
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(checkInterval);
    };
  }, []);

  return {
    ...state,
    updateServiceWorker,
  };
}

