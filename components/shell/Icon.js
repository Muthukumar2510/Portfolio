// Tiny UI icon set for navigation (stroke icons, inherit currentColor). Brand logos live in /public/brands.
const PATHS = {
  home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  box: 'M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8',
  timeline: 'M4 6h2M4 12h2M4 18h2M10 6h10M10 12h10M10 18h10',
  cpu: 'M7 7h10v10H7zM9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4',
  badge: 'M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.6 7.1 18.2l.9-5.5-4-3.9 5.5-.8z',
  pen: 'M4 20l4-1 11-11-3-3L5 16zM14 6l3 3',
  image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9h.01',
  pulse: 'M3 12h4l2-6 4 12 2-6h6',
  layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5',
  gauge: 'M12 14l4-4M4 18a8 8 0 1 1 16 0',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  terminal: 'M4 17l6-5-6-5M12 19h8',
  search: 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM21 21l-5-5',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  sidebar: 'M4 4h16v16H4zM9 4v16',
  close: 'M6 6l12 12M18 6L6 18',
};

export default function Icon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name] || PATHS.box} />
    </svg>
  );
}
