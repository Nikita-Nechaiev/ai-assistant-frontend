import { FiChevronDown, FiBold, FiItalic, FiAlignLeft, FiMoreHorizontal } from 'react-icons/fi';

import styles from '../welcomeStyles';

export function TextLines({ count = 4 }: { count?: number }) {
  return (
    <div className={styles.textLines}>
      {Array.from({ length: count }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}
export function MiniToolbar() {
  return (
    <div className={styles.miniToolbar}>
      <span>
        Normal text <FiChevronDown size={10} />
      </span>
      <FiBold size={13} />
      <FiItalic size={13} />
      <FiAlignLeft size={14} />
      <span className={styles.toolbarRule} />
      <span className={styles.toolbarHighlight}>A</span>
      <FiMoreHorizontal size={15} />
    </div>
  );
}
