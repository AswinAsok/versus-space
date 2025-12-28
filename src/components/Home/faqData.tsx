import type { ReactNode } from 'react';

export interface FaqItem {
  question: string;
  answer: ReactNode;
}

export const faqItems: FaqItem[] = [
  {
    question: 'Is Versus Space free to use?',
    answer:
      'Yes, Versus Space is 100% free with no hidden costs, premium tiers, or usage limits. Create unlimited polls, collect unlimited votes, and access all features without ever entering a credit card. We built this as an open-source project to make real-time polling accessible to everyone—from students running classroom quizzes to professionals hosting large-scale events.',
  },
  {
    question: 'Do participants need an account to vote?',
    answer:
      'No accounts or signups required. When you share your poll link, participants can vote with a single click—no registration, email verification, or personal information needed. This zero-friction approach means higher participation rates and instant engagement, whether you\'re polling 5 people or 5,000.',
  },
  {
    question: 'Can I see poll results in real-time?',
    answer:
      'Absolutely. Results update instantly with smooth animations as each vote comes in. You\'ll see vote counts tick up live, progress bars animate, and percentages recalculate in real-time. This makes Versus Space ideal for live presentations, interactive workshops, audience Q&A sessions, and any scenario where immediate visual feedback creates excitement and engagement.',
  },
  {
    question: 'Are online polls anonymous?',
    answer:
      'Yes, all votes are completely anonymous by design. We don\'t track or store any personally identifiable information about voters. Poll creators only see aggregate statistics—total vote counts and percentages—never individual voter identities, IP addresses, or device information. Your audience can vote honestly without privacy concerns.',
  },
  {
    question: 'How do I share a poll with my audience?',
    answer:
      'Sharing is simple: after creating your poll, you\'ll get a unique, short URL that you can distribute anywhere. Copy it to your clipboard with one click, then share via email, Slack, Discord, WhatsApp, social media, or embed it in presentations. For live events, display the link or QR code on screen so attendees can scan and vote from their phones instantly.',
  },
];
