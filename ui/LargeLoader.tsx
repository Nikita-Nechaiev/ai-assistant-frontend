'use client';

import styles from '../styles/LargeLoader.module.css';

const LargeLoader = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.screen}>
        <div className={styles.loader}></div>
      </div>
    </div>
  );
};

export default LargeLoader;
