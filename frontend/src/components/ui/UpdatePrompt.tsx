'use client';

import { useServiceWorker } from '@/hooks/useServiceWorker';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

export function UpdatePrompt() {
  const { isUpdateAvailable, isOffline, updateServiceWorker } = useServiceWorker();

  // Banner de offline
  if (isOffline) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
        <div className="bg-amber-500/90 backdrop-blur-lg text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <WifiOff className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Sin conexión - Modo offline</span>
        </div>
      </div>
    );
  }

  // Banner de actualización
  if (isUpdateAvailable) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
        <div className="bg-violet-600/95 backdrop-blur-lg text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">Nueva versión disponible</span>
          </div>
          <button
            onClick={updateServiceWorker}
            className="px-4 py-1.5 bg-white text-violet-600 rounded-lg text-sm font-semibold hover:bg-violet-100 transition-colors"
          >
            Actualizar
          </button>
        </div>
      </div>
    );
  }

  return null;
}

