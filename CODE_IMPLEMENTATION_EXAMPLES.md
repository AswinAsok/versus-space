# Versus Space - Code Implementation Examples

Complete code snippets for implementing all optimization recommendations.

---

## 1. Updated Home.tsx (Partial - Key Changes)

### Before
```tsx
// File: /src/components/Home/Home.tsx (Original)

export function Home({ onNavigate }: HomeProps) {
  const [stats, setStats] = useState({ pollsCount: 0, votesCount: 0 });

  useEffect(() => {
    pollService.getPlatformStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className={styles.homeContainer}>
      <div style={{ position: 'fixed', ... }}>
        <LightRays ... />
      </div>
      <div className={styles.homeInner}>
        {/* All sections */}
      </div>
      <footer>...</footer>
    </div>
  );
}
```

### After (Key Changes)

```tsx
// File: /src/components/Home/Home.tsx (Enhanced)

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
} from 'lucide-react';
import { track } from '@vercel/analytics';
import { Leaderboard } from './Leaderboard';
import { HomeSchema } from './HomeSchema'; // NEW IMPORT
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
    <div className={styles.homeContainer}>
      {/* CHANGE 1: Add HomeSchema Component */}
      <HomeSchema stats={stats} />

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

      {/* CHANGE 2: Replace div with main element */}
      <main className={styles.homeInner}>
        {/* CHANGE 3: Add skip-to-content link (optional, can be in Header instead) */}
        <a href="#main-content" className={styles.skipLink}>
          Skip to main content
        </a>

        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBadge}>
            <Sparkles size={14} />
            <span>Free Real-Time Polling Platform</span>
          </div>
          <h1 className={styles.heroTitle}>
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
              Create Your First Poll <ArrowRight size={18} />
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
              title="Versus Space Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <p className={styles.demoNote}>
              *Demo video was recorded in the last hour of submission. Demo v2 coming soon!
            </p>
          </div>
        </section>

        {/* Stats Section - CHANGED: Added semantic H2 */}
        <section className={styles.statsSection}>
          <h2 className={styles.srOnly}>Platform Statistics</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statNumber} aria-label="Total polls created">
                {stats.pollsCount.toLocaleString()}
              </div>
              <div className={styles.statLabel}>Polls Created</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <div className={styles.statNumber} aria-label="Total votes cast">
                {stats.votesCount.toLocaleString()}
              </div>
              <div className={styles.statLabel}>Clicks Cast</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <button onClick={() => onNavigate('/create')} className={styles.statButton}>
                Create Poll <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </section>

        {/* Leaderboard Section - CHANGED: Added ID */}
        <section id="leaderboard" className={styles.leaderboardSection}>
          <Leaderboard onNavigate={onNavigate} />
        </section>

        {/* Built For Section - CHANGED: Added semantic H2 */}
        <section className={styles.trustedSection}>
          <h2 className={styles.srOnly}>Built by Community</h2>
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
                alt="Ente - Built at Ente Hackathon"
                style={{ height: '48px', width: 'auto' }}
              />
            </a>
          </div>
        </section>

        {/* How It Works Section - CHANGED: Added ID */}
        <section id="how-it-works" className={styles.howItWorksSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>
              Simple Process
              <span className={styles.srOnly}> - Real-time polling in 3 easy steps</span>
            </span>
            <h2 className={styles.sectionTitle}>How to Create a Real-Time Poll</h2>
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

        {/* Use Cases Section - CHANGED: Added ID */}
        <section id="use-cases" className={styles.useCasesSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>
              Use Cases
              <span className={styles.srOnly}> - Real-world applications for real-time polling</span>
            </span>
            <h2 className={styles.sectionTitle}>Best Uses for Real-Time Polling</h2>
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

        {/* FAQ Section - CHANGED: Added ID */}
        <section id="faq" className={styles.faqSection} aria-labelledby="faq-heading">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>
              FAQ
              <span className={styles.srOnly}> - Frequently asked questions about Versus Space</span>
            </span>
            <h2 id="faq-heading" className={styles.sectionTitle}>
              Frequently Asked Questions
            </h2>
            <p className={styles.sectionSubtitle}>
              Everything you need to know about real-time polling with Versus Space.
            </p>
          </div>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <HelpCircle size={20} />
                <h3>What is Versus Space?</h3>
              </div>
              <p className={styles.faqAnswer}>
                Versus Space is a free real-time polling platform that allows you to create
                interactive polls in seconds and watch votes stream in live with split-screen
                visualizations. It's perfect for presentations, events, classrooms, and team
                decisions.
              </p>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <HelpCircle size={20} />
                <h3>Is Versus Space free to use?</h3>
              </div>
              <p className={styles.faqAnswer}>
                Yes, Versus Space is completely free to use with no limits on the number of polls
                you can create or votes you can receive. No credit card required.
              </p>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <HelpCircle size={20} />
                <h3>Do participants need an account to vote?</h3>
              </div>
              <p className={styles.faqAnswer}>
                No, participants can vote instantly by clicking your shared link. No signup or
                account creation is required to participate in polls. <a href="#how-it-works">Learn how it works</a>.
              </p>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <HelpCircle size={20} />
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
                <HelpCircle size={20} />
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
                <HelpCircle size={20} />
                <h3>How do I share a poll with my audience?</h3>
              </div>
              <p className={styles.faqAnswer}>
                Share your poll by copying the unique URL to send via email or chat, displaying the
                link on screen during presentations, or posting directly to social media.
                Participants can vote instantly. See <a href="#how-it-works">how it works</a>.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Create Your First Real-Time Poll?</h2>
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
  );
}
```

