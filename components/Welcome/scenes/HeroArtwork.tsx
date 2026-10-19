import {
  FiFileText,
  FiMoreHorizontal,
  FiCheck,
  FiZap,
  FiArrowUpRight,
  FiCheckCircle,
  FiUsers,
  FiClock,
} from 'react-icons/fi';

import styles from '../welcomeStyles';
import { TextLines, MiniToolbar } from './ScenePrimitives';

export function HeroArtwork() {
  return (
    <div className={styles.artwork} aria-hidden='true'>
      <div className={styles.artworkOrbit} />
      <div className={styles.heroDocument} data-parallax='16'>
        <div className={styles.documentTopline}>
          <span>
            <FiFileText size={15} /> Your next great idea
          </span>
          <FiMoreHorizontal size={17} />
        </div>
        <MiniToolbar />
        <div className={styles.heroPaper}>
          <span className={styles.paperEyebrow}>A SHARED FIRST DRAFT</span>
          <h3>
            A better place
            <br />
            for ideas.
          </h3>
          <p>Start with a shared thought. Give it structure, find the right words, and make something worth sharing.</p>
          <div className={styles.highlightedPassage}>
            Good ideas become better
            <br />
            when we work together.
            <span className={styles.sampleCursor} />
          </div>
          <TextLines count={3} />
          <div className={styles.paperNote}>
            <span />
            Room to think. Space to create.
          </div>
        </div>
        <div className={styles.documentBottomline}>
          <FiCheck size={12} /> A little more clarity, with every draft.
        </div>
      </div>
      <div className={styles.heroAiCard} data-parallax='-28'>
        <div className={styles.floatingCardTitle}>
          <span className={styles.blueIcon}>
            <FiZap size={15} />
          </span>{' '}
          A fresh way to say it <FiArrowUpRight size={14} />
        </div>
        <p>
          Bring your ideas together.
          <br />
          <strong>Make something better.</strong>
        </p>
        <div className={styles.aiCardFooter}>
          <span>Rephrase</span>
          <FiCheckCircle size={13} />
        </div>
      </div>
      <div className={styles.heroTeamCard} data-parallax='28'>
        <span className={styles.teamIcon}>
          <FiUsers size={17} />
        </span>
        <div>
          <strong>Better, together.</strong>
          <span>One shared workspace.</span>
        </div>
      </div>
      <div className={styles.heroVersionCard} data-parallax='-20'>
        <FiClock size={15} />
        <span>Every draft has a story.</span>
      </div>
      <span className={styles.artworkLabel}>YOUR IDEAS. A LITTLE MORE CONNECTED.</span>
    </div>
  );
}
