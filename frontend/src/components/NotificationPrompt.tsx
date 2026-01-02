'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const { permission, isSupported, isEnabled, enableNotifications } = useNotifications();

  useEffect(() => {
    // Debug logs
    console.log('🔔 NotificationPrompt - isSupported:', isSupported);
    console.log('🔔 NotificationPrompt - permission:', permission);
    console.log('🔔 NotificationPrompt - isEnabled:', isEnabled);
    
    // Verificar si ya mostramos el prompt antes
    const hasSeenPrompt = localStorage.getItem('notification_prompt_seen');
    console.log('🔔 NotificationPrompt - hasSeenPrompt:', hasSeenPrompt);
    
    // Mostrar si:
    // 1. Las notificaciones están soportadas
    // 2. El permiso está en "default" O está en "denied" (para informar al usuario)
    // 3. No hemos mostrado el prompt antes
    // 4. Las notificaciones no están ya habilitadas
    const shouldShow = isSupported && 
                       (permission === 'default' || permission === 'denied') && 
                       !hasSeenPrompt &&
                       !isEnabled;
    
    console.log('🔔 NotificationPrompt - shouldShow:', shouldShow);
    
    if (shouldShow) {
      // Esperar 2 segundos después de cargar para no ser intrusivos
      const timer = setTimeout(() => {
        console.log('🔔 NotificationPrompt - Mostrando modal');
        setShowPrompt(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission, isEnabled]);

  const handleEnable = async () => {
    localStorage.setItem('notification_prompt_seen', 'true');
    await enableNotifications();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('notification_prompt_seen', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Icono */}
        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>

        {/* Título */}
        <h3 className="text-xl font-bold text-white text-center mb-2">
          {permission === 'denied' ? '🔕 Notificaciones bloqueadas' : '¡No te pierdas nada! 🔔'}
        </h3>

        {/* Descripción */}
        {permission === 'denied' ? (
          <div className="text-slate-300 text-center text-sm mb-6">
            <p className="mb-3">Las notificaciones están bloqueadas en tu navegador.</p>
            <p className="text-amber-400 text-xs">
              Para habilitarlas, hacé click en el 🔒 de la barra de direcciones → Permisos → Notificaciones → Permitir
            </p>
          </div>
        ) : (
          <p className="text-slate-300 text-center text-sm mb-6">
            Activá las notificaciones para saber cuando tus amigos agreguen gastos o te deban plata.
          </p>
        )}

        {/* Beneficios - solo mostrar si no está denegado */}
        {permission !== 'denied' && (
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <span className="text-teal-400">✓</span>
              <span>Enteráte cuando agreguen un gasto</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <span className="text-teal-400">✓</span>
              <span>Recibí avisos de pagos pendientes</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <span className="text-teal-400">✓</span>
              <span>Mirá cuando liquiden un evento</span>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-col gap-3">
          {permission !== 'denied' && (
            <button
              onClick={handleEnable}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg shadow-teal-500/25"
            >
              Activar notificaciones
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="w-full py-3 text-slate-400 font-medium hover:text-slate-300 transition-colors"
          >
            {permission === 'denied' ? 'Entendido' : 'Ahora no'}
          </button>
        </div>
      </div>
    </div>
  );
}

