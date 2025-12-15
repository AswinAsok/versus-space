import { useState, useEffect } from 'react';
import {
  ArrowRight,
  Check,
  Sparkles,
  ChevronRight,
  Vote,
  Share2,
  Eye,
  Code2,
  Star,
  HelpCircle,
  Users,
  Presentation,
  GraduationCap,
  Calendar,
  MessageSquare,
  Zap,
  UserX,
  Infinity,
  Link2,
  Shield,
  Smartphone,
} from 'lucide-react';
import { track } from '@vercel/analytics';
import { Leaderboard } from './Leaderboard';
import { HomeSchema } from './HomeSchema';
import styles from './Home.module.css';
import sharedStyles from '../../styles/Shared.module.css';
import LightRays from '../ReactBits/LightRays';
import { pollService } from '../../services/pollService';

interface HomeProps {
  onNavigate: (path: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const [stats, setStats] = useState({ pollsCount: 0, votesCount: 0 });

  useEffect(() => {
    pollService.getPlatformStats().then(setStats).catch(console.error);
  }, []);

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>

      {/* JSON-LD Schema Markup for SEO */}
      <HomeSchema pollsCount={stats.pollsCount} votesCount={stats.votesCount} />

      <div className={styles.homeContainer}>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
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

        {/* Main content wrapper for accessibility */}
        <main id="main-content" className={styles.homeInner}>
          {/* Hero Section */}
          <section id="hero" className={styles.hero} aria-labelledby="hero-title">
            <div className={styles.heroBadge}>
              <Sparkles size={14} aria-hidden="true" />
              <span>
                Free Real-Time Polling Platform
                <span className={styles.srOnly}> - Create instant polls with live vote visualization</span>
              </span>
            </div>
            <h1 id="hero-title" className={styles.heroTitle}>
              Create <span className={styles.gradientText}>Real-Time Polls</span> That{' '}
              <span className={styles.gradientText}>Engage</span> Instantly
            </h1>
          <p className={styles.heroSubtitle}>
            Launch free online polls in under 30 seconds. Watch votes stream in live with
            split-screen visualizations. Perfect for presentations, classrooms, events, and team
            decisions.
          </p>
          <div className={styles.heroActions}>
            <button
              onClick={() => onNavigate('/create')}
              className={`${sharedStyles.btnPrimary} ${sharedStyles.btnLarge}`}
            >
              Create Free Poll <ArrowRight size={18} />
            </button>
            <a
              href="https://github.com/AswinAsok/versus-space"
              target="_blank"
              rel="noopener noreferrer"
              className={`${sharedStyles.btnSecondary} ${sharedStyles.btnLarge}`}
            >
              <Star size={18} /> {'Give a Star'}
            </a>
          </div>
          <p className={styles.heroNote}>Free to use • No signup required • Unlimited polls</p>

          <div className={styles.demoVideoWrapper}>
            <iframe
              className={styles.demoVideo}
              src="https://www.youtube.com/embed/lC7ViK-1DhI"
              title="Versus Space Demo - See how real-time polling works"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <p className={styles.demoNote}>
              *Demo video was recorded in the last hour of submission. Demo v2 coming soon!
            </p>
          </div>
        </section>

          {/* Features Overview - Optimized for List Snippets */}
          <section id="features" className={styles.featuresSection} aria-labelledby="features-title">
            <h2 id="features-title" className={styles.srOnly}>
              Key Features of Versus Space
            </h2>
            <div className={styles.featuresGrid}>
              <div className={styles.featureItem}>
                <Zap size={18} aria-hidden="true" />
                <span>Real-time vote visualization</span>
              </div>
              <div className={styles.featureItem}>
                <UserX size={18} aria-hidden="true" />
                <span>No signup required to vote</span>
              </div>
              <div className={styles.featureItem}>
                <Infinity size={18} aria-hidden="true" />
                <span>Free unlimited polls</span>
              </div>
              <div className={styles.featureItem}>
                <Link2 size={18} aria-hidden="true" />
                <span>Shareable poll links</span>
              </div>
              <div className={styles.featureItem}>
                <Shield size={18} aria-hidden="true" />
                <span>Anonymous voting</span>
              </div>
              <div className={styles.featureItem}>
                <Smartphone size={18} aria-hidden="true" />
                <span>Mobile responsive</span>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section id="stats" className={styles.statsSection} aria-labelledby="stats-title">
            <h2 id="stats-title" className={styles.srOnly}>
              Platform Statistics
            </h2>
            <div className={styles.statsGrid} aria-live="polite" aria-atomic="true">
              <div className={styles.statItem}>
                <div className={styles.statNumber} aria-label={`${stats.pollsCount.toLocaleString()} polls created`}>
                  {stats.pollsCount.toLocaleString()}
                </div>
                <div className={styles.statLabel}>Polls Created</div>
              </div>
              <div className={styles.statDivider} aria-hidden="true"></div>
              <div className={styles.statItem}>
                <div className={styles.statNumber} aria-label={`${stats.votesCount.toLocaleString()} votes cast`}>
                  {stats.votesCount.toLocaleString()}
                </div>
                <div className={styles.statLabel}>Clicks Cast</div>
              </div>
              <div className={styles.statDivider} aria-hidden="true"></div>
              <div className={styles.statItem}>
                <button onClick={() => onNavigate('/create')} className={styles.statButton}>
                  Create Poll <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </section>

          {/* Leaderboard Section */}
          <section id="leaderboard" className={styles.leaderboardSection} aria-labelledby="leaderboard-title">
            <h2 id="leaderboard-title" className={styles.srOnly}>
              Top Polls Leaderboard
            </h2>
            <Leaderboard onNavigate={onNavigate} />
          </section>

          {/* Built For Section */}
          <section id="built-for" className={styles.trustedSection} aria-labelledby="built-for-title">
            <h2 id="built-for-title" className={styles.srOnly}>
              Built For
            </h2>
            <p className={styles.trustedLabel}>BUILT FOR HACKATHON AT</p>
            <div className={styles.trustedLogos}>
              <a
                href="https://ente.io/?utm_source=versus.space"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('ente_link_click', { location: 'home_built_for' })}
              >
                <img
                  src="/ente-branding-green.png"
                  alt="Ente - Photo storage and sharing platform"
                  style={{ height: '48px', width: 'auto' }}
                />
              </a>
            </div>
          </section>

