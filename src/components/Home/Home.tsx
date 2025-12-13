import { useState, useEffect } from 'react';
import {
  Play,
  ArrowRight,
  Check,
  Sparkles,
  ChevronRight,
  Vote,
  Share2,
  Eye,
  Code2,
} from 'lucide-react';
import { Leaderboard } from './Leaderboard';
import styles from './Home.module.css';
import sharedStyles from '../../styles/Shared.module.css';
import LightRays from '../ReactBits/LightRays';
import { pollService } from '../../services/pollService';

interface HomeProps {
  onNavigate: (path: string) => void;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
  }
  return num.toString();
}

export function Home({ onNavigate }: HomeProps) {
  const [stats, setStats] = useState({ pollsCount: 0, votesCount: 0 });

  useEffect(() => {
    pollService.getPlatformStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className={styles.homeContainer}>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      >
        <LightRays
          raysOrigin="top-center"
          raysColor="#a8e6cf"
          raysSpeed={0.8}
          lightSpread={1.2}
          rayLength={1.5}
          followMouse={true}
          mouseInfluence={0.05}
          noiseAmount={0.05}
          distortion={0.02}
          className="custom-rays"
        />
      </div>
      <div className={styles.homeInner}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBadge}>
            <Sparkles size={14} />
            <span>Real-time voting made simple</span>
          </div>
          <h1 className={styles.heroTitle}>
            Create Polls That <span className={styles.gradientText}>Engage</span> Your{' '}
            <span className={styles.gradientText}>Audience</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Launch interactive polls in seconds and watch votes pour in real-time. Perfect for
            presentations, events, classrooms, and team decisions.
          </p>
          <div className={styles.heroActions}>
            <button
              onClick={() => onNavigate('/auth')}
              className={`${sharedStyles.btnPrimary} ${sharedStyles.btnLarge}`}
            >
              Start Free <ArrowRight size={18} />
            </button>
            <a
              href="https://youtu.be/lC7ViK-1DhI"
              target="_blank"
              rel="noopener noreferrer"
              className={`${sharedStyles.btnSecondary} ${sharedStyles.btnLarge}`}
            >
              <Play size={18} /> Watch Demo
            </a>
          </div>
          <p className={styles.heroNote}>Free to use • No limits for now</p>
          <p className={styles.demoNote}>
            *Demo video was recorded in the last hour of submission. Demo v2 coming soon!
          </p>
        </section>

        {/* Stats Section */}
        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{formatNumber(stats.pollsCount)}</div>
              <div className={styles.statLabel}>Polls Created</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{formatNumber(stats.votesCount)}</div>
              <div className={styles.statLabel}>Votes Cast</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>50ms</div>
              <div className={styles.statLabel}>Avg Response</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>99.9%</div>
              <div className={styles.statLabel}>Uptime</div>
            </div>
          </div>
        </section>

        {/* Built For Section */}
        <section className={styles.trustedSection}>
          <p className={styles.trustedLabel}>BUILT FOR HACKATHON AT</p>
          <div className={styles.trustedLogos}>
            <a href="https://ente.io/?ref=versus.space" target="_blank" rel="noopener noreferrer">
              <img
                src="/ente-branding-green.png"
                alt="Ente"
                style={{ height: '48px', width: 'auto' }}
              />
            </a>
          </div>
        </section>

        {/* How It Works Section */}
        <section className={styles.howItWorksSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Simple Process</span>
            <h2 className={styles.sectionTitle}>Launch a poll in 3 easy steps</h2>
            <p className={styles.sectionSubtitle}>
              Get your audience voting in under a minute. No technical skills required.
            </p>
          </div>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepIconWrapper}>
                <Vote size={32} />
              </div>
              <h3 className={styles.stepTitle}>Create Your Poll</h3>
              <p className={styles.stepDescription}>
                Add your question and options. Customize with images and choose public or private.
              </p>
            </div>
            <div className={styles.stepConnector}>
              <ChevronRight size={24} />
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepIconWrapper}>
                <Share2 size={32} />
              </div>
              <h3 className={styles.stepTitle}>Share the Link</h3>
              <p className={styles.stepDescription}>
                Send the unique link to your audience via email, chat, or display it on screen.
              </p>
            </div>
            <div className={styles.stepConnector}>
              <ChevronRight size={24} />
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepIconWrapper}>
                <Eye size={32} />
              </div>
              <h3 className={styles.stepTitle}>Watch Live Results</h3>
              <p className={styles.stepDescription}>
                See votes stream in real-time with beautiful split-screen visualizations.
              </p>
            </div>
          </div>
        </section>

        {/* Leaderboard Section */}
        <section className={styles.leaderboardSection}>
          <Leaderboard onNavigate={onNavigate} />
        </section>
      </div>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to engage your audience?</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of teams making better decisions with versus.space
          </p>
          <div className={styles.ctaActions}>
            <button
              onClick={() => onNavigate('/auth')}
              className={`${sharedStyles.btnPrimary} ${sharedStyles.btnLarge}`}
            >
              Get Started for Free <ArrowRight size={18} />
            </button>
          </div>
          <div className={styles.ctaFeatures}>
            <span>
              <Check size={16} /> Free to use
            </span>
            <span>
              <Check size={16} /> No limits
            </span>
            <span>
              <Check size={16} /> Setup in 30 seconds
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>&copy; 2025 versus.space</span>
        <div className={styles.footerRight}>
          <a
            href="https://neal.fun"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            inspired from neal<span className={styles.footerDot}>.</span>fun
          </a>
          <span className={styles.footerDivider}>·</span>
          <a
            href="https://github.com/AswinAsok"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            <Code2 size={14} />
            built by aswinasok<span className={styles.footerDot}>.</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
