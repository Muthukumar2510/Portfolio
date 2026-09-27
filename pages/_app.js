import { Google_Sans, Google_Sans_Code } from 'next/font/google';
import { SiteProvider } from '../lib/SiteContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CommandPalette from '../components/CommandPalette';
import EasterEggs from '../components/EasterEggs';
import Toast from '../components/Toast';
import '../styles/globals.css';

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
  return (
    <SiteProvider value={pageProps.site || { projects: [], posts: [] }}>
      <style jsx global>{`
        :root {
          --font-sans: ${sans.style.fontFamily};
          --font-mono: ${mono.style.fontFamily};
        }
      `}</style>
      <a href="#main" className="sr-only">Skip to content</a>
      <Navbar />
      <main id="main">
        <Component {...pageProps} />
      </main>
      <Footer />
      <CommandPalette />
      <EasterEggs />
      <Toast />
    </SiteProvider>
  );
}
