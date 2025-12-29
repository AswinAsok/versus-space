import type { ReactNode } from 'react';

export interface FaqItem {
  question: string;
  answer: ReactNode;
}

export const faqItems: FaqItem[] = [
  {
    question: 'Is Versus Space free to use?',
    answer:
      'Yes! The free plan lets you create up to 3 polls with unlimited votes. Free polls auto-close after 15 minutes and are public. For unlimited polls, custom timers, private access keys, vote limiting, and analytics, upgrade to Pro for just $0.18/month (less than a chai).',
  },
  {
    question: 'Do participants need an account to vote?',
    answer:
      'No accounts or signups required. When you share your poll link, participants can vote with a single click—no registration, email verification, or personal information needed. This zero-friction approach means higher participation rates and instant engagement.',
  },
  {
    question: 'Can I see poll results in real-time?',
    answer:
      'Absolutely. Results update instantly with smooth animations as each vote comes in. You\'ll see vote counts tick up live, progress bars animate, and percentages recalculate in real-time. This makes Versus Space ideal for live presentations, interactive workshops, and audience Q&A sessions.',
  },
  {
    question: 'How long do polls stay open?',
    answer:
      'Free polls automatically close after 15 minutes. Pro users can set custom timers or leave polls open indefinitely. Once a poll closes, results are preserved and displayed in grayscale to indicate voting has ended.',
  },
  {
    question: 'How do I share a poll with my audience?',
    answer:
      'After creating your poll, you\'ll get a unique, short URL. Copy it with one click and share via email, Slack, Discord, WhatsApp, or social media. For live events, display the link or QR code on screen so attendees can scan and vote from their phones instantly.',
  },
];
