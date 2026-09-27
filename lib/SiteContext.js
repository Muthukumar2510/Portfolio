import { createContext, useContext } from 'react';

const SiteContext = createContext({ projects: [], posts: [] });

export const SiteProvider = SiteContext.Provider;

export function useSite() {
  return useContext(SiteContext);
}
