const CACHE_NAME = 'asaphistool-v1.0.0';
const STATIC_CACHE_NAME = 'asaphistool-static-v1.0.0';

// Resources to cache for offline functionality
const STATIC_RESOURCES = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  // Add other critical resources
];

// Tools that work offline (text-based tools)
const OFFLINE_TOOLS = [
  '/tools/password-generator',
  '/tools/word-counter', 
  '/tools/json-formatter',
  '/tools/text-case-converter',
  '/tools/lorem-ipsum-generator',
  '/tools/url-encoder-decoder',
  '/tools/base64-encoder-decoder'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      }),
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching offline tools');
        return cache.addAll(OFFLINE_TOOLS);
      })
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - handle requests with cache-first strategy for offline tools
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // If offline and requesting a tool page, serve from cache
          if (OFFLINE_TOOLS.some(tool => url.pathname.includes(tool))) {
            return caches.match('/') || caches.match(request);
          }
          // Otherwise serve the main page
          return caches.match('/');
        })
    );
    return;
  }
  
  // Handle static resources and API requests
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Cache successful responses
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        
        return response;
      }).catch(() => {
        // If offline, show offline page for non-cached resources
        if (request.destination === 'document') {
          return caches.match('/offline.html') || caches.match('/');
        }
      });
    })
  );
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-usage') {
    event.waitUntil(syncUsageData());
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from AsaPhisTool',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore Tools',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('AsaPhisTool', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic background sync (for browsers that support it)
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic sync triggered:', event.tag);
  
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  }
});

// Helper function to sync usage data when back online
async function syncUsageData() {
  try {
    // This would sync any offline usage data to the server
    console.log('Service Worker: Syncing usage data...');
    
    // Check if we have any pending analytics data
    const cache = await caches.open(CACHE_NAME);
    const analyticsData = await cache.match('/offline-analytics');
    
    if (analyticsData) {
      // Send the data to your analytics endpoint
      const data = await analyticsData.json();
      // await fetch('/api/analytics', { method: 'POST', body: JSON.stringify(data) });
      
      // Remove from cache after successful sync
      await cache.delete('/offline-analytics');
      console.log('Service Worker: Analytics data synced successfully');
    }
  } catch (error) {
    console.error('Service Worker: Failed to sync usage data:', error);
  }
}

// Helper function to sync content updates
async function syncContent() {
  try {
    console.log('Service Worker: Syncing content updates...');
    
    // Check for updates to tools or content
    const response = await fetch('/api/updates');
    if (response.ok) {
      const updates = await response.json();
      
      // Update cache with new content if available
      if (updates.hasUpdates) {
        const cache = await caches.open(CACHE_NAME);
        // Update cached resources
        await cache.addAll(updates.updatedResources || []);
        console.log('Service Worker: Content updated successfully');
      }
    }
  } catch (error) {
    console.error('Service Worker: Failed to sync content:', error);
  }
}

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME
    });
  }
  
  if (event.data.type === 'CACHE_ANALYTICS') {
    // Cache analytics data for later sync
    caches.open(CACHE_NAME).then((cache) => {
      cache.put('/offline-analytics', new Response(JSON.stringify(event.data.analytics)));
    });
  }
});

// Share target handling (when app is shared to)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (url.pathname === '/' && url.searchParams.has('title')) {
    // Handle shared content
    event.respondWith(
      (async () => {
        const formData = await event.request.formData();
        const sharedData = {
          title: formData.get('title'),
          text: formData.get('text'),
          url: formData.get('url')
        };
        
        // Store shared data for the app to access
        const cache = await caches.open(CACHE_NAME);
        cache.put('/shared-data', new Response(JSON.stringify(sharedData)));
        
        // Redirect to appropriate tool based on shared content
        let redirectUrl = '/';
        if (sharedData.url) {
          redirectUrl = '/tools/qr-code-generator';
        } else if (sharedData.text) {
          redirectUrl = '/tools/text-case-converter';
        }
        
        return Response.redirect(redirectUrl, 302);
      })()
    );
  }
});
