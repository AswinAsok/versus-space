import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  Tap01Icon,
  Share01Icon,
  EyeIcon,
  CodeIcon,
  StarIcon,
  HelpCircleIcon,
  UserGroupIcon,
  Presentation01Icon,
  GraduationScrollIcon,
  Calendar01Icon,
  Comment01Icon,
  BookOpen01Icon,
  Add01Icon,
} from '@hugeicons/core-free-icons';
import { track } from '@vercel/analytics';
import { Leaderboard } from './Leaderboard';
import { HomeSchema } from './HomeSchema';
import { HomeSEO } from '../SEO/SEO';
import styles from './Home.module.css';
import sharedStyles from '../../styles/Shared.module.css';
import LightRays from '../ReactBits/LightRays';
import CurvedLoop from '../ReactBits/CurvedLoop/CurvedLoop';
import CircularText from '../ReactBits/CircularText/CircularText';
import { pollFacade } from '../../core/appServices';
import type { PlatformStats } from '../../types';

interface HomeProps {
  onNavigate: (path: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const [stats, setStats] = useState<PlatformStats>({ pollsCount: 0, votesCount: 0 });
  const [githubStars, setGithubStars] = useState<number | null>(null);
  const [clickBursts, setClickBursts] = useState<
    Array<{ id: number; x: number; y: number; rotation: number; scale: number }>
  >([]);
  const clickBurstTimeouts = useRef<number[]>([]);
  const initialStatsLoaded = useRef(false);
  const pendingStatsDelta = useRef<PlatformStats>({ pollsCount: 0, votesCount: 0 });
  const lastBurstTime = useRef(0);

  // Fetch GitHub stars
  useEffect(() => {
    fetch('https://api.github.com/repos/AswinAsok/versus-space')
      .then((res) => res.json())
      .then((data) => {
        if (data.stargazers_count !== undefined) {
          setGithubStars(data.stargazers_count);
        }
      })
      .catch(console.error);
  }, []);

  const spawnClickBurst = useCallback(() => {
    const now = Date.now();
    if (now - lastBurstTime.current < 900) {
      return; // throttle bursts so they stay occasional
    }
    lastBurstTime.current = now;

    const id = Date.now() + Math.random();
    const x = Math.random() * 100;
    const y = 25 + Math.random() * 50; // keep within the curved band
    const rotation = Math.random() * 24 - 12;
    const scale = 0.9 + Math.random() * 0.25;

    setClickBursts((prev) => [...prev, { id, x, y, rotation, scale }]);

    const timeoutId = window.setTimeout(() => {
      setClickBursts((prev) => prev.filter((burst) => burst.id !== id));
    }, 1800);

    clickBurstTimeouts.current.push(timeoutId);
  }, []);

  const applyRealtimeStats = useCallback((updater: (prev: PlatformStats) => PlatformStats) => {
    setStats((prev) => {
      const next = updater(prev);
      if (!initialStatsLoaded.current) {
        pendingStatsDelta.current = {
          pollsCount: pendingStatsDelta.current.pollsCount + (next.pollsCount - prev.pollsCount),
          votesCount: pendingStatsDelta.current.votesCount + (next.votesCount - prev.votesCount),
        };
      }
      return next;
    });
  }, []);

  useEffect(() => {
    pollFacade
      .getPlatformStats()
      .then((initialStats) => {
        initialStatsLoaded.current = true;
        setStats({
          pollsCount: initialStats.pollsCount + pendingStatsDelta.current.pollsCount,
          votesCount: initialStats.votesCount + pendingStatsDelta.current.votesCount,
        });
        pendingStatsDelta.current = { pollsCount: 0, votesCount: 0 };
      })
      .catch((error) => {
        console.error(error);
        initialStatsLoaded.current = true;
      });

    const unsubscribe = pollFacade.subscribeToPlatformStats(applyRealtimeStats, spawnClickBurst);

    return () => {
      unsubscribe();
      clickBurstTimeouts.current.forEach((timeoutId) => clearTimeout(timeoutId));
      clickBurstTimeouts.current = [];
    };
  }, [applyRealtimeStats, spawnClickBurst]);

  return (
    <>
      {/* Dynamic SEO meta tags */}
      <HomeSEO />
      {/* JSON-LD Schema Markup for SEO */}
      <HomeSchema pollsCount={stats.pollsCount} votesCount={stats.votesCount} />

      <div className={styles.homeContainer}>
        <div className={styles.lightRaysContainer}>
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
            <div className={styles.heroContent}>
              <div className={styles.heroText}>
                <a
                  href="https://github.com/AswinAsok/versus-space"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.githubStarBadge}
                >
                  <span className={styles.githubStarText}>Star On GitHub</span>
                  <span className={styles.githubStarCount}>
                    <HugeiconsIcon icon={StarIcon} size={14} />
                    {githubStars !== null ? githubStars.toLocaleString() : '...'}
                  </span>
                </a>
                <h1 id="hero-title" className={styles.heroTitle}>
                  Create{' '}
                  <span className={styles.gradientTextWrapper}>
                    <span className={styles.gradientText}>Real-Time Polls</span>
                    <span className={styles.clickCursor} aria-hidden="true">
                      <span className={styles.ripple}></span>
                      <span className={styles.plusOne}>+1</span>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.85a.5.5 0 0 0-.85.36Z" />
                      </svg>
                    </span>
                  </span>{' '}
                  That{' '}
                  <span className={styles.gradientTextWrapper}>
                    <span className={`${styles.gradientText} ${styles.flickerText}`}>Engage</span>
                  </span>{' '}
                  Instantly
                </h1>
                <p className={styles.heroSubtitle}>
                  Launch free online polls in seconds. Watch votes stream in live cool animations.
                  Perfect for presentations, classrooms, events, and team decisions.
                </p>
                <div className={styles.heroActions}>
                  <button
                    onClick={() => onNavigate('/create')}
                    className={`${sharedStyles.btnPrimary} ${sharedStyles.btnLarge}`}
                  >
                    Create Free Poll <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                  </button>
                </div>
              </div>

              <div className={styles.demoVideoWrapper}>
                <div className={styles.iframeContainer}>
                  <iframe
                    className={styles.demoVideo}
                    src="https://www.youtube.com/embed/lC7ViK-1DhI"
                    title="Versus Space Demo - See how real-time polling works"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <CircularText
                    text="✦ MADE FOR FUN ✦ MADE FOR FUN "
                    spinDuration={12}
                    onHover="speedUp"
                    className={styles.circularTextBadge}
                    radius={70}
                    highlightWord="FUN"
                  />
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Stats Section - Curved Loop (Full Width) */}
        <section id="stats" className={styles.statsSection} aria-labelledby="stats-title">
          <h2 id="stats-title" className={styles.srOnly}>
            Platform Statistics
          </h2>
          <div className={styles.clickBurstLayer} aria-hidden="true">
            {clickBursts.map((burst) => (
              <span
                key={burst.id}
                className={styles.clickBurst}
                style={{
                  left: `${burst.x}%`,
                  top: `${burst.y}%`,
                  transform: `translate(-50%, -50%) rotate(${burst.rotation}deg) scale(${burst.scale})`,
                }}
              >
                +1
              </span>
            ))}
          </div>
          <div className={styles.statsContent}>
            <CurvedLoop
              segments={[
                { text: stats.pollsCount.toLocaleString(), isNumber: true },
                { text: ' Polls Created ✦ ' },
                { text: stats.votesCount.toLocaleString(), isNumber: true },
                { text: ' Clicks Cast ✦ ' },
              ]}
              speed={1.5}
              curveAmount={250}
              direction="left"
              interactive={true}
            />
          </div>
        </section>

