import PreviewCarousel from './PreviewCarousel';
import styles from './welcomeStyles';

export default function WelcomePreview() {
  return (
    <section id='preview' className={styles.previewSection} aria-labelledby='preview-title'>
      <div className={styles.container}>
        <div className={styles.previewHeading}>
          <p className={styles.sectionEyebrow}>A CLOSER LOOK</p>
          <h2 id='preview-title'>
            See your workspace <span>in action.</span>
          </h2>
          <p>From the big picture to the details. A place for every part of your process.</p>
        </div>
        <PreviewCarousel />
      </div>
    </section>
  );
}
