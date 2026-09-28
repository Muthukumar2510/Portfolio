// Single source for navigation: sidebar, mobile tab bar, command palette and breadcrumbs all read this.
// `section` = id of a home-page section (scroll target); `href` = standalone page.
export const NAV = [
  {
    group: 'Overview',
    items: [{ id: 'home', label: 'Home', icon: 'home', href: '/' }],
  },
  {
    group: 'Workloads',
    items: [
      { id: 'projects', label: 'Projects', icon: 'box', section: 'projects', page: '/projects', badge: 'projects' },
      { id: 'experience', label: 'Experience', icon: 'timeline', section: 'experience' },
      { id: 'skills', label: 'Skills', icon: 'cpu', section: 'skills' },
      { id: 'certifications', label: 'Certifications', icon: 'badge', section: 'certifications' },
    ],
  },
  {
    group: 'Activity',
    items: [
      { id: 'writing', label: 'Writing', icon: 'pen', section: 'writing', page: '/writing', badge: 'posts' },
      { id: 'moments', label: 'Moments', icon: 'image', section: 'moments' },
    ],
  },
  {
    group: 'Operations',
    items: [
      { id: 'status', label: 'Status', icon: 'pulse', href: '/status', live: 'status' },
      { id: 'infra', label: 'Infrastructure', icon: 'layers', href: '/infra' },
      { id: 'operations', label: 'How it runs', icon: 'gauge', section: 'operations' },
    ],
  },
  {
    group: 'Connect',
    items: [{ id: 'contact', label: 'Contact', icon: 'mail', section: 'contact' }],
  },
];

export const ALL_ITEMS = NAV.flatMap((g) => g.items);

// Four primary destinations on phones; everything else lives in the "More" sheet.
export const TAB_IDS = ['home', 'projects', 'writing', 'status'];

// Where an item points: its own page, or its home-page section.
export const hrefFor = (item) => item.href || (item.section ? `/#${item.section}` : '/');

// Breadcrumb trail for a route, e.g. /projects/this-site → Console › Projects › This website.
export function crumbsFor(pathname, title) {
  const trail = [{ label: 'Console', href: '/' }];
  const top = pathname.split('/')[1];
  const item = ALL_ITEMS.find((i) => i.page === `/${top}` || i.href === `/${top}`);
  if (item) trail.push({ label: item.label, href: item.page || item.href });
  if (title && pathname.split('/').length > 2) trail.push({ label: title });
  return trail;
}
