import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from './Header';
import MobileTabBar from './MobileTabBar';
import Footer from '../layout/Footer';
import Backdrop from '../motion/Backdrop';
import styles from './AppShell.module.css';

// One flowing page: slim header pill on top, bottom tab bar on phones.
// After a client-side navigation the new page fades in (opacity only). Never on first load, so it can't delay LCP.
export default function AppShell({ children }) {
  const router = useRouter();
  const [navigated, setNavigated] = useState(false);
  useEffect(() => {
    const done = () => setNavigated(true);
    router.events.on('routeChangeComplete', done);
    return () => router.events.off('routeChangeComplete', done);
  }, [router.events]);
  return (
    <div className={styles.shell}>
      <Backdrop />
      <a href="#main" className="sr-only">
        Skip to content
      </a>
      <Header />
      <main id="main" className={styles.main}>
        <div key={navigated ? router.asPath.split('#')[0] : 'first'} className={navigated ? styles.enter : undefined}>
          {children}
        </div>
      </main>
      <Footer />
      <div className={styles.tabs}>
        <MobileTabBar />
      </div>
    </div>
  );
}
