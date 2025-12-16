# Versus Space Home Page - Content Structure Analysis & Optimization

## Executive Summary

The Versus Space home page has a solid structural foundation with semantic HTML and clear visual hierarchy. This analysis identifies optimization opportunities for SEO, accessibility, and schema markup implementation to improve search visibility and user experience.

---

## 1. Header Hierarchy Analysis & Recommendations

### Current Structure

```
H1: "Create Real-Time Polls That Engage Instantly"
├── H2: "How to Create a Real-Time Poll"
│   └── H3: (Step titles in cards)
│       - "Create Your Poll"
│       - "Share the Link"
│       - "Watch Live Results"
├── H2: "Best Uses for Real-Time Polling"
│   └── H3: (Use case titles in cards)
│       - "Live Presentations"
│       - "Classroom Activities"
│       - "Team Decisions"
│       - "Events & Conferences"
│       - "Social Engagement"
│       - "Quick Feedback"
├── H2: "Frequently Asked Questions"
│   └── H3: (FAQ questions in cards)
│       - "What is Versus Space?"
│       - "Is Versus Space free to use?"
│       - "Do participants need an account to vote?"
│       - "Can I see poll results in real-time?"
│       - "Are online polls anonymous?"
│       - "How do I share a poll with my audience?"
└── H2: "Ready to Create Your First Real-Time Poll?" (CTA Section)
```

### Issues Identified

1. **Missing semantic H2 for Leaderboard Section** - Uses div instead of semantic header
2. **No H2 for Hero Section content** - Badge and subtitle lack heading context
3. **No H2 for Stats Section** - Live metrics lack heading structure
4. **Inconsistent breadcrumb/context** - Sections lack connecting narrative headers

### Optimization Recommendations

#### Priority 1: Restructure for Semantic Clarity

```jsx
// Hero Section Enhancement
<section className={styles.hero}>
  <h1>Create Real-Time Polls That Engage Instantly</h1>
  {/* Existing content */}
</section>

// Add semantic H2 for Leaderboard (Currently missing)
<section className={styles.leaderboardSection}>
  <h2>Live Leaderboard</h2> {/* Currently in Leaderboard component without semantic structure */}
  <p className={styles.leaderboardSubtitle}>See what's trending and cast your vote</p>
  <Leaderboard onNavigate={onNavigate} />
</section>

// Add semantic H2 for Stats Section
<section className={styles.statsSection}>
  <h2 className="sr-only">Platform Statistics</h2> {/* Screen reader only */}
  {/* Stats grid content */}
</section>
```

#### Priority 2: Add Contextual H2 Headers

```jsx
// Built For Section
<section className={styles.trustedSection}>
  <h2 className="sr-only">Built By Community</h2>
  <p className={styles.trustedLabel}>BUILT FOR HACKATHON AT</p>
  {/* Logo content */}
</section>
```

#### Priority 3: Maintain Logical Hierarchy

| Section | Recommended Structure |
|---------|---------------------|
| Hero | H1 (main value prop) |
| Stats | H2 (sr-only: "Platform Statistics") |
| Leaderboard | H2 ("Live Leaderboard") |
| Built For | H2 (sr-only: "Built By Community") |
| How It Works | H2 + H3 (process steps) |
| Use Cases | H2 + H3 (case categories) |
| FAQ | H2 + H3 (Q&A pairs) |
| CTA | H2 (final conversion point) |

---

## 2. Schema Markup Recommendations

### Priority 1: Organization/SoftwareApplication Schema

