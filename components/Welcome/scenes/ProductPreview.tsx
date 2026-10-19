import { FiLayers, FiGrid, FiFileText, FiZap } from 'react-icons/fi';

import styles from '../welcomeStyles';
import { WelcomeSlideId } from '../welcomeSlides';
import { DashboardScene } from './DashboardScene';
import { DocumentScene } from './DocumentScene';
import { AiScene } from './AiScene';
import { ChatScene } from './ChatScene';

export function ProductPreview({ kind }: { kind: WelcomeSlideId }) {
  const labels = {
    dashboard: 'Dashboard',
    editor: 'Document editor',
    ai: 'AI Assistance',
    versions: 'Version history',
    chat: 'Session chat',
  };

  return (
    <div className={styles.previewFrame} aria-hidden='true'>
      <div className={styles.previewHeader}>
        <span>
          <FiLayers size={17} />
          <strong>
            AI Editor<span>.</span>
          </strong>
        </span>
        <span>
          Workspace <i>/</i> {labels[kind]}
        </span>
        <span className={styles.previewIllustrationLabel}>PRODUCT PREVIEW</span>
      </div>
      <div className={styles.previewBody}>
        <aside className={styles.previewSidebar}>
          <small>YOUR WORKSPACE</small>
          {[
            { name: 'Dashboard', icon: FiGrid, active: kind === 'dashboard' },
            { name: 'Documents', icon: FiFileText, active: ['editor', 'versions', 'chat'].includes(kind) },
            { name: 'AI Assistance', icon: FiZap, active: kind === 'ai' },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.name} className={item.active ? styles.previewNavActive : ''}>
                <Icon size={14} />
                {item.name}
              </div>
            );
          })}
          <div className={styles.previewSidebarFoot}>
            <FiLayers size={18} />
            <span>
              A little more clarity.
              <br />A lot more possibility.
            </span>
          </div>
        </aside>
        <div className={styles.previewContent}>
          {kind === 'dashboard' && <DashboardScene />}
          {kind === 'editor' && <DocumentScene />}
          {kind === 'ai' && <AiScene />}
          {kind === 'versions' && <DocumentScene versions />}
          {kind === 'chat' && <ChatScene />}
        </div>
      </div>
    </div>
  );
}
