import { useRouter } from 'next/router';
import { ALL_ITEMS } from './nav';
import useActiveSection from './useActiveSection';

const SECTION_IDS = ALL_ITEMS.filter((i) => i.section).map((i) => i.section);

// Returns (item) => boolean: on the home page follows the section in view, elsewhere the route.
export default function useIsActive() {
  const { pathname } = useRouter();
  const section = useActiveSection(SECTION_IDS);
  return (item) => {
    if (pathname === '/') return item.section ? section === item.section : item.id === 'home' && !section;
    return item.page ? pathname.startsWith(item.page) : Boolean(item.href && item.href !== '/' && pathname.startsWith(item.href));
  };
}