Add to page `<head>` for overall site identity:

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Versus Space",
  "description": "Free real-time polling platform with live vote visualization and instant audience engagement",
  "url": "https://versus.space",
  "applicationCategory": "Productivity",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "operatingSystem": "Web Browser",
  "author": {
    "@type": "Person",
    "name": "Aswinasok",
    "url": "https://github.com/AswinAsok"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "@comment": "Update with actual ratings if available",
    "ratingValue": "4.5",
    "ratingCount": "100"
  }
}
```

### Priority 2: HowTo Schema (How It Works Section)

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Create a Real-Time Poll",
  "description": "Create an interactive online poll in under 30 seconds with Versus Space",
  "totalTime": "PT30S",
  "step": [
    {
      "@type": "HowToStep",
      "position": "1",
      "name": "Create Your Poll",
      "text": "Enter your question and add voting options. Customize with images and set visibility to public or private.",
      "image": "/path-to-step-icon-1.png"
    },
    {
      "@type": "HowToStep",
      "position": "2",
      "name": "Share the Link",
      "text": "Copy your unique poll URL and distribute via email, chat, social media, or display on screen during presentations.",
      "image": "/path-to-step-icon-2.png"
    },
    {
      "@type": "HowToStep",
      "position": "3",
      "name": "Watch Live Results",
      "text": "View real-time vote counts with split-screen visualizations as your audience responds instantly.",
      "image": "/path-to-step-icon-3.png"
    }
  ]
}
```

### Priority 3: FAQPage Schema (FAQ Section)

```json
{
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
}
```

### Priority 4: BreadcrumbList Schema

```json
{
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
    }
  ]
}
```

### Priority 5: AggregateOffer Schema (Stats Section)

```json
{
  "@context": "https://schema.org",
  "@type": "AggregateOffer",
  "priceCurrency": "USD",
  "lowPrice": "0",
  "highPrice": "0",
  "offerCount": "Unlimited",
  "@comment": "Display both actual stats from API:"
}
```

### Implementation Strategy

1. **Add to `<head>`** using Next.js/React Helmet or meta tags
2. **Validate** using Google's Structured Data Testing Tool
3. **Monitor** with Google Search Console for enhanced SERP features
4. **Update dynamically** - Stats schema should reflect live `stats.pollsCount` and `stats.votesCount`

---

## 3. Internal Linking Opportunities

### Current State Analysis

**Existing internal links:**
- "Start a War" button → `/auth`
- "Create Poll" button → `/auth` or `/create` (inconsistent)
- Leaderboard item click → `/poll/{id}`
- "Create Your Own Poll" → `/create`
- GitHub link → external (correct: `noopener noreferrer`)

### Optimization Recommendations

#### 3.1 Siloing & Topic Clusters

Create a topical structure around "Real-Time Polling":

```
Home (core)
├── How It Works (educational hub)
│   ├── Create Poll Guide
│   ├── Share Guide
│   └── Results Visualization Guide
├── Use Cases (industry specific)
│   ├── Presentations Guide
│   ├── Classroom Guide
│   ├── Events Guide
│   └── Team Decisions Guide
├── FAQ Section (question resolution)
│   └── Link to dedicated FAQ page if exists
└── Demo/Examples (proof)
    └── Link to gallery/trending polls
```

#### 3.2 Recommended Internal Links to Add

| Location | Source Link Text | Target | Purpose |
|----------|------------------|--------|---------|
| Hero Section | "Launch free online polls" | #how-it-works | Contextual depth |
| How It Works | Step cards | Use case examples | Cross-silo connection |
| Use Cases | "Live Presentations" | #how-it-works or /guide/presentations | Category to guide |
| FAQ Section | Questions like "How do I share" | #how-it-works or /guide/sharing | Answer support |
| CTA Section | "Create Free Poll" | /create (not /auth) | Clearer UX |
| Leaderboard | Card titles | /poll/{id} | ✓ Already present |

#### 3.3 Add Fragment Identifiers for Deep Linking

```jsx
// Add IDs to major sections for anchor linking
<section id="how-it-works" className={styles.howItWorksSection}>
<section id="use-cases" className={styles.useCasesSection}>
<section id="faq" className={styles.faqSection}>
<section id="leaderboard" className={styles.leaderboardSection}>
```

#### 3.4 Table of Contents Implementation

Add a TOC component for pages over 2000 words or multiple sections:

