/**
 * Blog Component - Content SEO Hub
 *
 * This component serves as the blog listing page, optimized for
 * organic search traffic targeting B2B corporate audiences.
 */

import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar01Icon, Clock01Icon, ArrowRight01Icon, BookOpen01Icon, CodeIcon, Tap01Icon } from '@hugeicons/core-free-icons';
import LightRays from '../ReactBits/LightRays';
import styles from './Blog.module.css';

// Blog post metadata - In production, this would come from a CMS or API
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  publishedDate: string;
  readTime: string;
  category: string;
  keywords: string;
  image?: string;
}

// SEO-optimized blog posts targeting B2B corporate keywords
export const blogPosts: BlogPost[] = [
  {
    slug: 'real-time-polling-for-remote-teams',
    title: 'Real-Time Polling for Remote Teams: Best Practices for 2025',
    description:
      'Learn how distributed teams use real-time polling software to make faster decisions, improve engagement, and build consensus across time zones.',
    excerpt:
      'Remote work has fundamentally changed how teams make decisions. Discover how leading companies use real-time polling to maintain engagement and drive alignment in distributed workforces.',
    publishedDate: '2025-01-15',
    readTime: '8 min read',
    category: 'Team Collaboration',
    keywords:
      'remote team polling, distributed team decisions, virtual meeting polls, remote work voting tools',
  },
  {
    slug: 'best-practices-corporate-voting',
    title: 'Corporate Voting Best Practices: A Guide for Business Leaders',
    description:
      'Comprehensive guide to implementing effective corporate voting systems. Learn how to run transparent polls for board meetings, stakeholder decisions, and employee feedback.',
    excerpt:
      'From board meetings to all-hands surveys, corporate voting requires transparency, security, and ease of use. This guide covers everything business leaders need to know.',
    publishedDate: '2025-01-10',
    readTime: '12 min read',
    category: 'Corporate Governance',
    keywords:
      'corporate voting software, board voting systems, stakeholder polling, enterprise voting platform',
  },
  {
    slug: 'anonymous-polling-workplace-decisions',
    title: 'Anonymous Polling: Getting Honest Feedback on Workplace Decisions',
    description:
      'Why anonymous voting leads to better workplace decisions. Research-backed strategies for collecting honest employee feedback without fear of reprisal.',
    excerpt:
      'Anonymous polling removes the fear factor from workplace feedback. Learn how to structure anonymous votes that yield actionable insights while maintaining trust.',
    publishedDate: '2025-01-05',
    readTime: '6 min read',
    category: 'Employee Engagement',
    keywords:
      'anonymous workplace polling, employee feedback tools, anonymous voting software, honest workplace feedback',
  },
  {
    slug: 'live-presentation-polling-guide',
    title: 'Live Presentation Polling: Engage Your Audience in Real-Time',
    description:
      'Transform passive presentations into interactive experiences. Complete guide to using live polls during conferences, webinars, and corporate meetings.',
    excerpt:
      'Static presentations lose audience attention within minutes. Live polling keeps participants engaged and provides valuable real-time feedback for presenters.',
    publishedDate: '2025-01-01',
    readTime: '10 min read',
    category: 'Presentations',
    keywords:
      'live presentation polling, webinar audience engagement, conference polling tools, interactive presentation software',
  },
  {
    slug: 'team-decision-making-frameworks',
    title: 'Team Decision-Making Frameworks: When and How to Use Polling',
    description:
      'Not every decision needs a vote. Learn which decisions benefit from team polling and how to structure votes for optimal outcomes.',
    excerpt:
      'Effective leaders know when to decide and when to poll. This framework helps you identify which decisions warrant team input and how to structure the voting process.',
    publishedDate: '2024-12-20',
    readTime: '9 min read',
    category: 'Leadership',
    keywords:
      'team decision making, group voting strategies, collaborative decision tools, team consensus building',
  },
  {
    slug: 'event-polling-attendee-engagement',
    title: 'Event Polling: Maximizing Attendee Engagement at Corporate Events',
    description:
      'From icebreakers to post-event surveys, learn how event organizers use real-time polling to boost attendee participation and gather actionable feedback.',
    excerpt:
      'Corporate events are expensive. Maximize your ROI by using strategic polling throughout the event lifecycle to engage attendees and measure success.',
    publishedDate: '2024-12-15',
    readTime: '7 min read',
    category: 'Events',
    keywords:
      'event polling software, conference audience engagement, corporate event feedback, live event voting',
  },
];

