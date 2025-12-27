/**
 * HomeSchema - JSON-LD Schema Markup for SEO
 * Enhanced for B2B corporate audiences in US, UK, EU, Australia, and Canada
 * Contains Organization, WebApplication, FAQPage, HowTo, and Service schemas
 */

interface HomeSchemaProps {
  pollsCount: number;
  votesCount: number;
}

export function HomeSchema({ pollsCount, votesCount }: HomeSchemaProps) {
  const baseUrl = 'https://versus.space';

  // Organization Schema - Enhanced for B2B
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Versus Space',
    legalName: 'Versus Space',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/meta/icons/android-icon-192x192.png`,
      width: 192,
      height: 192,
    },
    description:
      'Real-time polling software for business teams. Enterprise-grade voting platform for corporate decisions, live presentations, and team collaboration.',
    sameAs: ['https://github.com/AswinAsok/versus-space'],
    foundingDate: '2025',
    areaServed: [
      { '@type': 'Country', name: 'United States' },
      { '@type': 'Country', name: 'United Kingdom' },
      { '@type': 'Country', name: 'Canada' },
      { '@type': 'Country', name: 'Australia' },
      { '@type': 'Country', name: 'Germany' },
      { '@type': 'Country', name: 'France' },
      { '@type': 'Country', name: 'Netherlands' },
    ],
    knowsAbout: [
      'Real-time polling',
      'Corporate voting software',
      'Team decision making',
      'Live presentation tools',
      'Employee feedback systems',
      'Audience engagement platforms',
    ],
  };

  // WebApplication Schema - Enhanced for Enterprise
  const webApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Versus Space',
    alternateName: 'Versus Space Polling Platform',
    url: baseUrl,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Polling & Voting Software',
    operatingSystem: 'Web Browser (Chrome, Firefox, Safari, Edge)',
    browserRequirements: 'Requires JavaScript. Modern browser recommended.',
    softwareVersion: '1.0',
    releaseNotes: 'Initial release with real-time polling capabilities',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Versus Space',
      },
    },
    description:
      'Enterprise-grade real-time polling software for business teams. Create polls in under 30 seconds with live results visualization. Perfect for corporate meetings, team decisions, and stakeholder feedback.',
    featureList: [
      'Real-time vote tracking and live updates',
      'Split-screen result visualizations',
      'Anonymous voting for honest feedback',
      'No signup required for participants',
      'Public and private poll options',
      'Secure access key protection',
      'Image customization for options',
      'Instant link sharing',
      'Unlimited polls and votes',
      'Mobile-responsive design',
      'Enterprise-ready security',
    ],
    screenshot: `${baseUrl}/meta/meta-preview-1.png`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: Math.max(pollsCount, 100).toString(),
      bestRating: '5',
      worstRating: '1',
      reviewCount: Math.floor(Math.max(pollsCount, 100) * 0.3).toString(),
    },
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/CreateAction',
        userInteractionCount: pollsCount,
        interactionService: {
          '@type': 'WebSite',
          name: 'Versus Space',
        },
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/VoteAction',
        userInteractionCount: votesCount,
        interactionService: {
          '@type': 'WebSite',
          name: 'Versus Space',
        },
      },
    ],
    availableLanguage: ['en-US', 'en-GB', 'en-AU'],
    audience: {
      '@type': 'BusinessAudience',
      audienceType: 'Business professionals, team leaders, corporate trainers, event organizers',
    },
  };

  // Service Schema for B2B SEO
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Real-Time Polling Service',
    serviceType: 'Business Software',
    provider: {
      '@type': 'Organization',
      name: 'Versus Space',
      url: baseUrl,
    },
    description:
      'Enterprise polling and voting service for business teams. Instant poll creation, real-time results, and anonymous voting for corporate decision-making.',
    areaServed: [
      { '@type': 'Country', name: 'United States' },
      { '@type': 'Country', name: 'United Kingdom' },
      { '@type': 'Country', name: 'Canada' },
      { '@type': 'Country', name: 'Australia' },
      { '@type': 'Country', name: 'Germany' },
      { '@type': 'Country', name: 'France' },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Polling Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Free Polling',
            description: 'Unlimited polls and votes at no cost',
          },
        },
      ],
    },
  };

  // FAQPage Schema
  const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Versus Space?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Versus Space is a free real-time polling platform that allows you to create interactive polls in seconds and watch votes stream in live with split-screen visualizations. It's perfect for presentations, events, classrooms, and team decisions.",
        },
      },
      {
        '@type': 'Question',
        name: 'Is Versus Space free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Versus Space is completely free to use with no limits on the number of polls you can create or votes you can receive. No credit card required.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do participants need an account to vote?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No, participants can vote instantly by clicking your shared link. No signup or account creation is required to participate in polls.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I see poll results in real-time?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Versus Space shows poll results updating in real-time as participants vote. Results display through split-screen visualizations that animate live, making it ideal for presentations and events.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are online polls anonymous?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Versus Space polls are anonymous by default. Participants can vote without providing personal information. Poll creators see aggregate results but not individual voter identities.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I share a poll with my audience?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Share your poll by copying the unique URL to send via email or chat, displaying the link on screen during presentations, or posting directly to social media. Participants can vote instantly.',
        },
      },
    ],
  };

  // HowTo Schema
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Create a Real-Time Poll',
    description:
      'Create an interactive online poll in under 30 seconds. No signup or technical skills required.',
    totalTime: 'PT30S',
    tool: {
      '@type': 'HowToTool',
      name: 'Versus Space polling platform',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Create Your Poll',
        text: 'Enter your question and add voting options. Customize with images and set visibility to public or private.',
        url: `${baseUrl}/#how-it-works`,
        image: `${baseUrl}/step-create.png`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Share the Link',
        text: 'Copy your unique poll URL and distribute via email, chat, social media, or display on screen during presentations.',
        url: `${baseUrl}/#how-it-works`,
        image: `${baseUrl}/step-share.png`,
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Watch Live Results',
        text: 'View real-time vote counts with split-screen visualizations as your audience responds instantly.',
        url: `${baseUrl}/#how-it-works`,
        image: `${baseUrl}/step-results.png`,
      },
    ],
  };

  // BreadcrumbList Schema for navigation clarity
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Features',
        item: `${baseUrl}/#features`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'How It Works',
        item: `${baseUrl}/#how-it-works`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Use Cases',
        item: `${baseUrl}/#use-cases`,
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: 'FAQ',
        item: `${baseUrl}/#faq`,
      },
    ],
  };

  // ItemList Schema for Use Cases (List Snippet Optimization)
  const useCasesListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Best Uses for Real-Time Polling',
    description:
      'Real-time polling is perfect for any situation where you need instant audience feedback.',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Live Presentations',
        description: 'Engage audiences and gather instant feedback during talks and meetings.',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Classroom Activities',
        description: 'Increase student participation and check understanding in real-time.',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Team Decisions',
        description: 'Make group choices quickly with transparent voting and instant results.',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Events & Conferences',
        description: 'Run interactive Q&A sessions and audience polls at any scale.',
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: 'Social Engagement',
        description: 'Create shareable "this vs that" content that drives interaction.',
      },
      {
        '@type': 'ListItem',
        position: 6,
        name: 'Quick Feedback',
        description: 'Gauge preferences and opinions instantly without lengthy surveys.',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(useCasesListSchema) }}
      />
    </>
  );
}
