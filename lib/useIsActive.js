import { useRouter } from 'next/router';
import { ALL_ITEMS } from './nav';
import useActiveSection from './useActiveSection';

const SECTION_IDS = ALL_ITEMS.filter((i) => i.section).map((i) => i.section);

// Returns (item) => boolean. Section items follow the section in view on their page; page items follow the route.
export default function useIsActive() {
  const { pathname } = useRouter();
  const section = useActiveSection(SECTION_IDS);
  return (item) => {
    if (item.section) return pathname === item.base && section === item.section;
    if (item.href === '/') return pathname === '/';
    return Boolean(item.href && pathname.startsWith(item.href));
  };
}
