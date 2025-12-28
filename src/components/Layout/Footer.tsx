/**
 * Footer Component - SEO-Optimized Footer with Internal Links
 *
 * Provides comprehensive internal linking structure for improved
 * crawlability and SEO. Includes schema markup for organization.
 */

import { Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { CodeIcon, GithubIcon, BookOpen01Icon, Tap01Icon, UserGroupIcon, HelpCircleIcon } from '@hugeicons/core-free-icons';
import styles from './Footer.module.css';

interface FooterProps {
  variant?: 'full' | 'minimal';
}

export function Footer({ variant = 'minimal' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  if (variant === 'minimal') {
    return (
      <footer className={styles.footerMinimal}>
        <span>&copy; {currentYear} versus.space</span>
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
      </footer>
    );
  }

  // Full footer with comprehensive internal linking for SEO
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.footerContent}>
        <div className={styles.footerGrid}>
          {/* Brand Section */}
          <div className={styles.footerBrand}>
            <Link to="/" className={styles.brandLogo}>
              <span className={styles.logoHighlight}>v</span>ersu
              <span className={styles.logoHighlight}>s</span>
              <span className={styles.logoDot}>.</span>space
            </Link>
            <p className={styles.brandDescription}>
              Real-time polling software for business teams. Create instant polls for team
              decisions, corporate events, and live presentations.
            </p>
            <div className={styles.socialLinks}>
              <a
                href="https://github.com/AswinAsok/versus-space"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Versus Space on GitHub"
              >
                <HugeiconsIcon icon={GithubIcon} size={20} />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <nav className={styles.footerNav} aria-label="Product">
            <h3 className={styles.navTitle}>Product</h3>
            <ul>
              <li>
                <Link to="/create">
                  <HugeiconsIcon icon={Tap01Icon} size={14} />
                  Create Poll
                </Link>
              </li>
              <li>
                <Link to="/#features">Features</Link>
              </li>
              <li>
                <Link to="/#how-it-works">How It Works</Link>
              </li>
              <li>
                <Link to="/#use-cases">Use Cases</Link>
              </li>
            </ul>
          </nav>

          {/* Resources Links */}
          <nav className={styles.footerNav} aria-label="Resources">
            <h3 className={styles.navTitle}>Resources</h3>
            <ul>
              <li>
                <Link to="/blog">
                  <HugeiconsIcon icon={BookOpen01Icon} size={14} />
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/#faq">
                  <HugeiconsIcon icon={HelpCircleIcon} size={14} />
                  FAQ
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/AswinAsok/versus-space"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <HugeiconsIcon icon={GithubIcon} size={14} />
                  GitHub
                </a>
              </li>
            </ul>
          </nav>

          {/* Use Cases Links - Important for SEO */}
          <nav className={styles.footerNav} aria-label="Use Cases">
            <h3 className={styles.navTitle}>Use Cases</h3>
            <ul>
              <li>
                <Link to="/#use-cases">
                  <HugeiconsIcon icon={UserGroupIcon} size={14} />
                  Team Decisions
                </Link>
              </li>
              <li>
                <Link to="/#use-cases">Live Presentations</Link>
              </li>
              <li>
                <Link to="/#use-cases">Corporate Events</Link>
              </li>
              <li>
                <Link to="/#use-cases">Employee Feedback</Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            &copy; {currentYear} Versus Space. Free real-time polling for teams worldwide.
          </p>
          <p className={styles.attribution}>
            <a
              href="https://neal.fun"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              inspired from neal.fun
            </a>
            <span className={styles.footerDivider}>|</span>
            <a
              href="https://github.com/AswinAsok"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              <HugeiconsIcon icon={CodeIcon} size={14} />
              built by aswinasok
            </a>
          </p>
        </div>
      </div>

      {/* Schema.org LocalBusiness markup for footer */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Versus Space',
            url: 'https://versus.space',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://versus.space/poll/{poll_id}',
              'query-input': 'required name=poll_id',
            },
          }),
        }}
      />
    </footer>
  );
}

export default Footer;
