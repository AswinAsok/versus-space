/**
 * BlogPost Component - Individual Blog Post Page
 *
 * Renders individual blog posts with full SEO optimization
 * including article schema markup for rich snippets.
 */

import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, ArrowLeft, ArrowRight, Share2 } from 'lucide-react';
import { blogPosts } from './Blog';
import styles from './BlogPost.module.css';

// Blog post content - In production, this would come from a CMS
const blogContent: Record<string, React.ReactNode> = {
  'real-time-polling-for-remote-teams': (
    <>
      <p>
        Remote work has fundamentally transformed how teams operate, collaborate, and make
        decisions. With team members spread across different time zones and working asynchronously,
        traditional decision-making processes often fall short. This is where real-time polling
        software becomes invaluable.
      </p>

      <h2>The Challenge of Remote Decision-Making</h2>
      <p>
        Distributed teams face unique challenges when it comes to reaching consensus. Lengthy email
        threads, time zone conflicts, and the inability to read the room during video calls make it
        difficult to gauge team sentiment and make timely decisions.
      </p>

      <h2>How Real-Time Polling Transforms Remote Collaboration</h2>
      <p>
        Real-time polling tools like Versus Space address these challenges by providing instant,
        visual feedback that works across time zones. Here are key strategies for implementing
        effective remote team polling:
      </p>

      <h3>1. Asynchronous Polling for Global Teams</h3>
      <p>
        Create polls that remain open for 24-48 hours, allowing team members in all time zones to
        participate. Share poll links via Slack, Teams, or email so everyone can vote at their
        convenience.
      </p>

      <h3>2. Real-Time Polls During Virtual Meetings</h3>
      <p>
        For synchronous meetings, use live polls to quickly gather opinions and break decision
        deadlocks. The visual split-screen results create engagement and transparency that text-based
        voting lacks.
      </p>

      <h3>3. Anonymous Voting for Honest Feedback</h3>
      <p>
        Remote workers may hesitate to voice dissenting opinions in group settings. Anonymous polls
        remove this barrier, leading to more honest feedback and better decisions.
      </p>

      <h2>Best Practices for Remote Team Polling</h2>
      <ul>
        <li>Keep poll questions clear and concise</li>
        <li>Limit options to 2-4 choices to prevent decision paralysis</li>
        <li>Set clear deadlines for asynchronous polls</li>
        <li>Share results transparently with the entire team</li>
        <li>Use polls for input, but maintain clear decision-making authority</li>
      </ul>

      <h2>Conclusion</h2>
      <p>
        Real-time polling is no longer a nice-to-have for remote teams; it is essential
        infrastructure for distributed collaboration. By implementing the strategies outlined above,
        your team can make faster, more inclusive decisions regardless of where members are located.
      </p>
    </>
  ),

  'best-practices-corporate-voting': (
    <>
      <p>
        Corporate voting serves as the backbone of organizational governance. From board resolutions
        to employee surveys, effective voting systems ensure transparency, accountability, and
        inclusive decision-making. This guide covers everything business leaders need to implement
        robust corporate voting processes.
      </p>

      <h2>Types of Corporate Voting</h2>

      <h3>Board and Shareholder Voting</h3>
      <p>
        Formal votes on company direction, executive decisions, and governance matters. These
        require audit trails, proxy capabilities, and often weighted voting based on share ownership.
      </p>

      <h3>Employee Polls and Surveys</h3>
      <p>
        Gathering workforce input on workplace policies, benefits decisions, and cultural
        initiatives. Anonymous options are crucial for honest feedback.
      </p>

      <h3>Team Decision Polls</h3>
      <p>
        Day-to-day operational decisions within teams. Speed and simplicity are paramount for these
        frequent, lower-stakes votes.
      </p>

      <h2>Key Principles of Effective Corporate Voting</h2>

      <h3>1. Transparency</h3>
      <p>
        All stakeholders should understand how votes are counted, who can participate, and how
        results will be used. Real-time result visualization builds trust in the process.
      </p>

      <h3>2. Accessibility</h3>
      <p>
        Voting should be easy for all participants. Tools that require no signup or complex
        authentication lower barriers to participation.
      </p>

      <h3>3. Anonymity Options</h3>
      <p>
        For sensitive topics, anonymous voting prevents groupthink and encourages honest feedback.
        Clearly communicate when votes are anonymous versus attributed.
      </p>

      <h3>4. Documentation</h3>
      <p>
        Maintain records of voting outcomes for compliance, reference, and continuous improvement of
        decision-making processes.
      </p>

      <h2>Implementing Corporate Polling Tools</h2>
      <p>
        When selecting a corporate polling solution, prioritize ease of use, security, and
        integration with existing workflows. Tools like Versus Space offer enterprise-ready features
        while maintaining the simplicity needed for broad adoption.
      </p>
    </>
  ),

  'anonymous-polling-workplace-decisions': (
    <>
      <p>
        Workplace decisions benefit enormously from honest input, but social dynamics often prevent
        employees from sharing their true opinions. Anonymous polling removes barriers to candid
        feedback, leading to better organizational decisions.
      </p>

      <h2>Why Anonymous Voting Matters</h2>
      <p>
        Research consistently shows that employees filter their feedback based on perceived
        consequences. Fear of retaliation, desire to conform with leadership opinions, and
        interpersonal dynamics all influence what people say publicly.
      </p>

      <h2>When to Use Anonymous Polls</h2>
      <ul>
        <li>Evaluating leadership or management effectiveness</li>
        <li>Sensitive policy changes (compensation, benefits, remote work)</li>
        <li>Workplace culture and environment assessments</li>
        <li>Ethics and compliance concerns</li>
        <li>Strategic direction input from diverse stakeholders</li>
      </ul>

      <h2>Designing Effective Anonymous Polls</h2>

      <h3>1. Clearly Communicate Anonymity</h3>
      <p>
        Explicitly state that responses cannot be traced to individuals. Explain the technical
        safeguards that protect voter identity.
      </p>

      <h3>2. Keep Demographic Questions Minimal</h3>
      <p>
        Too many demographic questions can inadvertently identify respondents in small teams. Only
        collect data essential for analysis.
      </p>

      <h3>3. Share Results Transparently</h3>
      <p>
        Building trust in anonymous processes requires demonstrating that results are taken
        seriously. Share aggregate findings and any actions taken.
      </p>

      <h2>Balancing Anonymity and Accountability</h2>
      <p>
        Not all votes should be anonymous. For decisions requiring accountability or follow-up,
        attributed voting is appropriate. The key is matching the voting format to the context.
      </p>
    </>
  ),

  'live-presentation-polling-guide': (
    <>
      <p>
        Static presentations are a thing of the past. Modern audiences expect interaction, and live
        polling transforms passive viewers into active participants. Whether you're presenting at a
        conference, running a webinar, or leading a team meeting, real-time polls keep your audience
        engaged and provide valuable feedback.
      </p>

      <h2>Why Live Polling Works</h2>
      <p>
        Research shows that audience attention drops significantly within the first 10 minutes of a
        presentation. Interactive elements like live polls create mental breaks that reset attention
        spans and increase information retention.
      </p>

      <h2>Types of Presentation Polls</h2>

      <h3>1. Icebreaker Polls</h3>
      <p>
        Start your presentation with a fun, low-stakes poll to warm up the audience. Questions like
        "Where are you joining from?" or "Coffee or tea?" get people comfortable with the polling
        interface before substantive questions.
      </p>

      <h3>2. Knowledge Check Polls</h3>
      <p>
        Test audience understanding of key concepts as you present. This helps you gauge whether to
        spend more time on certain topics and keeps attendees actively processing information.
      </p>

      <h3>3. Opinion Polls</h3>
      <p>
        Gather real-time sentiment on proposals, ideas, or decisions. Seeing live results creates
        energy and discussion opportunities that static presentations lack.
      </p>

      <h3>4. Q&A Prioritization</h3>
      <p>
        Let your audience vote on which questions to answer during Q&A sessions. This ensures you
        address the topics most relevant to your attendees.
      </p>

      <h2>Best Practices for Live Presentation Polling</h2>
      <ul>
        <li>Test your polling tool before the presentation starts</li>
        <li>Keep poll questions visible for at least 30-60 seconds</li>
        <li>Verbally explain how to participate for those unfamiliar with the tool</li>
        <li>React to results in real-time to show you value audience input</li>
        <li>Limit to 3-5 polls per 30-minute presentation to avoid poll fatigue</li>
        <li>Use split-screen displays to show both your slides and poll results</li>
      </ul>

      <h2>Technical Setup Tips</h2>
      <p>
        For seamless live polling, share poll links via QR codes on screen, chat functions, or
        shortened URLs. Tools like Versus Space require no downloads or signups for participants,
        reducing friction and increasing participation rates.
      </p>

      <h2>Measuring Success</h2>
      <p>
        Track participation rates across your polls. High engagement early that drops off may
        indicate poll fatigue, while consistently low participation might signal technical issues or
        unclear instructions. Use these insights to refine your approach for future presentations.
      </p>
    </>
  ),

  'team-decision-making-frameworks': (
    <>
      <p>
        Effective leaders know that not every decision should go to a vote. Understanding when to
        seek team input, when to decide unilaterally, and when consensus is required is a critical
        leadership skill. This framework helps you navigate these choices.
      </p>

      <h2>The Decision Spectrum</h2>
      <p>
        Decisions exist on a spectrum from fully autonomous to fully democratic. The key is matching
        your approach to the specific situation.
      </p>

      <h3>Autonomous Decisions</h3>
      <p>
        Leaders should decide alone when: time is critical, they have clear expertise, the decision
        is easily reversible, or team input would not materially change the outcome. Polling
        everything creates decision fatigue and slows organizational velocity.
      </p>

      <h3>Consultative Decisions</h3>
      <p>
        Seek input through polls when: the decision affects team members directly, diverse
        perspectives would improve the outcome, or buy-in is important for implementation. The
        leader retains final authority but is informed by team sentiment.
      </p>

      <h3>Democratic Decisions</h3>
      <p>
        True votes where majority rules work best for: team preferences (lunch spots, meeting
        times), low-stakes choices, or situations where any option is acceptable and commitment
        matters more than optimization.
      </p>

      <h2>When to Use Team Polling</h2>
      <ul>
        <li>Prioritizing project features or initiatives</li>
        <li>Selecting vendors or tools the team will use daily</li>
        <li>Scheduling decisions affecting multiple calendars</li>
        <li>Gathering feedback on proposed policy changes</li>
        <li>Breaking deadlocks between equally viable options</li>
        <li>Building consensus before major strategic shifts</li>
      </ul>

      <h2>Structuring Effective Team Polls</h2>

      <h3>1. Frame the Question Clearly</h3>
      <p>
        Ambiguous questions lead to meaningless results. State exactly what you're asking and how
        the results will be used. "Which option do you prefer?" is weaker than "Which approach
        should we implement for Q2?"
      </p>

      <h3>2. Provide Adequate Context</h3>
      <p>
        Share relevant background information before polling. Team members can't make informed
        choices without understanding constraints, trade-offs, and implications.
      </p>

      <h3>3. Limit Options Strategically</h3>
      <p>
        Too many options create analysis paralysis. Pre-filter to 2-4 viable choices. If you have
        more, consider a two-round process: first narrow the field, then vote on finalists.
      </p>

      <h3>4. Set Clear Timelines</h3>
      <p>
        Open-ended polls lose urgency. Set deadlines for voting and communicate when and how
        results will be shared.
      </p>

      <h2>After the Vote</h2>
      <p>
        Transparency post-poll is crucial for trust. Share results promptly, explain how they
        influenced the decision, and acknowledge minority viewpoints. Even when polls are
        consultative rather than binding, team members should see their input valued.
      </p>
    </>
  ),

  'event-polling-attendee-engagement': (
    <>
      <p>
        Corporate events represent significant investments in time and resources. Real-time polling
        throughout the event lifecycle maximizes ROI by driving engagement, gathering actionable
        feedback, and creating memorable interactive experiences.
      </p>

      <h2>The Event Polling Lifecycle</h2>

      <h3>Pre-Event Polling</h3>
      <p>
        Start engaging attendees before they arrive. Use polls to understand audience expectations,
        customize content to their interests, and build anticipation. Questions about experience
        levels help speakers calibrate their presentations.
      </p>

      <h3>During-Event Polling</h3>
      <p>
        Live polls during sessions transform passive attendees into active participants. Real-time
        feedback helps speakers adjust on the fly, while competitive elements like leaderboards
        create energy and networking opportunities.
      </p>

      <h3>Post-Event Polling</h3>
      <p>
        Capture feedback while experiences are fresh. Post-session and post-event polls provide
        data for improving future events and demonstrating value to stakeholders and sponsors.
      </p>

      <h2>High-Impact Event Polling Strategies</h2>

      <h3>1. Session Kickoff Polls</h3>
      <p>
        Start each session with a quick poll to gauge audience knowledge and interests. This helps
        speakers tailor their content in real-time and creates immediate engagement.
      </p>

      <h3>2. Networking Icebreakers</h3>
      <p>
        Use fun polls during networking sessions to spark conversations. "Tabs vs. spaces?" or
        industry-specific debates give strangers something to discuss.
      </p>

      <h3>3. Live Q&A Prioritization</h3>
      <p>
        Let attendees vote on submitted questions to ensure Q&A sessions address the most relevant
        topics. This democratizes the Q&A process and prevents vocal minorities from dominating.
      </p>

      <h3>4. Session Rating Polls</h3>
      <p>
        Quick thumbs up/down or star ratings immediately after sessions provide real-time speaker
        feedback and help attendees choose between concurrent sessions based on peer reviews.
      </p>

      <h3>5. Gamification Elements</h3>
      <p>
        Award points for poll participation and display leaderboards. Competitive elements drive
        engagement and can tie into prizes or recognition at closing ceremonies.
      </p>

      <h2>Technical Considerations for Event Polling</h2>
      <ul>
        <li>Test Wi-Fi capacity before the event with expected attendee loads</li>
        <li>Have backup connectivity options (4G/5G hotspots)</li>
        <li>Use QR codes on screens and printed materials for easy access</li>
        <li>Choose tools requiring no downloads or account creation</li>
        <li>Ensure displays are visible from all seating areas</li>
        <li>Brief speakers on poll mechanics during rehearsals</li>
      </ul>

      <h2>Measuring Event Polling Success</h2>
      <p>
        Track participation rates, response times, and feedback quality across sessions. Compare
        engagement metrics between polled and non-polled sessions. Use this data to refine your
        approach and demonstrate event ROI to stakeholders.
      </p>

      <h2>Privacy and Data Considerations</h2>
      <p>
        Be transparent about how poll data will be used. For corporate events, ensure compliance
        with company data policies. Anonymous options may be appropriate for sensitive feedback,
        while attributed responses work better for follow-up and personalization.
      </p>
    </>
  ),
};

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

  // Find the post by slug
  const post = blogPosts.find((p) => p.slug === slug);

  // If post not found, redirect to blog listing
  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const content = blogContent[slug || ''];

  // Find adjacent posts for navigation
  const currentIndex = blogPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

  // Article schema for rich snippets
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: post.image || 'https://versus.space/meta-preview-1.png',
    datePublished: post.publishedDate,
    dateModified: post.publishedDate,
    author: {
      '@type': 'Organization',
      name: 'Versus Space',
      url: 'https://versus.space',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Versus Space',
      logo: {
        '@type': 'ImageObject',
        url: 'https://versus.space/android-icon-192x192.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://versus.space/blog/${post.slug}`,
    },
    keywords: post.keywords,
    articleSection: post.category,
    wordCount: 1500, // Approximate
    inLanguage: 'en-US',
  };

  // Breadcrumb schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://versus.space',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://versus.space/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://versus.space/blog/${post.slug}`,
      },
    ],
  };

  const handleShare = async () => {
    const url = `https://versus.space/blog/${post.slug}`;
    if (navigator.share) {
      await navigator.share({
        title: post.title,
        text: post.description,
        url: url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className={styles.blogPostContainer}>
      <Helmet>
        <title>{post.title} | Versus Space Blog</title>
        <meta name="description" content={post.description} />
        <meta name="keywords" content={post.keywords} />
        <link rel="canonical" href={`https://versus.space/blog/${post.slug}`} />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:url" content={`https://versus.space/blog/${post.slug}`} />
        <meta
          property="og:image"
          content={post.image || 'https://versus.space/meta-preview-1.png'}
        />
        <meta property="article:published_time" content={post.publishedDate} />
        <meta property="article:section" content={post.category} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.description} />

        {/* Structured Data */}
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      {/* Breadcrumb Navigation */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <ol itemScope itemType="https://schema.org/BreadcrumbList">
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link to="/" itemProp="item">
              <span itemProp="name">Home</span>
            </Link>
            <meta itemProp="position" content="1" />
          </li>
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link to="/blog" itemProp="item">
              <span itemProp="name">Blog</span>
            </Link>
            <meta itemProp="position" content="2" />
          </li>
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <span itemProp="name">{post.title}</span>
            <meta itemProp="position" content="3" />
          </li>
        </ol>
      </nav>

      <article className={styles.article}>
        <header className={styles.articleHeader}>
          <div className={styles.articleMeta}>
            <span className={styles.category}>{post.category}</span>
            <div className={styles.dateInfo}>
              <span className={styles.date}>
                <Calendar size={14} />
                {new Date(post.publishedDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className={styles.readTime}>
                <Clock size={14} />
                {post.readTime}
              </span>
            </div>
          </div>

          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.excerpt}>{post.excerpt}</p>

          <button onClick={handleShare} className={styles.shareButton}>
            <Share2 size={18} />
            Share article
          </button>
        </header>

        <div className={styles.articleContent}>{content || <p>Content coming soon.</p>}</div>

        {/* CTA Section */}
        <div className={styles.articleCta}>
          <h3>Ready to implement real-time polling?</h3>
          <p>Create your first poll in under 30 seconds. Free forever, no credit card required.</p>
          <Link to="/create" className={styles.ctaButton}>
            Create Free Poll <ArrowRight size={18} />
          </Link>
        </div>
      </article>

      {/* Post Navigation */}
      <nav className={styles.postNavigation}>
        {prevPost ? (
          <Link to={`/blog/${prevPost.slug}`} className={styles.navLink}>
            <ArrowLeft size={18} />
            <div>
              <span className={styles.navLabel}>Previous</span>
              <span className={styles.navTitle}>{prevPost.title}</span>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextPost && (
          <Link to={`/blog/${nextPost.slug}`} className={`${styles.navLink} ${styles.navNext}`}>
            <div>
              <span className={styles.navLabel}>Next</span>
              <span className={styles.navTitle}>{nextPost.title}</span>
            </div>
            <ArrowRight size={18} />
          </Link>
        )}
      </nav>
    </div>
  );
}

export default BlogPostPage;
