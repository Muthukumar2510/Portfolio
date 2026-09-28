import Header from './Header';
import MobileTabBar from './MobileTabBar';
import Footer from '../Footer';
import Backdrop from '../Backdrop';
import styles from './AppShell.module.css';

// One flowing page: slim header pill on top, bottom tab bar on phones.
export default function AppShell({ children }) {
  return (
    <div className={styles.shell}>
      <Backdrop />
      <a href="#main" className="sr-only">
        Skip to content
      </a>
      <Header />
      <main id="main" className={styles.main}>
        {children}
      </main>
      <Footer />
      <div className={styles.tabs}>
        <MobileTabBar />
      </div>
    </div>
  );
}
