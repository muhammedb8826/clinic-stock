// Service Worker for Push Notifications
const CACHE_NAME = 'wan-ofi-pharmacy-v1';
const NOTIFICATION_TAG = 'wan-ofi-notification';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let notificationData = {
    title: 'Wan Ofi Pharmacy Alert',
    body: 'New inventory notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: NOTIFICATION_TAG,
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/favicon.ico'
      }
    ]
  };

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        title: data.title || notificationData.title,
        body: data.message || notificationData.body,
        tag: `notification-${data.type}-${data.medicineId || 'general'}`,
        requireInteraction: data.priority === 'urgent',
        data: data
      };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Default action or 'view' action
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If there's already a window open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            data: event.notification.data
          });
          return;
        }
      }
      
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow('/medicines');
      }
    })
  );
});

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event);
  
  if (event.tag === 'notification-sync') {
    event.waitUntil(
      // Handle any pending notifications
      handlePendingNotifications()
    );
  }
});

// Handle pending notifications
async function handlePendingNotifications() {
  try {
    // This could store notifications in IndexedDB when offline
    // and sync them when back online
    console.log('Handling pending notifications...');
  } catch (error) {
    console.error('Error handling pending notifications:', error);
  }
}

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'notification-check') {
    event.waitUntil(
      // Check for new notifications periodically
      checkForNotifications()
    );
  }
});

// Check for notifications
async function checkForNotifications() {
  try {
    // This could make API calls to check for new notifications
    console.log('Periodic notification check...');
  } catch (error) {
    console.error('Error checking for notifications:', error);
  }
}
