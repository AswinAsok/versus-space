import { BarChart3, Zap, Lock, Globe } from 'lucide-react';
import { Leaderboard } from './Leaderboard';
import styles from './Home.module.css';
import sharedStyles from '../../styles/Shared.module.css';

interface HomeProps {
  onNavigate: (path: string) => void;
}

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

      <section className={styles.mainContent}>
        <div className={styles.leaderboardSection}>
          <Leaderboard onNavigate={onNavigate} />
        </div>

        <div className={styles.featuresSection}>
          <h2 className={styles.featuresTitle}>Why versus.space?</h2>
          <div className={styles.features}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Zap size={28} />
              </div>
              <h3 className={styles.featureTitle}>Real-time Voting</h3>
              <p className={styles.featureDescription}>
                Watch votes update instantly with live WebSocket connections
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <BarChart3 size={28} />
              </div>
              <h3 className={styles.featureTitle}>Beautiful Visualizations</h3>
              <p className={styles.featureDescription}>
                Split-screen interface with smooth animations and transitions
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Globe size={28} />
              </div>
              <h3 className={styles.featureTitle}>Public & Private</h3>
              <p className={styles.featureDescription}>
                Create public polls for the leaderboard or private ones with access keys
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Lock size={28} />
              </div>
              <h3 className={styles.featureTitle}>Secure Access</h3>
              <p className={styles.featureDescription}>
                Private polls require a key, ensuring only invited participants can vote
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
