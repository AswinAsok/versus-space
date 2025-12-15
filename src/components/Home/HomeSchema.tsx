/**
 * HomeSchema - JSON-LD Schema Markup for SEO
 * Contains Organization, WebApplication, FAQPage, and HowTo schemas
 */

interface HomeSchemaProps {
  pollsCount: number;
  votesCount: number;
}

export function HomeSchema({ pollsCount, votesCount }: HomeSchemaProps) {
  const baseUrl = 'https://versus.space';

  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Versus Space',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      'Free real-time polling platform for presentations, classrooms, events, and team decisions.',
    sameAs: ['https://github.com/AswinAsok/versus-space'],
    foundingDate: '2025',
  };

  // WebApplication Schema
  const webApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Versus Space',
    url: baseUrl,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Create real-time polls in under 30 seconds. Watch votes stream in live with split-screen visualizations.',
    featureList: [
      'Real-time vote tracking',
      'Split-screen visualizations',
      'No signup required to vote',
      'Public and private polls',
      'Image customization',
      'Instant sharing',
      'Unlimited polls',
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      ratingCount: pollsCount.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/CreateAction',
        userInteractionCount: pollsCount,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/VoteAction',
        userInteractionCount: votesCount,
      },
    ],
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
