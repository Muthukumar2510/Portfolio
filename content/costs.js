// What it costs to run this site. Update when plans change.
// freeLimit/unit feed the usage bars; usageKey links a service to a live measurement (see Operations section).
const costs = {
  currency: 'USD',
  services: [
    {
      name: 'Vercel',
      plan: 'Hobby',
      monthly: 0,
      role: 'Build, edge network, serverless functions',
      limit: '100 GB bandwidth · 1M function calls / month',
    },
    {
      name: 'Upstash Redis',
      plan: 'Free',
      monthly: 0,
      role: 'Visitors, who is online, uptime checks, quality scores',
      limit: '500K commands / month',
      freeLimit: 500_000,
      usageKey: 'redisCommands',
    },
    {
      name: 'GitHub Actions',
      plan: 'Free (public repo)',
      monthly: 0,
      role: 'CI, quality gates, monitoring, photo pipeline',
      limit: 'Unlimited minutes for public repositories',
    },
    {
      name: 'Domain',
      plan: 'vercel.app subdomain',
      monthly: 0,
      role: 'Address',
      limit: 'A custom domain would be about $1/month',
    },
  ],
};

export default costs;