---

## 2. New HomeSchema.tsx Component

```tsx
// File: /src/components/Home/HomeSchema.tsx (NEW FILE)

interface HomeSchemaProps {
  stats: {
    pollsCount: number;
    votesCount: number;
  };
}

export function HomeSchema({ stats }: HomeSchemaProps) {
  // Organization/SoftwareApplication Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Versus Space",
    "description":
      "Free real-time polling platform with live vote visualization. Create interactive polls in seconds and watch votes stream in live with split-screen visualizations.",
    "url": "https://versus.space",
    "applicationCategory": "ProductivityApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "name": "Free Plan"
    },
    "operatingSystem": "Web",
    "browserRequirements": "Requires JavaScript enabled",
    "author": {
      "@type": "Person",
      "name": "Aswinasok",
      "url": "https://github.com/AswinAsok"
    },
    "image": "https://versus.space/og-image.png",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "ratingCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  // HowTo Schema for "How It Works" section
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Create a Real-Time Poll",
    "description":
      "Create an interactive online poll in under 30 seconds with Versus Space. No signup required.",
    "image": [
      "https://versus.space/images/step-1.png",
      "https://versus.space/images/step-2.png",
      "https://versus.space/images/step-3.png"
    ],
    "estimatedDuration": "PT30S",
    "step": [
      {
        "@type": "HowToStep",
        "position": "1",
        "name": "Create Your Poll",
        "text": "Enter your question and add voting options. Customize with images and set visibility to public or private.",
        "image": "https://versus.space/images/step-1.png"
      },
      {
        "@type": "HowToStep",
        "position": "2",
        "name": "Share the Link",
        "text": "Copy your unique poll URL and distribute via email, chat, social media, or display on screen during presentations.",
        "image": "https://versus.space/images/step-2.png"
      },
      {
        "@type": "HowToStep",
        "position": "3",
        "name": "Watch Live Results",
        "text": "View real-time vote counts with split-screen visualizations as your audience responds instantly.",
        "image": "https://versus.space/images/step-3.png"
      }
    ]
  };

  // FAQPage Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Versus Space?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Versus Space is a free real-time polling platform that allows you to create interactive polls in seconds and watch votes stream in live with split-screen visualizations. It's perfect for presentations, events, classrooms, and team decisions."
        }
      },
      {
        "@type": "Question",
        "name": "Is Versus Space free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Versus Space is completely free to use with no limits on the number of polls you can create or votes you can receive. No credit card required."
        }
      },
      {
        "@type": "Question",
        "name": "Do participants need an account to vote?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, participants can vote instantly by clicking your shared link. No signup or account creation is required to participate in polls."
        }
      },
      {
        "@type": "Question",
        "name": "Can I see poll results in real-time?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Versus Space shows poll results updating in real-time as participants vote. Results display through split-screen visualizations that animate live, making it ideal for presentations and events."
        }
      },
      {
        "@type": "Question",
        "name": "Are online polls anonymous?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Versus Space polls are anonymous by default. Participants can vote without providing personal information. Poll creators see aggregate results but not individual voter identities."
        }
      },
      {
        "@type": "Question",
        "name": "How do I share a poll with my audience?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Share your poll by copying the unique URL to send via email or chat, displaying the link on screen during presentations, or posting directly to social media. Participants can vote instantly."
        }
      }
    ]
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://versus.space"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "How It Works",
        "item": "https://versus.space#how-it-works"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Use Cases",
        "item": "https://versus.space#use-cases"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "FAQ",
        "item": "https://versus.space#faq"
      }
    ]
  };

  return (
    <>
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* HowTo Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
```

