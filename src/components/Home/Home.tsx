import { BarChart3, Zap, Users } from 'lucide-react';
import styles from './Home.module.css';
import sharedStyles from '../../styles/Shared.module.css';

interface HomeProps {
  onNavigate: (path: string) => void;
}

console.log('Hi');

export function Home({ onNavigate }: HomeProps) {
  return (
    <div className={styles.homeContainer}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>versus.space</h1>
        <p className={styles.heroSubtitle}>
          Create engaging polls and watch votes pour in real-time
        </p>
        <div className={styles.heroActions}>
          <button
            onClick={() => onNavigate('/auth')}
            className={`${sharedStyles.btnPrimary} ${sharedStyles.btnLarge}`}
          >
            Get Started
          </button>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <Zap size={32} />
          </div>
          <h3 className={styles.featureTitle}>Real-time Voting</h3>
          <p className={styles.featureDescription}>
            Watch votes update instantly with live WebSocket connections
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <BarChart3 size={32} />
          </div>
          <h3 className={styles.featureTitle}>Beautiful Visualizations</h3>
          <p className={styles.featureDescription}>
            Split-screen interface with smooth animations and transitions
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <Users size={32} />
          </div>
          <h3 className={styles.featureTitle}>Unlimited Polls</h3>
          <p className={styles.featureDescription}>
            Create as many polls as you want with multiple options
          </p>
        </div>
      </section>
    </div>
  );
}
