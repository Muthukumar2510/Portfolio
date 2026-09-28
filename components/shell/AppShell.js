import Sidebar from './Sidebar';
import CommandBar from './CommandBar';
import MobileTabBar from './MobileTabBar';
import Footer from '../Footer';
import styles from './AppShell.module.css';

// Console layout: sidebar (≥1024px) | main pane with floating command bar. Phones get a bottom tab bar.
export default function AppShell({ title, children }) {
  return (
    <div className={styles.shell}>
      <a href="#main" className="sr-only">
        Skip to content
      </a>
      <div className={styles.side}>
        <Sidebar />
      </div>
      <div className={styles.pane}>
        <CommandBar title={title} />
        <main id="main" className={styles.main}>
          {children}
        </main>
        <Footer />
      </div>
      <div className={styles.tabs}>
        <MobileTabBar />
      </div>
    </div>
  );
}