        <div className={styles.homeInner}>
          {/* Leaderboard Section */}
          <section
            id="leaderboard"
            className={styles.leaderboardSection}
            aria-labelledby="leaderboard-title"
          >
            <h2 id="leaderboard-title" className={styles.srOnly}>
              Top Polls Leaderboard
            </h2>
            <Leaderboard onNavigate={onNavigate} />
            <button onClick={() => onNavigate('/create')} className={styles.ctaButtonGreen}>
              <HugeiconsIcon icon={Add01Icon} size={18} />
              Create Your Own Poll
            </button>
          </section>

          {/* Built For Section */}
          <section
            id="built-for"
            className={styles.trustedSection}
            aria-labelledby="built-for-title"
          >
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
                className={styles.enteLogoWrapper}
              >
                <img
                  src="/ente-branding-green.png"
                  alt="Ente - Photo storage and sharing platform"
                  className={styles.enteLogo}
                />
                <div className={styles.cursorTrail}>
                  <svg className={styles.cursor} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.85a.5.5 0 0 0-.85.36Z" />
                  </svg>
                </div>
              </a>
            </div>
          </section>

          {/* Bento Grid - How It Works & Use Cases Combined */}
          <section id="how-it-works" className={styles.bentoSection} aria-labelledby="bento-title">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>
                Get Started
                <span className={styles.srOnly}> - How to create polls and use cases</span>
              </span>
              <h2 id="bento-title" className={styles.sectionTitle}>
                Create Polls in Seconds
              </h2>
              <p className={styles.sectionSubtitle}>
                Simple steps to launch real-time polls. Perfect for any situation.
              </p>
            </div>
            <div className={styles.bentoGrid}>
              {/* Row 1: Steps */}
              {/* Step 1 - Wide */}
              <div className={`${styles.bentoCard} ${styles.bentoWide}`}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.bentoIconSmall}>
                  <HugeiconsIcon icon={Tap01Icon} size={56} />
                </div>
                <h3 className={styles.bentoTitleSmall}>Create Your Poll</h3>
                <p className={styles.bentoDescriptionSmall}>
                  Enter your question and add voting options.
                </p>
              </div>

              {/* Step 2 */}
              <div className={`${styles.bentoCard} ${styles.bentoSmall}`}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.bentoIconSmall}>
                  <HugeiconsIcon icon={Share01Icon} size={56} />
                </div>
                <h3 className={styles.bentoTitleSmall}>Share the Link</h3>
                <p className={styles.bentoDescriptionSmall}>
                  Distribute via email, chat, or social media.
                </p>
              </div>

              {/* Step 3 */}
              <div className={`${styles.bentoCard} ${styles.bentoSmall}`}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.bentoIconSmall}>
                  <HugeiconsIcon icon={EyeIcon} size={56} />
                </div>
                <h3 className={styles.bentoTitleSmall}>Watch Live Results</h3>
                <p className={styles.bentoDescriptionSmall}>
                  View real-time votes as they stream in.
                </p>
              </div>

              {/* Row 2: Use Cases */}
              {/* Use Case - Presentations */}
              <div className={`${styles.bentoCard} ${styles.bentoSmall}`}>
                <div className={styles.bentoIconSmall}>
                  <HugeiconsIcon icon={Presentation01Icon} size={56} />
                </div>
                <h3 className={styles.bentoTitleSmall}>Live Presentations</h3>
                <p className={styles.bentoDescriptionSmall}>
                  Engage audiences during talks and meetings.
                </p>
              </div>

              {/* Use Case - Classroom */}
              <div className={`${styles.bentoCard} ${styles.bentoSmall}`}>
                <div className={styles.bentoIconSmall}>
                  <HugeiconsIcon icon={GraduationScrollIcon} size={56} />
                </div>
                <h3 className={styles.bentoTitleSmall}>Classroom Activities</h3>
                <p className={styles.bentoDescriptionSmall}>
                  Check student understanding in real-time.
                </p>
              </div>

              {/* Use Case - Team - Wide */}
              <div className={`${styles.bentoCard} ${styles.bentoWide}`}>
                <div className={styles.bentoIconSmall}>
                  <HugeiconsIcon icon={UserGroupIcon} size={56} />
                </div>
                <h3 className={styles.bentoTitleSmall}>Team Decisions</h3>
                <p className={styles.bentoDescriptionSmall}>
                  Make group choices with transparent voting.
                </p>
              </div>

              {/* Row 3: More Use Cases */}
              {/* Use Case - Events - Wide */}
              <div className={`${styles.bentoCard} ${styles.bentoWide}`}>
                <div className={styles.bentoIconSmall}>
                  <HugeiconsIcon icon={Calendar01Icon} size={56} />
                </div>
                <h3 className={styles.bentoTitleSmall}>Events & Conferences</h3>
                <p className={styles.bentoDescriptionSmall}>
                  Run interactive Q&A and polls at scale.
                </p>
              </div>

              {/* Use Case - Social */}
              <div className={`${styles.bentoCard} ${styles.bentoSmall}`}>
                <div className={styles.bentoIconSmall}>
                  <HugeiconsIcon icon={Comment01Icon} size={56} />
                </div>
                <h3 className={styles.bentoTitleSmall}>Social Engagement</h3>
                <p className={styles.bentoDescriptionSmall}>
                  Create shareable "this vs that" content.
                </p>
              </div>

              {/* Use Case - Feedback */}
              <div className={`${styles.bentoCard} ${styles.bentoSmall}`}>
                <div className={styles.bentoIconSmall}>
                  <HugeiconsIcon icon={Tap01Icon} size={56} />
                </div>
                <h3 className={styles.bentoTitleSmall}>Quick Feedback</h3>
                <p className={styles.bentoDescriptionSmall}>
                  Gauge preferences without lengthy surveys.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Section - Optimized for PAA Snippets */}
          <section id="faq" className={styles.faqSection} aria-labelledby="faq-title">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>
                FAQ
                <span className={styles.srOnly}>
                  {' '}
                  - Frequently asked questions about Versus Space
                </span>
              </span>
              <h2 id="faq-title" className={styles.sectionTitle}>
                Frequently Asked Questions
              </h2>
              <p className={styles.sectionSubtitle}>
                Everything you need to know about real-time polling with Versus Space.
              </p>
            </div>
            <div className={styles.faqGrid}>
              <div className={styles.faqItem}>
                <div className={styles.faqQuestion}>
                  <HugeiconsIcon icon={HelpCircleIcon} size={20} />
                  <h3>What is Versus Space?</h3>
                </div>
                <p className={styles.faqAnswer}>
                  Versus Space is a free real-time polling platform that allows you to create
                  interactive polls in seconds and watch votes stream in live with split-screen
                  visualizations. It's perfect for{' '}
                  <a href="#how-it-works" className={styles.faqLink}>
                    presentations, events, classrooms, and team decisions
                  </a>
                  .
                </p>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqQuestion}>
                  <HugeiconsIcon icon={HelpCircleIcon} size={20} />
                  <h3>Is Versus Space free to use?</h3>
                </div>
                <p className={styles.faqAnswer}>
                  Yes, Versus Space is completely free to use with no limits on the number of polls
                  you can create or votes you can receive. No credit card required.{' '}
                  <a href="#features" className={styles.faqLink}>
                    See all features
                  </a>
                  .
                </p>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqQuestion}>
                  <HugeiconsIcon icon={HelpCircleIcon} size={20} />
                  <h3>Do participants need an account to vote?</h3>
                </div>
                <p className={styles.faqAnswer}>
                  No, participants can vote instantly by clicking your shared link. No signup or
                  account creation is required to participate in polls.
                </p>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqQuestion}>
                  <HugeiconsIcon icon={HelpCircleIcon} size={20} />
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
                  <HugeiconsIcon icon={HelpCircleIcon} size={20} />
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
                  <HugeiconsIcon icon={HelpCircleIcon} size={20} />
                  <h3>How do I share a poll with my audience?</h3>
                </div>
                <p className={styles.faqAnswer}>
                  Share your poll by copying the unique URL to send via email or chat, displaying
                  the link on screen during presentations, or posting directly to social media.{' '}
                  <a href="#how-it-works" className={styles.faqLink}>
                    See how it works
                  </a>
                  .
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* CTA Section */}
        <section id="cta" className={styles.ctaSection} aria-labelledby="cta-title">
          <div className={styles.ctaContent}>
            <div className={styles.ctaText}>
              <h2 id="cta-title" className={styles.ctaTitle}>
                Ready to create your first poll?
              </h2>
              <p className={styles.ctaSubtitle}>Free forever. No signup required.</p>
            </div>
            <button onClick={() => onNavigate('/create')} className={styles.ctaButton}>
              Create Free Poll <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            </button>
          </div>
        </section>

        {/* Footer with SEO Internal Links */}
        <footer className={styles.footer}>
          <div className={styles.footerTop}>
            <nav className={styles.footerNav} aria-label="Footer navigation">
              <Link to="/create" className={styles.footerNavLink}>
                Create Poll
              </Link>
              <Link to="/blog" className={styles.footerNavLink}>
                <HugeiconsIcon icon={BookOpen01Icon} size={14} />
                Blog
              </Link>
              <a href="#how-it-works" className={styles.footerNavLink}>
                How It Works
              </a>
              <a href="#faq" className={styles.footerNavLink}>
                FAQ
              </a>
            </nav>
          </div>
          <div className={styles.footerBottom}>
            <span>&copy; 2025 versus.space - Real-time polling for teams worldwide</span>
            <div className={styles.footerRight}>
              <a
                href="https://neal.fun"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                inspired from neal<span className={styles.footerDot}>.</span>fun
              </a>
              <span className={styles.footerDivider}>|</span>
              <a
                href="https://github.com/AswinAsok"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                <HugeiconsIcon icon={CodeIcon} size={14} />
                built by aswinasok<span className={styles.footerDot}>.</span>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
