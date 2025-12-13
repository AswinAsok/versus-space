import {
  Globe,
  Play,
  ArrowRight,
  Check,
  Sparkles,
  MessageSquare,
  Linkedin,
  ChevronRight,
  Vote,
  Share2,
  Eye,
} from 'lucide-react';
import { Leaderboard } from './Leaderboard';
import styles from './Home.module.css';
import sharedStyles from '../../styles/Shared.module.css';
import LightRays from '../ReactBits/LightRays';

interface HomeProps {
  onNavigate: (path: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
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
            <button
              onClick={() => onNavigate('/auth')}
              className={`${sharedStyles.btnSecondary} ${sharedStyles.btnLarge}`}
            >
              <Play size={18} /> Watch Demo
            </button>
          </div>
          <p className={styles.heroNote}>No credit card required • Free forever for basic use</p>
        </section>

        {/* Stats Section */}
        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>10K+</div>
              <div className={styles.statLabel}>Polls Created</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>500K+</div>
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

        {/* Trusted By Section */}
        <section className={styles.trustedSection}>
          <p className={styles.trustedLabel}>Trusted by teams at</p>
          <div className={styles.trustedLogos}>
            <span className={styles.trustedLogo}>Startup Inc</span>
            <span className={styles.trustedLogo}>TechCorp</span>
            <span className={styles.trustedLogo}>EduLearn</span>
            <span className={styles.trustedLogo}>EventPro</span>
            <span className={styles.trustedLogo}>MediaHub</span>
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
              <Check size={16} /> Free forever
            </span>
            <span>
              <Check size={16} /> No credit card
            </span>
            <span>
              <Check size={16} /> Setup in 30 seconds
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          <div className={styles.footerBrand}>
            <h3 className={styles.footerLogo}>versus.space</h3>
            <p className={styles.footerTagline}>Real-time voting for modern teams</p>
            <div className={styles.footerSocial}>
              <a href="#" className={styles.socialLink}>
                <Globe size={20} />
              </a>
              <a href="#" className={styles.socialLink}>
                <MessageSquare size={20} />
              </a>
              <a href="#" className={styles.socialLink}>
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerColumn}>
              <h4>Product</h4>
              <a href="#">Features</a>
              <a href="#">Pricing</a>
              <a href="#">Integrations</a>
              <a href="#">API</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>Resources</h4>
              <a href="#">Documentation</a>
              <a href="#">Help Center</a>
              <a href="#">Community</a>
              <a href="#">Status</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>Legal</h4>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Security</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; 2025 versus.space. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
