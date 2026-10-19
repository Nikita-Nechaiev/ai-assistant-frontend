import { FiCheck, FiZap, FiUsers, FiEdit3, FiMessageSquare, FiClock } from 'react-icons/fi';

import { cn } from '@/lib/utils';

import styles from '../welcomeStyles';
import { TextLines, MiniToolbar } from './ScenePrimitives';

export function FeatureIllustration({ kind }: { kind: 'write' | 'ai' | 'team' }) {
  return (
    <div className={cn(styles.featureIllustration, styles[`illustration_${kind}`])} aria-hidden='true'>
      {kind === 'write' && (
        <div className={styles.featurePaper}>
          <MiniToolbar />
          <div>
            <strong>A thought worth keeping.</strong>
            <TextLines count={3} />
            <span className={styles.miniSaved}>
              <FiCheck size={11} />
              Saved as you write
            </span>
          </div>
        </div>
      )}
      {kind === 'ai' && (
        <div className={styles.featureAi}>
          <span className={styles.blueIcon}>
            <FiZap size={17} />
          </span>
          <p>
            The right words.
            <br />
            <strong>A new perspective.</strong>
          </p>
          <div>
            <span>Rephrase</span>
            <span>Translate</span>
            <span>Summarize</span>
          </div>
        </div>
      )}
      {kind === 'team' && (
        <div className={styles.featureTeam}>
          <div>
            <span>
              <FiUsers size={17} />
            </span>
            <strong>Ideas meet here.</strong>
          </div>
          <div className={styles.teamPills}>
            <span>
              <FiEdit3 size={12} />
              Editor
            </span>
            <span>
              <FiMessageSquare size={12} />
              Chat
            </span>
            <span>
              <FiClock size={12} />
              History
            </span>
          </div>
          <div className={styles.teamConnection}>
            <span />
            <i />
            <span />
            <i />
            <span />
          </div>
        </div>
      )}
    </div>
  );
}
