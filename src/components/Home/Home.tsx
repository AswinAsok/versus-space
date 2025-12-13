import {
  BarChart3,
  Zap,
  Lock,
  Globe,
  Users,
  TrendingUp,
  Play,
  ArrowRight,
  Check,
  Star,
  Sparkles,
  Shield,
  Clock,
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

interface HomeProps {
  onNavigate: (path: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.homeInner}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBadge}>
            <Sparkles size={14} />
            <span>Real-time voting made simple</span>
          </div>
          <h1 className={styles.heroTitle}>
            Create polls that <span className={styles.gradientText}>engage</span> your audience
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

        {/* Main Content - Leaderboard & Features */}
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

      {/* Use Cases Section */}
      <section className={styles.useCasesSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Use Cases</span>
          <h2 className={styles.sectionTitle}>Built for every scenario</h2>
          <p className={styles.sectionSubtitle}>
            From quick team decisions to large-scale audience engagement
          </p>
        </div>
        <div className={styles.useCasesGrid}>
          <div className={styles.useCaseCard}>
            <div
              className={styles.useCaseIcon}
              style={{ background: 'linear-gradient(135deg, #FF6B4A, #E91E63)' }}
            >
              <Users size={28} />
            </div>
            <h3>Team Meetings</h3>
            <p>Make decisions faster with instant team polls and anonymous voting.</p>
          </div>
          <div className={styles.useCaseCard}>
            <div
              className={styles.useCaseIcon}
              style={{ background: 'linear-gradient(135deg, #9C27B0, #673AB7)' }}
            >
              <MessageSquare size={28} />
            </div>
            <h3>Live Events</h3>
            <p>Engage your audience during conferences, webinars, and presentations.</p>
          </div>
          <div className={styles.useCaseCard}>
            <div
              className={styles.useCaseIcon}
              style={{ background: 'linear-gradient(135deg, #00BFA5, #00897B)' }}
            >
              <TrendingUp size={28} />
            </div>
            <h3>Market Research</h3>
            <p>Gather quick feedback and validate ideas with your target audience.</p>
          </div>
          <div className={styles.useCaseCard}>
            <div
              className={styles.useCaseIcon}
              style={{ background: 'linear-gradient(135deg, #196AFF, #0D47A1)' }}
            >
              <BarChart3 size={28} />
            </div>
            <h3>Classrooms</h3>
            <p>Increase student participation with interactive quizzes and polls.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonialsSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Testimonials</span>
          <h2 className={styles.sectionTitle}>Loved by teams worldwide</h2>
          <p className={styles.sectionSubtitle}>
            See what our users have to say about versus.space
          </p>
        </div>
        <div className={styles.testimonialsGrid}>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialStars}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#FFCA28" color="#FFCA28" />
              ))}
            </div>
            <p className={styles.testimonialText}>
              "versus.space transformed our team meetings. Decisions that used to take 30 minutes
              now take 2. The real-time updates are magical!"
            </p>
            <div className={styles.testimonialAuthor}>
              <div className={styles.testimonialAvatar}>SK</div>
              <div className={styles.testimonialInfo}>
                <div className={styles.testimonialName}>Sarah Kim</div>
                <div className={styles.testimonialRole}>Product Lead at TechCorp</div>
              </div>
            </div>
          </div>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialStars}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#FFCA28" color="#FFCA28" />
              ))}
            </div>
            <p className={styles.testimonialText}>
              "I use this for every presentation now. The audience engagement went up 300% compared
              to asking for a show of hands."
            </p>
            <div className={styles.testimonialAuthor}>
              <div className={styles.testimonialAvatar}>MJ</div>
              <div className={styles.testimonialInfo}>
                <div className={styles.testimonialName}>Marcus Johnson</div>
                <div className={styles.testimonialRole}>Conference Speaker</div>
              </div>
            </div>
          </div>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialStars}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#FFCA28" color="#FFCA28" />
              ))}
            </div>
            <p className={styles.testimonialText}>
              "My students love it! The split-screen voting makes polls feel like a game.
              Participation in my classes has never been higher."
            </p>
            <div className={styles.testimonialAuthor}>
              <div className={styles.testimonialAvatar}>EP</div>
              <div className={styles.testimonialInfo}>
                <div className={styles.testimonialName}>Emily Parker</div>
                <div className={styles.testimonialRole}>University Professor</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className={styles.pricingSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Pricing</span>
          <h2 className={styles.sectionTitle}>Simple, transparent pricing</h2>
          <p className={styles.sectionSubtitle}>Start free and upgrade when you need more power</p>
        </div>
        <div className={styles.pricingGrid}>
          <div className={styles.pricingCard}>
            <div className={styles.pricingHeader}>
              <h3 className={styles.pricingName}>Free</h3>
              <div className={styles.pricingPrice}>
                <span className={styles.pricingAmount}>$0</span>
                <span className={styles.pricingPeriod}>/month</span>
              </div>
              <p className={styles.pricingTagline}>Perfect for getting started</p>
            </div>
            <ul className={styles.pricingFeatures}>
              <li>
                <Check size={18} /> Up to 5 active polls
              </li>
              <li>
                <Check size={18} /> 100 votes per poll
              </li>
              <li>
                <Check size={18} /> Real-time results
              </li>
              <li>
                <Check size={18} /> Public polls only
              </li>
              <li>
                <Check size={18} /> Basic analytics
              </li>
            </ul>
            <button
              onClick={() => onNavigate('/auth')}
              className={`${sharedStyles.btnSecondary} ${styles.pricingBtn}`}
            >
              Get Started Free
            </button>
          </div>
          <div className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}>
            <div className={styles.pricingPopular}>Most Popular</div>
            <div className={styles.pricingHeader}>
              <h3 className={styles.pricingName}>Pro</h3>
              <div className={styles.pricingPrice}>
                <span className={styles.pricingAmount}>$12</span>
                <span className={styles.pricingPeriod}>/month</span>
              </div>
              <p className={styles.pricingTagline}>For professionals & teams</p>
            </div>
            <ul className={styles.pricingFeatures}>
              <li>
                <Check size={18} /> Unlimited polls
              </li>
              <li>
                <Check size={18} /> Unlimited votes
              </li>
              <li>
                <Check size={18} /> Real-time results
              </li>
              <li>
                <Check size={18} /> Private polls with access keys
              </li>
              <li>
                <Check size={18} /> Advanced analytics
              </li>
              <li>
                <Check size={18} /> Priority support
              </li>
              <li>
                <Check size={18} /> Custom branding
              </li>
            </ul>
            <button
              onClick={() => onNavigate('/auth')}
              className={`${sharedStyles.btnPrimary} ${styles.pricingBtn}`}
            >
              Start Pro Trial
            </button>
          </div>
          <div className={styles.pricingCard}>
            <div className={styles.pricingHeader}>
              <h3 className={styles.pricingName}>Enterprise</h3>
              <div className={styles.pricingPrice}>
                <span className={styles.pricingAmount}>Custom</span>
              </div>
              <p className={styles.pricingTagline}>For large organizations</p>
            </div>
            <ul className={styles.pricingFeatures}>
              <li>
                <Check size={18} /> Everything in Pro
              </li>
              <li>
                <Check size={18} /> SSO & SAML
              </li>
              <li>
                <Check size={18} /> Dedicated support
              </li>
              <li>
                <Check size={18} /> SLA guarantee
              </li>
              <li>
                <Check size={18} /> On-premise option
              </li>
              <li>
                <Check size={18} /> API access
              </li>
            </ul>
            <button
              onClick={() => onNavigate('/auth')}
              className={`${sharedStyles.btnSecondary} ${styles.pricingBtn}`}
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className={styles.featuresGridSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Features</span>
          <h2 className={styles.sectionTitle}>Everything you need</h2>
          <p className={styles.sectionSubtitle}>Powerful features to make your polls stand out</p>
        </div>
        <div className={styles.fullFeaturesGrid}>
          <div className={styles.fullFeatureCard}>
            <Zap size={24} className={styles.fullFeatureIcon} />
            <h4>Lightning Fast</h4>
            <p>50ms average response time with global edge network</p>
          </div>
          <div className={styles.fullFeatureCard}>
            <Shield size={24} className={styles.fullFeatureIcon} />
            <h4>Secure by Default</h4>
            <p>End-to-end encryption and SOC 2 compliant infrastructure</p>
          </div>
          <div className={styles.fullFeatureCard}>
            <Clock size={24} className={styles.fullFeatureIcon} />
            <h4>Real-time Updates</h4>
            <p>WebSocket connections for instant vote synchronization</p>
          </div>
          <div className={styles.fullFeatureCard}>
            <Users size={24} className={styles.fullFeatureIcon} />
            <h4>Unlimited Voters</h4>
            <p>Scale to thousands of simultaneous participants</p>
          </div>
          <div className={styles.fullFeatureCard}>
            <BarChart3 size={24} className={styles.fullFeatureIcon} />
            <h4>Rich Analytics</h4>
            <p>Detailed insights into voting patterns and engagement</p>
          </div>
          <div className={styles.fullFeatureCard}>
            <Globe size={24} className={styles.fullFeatureIcon} />
            <h4>Global CDN</h4>
            <p>Fast loading from anywhere in the world</p>
          </div>
        </div>
      </section>

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
