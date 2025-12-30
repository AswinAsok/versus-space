import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  Tap01Icon,
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
  CheckmarkCircle02Icon,
  SparklesIcon,
  CrownIcon,
  Coffee01Icon,
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
import { usePlatformStats, useProUserCount } from '../../hooks/usePollQueries';
import { faqItems } from './faqData';

interface HomeProps {
  onNavigate: (path: string) => void;
}

// Chai meter constants
const TOTAL_HOURS_WORKED = 30;
const HOURS_PER_WORK_DAY = 4;
const CUPS_PER_DAY = 6;
const TOTAL_CHAI_CONSUMED = Math.ceil((TOTAL_HOURS_WORKED / HOURS_PER_WORK_DAY) * CUPS_PER_DAY); // 45 cups

export function Home({ onNavigate }: HomeProps) {
  const { data: stats } = usePlatformStats();
  const { data: proUserCount = 0 } = useProUserCount();
  const [githubStars, setGithubStars] = useState<number | null>(null);
  const [clickBursts, setClickBursts] = useState<
    Array<{ id: number; x: number; y: number; rotation: number; scale: number }>
  >([]);
  const clickBurstTimeouts = useRef<number[]>([]);
  const lastBurstTime = useRef(0);
  const [openFaqQuestion, setOpenFaqQuestion] = useState<string | null>(null);

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

  // Cleanup burst timeouts on unmount
  useEffect(() => {
    return () => {
      clickBurstTimeouts.current.forEach((timeoutId) => clearTimeout(timeoutId));
      clickBurstTimeouts.current = [];
    };
  }, []);

  // Spawn click burst periodically for engagement effect (the real-time subscription is handled in usePlatformStats)
  useEffect(() => {
    // Check for new votes via stats changes
    if (stats && stats.votesCount > 0) {
      spawnClickBurst();
    }
  }, [stats?.votesCount, spawnClickBurst]);

  return (
    <>
      {/* Dynamic SEO meta tags */}
      <HomeSEO />
      {/* JSON-LD Schema Markup for SEO */}
      <HomeSchema pollsCount={stats?.pollsCount ?? 0} votesCount={stats?.votesCount ?? 0} />

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
                    text="✦ MADE FOR FUN ✦ MADE WITH FUN "
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
                { text: (stats?.pollsCount ?? 0).toLocaleString(), isNumber: true },
                { text: ' Polls Created ✦ ' },
                { text: (stats?.votesCount ?? 0).toLocaleString(), isNumber: true },
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
                <h3 className={styles.bentoTitleSmall}>Create Your Poll</h3>
                <p className={styles.bentoDescriptionSmall}>
                  Enter your question and add voting options.
                </p>
              </div>

              {/* Step 2 */}
              <div className={`${styles.bentoCard} ${styles.bentoSmall}`}>
                <div className={styles.stepNumber}>2</div>
                <h3 className={styles.bentoTitleSmall}>Share the Link</h3>
                <p className={styles.bentoDescriptionSmall}>
                  Distribute via email, chat, or social media.
                </p>
              </div>

              {/* Step 3 */}
              <div className={`${styles.bentoCard} ${styles.bentoSmall}`}>
                <div className={styles.stepNumber}>3</div>
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

          {/* Chai Meter Section */}
          <section id="chai-meter" className={styles.chaiMeterSection}>
            <div className={styles.chaiMeterCard}>
              <div className={styles.chaiMeterHeader}>
                <div className={styles.chaiMeterIcon}>
                  <HugeiconsIcon icon={Coffee01Icon} size={24} />
                </div>
                <div className={styles.chaiMeterText}>
                  <h3 className={styles.chaiMeterTitle}>The Chai Meter</h3>
                  <p className={styles.chaiMeterSubtitle}>
                    This project took ~{TOTAL_HOURS_WORKED} hours to build. At {CUPS_PER_DAY} cups
                    of chai per day across {HOURS_PER_WORK_DAY}-hour work sessions, that's{' '}
                    {TOTAL_CHAI_CONSUMED} cups consumed.
                  </p>
                </div>
              </div>
              <div className={styles.chaiMeterProgress}>
                <div className={styles.chaiMeterLabels}>
                  <span className={styles.chaiMeterCurrent}>
                    {proUserCount} chai{proUserCount !== 1 ? 's' : ''} funded
                  </span>
                  <span className={styles.chaiMeterGoal}>Goal: {TOTAL_CHAI_CONSUMED} chais</span>
                </div>
                <div className={styles.chaiMeterBar}>
                  <div
                    className={styles.chaiMeterFill}
                    style={{
                      width: `${Math.min((proUserCount / TOTAL_CHAI_CONSUMED) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className={styles.chaiMeterNote}>
                  Every Pro subscription = 1 chai paid back. Help me break even on my chai
                  addiction!
                </p>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className={styles.pricingSection} aria-labelledby="pricing-title">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>
                Pricing
                <span className={styles.srOnly}> - Simple and transparent</span>
              </span>
              <h2 id="pricing-title" className={styles.sectionTitle}>
                Cheaper Than Chai
              </h2>
              <p className={styles.sectionSubtitle}>
                Support this project for the price of a cup of tea in Bangalore. That's it.
              </p>
            </div>
            <div className={styles.pricingGrid}>
              {/* Free Tier */}
              <div className={styles.pricingCard}>
                <div className={styles.pricingCardInner}>
                  <h3 className={styles.pricingTierName}>Free</h3>
                  <p className={styles.pricingTagline}>Perfect for getting started.</p>

                  <div className={styles.pricingPriceBlock}>
                    <span className={styles.pricingCurrency}>$</span>
                    <span className={styles.pricingAmount}>0</span>
                    <span className={styles.pricingPeriod}>/mo</span>
                  </div>
                  <p className={styles.pricingBillingAlt}>₹0 INR</p>
                  <p className={styles.pricingBilling}>Free forever</p>

                  <button onClick={() => onNavigate('/create')} className={styles.pricingButton}>
                    Get Started with Free
                  </button>

                  <div className={styles.pricingFeatureHighlight}>
                    <strong>3 Polls</strong> with <strong>unlimited votes</strong>
                  </div>

                  <ul className={styles.pricingFeatures}>
                    <li>
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
                      <span>Real-time live results</span>
                    </li>
                    <li>
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
                      <span>Shareable poll links</span>
                    </li>
                    <li>
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
                      <span>15-minute auto-close timer</span>
                    </li>
                    <li>
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
                      <span>Public polls only</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Pro Tier */}
              <div className={`${styles.pricingCard} ${styles.pricingCardPro}`}>
                <div className={styles.mostPopularBadge}>
                  <HugeiconsIcon icon={CrownIcon} size={14} />
                  Most Popular
                </div>
                <div className={styles.pricingCardInner}>
                  <h3 className={`${styles.pricingTierName} ${styles.pricingTierNamePro}`}>
                    Pro + Chai
                  </h3>
                  <p className={styles.pricingTagline}>One chai = One month of Pro. Fair deal?</p>

                  <div className={styles.pricingPriceBlock}>
                    <span className={styles.pricingCurrency}>$</span>
                    <span className={styles.pricingAmount}>0.18</span>
                    <span className={styles.pricingPeriod}>/mo</span>
                  </div>
                  <p className={styles.pricingBillingAlt}>~₹15 INR</p>
                  <p className={styles.pricingBilling}>Less than a cutting chai</p>

                  <button
                    onClick={() => onNavigate('/dashboard')}
                    className={`${styles.pricingButton} ${styles.pricingButtonPro}`}
                  >
                    Buy Me a Chai
                  </button>

                  <div className={styles.pricingFeatureHighlight}>
                    <strong>Unlimited Polls</strong> + <strong>Pro Analytics</strong>
                  </div>

                  <ul className={styles.pricingFeatures}>
                    <li>
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
                      <span>Unlimited polls forever</span>
                    </li>
                    <li>
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
                      <span>Custom auto-close timer</span>
                    </li>
                    <li>
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
                      <span>IP-based vote limiting</span>
                    </li>
                    <li>
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
                      <span>Auto votes simulation</span>
                    </li>
                    <li>
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
                      <span>Private polls with access key</span>
                    </li>
                    <li>
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
                      <span>Vote trends & peak hours</span>
                    </li>
                    <li>
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
                      <span>Engagement & health scores</span>
                    </li>
                    <li>
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
                      <span>Geographic analytics</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Support Tier */}
              <div className={`${styles.pricingCard} ${styles.pricingCardEnterprise}`}>
                <div className={styles.pricingCardInner}>
                  <h3 className={styles.pricingTierName}>Just Premium Chai</h3>
                  <p className={styles.pricingTagline}>
                    No use case? Just vibing with the project?
                  </p>

                  <div className={styles.pricingPriceBlock}>
                    <span className={styles.pricingAmountJoke}>Any Amount</span>
                  </div>
                  <p className={styles.pricingBillingJoke}>Fuel the chai addiction anyway</p>

                  <a
                    href="https://www.buymeacoffee.com/aswinasok"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.pricingButtonSupport}
                    onClick={() => track('buymeacoffee_click', { location: 'pricing' })}
                  >
                    <img
                      src="https://img.buymeacoffee.com/button-api/?text=Buy me a chai&emoji=☕&slug=aswinasok&button_colour=FFDD00&font_colour=000000&font_family=Lato&outline_colour=000000&coffee_colour=ffffff"
                      alt="Buy me a chai"
                    />
                  </a>

                  <div className={styles.pricingFeatureHighlightJoke}>
                    Every sip counts — <strong>thank you!</strong>
                  </div>

                  <ul className={styles.pricingFeaturesJoke}>
                    <li>
                      <span>♥</span>
                      <span>Support an indie dev</span>
                    </li>
                    <li>
                      <span>♥</span>
                      <span>Keep the servers running</span>
                    </li>
                    <li>
                      <span>♥</span>
                      <span>Fund more chai breaks</span>
                    </li>
                    <li>
                      <span>♥</span>
                      <span>Good karma guaranteed</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className={styles.pricingNote}>
              <p className={styles.pricingNoteText}>
                YESS, with this pricing this app won't survive — but this is my first project with a
                subscription model, and my only <span className={styles.pricingNoteWhite}>AIM</span>{' '}
                is to get my{' '}
                <span className={styles.pricingNoteHighlight}>FIRST PAYING CUSTOMER</span>. As you
                can already see, there are{' '}
                <span className={styles.pricingNoteHighlight}>NO PLANS</span> to turn this into the
                next <span className={styles.pricingNoteHighlight}>MILLION DOLLAR</span> idea.
              </p>
            </div>
          </section>

          {/* FAQ Section - Minimal */}
          <section id="faq" className={styles.faqSection} aria-labelledby="faq-title">
            <h2 id="faq-title" className={styles.faqTitle}>
              Frequently Asked Questions
            </h2>
            <div className={styles.faqList} role="list">
              {faqItems.map((item) => {
                const isOpen = openFaqQuestion === item.question;
                return (
                  <div
                    key={item.question}
                    className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}
                    role="listitem"
                  >
                    <button
                      className={styles.faqTrigger}
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaqQuestion(isOpen ? null : item.question)}
                    >
                      <div className={styles.faqQuestion}>
                        <HugeiconsIcon icon={HelpCircleIcon} size={20} />
                        <h3>{item.question}</h3>
                      </div>
                      <span
                        className={`${styles.faqChevron} ${isOpen ? styles.faqChevronOpen : ''}`}
                        aria-hidden="true"
                      >
                        <HugeiconsIcon icon={Add01Icon} size={16} />
                      </span>
                    </button>
                    <div
                      className={`${styles.faqAnswerWrapper} ${isOpen ? styles.faqAnswerOpen : ''}`}
                      role="region"
                      aria-live="polite"
                    >
                      <div>
                        <p className={styles.faqAnswer}>{item.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
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
