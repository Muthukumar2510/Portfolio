// Vercel region codes → human-readable city.
const REGIONS = {
  arn1: 'Stockholm',
  bom1: 'Mumbai',
  cdg1: 'Paris',
  cle1: 'Cleveland',
  cpt1: 'Cape Town',
  dub1: 'Dublin',
  dxb1: 'Dubai',
  fra1: 'Frankfurt',
  gru1: 'São Paulo',
  hkg1: 'Hong Kong',
  hnd1: 'Tokyo',
  iad1: 'Washington, D.C.',
  icn1: 'Seoul',
  kix1: 'Osaka',
  lhr1: 'London',
  pdx1: 'Portland',
  sfo1: 'San Francisco',
  sin1: 'Singapore',
  syd1: 'Sydney',
};

export function regionName(code) {
  if (!code) return 'local';
  return REGIONS[code] || code;
}

// Nearest healthy neighbour for the outage simulation, with a rough extra round trip.
const FAILOVER = {
  bom1: ['sin1', 45],
  sin1: ['hnd1', 70],
  hnd1: ['icn1', 30],
  icn1: ['hnd1', 30],
  kix1: ['hnd1', 12],
  hkg1: ['sin1', 35],
  syd1: ['sin1', 90],
  dxb1: ['bom1', 40],
  fra1: ['cdg1', 12],
  cdg1: ['fra1', 12],
  lhr1: ['dub1', 15],
  dub1: ['lhr1', 15],
  arn1: ['fra1', 25],
  iad1: ['cle1', 15],
  cle1: ['iad1', 15],
  sfo1: ['pdx1', 20],
  pdx1: ['sfo1', 20],
  gru1: ['iad1', 110],
  cpt1: ['fra1', 150],
};

export function failoverFor(code) {
  const [to, extraMs] = FAILOVER[code] || ['iad1', 60];
  return { code: to, name: regionName(to), extraMs };
}