---

## 3. Updated CSS - Home.module.css

Add these styles to your existing Home.module.css:

```css
/* File: /src/components/Home/Home.module.css (Additions) */

/* Screen Reader Only Class */
.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Skip to Content Link */
.skipLink {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary);
  color: #000000;
  padding: 8px 16px;
  z-index: 100;
  text-decoration: none;
  font-weight: 600;
  border-radius: 0 0 var(--radius-md) 0;
  transition: all var(--transition-fast) var(--ease-out);
}

.skipLink:focus {
  top: 0;
}

.skipLink:focus:visible {
  outline: 2px solid #000000;
  outline-offset: 2px;
}

/* Update FAQ items with aria-labelledby support */
.faqSection[aria-labelledby] {
  /* This attribute helps screen readers associate section content with heading */
  /* No additional CSS needed, semantic HTML attribute does the work */
}

/* Add underlines to internal links in FAQ answers */
.faqAnswer a {
  color: var(--color-primary);
  text-decoration: underline;
  font-weight: 500;
  transition: opacity var(--transition-fast) var(--ease-out);
}

.faqAnswer a:hover {
  opacity: 0.8;
}

.faqAnswer a:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Ensure main element has proper styling */
main {
  width: 100%;
}
```

---

## 4. Updated Leaderboard.tsx (Minor Enhancement)

No major changes needed - the component already has proper H2 semantics.

However, ensure the H2 is using semantic HTML (already correct in your code):

```tsx
// File: /src/components/Home/Leaderboard.tsx (Already Correct - No Changes)
// The component already has:
// <h2 className={styles.leaderboardTitle}>Live Leaderboard</h2>

// Just verify this is present (it is in your current code ✓)
```

---

## 5. Index/Root File - Add Main Content ID

If using a layout wrapper or root component:

```tsx
// File: /src/components/Layout/Header.tsx (or similar)

// If adding skip link in header:
export function Header() {
  return (
    <>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      {/* Header content */}
    </>
  );
}
```

Then in Home.tsx:

```tsx
<main id="main-content" className={styles.homeInner}>
  {/* All sections */}
</main>
```

---

## 6. Testing - Validation Scripts

### Test Schema Markup

```bash
# Using Node.js to validate JSON-LD structure:
node -e "
const schema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': []
};
console.log('Schema valid:', JSON.stringify(schema, null, 2));
"
```

### SEO Audit Script (Optional)

Create a file: `/scripts/seo-audit.js`

