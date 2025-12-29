/**
 * SEO Component - Dynamic Meta Tags Manager
 *
 * This component uses react-helmet-async to manage dynamic meta tags
 * for improved SEO across all pages of the application.
 *
 * Optimized for B2B corporate audiences in US, UK, EU, Australia, and Canada.
 */

import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  ogImageAlt?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
  structuredData?: object | object[];
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleAuthor?: string;
}

// Default SEO values optimized for B2B corporate keywords
const defaults = {
  siteName: 'Versus Space',
  title: 'Real-Time Polling Software for Teams | Free Online Voting Platform',
  description:
    'Create instant polls for team decisions, corporate events, and live presentations. Free real-time voting software trusted by businesses worldwide. No signup required to vote.',
  keywords:
    'real-time polling software, online voting platform, team decision making tool, corporate polling software, live audience polling, enterprise survey tool, anonymous voting software, presentation polling, business voting app',
  baseUrl: 'https://versus.space',
  ogImage: 'https://versus.space/meta/meta-preview-1.png',
  twitterHandle: '@versusspace',
  locale: 'en_US',
};

export function SEO({
  title,
  description,
  keywords,
  canonicalUrl,
  ogType = 'website',
  ogImage,
  ogImageAlt,
  twitterCard = 'summary_large_image',
  noIndex = false,
  structuredData,
  articlePublishedTime,
  articleModifiedTime,
  articleAuthor,
}: SEOProps) {
  const seoTitle = title ? `${title} | ${defaults.siteName}` : defaults.title;
  const seoDescription = description || defaults.description;
  const seoKeywords = keywords || defaults.keywords;
  const seoCanonical = canonicalUrl || defaults.baseUrl;
  const seoOgImage = ogImage || defaults.ogImage;
  const seoOgImageAlt =
    ogImageAlt || 'Versus Space - Real-time polling platform for business teams';

  // Prepare structured data as JSON string
  const structuredDataString = structuredData
    ? JSON.stringify(Array.isArray(structuredData) ? structuredData : [structuredData])
    : null;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="title" content={seoTitle} />
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />

      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={seoCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={seoCanonical} />
      <meta property="og:site_name" content={defaults.siteName} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={seoOgImageAlt} />
      <meta property="og:locale" content={defaults.locale} />
      <meta property="og:locale:alternate" content="en_GB" />
      <meta property="og:locale:alternate" content="en_AU" />
      <meta property="og:locale:alternate" content="de_DE" />
      <meta property="og:locale:alternate" content="fr_FR" />

      {/* Article-specific OG tags */}
      {ogType === 'article' && articlePublishedTime && (
        <meta property="article:published_time" content={articlePublishedTime} />
      )}
      {ogType === 'article' && articleModifiedTime && (
        <meta property="article:modified_time" content={articleModifiedTime} />
      )}
      {ogType === 'article' && articleAuthor && (
        <meta property="article:author" content={articleAuthor} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={defaults.twitterHandle} />
      <meta name="twitter:creator" content={defaults.twitterHandle} />
      <meta name="twitter:url" content={seoCanonical} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoOgImage} />
      <meta name="twitter:image:alt" content={seoOgImageAlt} />

      {/* Structured Data */}
      {structuredDataString && <script type="application/ld+json">{structuredDataString}</script>}
    </Helmet>
  );
}

/**
 * Page-specific SEO configurations
 * Pre-configured SEO settings for each major page
 */

// Homepage SEO
export function HomeSEO() {
  return (
    <SEO
      title="Real-Time Polling Software for Teams"
      description="Create instant polls for team decisions, corporate events, and live presentations. Free real-time voting software trusted by businesses worldwide. No signup required to vote."
      keywords="real-time polling software, online voting platform, team decision making tool, corporate polling software, live audience polling, enterprise survey tool, anonymous voting software, business voting app"
      canonicalUrl="https://versus.space/"
    />
  );
}

// Create Poll Page SEO
export function CreatePollSEO() {
  return (
    <SEO
      title="Create a Free Online Poll"
      description="Create a free real-time poll in under 30 seconds. Set up voting options, share with your team, and watch results stream in live. No signup required for participants."
      keywords="create online poll, make free poll, create voting poll, quick poll maker, real-time poll creator, team voting tool"
      canonicalUrl="https://versus.space/create"
    />
  );
}

// Dashboard SEO (noindex for authenticated pages)
export function DashboardSEO() {
  return (
    <SEO
      title="Your Poll Dashboard"
      description="Manage your polls, view analytics, and track real-time voting results from your personal dashboard."
      canonicalUrl="https://versus.space/dashboard"
      noIndex={true}
    />
  );
}

// Auth Page SEO (noindex for authenticated pages)
export function AuthSEO() {
  return (
    <SEO
      title="Sign In or Create Account"
      description="Sign in to your Versus Space account or create a new account to start creating and managing polls."
      canonicalUrl="https://versus.space/auth"
      noIndex={true}
    />
  );
}

// Individual Poll SEO - Dynamic based on poll data
interface PollSEOProps {
  slug: string;
  pollTitle: string;
  pollDescription?: string;
  totalVotes?: number;
  optionCount?: number;
  createdAt?: string;
}

export function PollSEO({
  slug,
  pollTitle,
  pollDescription,
  totalVotes = 0,
  optionCount = 2,
  createdAt,
}: PollSEOProps) {
  const title = `${pollTitle} - Vote Now`;
  const description =
    pollDescription ||
    `Vote on "${pollTitle}" and see real-time results. ${totalVotes.toLocaleString()} votes cast. ${optionCount} options to choose from. Anonymous voting - no signup required.`;

  // Poll-specific structured data
  const pollStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: description,
    url: `https://versus.space/poll/${slug}`,
    mainEntity: {
      '@type': 'Question',
      name: pollTitle,
      answerCount: optionCount,
      dateCreated: createdAt,
      author: {
        '@type': 'Organization',
        name: 'Versus Space',
      },
    },
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/VoteAction',
      userInteractionCount: totalVotes,
    },
  };

  return (
    <SEO
      title={title}
      description={description}
      keywords={`vote ${pollTitle}, poll ${pollTitle}, online voting, real-time poll results`}
      canonicalUrl={`https://versus.space/poll/${slug}`}
      structuredData={pollStructuredData}
    />
  );
}

