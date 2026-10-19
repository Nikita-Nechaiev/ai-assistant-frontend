import { FiPlus, FiLayers, FiMoreHorizontal, FiUsers, FiFileText, FiArrowUpRight } from 'react-icons/fi';

import styles from '../welcomeStyles';

export function DashboardScene() {
  return (
    <div className={styles.sceneWorkspace}>
      <div className={styles.sceneHeading}>
        <div>
          <small>YOUR WORKSPACE, IN FOCUS</small>
          <h3>A little space for great ideas.</h3>
        </div>
        <span className={styles.sceneButton}>
          <FiPlus size={12} />
          New session
        </span>
      </div>
      <div className={styles.sceneBlueBanner}>
        <div>
          <span>WRITE. REFINE. COLLABORATE.</span>
          <h4>
            Bring your next
            <br />
            idea to life.
          </h4>
          <p>Your documents and your team. All together.</p>
        </div>
        <FiLayers size={72} strokeWidth={1} />
      </div>
      <div className={styles.sceneSectionLabel}>
        Your sessions <FiMoreHorizontal size={15} />
      </div>
      <div className={styles.sceneSessionCards}>
        {['A space for ideas', 'The next chapter', 'Better together'].map((name) => (
          <div key={name}>
            <FiUsers size={18} />
            <strong>{name}</strong>
            <span>Collaborative workspace</span>
            <div>
              <FiFileText size={12} />
              Open session
              <FiArrowUpRight size={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
