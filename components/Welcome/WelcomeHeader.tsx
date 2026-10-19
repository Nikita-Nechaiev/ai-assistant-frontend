import { FiArrowUpRight } from 'react-icons/fi';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import AppLogo from '@/components/common/AppLogo';

import styles from './welcomeStyles';

export default function WelcomeHeader({
  isAuthenticated,
  primaryHref,
}: {
  isAuthenticated: boolean;
  primaryHref: string;
}) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href='/welcome' aria-label='AI Editor welcome'>
          <AppLogo variant='workspace' isLink={false} />
        </Link>
        <nav aria-label='Page navigation' className={styles.headerNav}>
          <a href='#features'>Features</a>
          <a href='#preview'>Preview</a>
          <a href='#about'>About</a>
        </nav>
        <div className={styles.headerActions}>
          {!isAuthenticated && (
            <Button variant='ghost' asChild className={styles.signIn}>
              <Link href='/login'>Sign in</Link>
            </Button>
          )}
          <Button asChild className='h-10 rounded-lg px-5 text-xs shadow-blue'>
            <Link href={primaryHref}>
              {isAuthenticated ? 'Go to dashboard' : 'Create an account'}
              <FiArrowUpRight aria-hidden='true' />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
