const crypto = require('crypto');
const themeScript = require('./lib/themeScript');

const themeHash = crypto.createHash('sha256').update(themeScript).digest('base64');

// Strict CSP: only our own scripts plus the hashed inline theme script. Styles allow inline
// because React style props and styled-jsx emit them. Dev mode needs eval, so CSP is prod-only.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'sha256-${themeHash}'`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' https://formspree.io",
  "form-action 'self' https://formspree.io",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,
  // 90 is used for the portrait so faces stay crisp; everything else uses the default 75.
  images: { qualities: [75, 90] },
  env: {
    NEXT_PUBLIC_COMMIT: (process.env.VERCEL_GIT_COMMIT_SHA || 'local').slice(0, 7),
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    NEXT_PUBLIC_REPO_URL: process.env.VERCEL_GIT_REPO_SLUG
      ? `https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
      : 'https://github.com/Muthukumar2510/Portfolio',
  },
  // Projects and writing became notebook entries under /lab; old links keep working.
  async redirects() {
    return [
      { source: '/projects', destination: '/lab?type=build', permanent: true },
      { source: '/projects/:slug', destination: '/lab/:slug', permanent: true },
      { source: '/writing', destination: '/lab?type=note', permanent: true },
      { source: '/writing/:slug', destination: '/lab/:slug', permanent: true },
    ];
  },
  async headers() {
    if (process.env.NODE_ENV !== 'production') return [];
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