// Blog listing page schema
const blogListSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'Versus Space Blog',
  description:
    'Expert insights on real-time polling, corporate voting, and team decision-making for business professionals.',
  url: 'https://versus.space/blog',
  publisher: {
    '@type': 'Organization',
    name: 'Versus Space',
    logo: {
      '@type': 'ImageObject',
      url: 'https://versus.space/meta/icons/android-icon-192x192.png',
    },
  },
  blogPost: blogPosts.map((post) => ({
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedDate,
    url: `https://versus.space/blog/${post.slug}`,
    author: {
      '@type': 'Organization',
      name: 'Versus Space',
    },
  })),
};

export function Blog() {
  return (
    <>
      <Helmet>
        <title>Blog - Real-Time Polling Insights for Business | Versus Space</title>
        <meta
          name="description"
          content="Expert insights on real-time polling, corporate voting, team decisions, and audience engagement. Practical guides for business professionals."
        />
        <meta
          name="keywords"
          content="polling best practices, corporate voting guide, team decision making, audience engagement tips, real-time feedback strategies"
        />
        <link rel="canonical" href="https://versus.space/blog" />
        <meta property="og:title" content="Versus Space Blog - Polling Insights for Business" />
        <meta
          property="og:description"
          content="Expert insights on real-time polling, corporate voting, and team decision-making."
        />
        <meta property="og:url" content="https://versus.space/blog" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(blogListSchema)}</script>
      </Helmet>

      <div className={styles.blogContainer}>
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

        <main id="main-content" className={styles.blogInner}>
          {/* Hero/Header Section */}
          <header className={styles.blogHeader}>
            <div className={styles.headerContent}>
              <span className={styles.headerBadge}>
                <HugeiconsIcon icon={BookOpen01Icon} size={16} />
                Resources
              </span>
              <h1 className={styles.headerTitle}>
                <span className={styles.gradientText}>Polling Insights</span> for Business Teams
              </h1>
              <p className={styles.headerSubtitle}>
                Expert guides on real-time polling, corporate voting, team decisions, and audience
                engagement strategies.
              </p>
            </div>
          </header>

          {/* Blog Posts Section */}
          <section className={styles.blogMain} aria-labelledby="posts-title">
            <h2 id="posts-title" className={styles.srOnly}>
              Blog Posts
            </h2>
            <div className={styles.postsGrid}>
              {blogPosts.map((post) => (
                <article key={post.slug} className={styles.postCard}>
                  <div className={styles.postMeta}>
                    <span className={styles.postCategory}>{post.category}</span>
                    <div className={styles.postDateInfo}>
                      <span className={styles.postDate}>
                        <HugeiconsIcon icon={Calendar01Icon} size={14} />
                        {new Date(post.publishedDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className={styles.postReadTime}>
                        <HugeiconsIcon icon={Clock01Icon} size={14} />
                        {post.readTime}
                      </span>
                    </div>
                  </div>
                  <h3 className={styles.postTitle}>
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className={styles.postExcerpt}>{post.excerpt}</p>
                  <Link to={`/blog/${post.slug}`} className={styles.readMore}>
                    Read article <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </main>

        {/* CTA Section */}
        <section id="cta" className={styles.ctaSection} aria-labelledby="cta-title">
          <div className={styles.ctaContent}>
            <div className={styles.ctaText}>
              <h2 id="cta-title" className={styles.ctaTitle}>
                Ready to create your first poll?
              </h2>
              <p className={styles.ctaSubtitle}>Free forever. No signup required.</p>
            </div>
            <Link to="/create" className={styles.ctaButton}>
              Create Free Poll <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            </Link>
          </div>
        </section>

        {/* Footer with SEO Internal Links */}
        <footer className={styles.footer}>
          <div className={styles.footerTop}>
            <nav className={styles.footerNav} aria-label="Footer navigation">
              <Link to="/" className={styles.footerNavLink}>
                Home
              </Link>
              <Link to="/create" className={styles.footerNavLink}>
                <Vote size={14} />
                Create Poll
              </Link>
              <Link to="/blog" className={styles.footerNavLink}>
                <BookOpen size={14} />
                Blog
              </Link>
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
                <Code2 size={14} />
                built by aswinasok<span className={styles.footerDot}>.</span>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default Blog;
