const CACHE_NAME = 'exome-static-cache-v1';
const staticAssets = [
  '/',
  '/index.html',
  '/placeholder.svg'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(staticAssets);
      })
      .catch(err => console.error('Service Worker: Cache addAll failed', err))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('Service Worker: Serving from cache', event.request.url);
          return response;
        }
        console.log('Service Worker: Fetching from network', event.request.url);
        return fetch(event.request);
      })
      .catch(err => console.error('Service Worker: Fetch failed', err))
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// --- Push Notification Handling ---
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received!', event);
  const data = event.data?.json() || {};
  const title = data.title || 'Exome Instruments';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: data.icon || '/placeholder.svg', // Default icon
    badge: data.badge || '/placeholder.svg', // Badge for Android
    data: {
      url: data.url || '/', // URL to open when notification is clicked
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received!', event);
  event.notification.close(); // Close the notification

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.openWindow(urlToOpen) // Open the URL when clicked
  );
});