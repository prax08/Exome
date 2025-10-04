const CACHE_NAME = 'exome-static-cache-v2'; // Increment cache version
const DYNAMIC_CACHE_NAME = 'exome-dynamic-cache-v1'; // New cache for dynamic content

const staticAssets = [
  '/',
  '/index.html',
  '/placeholder.svg',
  '/manifest.json',
  // Add common asset types
  '/*.css',
  '/*.js',
  '/*.png',
  '/*.jpg',
  '/*.jpeg',
  '/*.gif',
  '/*.webp',
  '/*.svg',
  '/*.woff',
  '/*.woff2',
  '/*.ttf',
  '/*.eot',
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(staticAssets.filter(asset => !asset.includes('*'))); // Filter out wildcards for addAll
      })
      .catch(err => console.error('Service Worker: Cache addAll failed', err))
  );
});

self.addEventListener('fetch', (event) => {
  // Cache-First for static assets, Stale-While-Revalidate for others
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If cached, return cached response
      if (cachedResponse) {
        console.log('Service Worker: Serving from cache', event.request.url);
        return cachedResponse;
      }

      // If not in cache, fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Check if the response is valid before caching
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // For dynamic content, use stale-while-revalidate
        // Clone the response as it can only be consumed once
        const responseToCache = networkResponse.clone();
        caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        console.log('Service Worker: Fetching from network and caching', event.request.url);
        return networkResponse;
      }).catch((error) => {
        console.error('Service Worker: Fetch failed for', event.request.url, error);
        // Fallback for network failures, e.g., return an offline page
        // if (event.request.mode === 'navigate') {
        //   return caches.match('/offline.html'); // You would need to create an offline.html
        // }
        throw error; // Re-throw to indicate fetch failure
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  const cacheWhitelist = [CACHE_NAME, DYNAMIC_CACHE_NAME];
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