```jsx
<nav className={styles.tableOfContents}>
  <h2>On This Page</h2>
  <ul>
    <li><a href="#how-it-works">How It Works</a></li>
    <li><a href="#use-cases">Use Cases</a></li>
    <li><a href="#faq">FAQ</a></li>
  </ul>
</nav>
```

#### 3.5 Link Anchor Text Audit

| Current | Recommended | Reason |
|---------|------------|--------|
| "Start a War" | "Create a Free Poll" | More SEO-friendly, clearer intent |
| "Give a Star" | Keep as-is | Brand voice appropriate |
| "Create Poll" button | "Create Free Poll" or "Build Your Poll" | Consistency, SEO keyword |

---

## 4. Content Organization Improvements

### 4.1 Visual Hierarchy Assessment

**Strengths:**
- Clear H1 value proposition
- Well-spaced sections with distinct visual breaks
- Color-coded badges (primary color for differentiation)
- Icon usage enhances scannability

**Gaps:**
- No visual separation between sections at mobile
- Stats section lacks narrative context (missing introductory text)
- "Built For" section feels disconnected

### 4.2 Recommended Organizational Changes

#### A. Add Narrative Flow with Introductory Paragraphs

```jsx
// Before "How It Works"
<section className={styles.heroContext}>
  <p className={styles.contextParagraph}>
    Getting started with Versus Space takes less than 30 seconds. Here's what the
    process looks like:
  </p>
</section>
<section className={styles.howItWorksSection}>
  {/* Existing content */}
</section>
```

#### B. Restructure "Built For" Section

**Current Issue:** Feels orphaned without context

**Solution:** Make it part of a "Community & Trust" narrative

```jsx
<section className={styles.communitySection}>
  <h2>Trusted by Developers</h2>
  <p>Built during a hackathon to solve real-world polling needs:</p>
  <div className={styles.trustGrid}>
    <div className={styles.trustItem}>
      <strong>Built For:</strong>
      <img src="/ente-branding-green.png" alt="Ente Hackathon" />
    </div>
    <div className={styles.trustItem}>
      <strong>Made By:</strong>
      <a href="https://github.com/AswinAsok">AswinAsok</a>
    </div>
  </div>
</section>
```

#### C. Content Gap Analysis

| Section | Completeness | Missing Element |
|---------|--------------|-----------------|
| Hero | 100% | N/A - well-rounded |
| Stats | 70% | Context paragraph explaining significance |
| Leaderboard | 85% | Subtitle explaining what "trending" means |
| How It Works | 95% | Estimated time (already says "30 seconds" but could be in schema) |
| Use Cases | 100% | Good coverage |
| FAQ | 85% | Missing CTA in section (link to /create) |
| CTA | 95% | Could include social proof (testimonial snippet) |

### 4.3 Scanability Improvements

#### A. Add a "Features" List Section (after Hero)

```jsx
<section className={styles.featuresOverview}>
  <h2 className="sr-only">Key Features</h2>
  <div className={styles.featuresList}>
    <span><Check size={16} /> Real-time vote visualization</span>
    <span><Check size={16} /> No signup required</span>
    <span><Check size={16} /> Free unlimited polls</span>
    <span><Check size={16} /> Shareable poll links</span>
    <span><Check size={16} /> Anonymous voting</span>
    <span><Check size={16} /> Mobile responsive</span>
  </div>
</section>
```

This helps with:
- Featured snippet potential (list format)
- Screen reader users
- Mobile quick-scan users
- SEO keyword relevance

#### B. Format FAQ as Expandable Accordion

Current grid layout works, but consider:

```jsx
// Enhanced FAQ with expandable design
<div className={styles.faqItem} role="region" aria-labelledby={`question-${id}`}>
  <button
    id={`question-${id}`}
    aria-expanded={isOpen}
    onClick={() => toggleAnswer(id)}
  >
    <h3>{question}</h3>
    <ChevronDown size={20} />
  </button>
  {isOpen && (
    <p className={styles.faqAnswer}>{answer}</p>
  )}
</div>
```

