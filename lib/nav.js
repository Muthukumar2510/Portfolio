// Single source for navigation: header, mobile tab bar, command palette and terminal all read this.
// `href` = a page; `section` + `base` = a section on that page (scroll target).
export const NAV = [
  {
    group: 'Notebook',
    items: [
      { id: 'home', label: 'Today', icon: 'home', href: '/' },
      { id: 'lab', label: 'Lab', icon: 'box', href: '/lab' },
      { id: 'log', label: 'Log', icon: 'timeline', href: '/log' },
      { id: 'design', label: 'Design', icon: 'ruler', href: '/design' },
    ],
  },
  {
    group: 'Colophon',
    items: [
      { id: 'colophon', label: 'Colophon', icon: 'user', href: '/colophon' },
      { id: 'about', label: 'About', icon: 'user', section: 'about', base: '/colophon' },
      { id: 'experience', label: 'Experience', icon: 'timeline', section: 'experience', base: '/colophon' },
      { id: 'skills', label: 'Skills', icon: 'cpu', section: 'skills', base: '/colophon' },
      { id: 'certifications', label: 'Certifications', icon: 'badge', section: 'certifications', base: '/colophon' },
      { id: 'moments', label: 'Talks & moments', icon: 'image', section: 'moments', base: '/colophon' },
      { id: 'operations', label: 'How this site runs', icon: 'gauge', section: 'operations', base: '/colophon' },
      { id: 'contact', label: 'Contact', icon: 'mail', section: 'contact', base: '/colophon' },
    ],
  },
  {
    group: 'Behind the site',
    items: [
      { id: 'status', label: 'Status', icon: 'pulse', href: '/status' },
      { id: 'infra', label: 'Infrastructure', icon: 'layers', href: '/infra' },
    ],
  },
];

export const ALL_ITEMS = NAV.flatMap((g) => g.items);

// Links in the desktop header pill.
export const HEADER_IDS = ['lab', 'log', 'design', 'colophon'];
// Four primary destinations on phones; everything else lives in the "More" sheet.
export const TAB_IDS = ['home', 'lab', 'design', 'colophon'];

export const itemsFor = (ids) => ids.map((id) => ALL_ITEMS.find((i) => i.id === id));

// Where an item points: a section of its page (`base`), or its own page.
export const hrefFor = (item) => (item.section ? `${item.base || '/'}#${item.section}` : item.href || '/');

// The page that holds a section id (used when jumping to a section from elsewhere).
export const pageForSection = (id) => ALL_ITEMS.find((i) => i.section === id)?.base || '/';
