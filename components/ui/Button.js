import Link from 'next/link';
import styles from './Button.module.css';

// variant: 'primary' | 'ghost'. Renders <Link> for internal hrefs, <a> for external/mailto, <button> otherwise.
export default function Button({ href, variant = 'primary', external, className = '', children, ...rest }) {
  const cls = `${styles.btn} ${styles[variant]} ${className}`;

  if (!href) {
    return (
      <button type="button" className={cls} {...rest}>
        {children}
      </button>
    );
  }
  const isExternal = external ?? /^(https?:|mailto:)/.test(href);
  if (isExternal || href.startsWith('#') || href.endsWith('.pdf')) {
    const newTab = /^https?:/.test(href) || href.endsWith('.pdf');
    return (
      <a href={href} className={cls} {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}