Benefits:
- Better space efficiency on mobile
- Clearer interaction model
- Improved accessibility (ARIA controls)
- Better for featured snippets (expanded content on demand)

---

## 5. Accessibility Structure Recommendations

### 5.1 Current Accessibility Assessment

**Strengths:**
- Semantic HTML sections (`<section>`)
- Proper button elements (not divs)
- Alt text on images
- Color contrast appears adequate

**Issues Found:**

| Issue | Location | Fix |
|-------|----------|-----|
| Missing main landmark | Root element | Add `<main>` wrapper |
| No skip link | Before hero | Add skip-to-content link |
| Implicit heading structure | Leaderboard | Explicit H2 required |
| No ARIA labels on interactive cards | Use case cards | Add role="button" or semantic button |
| Badge text lacks context | All badges | Add sr-only descriptions |
| Video iframe needs title | Demo video | Has `title` ✓ (correct) |

### 5.2 HTML Structure Fixes

#### Priority 1: Semantic Improvements

```jsx
// Add <main> landmark
<div className={styles.homeContainer}>
  <div className={styles.backgroundEffects}>
    {/* LightRays */}
  </div>

  <main className={styles.homeInner}> {/* NEW */}
    {/* All sections */}
  </main>

  <footer className={styles.footer}>
    {/* Footer content */}
  </footer>
</div>
```

#### Priority 2: Skip Navigation Link

```jsx
<a href="#main-content" className={styles.skipLink}>
  Skip to main content
</a>

<main id="main-content" className={styles.homeInner}>
  {/* Content */}
</main>
```

CSS:
```css
.skipLink {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  z-index: 100;
}

.skipLink:focus {
  top: 0;
}
```

#### Priority 3: Enhance Section Headings with ARIA

```jsx
<section className={styles.useCasesSection} aria-labelledby="use-cases-heading">
  <h2 id="use-cases-heading">Best Uses for Real-Time Polling</h2>
  {/* Content */}
</section>
```

### 5.3 Heading Accessibility

**Add sr-only descriptions for badges:**

```jsx
// Current
<span className={styles.sectionBadge}>Use Cases</span>

// Enhanced
<span className={styles.sectionBadge}>
  Use Cases
  <span className="sr-only"> - Real-world applications for real-time polling</span>
</span>
```

CSS for sr-only:
```css
.sr-only {
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
```

### 5.4 Interactive Elements Accessibility

#### Cards with Click Handlers

Current markup in Use Cases uses div cards. Enhance with:

```jsx
<div
  className={styles.useCaseCard}
  role="article"
  tabIndex={0}
  onKeyPress={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Handle interaction
    }
  }}
>
  <h3>{title}</h3>
  <p>{description}</p>
</div>
```

Better approach - use buttons if clickable:

```jsx
<button
  className={styles.useCaseCard}
  onClick={() => navigateTo(useCase)}
  aria-label={`Learn more about ${title}`}
>
  {/* Content */}
</button>
```

#### Form Elements (if expanding to interactive features)

```jsx
// Example for future interactive sections
<fieldset>
  <legend>Poll options</legend>
  <label htmlFor="option-1">Option 1</label>
  <input id="option-1" type="radio" name="poll-choice" />
</fieldset>
```

### 5.5 Keyboard Navigation

Ensure all interactive elements are keyboard accessible:

```jsx
// In buttons and links
<button
  onClick={handler}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handler();
    }
  }}
>
  Action
</button>
```

### 5.6 ARIA Live Regions (for dynamic content)

For the stats section that updates:

```jsx
<div
  className={styles.statsSection}
  aria-live="polite"
  aria-atomic="true"
>
  <div className={styles.statNumber} aria-label="Total polls created">
    {stats.pollsCount}
  </div>
  <div className={styles.statNumber} aria-label="Total votes cast">
    {stats.votesCount}
  </div>
</div>
```

---

