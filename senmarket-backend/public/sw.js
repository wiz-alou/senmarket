// public/sw.js - Service Worker pour SenMarket PWA
const CACHE_NAME = 'senmarket-v1.0.0';
const STATIC_CACHE = 'senmarket-static-v1';
const DYNAMIC_CACHE = 'senmarket-dynamic-v1';

// Fichiers à mettre en cache immédiatement
const STATIC_FILES = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installation...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 Cache statique créé');
        return cache.addAll(STATIC_FILES);
      })
      .catch(err => console.error('❌ Erreur cache statique:', err))
  );
  
  // Forcer l'activation immédiate
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log('✅ Service Worker: Activation...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Supprimer les anciens caches
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('🗑️ Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Prendre le contrôle immédiatement
  self.clients.claim();
});

// Interception des requêtes réseau
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Stratégie pour les API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstThenCache(request));
    return;
  }
  
  // Stratégie pour les images
  if (url.pathname.startsWith('/uploads/')) {
    event.respondWith(cacheFirstThenNetwork(request));
    return;
  }
  
  // Stratégie pour les fichiers statiques
  if (isStaticFile(request)) {
    event.respondWith(cacheFirstThenNetwork(request));
    return;
  }
  
  // Stratégie par défaut pour les pages
  event.respondWith(networkFirstThenCache(request));
});

// Stratégie: Network First, puis Cache
async function networkFirstThenCache(request) {
  try {
    // Essayer le réseau d'abord
    const networkResponse = await fetch(request);
    
    // Si succès, mettre en cache et retourner
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('🌐 Réseau indisponible, tentative cache:', request.url);
    
    // Chercher dans le cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si page HTML et pas de cache, retourner page offline
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    // Sinon, erreur
    throw error;
  }
}

// Stratégie: Cache First, puis Network
async function cacheFirstThenNetwork(request) {
  // Chercher dans le cache d'abord
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Si pas en cache, aller sur le réseau
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Erreur réseau:', error);
    throw error;
  }
}

// Vérifier si c'est un fichier statique
function isStaticFile(request) {
  return request.url.includes('.css') ||
         request.url.includes('.js') ||
         request.url.includes('.woff') ||
         request.url.includes('.woff2') ||
         request.url.includes('.ttf') ||
         request.url.includes('.ico');
}

// Gestion des notifications push (pour plus tard)
self.addEventListener('push', event => {
  console.log('📱 Notification push reçue');
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Nouvelle notification SenMarket',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [200, 100, 200],
      data: data.data || {},
      actions: [
        {
          action: 'view',
          title: 'Voir',
          icon: '/icons/action-view.png'
        },
        {
          action: 'close',
          title: 'Fermer',
          icon: '/icons/action-close.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'SenMarket',
        options
      )
    );
  }
});

// Gestion des clics sur notifications
self.addEventListener('notificationclick', event => {
  console.log('🔔 Clic sur notification');
  
  event.notification.close();
  
  if (event.action === 'view') {
    // Ouvrir l'app ou naviguer vers la page
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Gestion du mode offline
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Synchronisation en arrière-plan');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Ici tu peux implémenter la logique de sync
  // Par exemple, envoyer les données en attente
  console.log('📡 Synchronisation des données en attente...');
}