// Blog Post SEO
interface BlogPostSEOProps {
  slug: string;
  title: string;
  description: string;
  publishedDate: string;
  modifiedDate?: string;
  author?: string;
  image?: string;
  keywords?: string;
}

export function BlogPostSEO({
  slug,
  title,
  description,
  publishedDate,
  modifiedDate,
  author = 'Versus Space Team',
  image,
  keywords,
}: BlogPostSEOProps) {
  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: image || 'https://versus.space/meta/meta-preview-1.png',
    datePublished: publishedDate,
    dateModified: modifiedDate || publishedDate,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Versus Space',
      logo: {
        '@type': 'ImageObject',
        url: 'https://versus.space/meta/icons/android-icon-192x192.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://versus.space/blog/${slug}`,
    },
  };

  return (
    <SEO
      title={title}
      description={description}
      keywords={keywords}
      canonicalUrl={`https://versus.space/blog/${slug}`}
      ogType="article"
      ogImage={image}
      structuredData={articleStructuredData}
      articlePublishedTime={publishedDate}
      articleModifiedTime={modifiedDate || publishedDate}
      articleAuthor={author}
    />
  );
}

// Use Case Landing Page SEO
interface UseCaseSEOProps {
  slug: string;
  title: string;
  description: string;
  keywords: string;
}

export function UseCaseSEO({ slug, title, description, keywords }: UseCaseSEOProps) {
  return (
    <SEO
      title={title}
      description={description}
      keywords={keywords}
      canonicalUrl={`https://versus.space/use-cases/${slug}`}
    />
  );
}

export default SEO;