## 6. Summary of Implementation Priorities

### Tier 1 (High Impact - Implement First)

1. **Add semantic `<main>` and H2 headers** to all sections
2. **Implement FAQPage schema** (quick wins for featured snippets)
3. **Add section IDs** for fragment linking
4. **Insert HowTo schema** for "How It Works" section
5. **Add sr-only text** to badges

### Tier 2 (Medium Impact - Implement Next)

6. **Restructure CTA buttons** to use consistent `/create` endpoint
7. **Add internal links** between related sections
8. **Enhance FAQ** with accordion pattern
9. **Implement SoftwareApplication schema**
10. **Add skip-to-content link**

### Tier 3 (Enhancement - Implement After)

11. **Build dedicated guides** for use cases (new pages)
12. **Create Table of Contents** component
13. **Add testimonial/social proof** section
14. **Implement ARIA labels** on all interactive elements
15. **Add breadcrumb navigation** with schema

---

## 7. Featured Snippet Optimization

### Opportunities by Section

#### FAQ Section - Direct Answer Box

**Query:** "How to create a real-time poll"
**Current:** Covered well in How It Works
**Optimization:** Ensure answers are 40-60 words in FAQ

#### Use Cases - List Snippet

**Query:** "What are online polls used for"
**Current:** 6 use cases presented
**Add:** Intro paragraph with "Real-time polls are used for:" format

```jsx
<p className={styles.sectionContext}>
  Real-time polls are used for:
</p>
<ol>
  <li>Live Presentations - Engage audiences with instant feedback</li>
  <li>Classroom Activities - Increase student participation</li>
  {/* ... */}
</ol>
```

#### How To - Process Snippet

**Query:** "How to create a poll"
**Current:** Already in HowTo schema format
**Status:** Good - maintain

#### Definitions - Knowledge Panel

**Query:** "What is real-time polling"
**Add dedicated section:**

```jsx
<section id="definition" className={styles.definitionSection}>
  <h2>What is Real-Time Polling?</h2>
  <p>
    Real-time polling is an interactive voting method that displays vote counts
    and results instantly as participants respond, enabling live audience engagement
    during presentations, events, and team discussions.
  </p>
</section>
```

---

## 8. Mobile Considerations

### Responsive Improvements Needed

| Breakpoint | Current | Enhancement |
|-----------|---------|-------------|
| 480px | Good | Consider single-column FAQ |
| 768px | Good | Steps already stack, no change |
| 1024px | Good | Use cases grid works at 2-col |
| 1200px+ | Good | Maintain 3-col use cases |

**Add:** Mobile-optimized headings with smaller font sizes (already present in CSS)

---

## 9. Implementation Code Snippets

### File: /src/components/Home/Home.tsx

#### Change 1: Add Section IDs

```jsx
// How It Works Section - Optimized for HowTo Schema
<section id="how-it-works" className={styles.howItWorksSection}>
  {/* Existing content */}
</section>

// Use Cases Section
<section id="use-cases" className={styles.useCasesSection}>
  {/* Existing content */}
</section>

// FAQ Section
<section id="faq" className={styles.faqSection}>
  {/* Existing content */}
</section>
```

#### Change 2: Add H2 to Leaderboard Section

In Leaderboard.tsx component, add semantic heading:

```jsx
<div className={styles.leaderboardHeader}>
  <span className={styles.leaderboardBadge}>
    <Trophy size={14} />
    Top Polls
  </span>
  <h2 className={styles.leaderboardTitle}>Live Leaderboard</h2>
  <p className={styles.leaderboardSubtitle}>See what's trending and cast your vote</p>
</div>
```

#### Change 3: Wrap in `<main>` Element

```jsx
export function Home({ onNavigate }: HomeProps) {
  const [stats, setStats] = useState({ pollsCount: 0, votesCount: 0 });

  useEffect(() => {
    pollService.getPlatformStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className={styles.homeContainer}>
      {/* Background effects */}

      <main className={styles.homeInner}>
        {/* All sections */}
      </main>

      <footer className={styles.footer}>
        {/* Footer */}
      </footer>
    </div>
  );
}
```

