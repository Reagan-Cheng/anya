// 讓遊戲在 HTTPS 網址下可以離線遊玩：有網路時抓最新版，沒網路時用快取
importScripts('version.js');
// 發布版本 v1.1（改版時順手改這行，讓 iPad 一定偵測到 sw.js 有變動）
const CACHE = 'anya-monster-' + self.ANYA_MONSTER_VERSION;
const FILES = ['./', './index.html', './style.css', './anime-art.js', './draw.js', './game.js', './version.js', './manifest.webmanifest',
  './img/anime/frames.json',
  ...['anya-atlas', 'loid-atlas', 'yor-atlas', 'bond-atlas', 'enemies-atlas', 'penguin-atlas', 'city', 'school', 'ship', 'night'].map(n => `./img/anime/${n}.png`),
  './img/anya.png', './img/icon-180.png', './img/icon-512.png'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys
      .filter((k) => k.startsWith('anya-monster-') && k !== CACHE)
      .map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    // no-cache：每次都向網站確認有沒有新版（不用瀏覽器暫存的舊檔）
    fetch(e.request, { cache: 'no-cache' })
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })));
});
