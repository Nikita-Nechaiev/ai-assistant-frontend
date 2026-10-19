import { FiFileText, FiZap, FiUsers, FiCheck } from 'react-icons/fi';

import { FeatureIllustration } from './scenes/FeatureIllustration';
import styles from './welcomeStyles';

const features = [
  {
    kind: 'write' as const,
    number: '01',
    icon: FiFileText,
    title: 'Write with clarity.',
    description:
      'Give your ideas structure with rich text editing. Keep your changes as you write, and take your work with you as a PDF.',
    tags: ['Rich text editing', 'Automatic saving', 'PDF export'],
  },
  {
    kind: 'ai' as const,
    number: '02',
    icon: FiZap,
    title: 'A fresh perspective, on demand.',
    description:
      'Find the right words with nine AI tools. Refine a sentence, translate a thought, or turn a long read into a clear summary.',
    tags: ['Grammar & tone', 'Rephrase & translate', 'Summarize & more'],
  },
  {
    kind: 'team' as const,
    number: '03',
    icon: FiUsers,
    title: 'Work better, together.',
    description:
      'Bring people into the same workspace. Share documents, discuss the details, and revisit earlier drafts as your ideas evolve.',
    tags: ['Shared sessions', 'Roles & invitations', 'Chat & history'],
  },
];
export default function WelcomeFeatures() {
  return (
    <section id='features' className={styles.featuresSection} aria-labelledby='features-title'>
      <div className={styles.container}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.sectionEyebrow}>A MORE CONNECTED WAY TO WORK</p>
            <h2 id='features-title'>
              One workspace.
              <br />
              <span>From first idea to final draft.</span>
            </h2>
          </div>
          <p>
            Less switching between tools.
            <br />
            More space for the work that matters.
          </p>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article key={feature.kind} className={styles.featureCard}>
                <FeatureIllustration kind={feature.kind} />
                <div className={styles.featureCopy}>
                  <div className={styles.featureTopline}>
                    <Icon size={18} aria-hidden='true' />
                    <span>{feature.number}</span>
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <ul>
                    {feature.tags.map((tag) => (
                      <li key={tag}>
                        <FiCheck size={12} aria-hidden='true' />
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
