import { FiLinkedin, FiArrowUpRight, FiGithub } from 'react-icons/fi';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import AppLogo from '@/components/common/AppLogo';

import ResumeDownloadButton from './ResumeDownloadButton';
import styles from './welcomeStyles';

export default function WelcomeFooter() {
  return (
    <footer id='about' className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerMain}>
          <div>
            <Link href='/welcome' aria-label='AI Editor welcome'>
              <AppLogo variant='workspace' isLink={false} />
            </Link>
            <p>
              Your documents, your team, and the power of AI.
              <br />
              One workspace to bring ideas to life.
            </p>
          </div>
          <div className={styles.author}>
            <span className={styles.sectionEyebrow}>THE PERSON BEHIND THE PRODUCT</span>
            <h2>
              Mykyta Nechaiev<span>Full-stack developer</span>
            </h2>
            <p>
              Designed and built by Mykyta Nechaiev.
              <br />A personal portfolio project.
            </p>
            <div className={styles.authorLinks}>
              <Button variant='outline' size='sm' asChild className='h-9 gap-2 rounded-lg text-xs shadow-none'>
                <a
                  href='https://www.linkedin.com/in/mykyta-nechaiev-48b776358/'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <FiLinkedin aria-hidden='true' />
                  LinkedIn
                  <FiArrowUpRight aria-hidden='true' />
                </a>
              </Button>
              <Button variant='outline' size='sm' asChild className='h-9 gap-2 rounded-lg text-xs shadow-none'>
                <a
                  href='https://github.com/Nikita-Nechaiev/ai-assistant-frontend'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <FiGithub aria-hidden='true' />
                  GitHub
                  <FiArrowUpRight aria-hidden='true' />
                </a>
              </Button>
              <ResumeDownloadButton />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
