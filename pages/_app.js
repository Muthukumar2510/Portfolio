import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Google_Sans, Google_Sans_Code } from 'next/font/google';
import { SiteProvider } from '../lib/SiteContext';
import AppShell from '../components/shell/AppShell';
import Toast from '../components/Toast';
import useInteractions from '../lib/useInteractions';
import '../styles/tokens.css';
import '../styles/globals.css';

// Interactive extras load after first paint, off the critical path.
const Console = dynamic(() => import('../components/Console'), { ssr: false });
const CommandPalette = dynamic(() => import('../components/CommandPalette'), { ssr: false });
const EasterEggs = dynamic(() => import('../components/EasterEggs'), { ssr: false });

function useIdle() {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const ric = window.requestIdleCallback || ((cb) => setTimeout(cb, 1200));
    const id = ric(() => setIdle(true), { timeout: 2500 });
    return () => (window.cancelIdleCallback || clearTimeout)(id);
  }, []);
  return idle;
}

// Next has no fallback metrics for these families, so fallbacks are declared explicitly.
const sans = Google_Sans({
  subsets: ['latin'],
  weight: 'variable',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
});
const mono = Google_Sans_Code({
  subsets: ['latin'],
  weight: 'variable',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
});

export default function App({ Component, pageProps }) {
  useInteractions();
  const idle = useIdle();
  return (
    <SiteProvider value={pageProps.site || { projects: [], posts: [] }}>
      <style jsx global>{`
        :root {
          --font-sans: ${sans.style.fontFamily};
          --font-mono: ${mono.style.fontFamily};
        }
      `}</style>
      <AppShell>
        <Component {...pageProps} />
      </AppShell>
      {idle && (
        <>
          <Console />
          <CommandPalette />
          <EasterEggs />
        </>
      )}
      <Toast />
    </SiteProvider>
  );
}
