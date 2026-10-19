import WelcomeHeader from './WelcomeHeader';
import WelcomeHero from './WelcomeHero';
import WelcomeFeatures from './WelcomeFeatures';
import WelcomePreview from './WelcomePreview';
import WelcomeCta from './WelcomeCta';
import WelcomeFooter from './WelcomeFooter';
import styles from './welcomeStyles';

export default function WelcomePage({ isAuthenticated }: { isAuthenticated: boolean }) {
  const primaryHref = isAuthenticated ? '/dashboard' : '/registration';

  return (
    <div className={`saas-shell ${styles.page}`}>
      <a href='#welcome-main' className={styles.skipLink}>
        Skip to content
      </a>
      <WelcomeHeader isAuthenticated={isAuthenticated} primaryHref={primaryHref} />
      <main id='welcome-main'>
        <WelcomeHero primaryHref={primaryHref} />
        <WelcomeFeatures />
        <WelcomePreview />
        <WelcomeCta isAuthenticated={isAuthenticated} primaryHref={primaryHref} />
      </main>
      <WelcomeFooter />
    </div>
  );
}
