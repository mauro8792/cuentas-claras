const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  // Regenerar SW en cada build
  buildExcludes: [/middleware-manifest\.json$/],
  // No cachear la API
  runtimeCaching: [
    {
      urlPattern: /^https?:\/\/.*\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 60 * 60 // 1 hora
        },
        networkTimeoutSeconds: 10
      }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 días
        }
      }
    },
    {
      urlPattern: /\.(?:js|css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 1 día
        }
      }
    }
  ]
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
};

module.exports = withPWA(nextConfig);

