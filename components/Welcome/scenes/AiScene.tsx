import { FiZap, FiEdit3, FiCheckCircle } from 'react-icons/fi';

import styles from '../welcomeStyles';
import { TextLines } from './ScenePrimitives';

export function AiScene() {
  return (
    <div className={styles.sceneWorkspace}>
      <div className={styles.sceneHeading}>
        <div>
          <small>A LITTLE HELP. A LOT OF POSSIBILITY.</small>
          <h3>Find your next great sentence.</h3>
        </div>
        <FiZap size={23} className='text-primary' />
      </div>
      <div className={styles.sceneSteps}>
        <span>
          <b>1</b>Choose a tool
        </span>
        <span className={styles.sceneStepActive}>
          <b>2</b>Add your text
        </span>
        <span>
          <b>3</b>Your result
        </span>
      </div>
      <div className={styles.sceneAiColumns}>
        <div className={styles.sceneAiInput}>
          <span>
            <FiEdit3 size={14} />
            Your words
          </span>
          <p>Good ideas become better when we work together.</p>
          <TextLines count={3} />
          <small>A shared thought. Ready for a fresh perspective.</small>
        </div>
        <div className={styles.sceneAiResult}>
          <span>
            <FiZap size={14} />A fresh perspective
          </span>
          <p>
            Bring your ideas together.
            <br />
            <strong>Make something better.</strong>
          </p>
          <div>
            <FiCheckCircle size={13} />A new way to say it.
          </div>
        </div>
      </div>
      <div className={styles.sceneToolPills}>
        {['Grammar', 'Rephrase', 'Translate', 'Summarize', 'Tone', 'More tools'].map((name) => (
          <span key={name}>{name}</span>
        ))}
      </div>
    </div>
  );
}
