import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyA0OkXVj0z5mjDFIPi5wfyw3vup38C-VSk",
  authDomain: "cuentas-claras-d4c6d.firebaseapp.com",
  projectId: "cuentas-claras-d4c6d",
  storageBucket: "cuentas-claras-d4c6d.firebasestorage.app",
  messagingSenderId: "564340000242",
  appId: "1:564340000242:web:0245d286267ff23f2fd76b"
};

// VAPID Key para Web Push
const VAPID_KEY = "BD37XRHQXw2W954LZEvD8e0nERLPhTJFW4xq70jt4ZAyC7O-9BDmguzi65XTqK_3qg42B7W2JNgNeQ0WKNq4cgU";

// Inicializar Firebase (solo una vez)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let messaging: Messaging | null = null;

// Solo inicializar messaging en el cliente (no en SSR)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error);
  }
}

/**
 * Espera a que el Service Worker esté activo
 */
async function waitForServiceWorkerActive(registration: ServiceWorkerRegistration): Promise<void> {
  // Si ya está activo, retornar inmediatamente
  if (registration.active) {
    return;
  }

  // Esperar a que se active
  return new Promise((resolve) => {
    const sw = registration.installing || registration.waiting;
    if (!sw) {
      resolve();
      return;
    }

    sw.addEventListener('statechange', () => {
      if (sw.state === 'activated') {
        resolve();
      }
    });

    // Timeout de seguridad (5 segundos)
    setTimeout(() => resolve(), 5000);
  });
}

/**
 * Solicita permiso para notificaciones y obtiene el token FCM
 */
export async function requestNotificationPermission(): Promise<string | null> {
  if (!messaging) {
    console.warn('Firebase Messaging no está disponible');
    return null;
  }

  try {
    // Solicitar permiso primero
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.log('Permiso de notificaciones denegado');
      return null;
    }

    console.log('✅ Permiso de notificaciones concedido');

    // Registrar service worker
    console.log('📝 Registrando Service Worker...');
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('📝 Service Worker registrado, estado:', registration.active ? 'activo' : 'pendiente');
    
    // Esperar a que el SW esté activo
    await waitForServiceWorkerActive(registration);
    console.log('✅ Service Worker activo');

    // Pequeña pausa para asegurar que todo esté listo
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Obtener token
    console.log('🔑 Obteniendo token FCM...');
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    console.log('🔔 Token FCM obtenido:', token ? token.substring(0, 30) + '...' : 'null');
    return token;
  } catch (error) {
    console.error('❌ Error al obtener token FCM:', error);
    return null;
  }
}

/**
 * Escucha mensajes cuando la app está en primer plano
 */
export function onForegroundMessage(callback: (payload: any) => void) {
  if (!messaging) return () => {};
  
  return onMessage(messaging, (payload) => {
    console.log('📩 Mensaje recibido en primer plano:', payload);
    callback(payload);
  });
}

export { messaging };