#### Change 4: Add Schema Scripts

Create new file: `/src/components/Home/HomeSchema.tsx`

```tsx
export function HomeSchema({ stats }: { stats: { pollsCount: number; votesCount: number } }) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Versus Space",
    "description": "Free real-time polling platform with live vote visualization",
    "url": "https://versus.space",
    "applicationCategory": "Productivity",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      /* FAQ items */
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
```

---

## 10. Testing & Validation Checklist

- [ ] Google Structured Data Testing Tool validates all schemas
- [ ] Lighthouse accessibility score 90+
- [ ] All sections have proper heading hierarchy (no skipped levels)
- [ ] All images have descriptive alt text
- [ ] Keyboard navigation works without mouse
- [ ] Screen reader testing (NVDA/JAWS)
- [ ] Mobile viewport testing at 320px, 480px, 768px
- [ ] Color contrast ratio 4.5:1 for text
- [ ] Focus indicators visible on all interactive elements
- [ ] Page passes Google PageSpeed Insights on mobile

---

## 11. Expected SEO Benefits

### Improved SERP Features

1. **FAQ Schema** → FAQ featured snippets
2. **HowTo Schema** → How-to carousel results
3. **Heading hierarchy** → Better internal linking & topic clustering
4. **Accessibility** → Improved crawlability & indexing
5. **Schema markup** → Knowledge panels, rich results

### Estimated Ranking Impact

- **Short-term (1-2 weeks):** Schema indexing, structured data validation
- **Medium-term (1-2 months):** Featured snippet appearances, FAQ results
- **Long-term (3+ months):** Improved CTR from rich results, topical authority

---

## Quick Reference: Before/After Comparison

### Header Structure
```
BEFORE                          AFTER
H1: Main title                  H1: Main title
H2: How it works               H2: How it works
H3: Step titles                H3: Step titles
H2: Use Cases                  H2: Use Cases
H3: Case titles                H3: Case titles
H2: FAQ                        H2: FAQ
H3: Questions                  H3: Questions
H2: CTA                        H2: Final CTA

MISSING:                       FIXED:
- H2 for Leaderboard          + Added H2: Live Leaderboard
- H2 for Stats                + Added sr-only H2: Platform Stats
- Section IDs                 + Added id="#how-it-works", etc.
- Main landmark               + Added <main> element
```

### Schema Markup Coverage
```
BEFORE                AFTER
None                  FAQPage Schema ✓
                      HowTo Schema ✓
                      SoftwareApplication Schema ✓
                      BreadcrumbList Schema ✓
```

### Internal Linking
```
BEFORE                          AFTER
Start a War → /auth             Start a War → /create (consistent)
Create Poll → /auth or /create  Create Free Poll → /create
Links mostly external           + Links between sections with IDs
No TOC                          + TOC component for navigation
```

---

## Files to Modify

1. **`/src/components/Home/Home.tsx`**
   - Add `<main>` element
   - Add section IDs
   - Fix CTA button routes
   - Add schema component

2. **`/src/components/Home/Leaderboard.tsx`**
   - Ensure H2 is properly semantic

3. **`/src/components/Home/Home.module.css`**
   - Add sr-only styles (if not present)
   - No major CSS changes needed

4. **`/src/App.tsx` or layout file**
   - Consider adding global schema or Helmet for head management

5. **New file: `/src/components/Home/HomeSchema.tsx`**
   - Central location for all schema markup

---

## Conclusion

The Versus Space home page has a solid foundation. By implementing these structural and semantic improvements, you'll see:

- Better SEO performance with featured snippet opportunities
- Improved accessibility for all users
- Clearer information hierarchy
- Enhanced mobile experience
- Stronger topical authority signals to search engines

**Recommended implementation timeline:** 1-2 days for core changes, ongoing monitoring post-launch.

