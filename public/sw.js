// Big Education service worker.
// Stores a full copy of the app (pages + compiled files) so it opens even with no internet.
// Data itself is not cached here: with no internet the app switches to its offline demo data.
//  - Pages: network first (3s), then the stored copy, then /offline.html.
//  - Compiled files, fonts, images: stored copy first (they never change for a given deploy).
//  - Everything is refreshed automatically after each deploy (see precache()).
const SHELL_PREFIX = 'big-shell-';
const RUNTIME = 'big-runtime-v1';
const META = 'big-meta';
const MANIFEST_URL = '/app-precache';
const OFFLINE_URL = '/offline.html';
const NAVIGATION_TIMEOUT_MS = 3000;

async function currentShellName() {
  const meta = await caches.open(META);
  const stored = await meta.match('/__shell');
  return stored ? stored.text() : null;
}

let precaching = null;
function precache() {
  if (!precaching) precaching = doPrecache().finally(() => { precaching = null; });
  return precaching;
}

async function doPrecache() {
  const response = await fetch(MANIFEST_URL, { cache: 'no-store' });
  if (!response.ok) return;
  const manifest = await response.json();
  const name = SHELL_PREFIX + manifest.version;
  if ((await currentShellName()) === name) return; // already complete for this deploy

  const cache = await caches.open(name);
  const urls = [...manifest.pages, ...manifest.assets];
  let failed = 0;
  // A few at a time so the first visit stays responsive.
  for (let index = 0; index < urls.length; index += 6) {
    await Promise.all(urls.slice(index, index + 6).map(async url => {
      try {
        const res = await fetch(new Request(url, { cache: 'reload', credentials: 'same-origin' }));
        if (res.ok) await cache.put(url, res);
        else failed++;
      } catch {
        failed++;
      }
    }));
  }
  if (failed) return; // keep the previous complete copy; retried on the next visit

  const meta = await caches.open(META);
  await meta.put('/__shell', new Response(name));
  const keys = await caches.keys();
  await Promise.all(keys.filter(key => (key.startsWith(SHELL_PREFIX) && key !== name) || key === 'big-offline-v1').map(key => caches.delete(key)));
}

self.addEventListener('install', event => {
  event.waitUntil(precache().catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    if (self.registration.navigationPreload) await self.registration.navigationPreload.disable();
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data === 'refresh-precache') event.waitUntil(precache().catch(() => {}));
});

async function matchStored(request) {
  const name = await currentShellName();
  if (name) {
    const shell = await caches.open(name);
    const hit = await shell.match(request, { ignoreSearch: request.mode === 'navigate', ignoreVary: true });
    if (hit) return hit;
  }
  return caches.match(request, { ignoreSearch: request.mode === 'navigate', ignoreVary: true });
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
  });
}

async function handleNavigation(request) {
  try {
    const response = await withTimeout(fetch(request), NAVIGATION_TIMEOUT_MS);
    if (response.ok) {
      const name = await currentShellName();
      if (name) {
        const url = new URL(request.url);
        const copy = response.clone();
        caches.open(name).then(cache => cache.put(url.pathname, copy)).catch(() => {});
      }
    }
    return response;
  } catch {
    return (await matchStored(request)) || (await caches.match(OFFLINE_URL)) || Response.error();
  }
}

async function handleStatic(request) {
  const stored = await matchStored(request);
  if (stored) return stored;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const copy = response.clone();
      caches.open(RUNTIME).then(cache => cache.put(request, copy)).catch(() => {});
    }
    return response;
  } catch (error) {
    // An optimized image size that was never downloaded: fall back to the stored original image.
    const url = new URL(request.url);
    const original = url.pathname === '/_next/image' && url.searchParams.get('url');
    const fallback = original && original.startsWith('/') ? await matchStored(new Request(original)) : null;
    if (fallback) return fallback;
    throw error;
  }
}

async function handleOther(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const stored = await matchStored(request);
    if (stored) return stored;
    throw error;
  }
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // the live API is never cached here

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }
  // React Server Component requests: when they fail, Next.js falls back to a full page load,
  // which is then served from the stored pages above.
  if (url.searchParams.has('_rsc') || request.headers.get('RSC') === '1') return;

  if (/^\/(_next\/static\/|_next\/image$|icons\/|image\/|fonts\/)/.test(url.pathname) || url.pathname === OFFLINE_URL) {
    event.respondWith(handleStatic(request));
    return;
  }
  event.respondWith(handleOther(request));
});
