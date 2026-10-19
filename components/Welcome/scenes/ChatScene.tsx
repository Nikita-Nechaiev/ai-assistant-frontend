import { FiFileText, FiMessageSquare, FiSend } from 'react-icons/fi';

import styles from '../welcomeStyles';
import { TextLines } from './ScenePrimitives';

export function ChatScene() {
  return (
    <div className={styles.sceneChatLayout}>
      <div className={styles.sceneWorkspace}>
        <div className={styles.sceneHeading}>
          <div>
            <small>YOUR SHARED WORKSPACE</small>
            <h3>Good work is better together.</h3>
          </div>
        </div>
        <p className={styles.sceneIntro}>A place for your documents. A space for the conversation.</p>
        <div className={styles.sceneDocumentCards}>
          {['A shared first draft', 'Our next big idea'].map((name) => (
            <div key={name}>
              <FiFileText size={25} />
              <TextLines count={4} />
              <strong>{name}</strong>
            </div>
          ))}
        </div>
      </div>
      <aside className={styles.sceneChatPanel}>
        <div>
          <FiMessageSquare size={17} />
          <strong>Session chat</strong>
        </div>
        <small>Keep the conversation close.</small>
        <div className={styles.sampleChat}>
          <span>Teammate</span>
          <p>What if we start with the idea that brought us here?</p>
        </div>
        <div className={styles.sampleChatOwn}>
          <span>You</span>
          <p>I like that. Let’s give it a little room to grow.</p>
        </div>
        <div className={styles.sampleChat}>
          <span>Teammate</span>
          <p>A good place to begin.</p>
        </div>
        <div className={styles.sceneChatInput}>
          Share a thought…
          <FiSend size={13} />
        </div>
      </aside>
    </div>
  );
}
