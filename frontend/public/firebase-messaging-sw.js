// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA0OkXVj0z5mjDFIPi5wfyw3vup38C-VSk",
  authDomain: "cuentas-claras-d4c6d.firebaseapp.com",
  projectId: "cuentas-claras-d4c6d",
  storageBucket: "cuentas-claras-d4c6d.firebasestorage.app",
  messagingSenderId: "564340000242",
  appId: "1:564340000242:web:0245d286267ff23f2fd76b"
});

const messaging = firebase.messaging();

// Manejar notificaciones en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('📩 Mensaje recibido en segundo plano:', payload);

  const notificationTitle = payload.notification?.title || 'Cuentas Claras';
  const notificationOptions = {
    body: payload.notification?.body || 'Tenés una nueva notificación',
    icon: '/icons/web-app-manifest-192x192.png',
    badge: '/icons/favicon-96x96.png',
    tag: payload.data?.type || 'default',
    data: payload.data,
    actions: [
      { action: 'open', title: 'Ver' },
      { action: 'close', title: 'Cerrar' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar click en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una ventana abierta, enfocarla
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

