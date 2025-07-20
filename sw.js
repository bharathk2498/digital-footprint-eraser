/**
 * Digital Footprint Eraser - Service Worker
 * Enables offline functionality and caching for PWA
 */

const CACHE_NAME = 'digital-footprint-eraser-v1.0.0';
const CACHE_VERSION = '1.0.0';

// Files to cache for offline functionality
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/assets/css/style.css',
    '/assets/css/components.css',
    '/assets/js/app.js',
    '/assets/js/cookie-cleaner.js',
    '/assets/js/data-broker.js',
    '/assets/js/social-cleanup.js',
    '/assets/js/footprint-scanner.js',
    '/assets/data/data-brokers.json',
    '/docs/PRIVACY_POLICY.md',
    '/docs/USER_GUIDE.md',
    '/docs/INSTALLATION.md'
];

// External resources to cache
const EXTERNAL_ASSETS = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// All cacheable assets
const ALL_ASSETS = [...STATIC_ASSETS, ...EXTERNAL_ASSETS];

/**
 * Service Worker Installation
 */
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Caching app shell');
                
                // Cache static assets with error handling
                return Promise.allSettled(
                    ALL_ASSETS.map(url => 
                        cache.add(url).catch(err => {
                            console.warn(`⚠️ Failed to cache ${url}:`, err);
                            return null;
                        })
                    )
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Installation complete');
                // Force activation of new service worker
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Service Worker: Installation failed', error);
            })
    );
});

/**
 * Service Worker Activation
 */
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Activating...');
    
    event.waitUntil(
        // Clean up old caches
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker: Activation complete');
            // Take control of all pages immediately
            return self.clients.claim();
        })
    );
});

/**
 * Fetch Event Handler - Network First with Cache Fallback
 */
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http(s) requests
    if (!event.request.url.startsWith('http')) {
        return;
    }
    
    event.respondWith(
        // Try network first for fresh content
        fetch(event.request)
            .then((networkResponse) => {
                // If network request is successful, cache the response
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                
                return networkResponse;
            })
            .catch(() => {
                // Network failed, try cache
                return caches.match(event.request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            console.log('📱 Service Worker: Serving from cache', event.request.url);
                            return cachedResponse;
                        }
                        
                        // If no cache, return a custom offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html').then((cachedIndex) => {
                                return cachedIndex || new Response(
                                    getOfflineHTML(), 
                                    { 
                                        headers: { 'Content-Type': 'text/html' }
                                    }
                                );
                            });
                        }
                        
                        // For other requests, return a network error
                        return new Response('Network error occurred', {
                            status: 408,
                            headers: { 'Content-Type': 'text/plain' }
                        });
                    });
            })
    );
});

/**
 * Background Sync for Data Broker Emails
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'send-broker-emails') {
        console.log('📧 Service Worker: Background sync - sending broker emails');
        event.waitUntil(syncBrokerEmails());
    }
});

/**
 * Push Notification Handler
 */
self.addEventListener('push', (event) => {
    console.log('🔔 Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'Privacy cleanup reminder',
        icon: '/assets/images/icon-192x192.png',
        badge: '/assets/images/badge-72x72.png',
        tag: 'privacy-reminder',
        actions: [
            {
                action: 'open',
                title: 'Open App'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Digital Footprint Eraser', options)
    );
});

/**
 * Notification Click Handler
 */
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Service Worker: Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

/**
 * Message Handler for communication with main app
 */
self.addEventListener('message', (event) => {
    console.log('💬 Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
        return;
    }
    
    if (event.data && event.data.type === 'GET_CACHE_STATUS') {
        getCacheStatus().then(status => {
            event.ports[0].postMessage(status);
        });
        return;
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        clearAllCaches().then(() => {
            event.ports[0].postMessage({ success: true });
        });
        return;
    }
});

/**
 * Utility Functions
 */

// Get cache status for debugging
async function getCacheStatus() {
    const cacheNames = await caches.keys();
    const cacheStatus = {};
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        cacheStatus[cacheName] = keys.length;
    }
    
    return {
        caches: cacheStatus,
        version: CACHE_VERSION,
        totalCaches: cacheNames.length
    };
}

// Clear all caches (for privacy cleanup)
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
}

// Background sync for broker emails
async function syncBrokerEmails() {
    try {
        // This would sync any pending broker email requests
        // For privacy reasons, we don't actually send emails from service worker
        console.log('📧 Service Worker: Broker email sync complete');
        return true;
    } catch (error) {
        console.error('❌ Service Worker: Broker email sync failed', error);
        throw error;
    }
}

// Generate offline HTML page
function getOfflineHTML() {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Digital Footprint Eraser - Offline</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background: #0f172a;
                    color: #f8fafc;
                    margin: 0;
                    padding: 2rem;
                    text-align: center;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
                .offline-container {
                    max-width: 600px;
                    padding: 2rem;
                    background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
                    border-radius: 1rem;
                    border: 1px solid #475569;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                }
                .offline-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    color: #6366f1;
                }
                h1 {
                    color: #f8fafc;
                    margin-bottom: 1rem;
                    font-size: 2rem;
                }
                p {
                    color: #cbd5e1;
                    line-height: 1.6;
                    margin-bottom: 1.5rem;
                }
                .retry-btn {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: transform 0.2s;
                }
                .retry-btn:hover {
                    transform: translateY(-2px);
                }
                .offline-features {
                    text-align: left;
                    margin-top: 2rem;
                    padding: 1rem;
                    background: #1e293b;
                    border-radius: 0.5rem;
                }
                .offline-features h3 {
                    color: #f8fafc;
                    margin-bottom: 0.5rem;
                }
                .offline-features ul {
                    color: #cbd5e1;
                    padding-left: 1.5rem;
                }
                .offline-features li {
                    margin-bottom: 0.5rem;
                }
            </style>
        </head>
        <body>
            <div class="offline-container">
                <div class="offline-icon">🔒</div>
                <h1>You're Offline</h1>
                <p>Digital Footprint Eraser is still protecting your privacy, even offline! Some features are available without an internet connection.</p>
                
                <button class="retry-btn" onclick="window.location.reload()">
                    🔄 Try Again
                </button>
                
                <div class="offline-features">
                    <h3>Available Offline:</h3>
                    <ul>
                        <li>🍪 Browser cookie cleanup</li>
                        <li>💾 Local storage clearing</li>
                        <li>📊 Privacy analysis of local data</li>
                        <li>📱 Cached privacy guides</li>
                        <li>📋 Report generation</li>
                    </ul>
                </div>
            </div>
            
            <script>
                // Auto-retry when connection returns
                window.addEventListener('online', () => {
                    window.location.reload();
                });
            </script>
        </body>
        </html>
    `;
}

// Performance monitoring
self.addEventListener('fetch', (event) => {
    // Track performance metrics for privacy tools
    if (event.request.url.includes('footprint-scanner') || 
        event.request.url.includes('cookie-cleaner')) {
        
        const startTime = performance.now();
        
        event.respondWith(
            fetch(event.request).then(response => {
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                // Log performance for debugging (no external analytics)
                console.log(`🏃‍♂️ Privacy tool performance: ${duration.toFixed(2)}ms for ${event.request.url}`);
                
                return response;
            })
        );
    }
});

console.log('🔐 Digital Footprint Eraser Service Worker: Loaded successfully');
console.log('📱 PWA functionality: Enabled');
console.log('🔒 Privacy-first caching: Active');
console.log('📡 Offline support: Ready');