          {/* How It Works Section - Optimized for HowTo Schema */}
          <section id="how-it-works" className={styles.howItWorksSection} aria-labelledby="how-it-works-title">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>
                Simple Process
                <span className={styles.srOnly}> - Step-by-step guide to create polls</span>
              </span>
              <h2 id="how-it-works-title" className={styles.sectionTitle}>How to Create a Real-Time Poll</h2>
            <p className={styles.sectionSubtitle}>
              Create an interactive online poll in under 30 seconds. No signup or technical skills
              required.
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
                Enter your question and add voting options. Customize with images and set visibility
                to public or private.
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
                Copy your unique poll URL and distribute via email, chat, social media, or display
                on screen during presentations.
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
                View real-time vote counts with split-screen visualizations as your audience
                responds instantly.
              </p>
            </div>
            </div>
          </section>

          {/* Use Cases Section - Optimized for List Snippets */}
          <section id="use-cases" className={styles.useCasesSection} aria-labelledby="use-cases-title">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>
                Use Cases
                <span className={styles.srOnly}> - Real-world applications for real-time polling</span>
              </span>
              <h2 id="use-cases-title" className={styles.sectionTitle}>Best Uses for Real-Time Polling</h2>
            <p className={styles.sectionSubtitle}>
              Real-time polling is perfect for any situation where you need instant audience
              feedback.
            </p>
          </div>
          <div className={styles.useCasesGrid}>
            <div className={styles.useCaseCard}>
              <div className={styles.useCaseIcon}>
                <Presentation size={24} />
              </div>
              <h3 className={styles.useCaseTitle}>Live Presentations</h3>
              <p className={styles.useCaseDescription}>
                Engage audiences and gather instant feedback during talks and meetings.
              </p>
            </div>
            <div className={styles.useCaseCard}>
              <div className={styles.useCaseIcon}>
                <GraduationCap size={24} />
              </div>
              <h3 className={styles.useCaseTitle}>Classroom Activities</h3>
              <p className={styles.useCaseDescription}>
                Increase student participation and check understanding in real-time.
              </p>
            </div>
            <div className={styles.useCaseCard}>
              <div className={styles.useCaseIcon}>
                <Users size={24} />
              </div>
              <h3 className={styles.useCaseTitle}>Team Decisions</h3>
              <p className={styles.useCaseDescription}>
                Make group choices quickly with transparent voting and instant results.
              </p>
            </div>
            <div className={styles.useCaseCard}>
              <div className={styles.useCaseIcon}>
                <Calendar size={24} />
              </div>
              <h3 className={styles.useCaseTitle}>Events & Conferences</h3>
              <p className={styles.useCaseDescription}>
                Run interactive Q&A sessions and audience polls at any scale.
              </p>
            </div>
            <div className={styles.useCaseCard}>
              <div className={styles.useCaseIcon}>
                <MessageSquare size={24} />
              </div>
              <h3 className={styles.useCaseTitle}>Social Engagement</h3>
              <p className={styles.useCaseDescription}>
                Create shareable "this vs that" content that drives interaction.
              </p>
            </div>
            <div className={styles.useCaseCard}>
              <div className={styles.useCaseIcon}>
                <Vote size={24} />
              </div>
              <h3 className={styles.useCaseTitle}>Quick Feedback</h3>
              <p className={styles.useCaseDescription}>
                Gauge preferences and opinions instantly without lengthy surveys.
              </p>
            </div>
            </div>
          </section>

