import { FiZap, FiClock } from 'react-icons/fi';

import { cn } from '@/lib/utils';

import styles from '../welcomeStyles';
import { TextLines, MiniToolbar } from './ScenePrimitives';

export function DocumentScene({ versions = false }: { versions?: boolean }) {
  return (
    <div className={styles.sceneDocumentLayout}>
      <div className={styles.sceneEditorArea}>
        <div className={styles.sceneHeading}>
          <div>
            <small>DOCUMENT WORKSPACE</small>
            <h3>A better place for ideas.</h3>
          </div>
          <span className={styles.sceneButton}>
            <FiZap size={12} />
            AI Assistance
          </span>
        </div>
        <div className={styles.scenePaper}>
          <MiniToolbar />
          <article>
            <span className={styles.paperEyebrow}>FROM FIRST THOUGHT TO FINAL DRAFT</span>
            <h4>
              Good work begins
              <br />
              with a shared idea.
            </h4>
            <p>
              Bring your thinking into focus. A few words, a new perspective, a conversation that moves everything
              forward.
            </p>
            <TextLines count={4} />
            <p className={styles.sceneQuote}>Great ideas grow when you give them room.</p>
            <TextLines count={3} />
          </article>
        </div>
      </div>
      {versions && (
        <aside className={styles.sceneVersionPanel}>
          <div>
            <FiClock size={16} />
            <strong>Version history</strong>
          </div>
          <p>Every draft is part of the story.</p>
          {['A fresh perspective', 'Finding the right words', 'The first thought'].map((name, index) => (
            <div className={cn(styles.sceneVersion, index === 0 && styles.sceneVersionActive)} key={name}>
              <span />
              <div>
                <strong>{name}</strong>
                <small>{index === 0 ? 'Current version' : 'Saved draft'}</small>
              </div>
            </div>
          ))}
          <span className={styles.sceneRestore}>
            <FiClock size={12} />
            Preview your earlier thinking
          </span>
        </aside>
      )}
    </div>
  );
}
