// Single source for navigation: header, mobile tab bar, command palette and terminal all read this.
// `section` = id of a home-page section (scroll target); `href` = standalone page; `page` = its full list page.
export const NAV = [
  {
    group: 'Me',
    items: [
      { id: 'home', label: 'Home', icon: 'home', href: '/' },
      { id: 'projects', label: 'Work', icon: 'box', section: 'projects', page: '/projects' },
      { id: 'about', label: 'About', icon: 'user', section: 'about' },
      { id: 'experience', label: 'Experience', icon: 'timeline', section: 'experience' },
      { id: 'skills', label: 'Skills', icon: 'cpu', section: 'skills' },
      { id: 'certifications', label: 'Certifications', icon: 'badge', section: 'certifications' },
    ],
  },
  {
    group: 'Stories',
    items: [
      { id: 'moments', label: 'Talks & moments', icon: 'image', section: 'moments' },
      { id: 'writing', label: 'Writing', icon: 'pen', section: 'writing', page: '/writing' },
    ],
  },
  {
    group: 'Behind the site',
    items: [
      { id: 'operations', label: 'How this site runs', icon: 'gauge', section: 'operations' },
      { id: 'status', label: 'Status', icon: 'pulse', href: '/status' },
      { id: 'infra', label: 'Infrastructure', icon: 'layers', href: '/infra' },
    ],
  },
  {
    group: 'Connect',
    items: [{ id: 'contact', label: 'Contact', icon: 'mail', section: 'contact' }],
  },
];

export const ALL_ITEMS = NAV.flatMap((g) => g.items);

// Links in the desktop header pill.
export const HEADER_IDS = ['projects', 'about', 'moments', 'writing'];
// Four primary destinations on phones; everything else lives in the "More" sheet.
export const TAB_IDS = ['home', 'projects', 'about', 'writing'];

export const itemsFor = (ids) => ids.map((id) => ALL_ITEMS.find((i) => i.id === id));

// Where an item points: its home-page section, or its own page.
export const hrefFor = (item) => (item.section ? `/#${item.section}` : item.href || '/');
