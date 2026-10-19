import { FiArrowRight, FiFileText, FiZap, FiUsers } from 'react-icons/fi';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

import styles from './welcomeStyles';

export default function WelcomeCta({
  isAuthenticated,
  primaryHref,
}: {
  isAuthenticated: boolean;
  primaryHref: string;
}) {
  return (
    <section className={styles.ctaSection} aria-labelledby='cta-title'>
      <div className={styles.ctaInner}>
        <div className={styles.ctaCopy}>
          <p>MAKE ROOM FOR WHAT’S NEXT</p>
          <h2 id='cta-title'>
            Your next great idea
            <br />
            starts here.
          </h2>
          <span>
            A blank page. A fresh perspective. A shared possibility.
            <br />
            Bring it all together with AI Editor.
          </span>
          <Button
            asChild
            className='mt-7 h-12 rounded-lg bg-white px-6 text-[13px] text-[#174882] shadow-none hover:bg-blue-50'
          >
            <Link href={primaryHref}>
              {isAuthenticated ? 'Get started' : 'Create an account'}
              <FiArrowRight aria-hidden='true' />
            </Link>
          </Button>
        </div>
        <div className={styles.ctaArtwork} aria-hidden='true'>
          <div>
            <FiFileText size={25} />
            <span>A fresh page.</span>
            <strong>
              Endless
              <br />
              possibilities.
            </strong>
            <i />
            <i />
            <i />
            <span className={styles.ctaPaperFooter}>
              <FiZap size={13} />A little help from AI.
            </span>
          </div>
          <span className={styles.ctaArtworkBadge}>
            <FiUsers size={17} />
            Better, together.
          </span>
        </div>
      </div>
    </section>
  );
}
