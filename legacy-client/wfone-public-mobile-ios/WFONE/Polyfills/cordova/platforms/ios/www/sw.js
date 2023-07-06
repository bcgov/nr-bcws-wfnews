

// use a cacheName for cache versioning
var cacheName = 'wfone_public_mobile_offline_cache:v1'
var goodCaches = [];
goodCaches.push(cacheName);
goodCaches.push('CordovaAssets');

self.addEventListener('install', function(e) {
console.log('[ServiceWorker] Install!');
});


self.addEventListener('activate', function(event) {
    console.log('[ServiceWorker] Activate');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheKey) {
                    console.log("** Cache key " + cacheKey);
                    if (goodCaches.indexOf(cacheKey) === -1) {
                        console.log("Deleting cache " + cacheKey);
                        return caches.delete(cacheKey);
                    }
                })
            );
        })
    );
});


self.addEventListener('fetch', function(event) {
    console.log('Handling fetch event for ' + event.request.url);
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if (response) {
                console.log('Found response in cache:', response);
                return response;
            }

            console.log('No response found in cache. Fetch from network...');
            return fetch(event.request);

        })

    );
});