          {/* FAQ Section - Optimized for PAA Snippets */}
          <section id="faq" className={styles.faqSection} aria-labelledby="faq-title">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>
                FAQ
                <span className={styles.srOnly}> - Frequently asked questions about Versus Space</span>
              </span>
              <h2 id="faq-title" className={styles.sectionTitle}>Frequently Asked Questions</h2>
            <p className={styles.sectionSubtitle}>
              Everything you need to know about real-time polling with Versus Space.
            </p>
          </div>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <HelpCircle size={20} aria-hidden="true" />
                <h3>What is Versus Space?</h3>
              </div>
              <p className={styles.faqAnswer}>
                Versus Space is a free real-time polling platform that allows you to create
                interactive polls in seconds and watch votes stream in live with split-screen
                visualizations. It's perfect for{' '}
                <a href="#use-cases" className={styles.faqLink}>presentations, events, classrooms, and team decisions</a>.
              </p>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <HelpCircle size={20} aria-hidden="true" />
                <h3>Is Versus Space free to use?</h3>
              </div>
              <p className={styles.faqAnswer}>
                Yes, Versus Space is completely free to use with no limits on the number of polls
                you can create or votes you can receive. No credit card required.{' '}
                <a href="#features" className={styles.faqLink}>See all features</a>.
              </p>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <HelpCircle size={20} aria-hidden="true" />
                <h3>Do participants need an account to vote?</h3>
              </div>
              <p className={styles.faqAnswer}>
                No, participants can vote instantly by clicking your shared link. No signup or
                account creation is required to participate in polls.
              </p>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <HelpCircle size={20} aria-hidden="true" />
                <h3>Can I see poll results in real-time?</h3>
              </div>
              <p className={styles.faqAnswer}>
                Yes, Versus Space shows poll results updating in real-time as participants vote.
                Results display through split-screen visualizations that animate live, making it
                ideal for presentations and events.
              </p>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <HelpCircle size={20} aria-hidden="true" />
                <h3>Are online polls anonymous?</h3>
              </div>
              <p className={styles.faqAnswer}>
                Yes, Versus Space polls are anonymous by default. Participants can vote without
                providing personal information. Poll creators see aggregate results but not
                individual voter identities.
              </p>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <HelpCircle size={20} aria-hidden="true" />
                <h3>How do I share a poll with my audience?</h3>
              </div>
              <p className={styles.faqAnswer}>
                Share your poll by copying the unique URL to send via email or chat, displaying the
                link on screen during presentations, or posting directly to social media.{' '}
                <a href="#how-it-works" className={styles.faqLink}>See how it works</a>.
              </p>
            </div>
            </div>
          </section>
        </main>

        {/* CTA Section */}
        <section id="cta" className={styles.ctaSection} aria-labelledby="cta-title">
          <div className={styles.ctaContent}>
            <h2 id="cta-title" className={styles.ctaTitle}>Ready to Create Your First Real-Time Poll?</h2>
            <p className={styles.ctaSubtitle}>
              Join teams worldwide making better decisions with instant audience feedback.
            </p>
            <div className={styles.ctaActions}>
              <button
                onClick={() => onNavigate('/create')}
                className={`${sharedStyles.btnPrimary} ${sharedStyles.btnLarge}`}
              >
                Create Free Poll <ArrowRight size={18} />
              </button>
            </div>
            <div className={styles.ctaFeatures}>
              <span>
                <Check size={16} /> Free forever
              </span>
              <span>
                <Check size={16} /> No signup to vote
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
    </>
  );
}
