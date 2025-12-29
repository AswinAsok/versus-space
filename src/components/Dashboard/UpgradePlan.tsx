import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  StarIcon,
  ArrowRight01Icon,
  BarChartIcon,
  ChartLineData01Icon,
  LockIcon,
  Activity01Icon,
  HelpCircleIcon,
} from '@hugeicons/core-free-icons';
import { redirectToCheckout } from '../../utils/payment';
import { PRO_PLAN_PRICE, FREE_PLAN_POLL_LIMIT } from '../../config/plans';
import styles from './UpgradePlan.module.css';

interface UpgradePlanProps {
  user: User;
  currentPollCount: number;
}

const proFeatures = [
  { icon: BarChartIcon, text: 'Unlimited polls' },
  { icon: ChartLineData01Icon, text: 'Advanced analytics' },
  { icon: LockIcon, text: 'Private polls' },
  { icon: Activity01Icon, text: 'Poll automation' },
  { icon: HelpCircleIcon, text: 'Priority support' },
];

export function UpgradePlan({ user, currentPollCount }: UpgradePlanProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = () => {
    setIsLoading(true);
    redirectToCheckout({
      email: user.email || '',
      userId: user.id,
      customerName: user.user_metadata?.full_name,
    });
  };

  const isAtLimit = currentPollCount >= FREE_PLAN_POLL_LIMIT;

  return (
    <div className={styles.upgradeCard}>
      <div className={styles.upgradeHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.proBadge}>
            <HugeiconsIcon icon={StarIcon} size={12} />
            <span>PRO</span>
          </div>
          <h3 className={styles.upgradeTitle}>Upgrade to Pro</h3>
          <p className={styles.upgradeSubtitle}>Unlock the full potential of your polls</p>
        </div>
        <div className={styles.priceTag}>
          <span className={styles.priceAmount}>$0.18</span>
          <span className={styles.pricePeriod}>/month</span>
        </div>
      </div>

      <div className={styles.usageIndicator}>
        <div className={styles.usageText}>
          <span className={styles.usageLabel}>Current usage</span>
          <span className={styles.usageValue}>
            {currentPollCount} of {FREE_PLAN_POLL_LIMIT} polls
          </span>
        </div>
        <div className={styles.usageBar}>
          <div
            className={`${styles.usageProgress} ${isAtLimit ? styles.usageFull : ''}`}
            style={{ width: `${Math.min((currentPollCount / FREE_PLAN_POLL_LIMIT) * 100, 100)}%` }}
          />
        </div>
      </div>

      <div className={styles.featuresGrid}>
        {proFeatures.map((feature, index) => (
          <div key={index} className={styles.featureItem}>
            <HugeiconsIcon icon={feature.icon} size={14} />
            <span>{feature.text}</span>
          </div>
        ))}
      </div>

      <button
        onClick={handleUpgrade}
        className={styles.upgradeButton}
        disabled={isLoading}
      >
        {isLoading ? 'Redirecting...' : 'Upgrade Now'}
        {!isLoading && <HugeiconsIcon icon={ArrowRight01Icon} size={16} />}
      </button>
    </div>
  );
}
