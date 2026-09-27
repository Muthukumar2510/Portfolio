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
