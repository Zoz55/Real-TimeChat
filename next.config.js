const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  // Other Next.js config options
});
