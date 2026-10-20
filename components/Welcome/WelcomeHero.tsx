import { FiZap, FiArrowRight, FiCheck } from 'react-icons/fi';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

import HeroParallax from './HeroParallax';
import { HeroArtwork } from './scenes/HeroArtwork';
import styles from './welcomeStyles';

export default function WelcomeHero({ primaryHref }: { primaryHref: string }) {
  return (
    <section className={styles.hero} aria-labelledby='welcome-title'>
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <p className={styles.heroEyebrow}>
            <span>
              <FiZap size={12} aria-hidden='true' />
            </span>
            DEVELOPER PORTFOLIO · MYKYTA NECHAIEV
          </p>
          <h1 id='welcome-title'>
            AI Editor.
            <br />
            <span>A full-stack</span>
            <br />
            case study.
          </h1>
          <p className={styles.heroDescription}>
            A developer portfolio project built with Next.js, NestJS, and PostgreSQL. Explore real-time document
            editing, collaboration, and AI tools.
          </p>
          <div className={styles.heroActions}>
            <Button asChild className='h-12 rounded-lg px-6 text-[13px] shadow-blue'>
              <Link href={primaryHref}>
                Get started
                <FiArrowRight aria-hidden='true' />
              </Link>
            </Button>
            <Button
              variant='outline'
              asChild
              className='h-12 rounded-lg border-border bg-white/80 px-5 text-[13px] shadow-none'
            >
              <Link href='/ai-assistance'>
                <FiZap aria-hidden='true' />
                Try AI features
              </Link>
            </Button>
          </div>
          <ul className={styles.heroBenefits} aria-label='Core capabilities'>
            {['Rich text editing', '9 AI tools', 'Real-time collaboration'].map((label) => (
              <li key={label}>
                <FiCheck size={12} aria-hidden='true' />
                {label}
              </li>
            ))}
          </ul>
        </div>
        <HeroParallax>
          <HeroArtwork />
        </HeroParallax>
      </div>
    </section>
  );
}
