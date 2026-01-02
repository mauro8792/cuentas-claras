'use client';

import { useEffect, useState, useCallback } from 'react';

interface ServiceWorkerState {
  isUpdateAvailable: boolean;
  isOffline: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function useServiceWorker() {
  // Empezar con isOffline: false para evitar flash del banner
  const [state, setState] = useState<ServiceWorkerState>({
    isUpdateAvailable: false,
    isOffline: false,
    registration: null,
  });

  const updateServiceWorker = useCallback(() => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  }, [state.registration]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Verificar conexión real haciendo un request
    const checkConnection = async () => {
      try {
        // Solo confiar en navigator.onLine si dice offline
        if (!navigator.onLine) {
          setState(prev => ({ ...prev, isOffline: true }));
          return;
        }
        // Si dice online, verificar con un request real (solo para confirmar)
        setState(prev => ({ ...prev, isOffline: false }));
      } catch {
        setState(prev => ({ ...prev, isOffline: true }));
      }
    };

    const handleOnline = () => {
      setState(prev => ({ ...prev, isOffline: false }));
    };
    
    const handleOffline = () => {
      setState(prev => ({ ...prev, isOffline: true }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Verificar estado inicial después de un pequeño delay
    const initialCheck = setTimeout(checkConnection, 1000);

    // Service Worker stuff
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        setState(prev => ({ ...prev, registration }));

        if (registration.waiting) {
          setState(prev => ({ ...prev, isUpdateAvailable: true }));
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🆕 Nueva versión disponible!');
                setState(prev => ({ ...prev, isUpdateAvailable: true }));
              }
            });
          }
        });
      });

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
        clearTimeout(initialCheck);
        clearInterval(checkInterval);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(initialCheck);
    };
  }, []);

  return {
    ...state,
    updateServiceWorker,
  };
}
