/* EngineeringVerse service worker: offline support for public pages.
 *
 * What it does: pages you have already visited (public content only)
 * keep working with no connection, and static files (JS, CSS, images,
 * fonts) are served from a local cache. Nothing else is cached:
 *  - only GET requests, same origin only
 *  - never caches RSC payloads (?_rsc), the service worker itself,
 *    or any account page (/auth, /dashboard, /profile, /upload, /admin)
 *  - never caches Supabase or any other cross-origin request
 *  - only successful (200) responses are stored
 *
 * Bump CACHE_VERSION whenever this file changes so old caches are dropped.
 */

const CACHE_VERSION = "ev-v1";
const PAGE_CACHE = `ev-pages-${CACHE_VERSION}`;
const ASSET_CACHE = `ev-assets-${CACHE_VERSION}`;

/* Public content routes whose HTML may be cached for offline reading. */
const PUBLIC_PATHS = [
  "/blog",
  "/disciplines",
  "/software",
  "/ai-tools",
  "/learning",
  "/projects",
  "/careers",
  "/past-papers",
];

const STATIC_EXTENSIONS = [
  ".js",
  ".css",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".webp",
  ".ico",
  ".woff",
  ".woff2",
];

function isPublicPath(pathname) {
  if (pathname === "/") return true;
  return PUBLIC_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );
}

function isStaticAsset(pathname) {
  if (pathname.startsWith("/_next/static/")) return true;
  return STATIC_EXTENSIONS.some((ext) => pathname.endsWith(ext));
}

const OFFLINE_HTML = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>You're offline — EngineeringVerse</title>
<style>body{font-family:system-ui,sans-serif;background:#0B1F33;color:#fff;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:24px;text-align:center}h1{font-size:22px}a{color:#7FB3FF}</style>
</head>
<body><main><h1>You're offline</h1><p>This page hasn't been visited yet, so there's no saved copy to show.</p><p><a href="/">Go to the EngineeringVerse home page</a> — pages you have already visited work offline.</p></main></body>
</html>`;

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== PAGE_CACHE && key !== ASSET_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === "/sw.js") return;
  if (url.searchParams.has("_rsc")) return;

  /* Navigations to public pages: network first, fall back to the cache,
     then to a small offline page. Account pages are left alone. */
  if (request.mode === "navigate") {
    if (!isPublicPath(url.pathname)) return;
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(PAGE_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) =>
              cached ??
              new Response(OFFLINE_HTML, {
                status: 503,
                headers: { "Content-Type": "text/html; charset=utf-8" },
              }),
          ),
        ),
    );
    return;
  }

  /* Static assets: cache first, refresh the cache in the background. */
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(ASSET_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        });
        return cached ?? network;
      }),
    );
  }
});
