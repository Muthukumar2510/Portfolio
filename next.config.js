/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_COMMIT: (process.env.VERCEL_GIT_COMMIT_SHA || 'local').slice(0, 7),
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    NEXT_PUBLIC_REPO_URL: process.env.VERCEL_GIT_REPO_SLUG
      ? `https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
      : 'https://github.com/Muthukumar2510/Portfolio',
  },
};