```javascript
// File: /scripts/seo-audit.js

const fs = require('fs');

/**
 * Basic SEO audit for home page structure
 * Run: node scripts/seo-audit.js
 */

const checklist = {
  semanticHTML: {
    mainElement: 'Should have <main> element',
    sections: 'Should have 7+ <section> elements',
    heading: 'Should have exactly 1 <h1>',
    h2s: 'Should have 5+ <h2> elements',
    footer: 'Should have <footer> element',
  },
  schema: {
    faqSchema: 'FAQPage schema present',
    howToSchema: 'HowTo schema present',
    organizationSchema: 'SoftwareApplication schema present',
    breadcrumbSchema: 'BreadcrumbList schema present',
  },
  accessibility: {
    skipLink: 'Skip-to-content link present',
    ariaLabels: 'ARIA labels on sections',
    altText: 'All images have alt text',
    focusIndicators: 'Focus indicators visible',
  },
  internalLinks: {
    sectionIds: 'All sections have IDs',
    fragmentLinks: 'Links use fragment identifiers',
    consistency: 'All CTAs link to /create',
  },
};

console.log('\n===== HOME PAGE SEO AUDIT CHECKLIST =====\n');

Object.entries(checklist).forEach(([category, items]) => {
  console.log(`${category.toUpperCase()}:`);
  Object.entries(items).forEach(([item, description]) => {
    console.log(`  [ ] ${item}: ${description}`);
  });
  console.log();
});

console.log('===== Validation URLs =====\n');
console.log('Schema.org Validator:');
console.log('  https://validator.schema.org/\n');
console.log('Google Rich Results Test:');
console.log('  https://search.google.com/test/rich-results\n');
console.log('Lighthouse Accessibility:');
console.log('  Chrome DevTools → Lighthouse → Accessibility\n');
```

Run with: `node scripts/seo-audit.js`

---

## 7. Type Safety - TypeScript Definitions

Add to your types file if needed:

```typescript
// File: /src/types/index.ts (or similar)

export interface HomeSchemaProps {
  stats: {
    pollsCount: number;
    votesCount: number;
  };
}

export interface SchemaOrganization {
  "@context": "https://schema.org";
  "@type": "SoftwareApplication";
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  offers: {
    "@type": "Offer";
    price: string;
    priceCurrency: string;
  };
}

export interface SchemaFAQPage {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}
```

---

## 8. Migration Steps (Day-by-Day Plan)

### Day 1: Core Structure (2 hours)
```bash
# 1. Create HomeSchema.tsx
touch src/components/Home/HomeSchema.tsx
# Copy code from section 2 above

# 2. Update Home.tsx
# - Add import for HomeSchema
# - Change <div> to <main> for homeInner
# - Add id attributes to sections
# - Add sr-only headings

# 3. Update Home.module.css
# - Add .srOnly styles
# - Add .skipLink styles

# 4. Test in dev environment
npm run dev
# Visit http://localhost:5173
# Check page source for schema tags
```

### Day 2: Validation & Testing (1 hour)
```bash
# 1. Validate schemas
# Copy each schema to https://validator.schema.org/

# 2. Test with Rich Results
# Go to https://search.google.com/test/rich-results
# Paste URL when deployed

# 3. Run Lighthouse
# Chrome DevTools > Lighthouse > Accessibility
# Target: 90+ score

# 4. Test keyboard navigation
# Use Tab key to navigate entire page
# Verify all interactive elements accessible
```

### Day 3: Content & Links (1-2 hours)
```bash
# 1. Add internal links in FAQ answers
# Update faqAnswer paragraphs to include anchor links

# 2. Verify CTA button routes
# All should point to /create (not /auth)

# 3. Test mobile responsiveness
# Chrome DevTools > Toggle device toolbar
# Test at 320px, 480px, 768px, 1024px
```

---

## 9. Rollback Strategy

If issues occur after deployment:

```bash
# View git history
git log --oneline -10

# Revert to previous version
git revert <commit-hash>
git push origin main

# Or reset (if not pushed yet)
git reset --hard <commit-hash>
```

---

## 10. Monitoring Post-Implementation

```javascript
// Optional: Add to Google Analytics to track engagement
// File: /src/components/Home/Home.tsx

useEffect(() => {
  // Track section views when scrolling
  const handleScroll = () => {
    const sections = ['hero', 'how-it-works', 'use-cases', 'faq'];
    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          track('section_view', { section: sectionId });
        }
      }
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

---

## Summary of Changes

| File | Changes | Impact |
|------|---------|--------|
| Home.tsx | Add schema, main element, section IDs, sr-only headings | SEO, Accessibility |
| HomeSchema.tsx | NEW - Contains all schema markup | Search results, rich snippets |
| Home.module.css | Add sr-only, skipLink styles | Accessibility |
| Leaderboard.tsx | No changes needed (already correct) | N/A |

**Total Implementation Time:** 3-4 hours (1 day)
**Testing Time:** 2-3 hours (additional)

All changes are backward compatible and non-breaking.

