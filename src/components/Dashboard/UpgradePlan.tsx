import { User } from '@supabase/supabase-js';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CrownIcon,
  CheckmarkCircle02Icon,
  ArrowUp01Icon,
} from '@hugeicons/core-free-icons';
import { getProCheckoutUrl } from '../../utils/payment';
import { FREE_PLAN_POLL_LIMIT } from '../../config/plans';
import styles from './UpgradePlan.module.css';

interface UpgradePlanProps {
  user: User;
  currentPollCount: number;
}

export function UpgradePlan({ user, currentPollCount }: UpgradePlanProps) {
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || '';

  const handleUpgradeClick = () => {
    const checkoutUrl = getProCheckoutUrl({
      email: userEmail,
      userId: user.id,
      customerName: displayName,
    });
    window.location.href = checkoutUrl;
  };

  return (
    <div className={styles.planCard}>
      <div className={styles.currentPlan}>
        <div className={styles.planHeader}>
          <div className={styles.planInfo}>
            <span className={styles.planBadgeFree}>Free</span>
            <h3 className={styles.planName}>Free Plan</h3>
            <p className={styles.planDescription}>
              {currentPollCount} of {FREE_PLAN_POLL_LIMIT} polls used
            </p>
          </div>
          <button onClick={handleUpgradeClick} className={styles.upgradeButton}>
            <HugeiconsIcon icon={ArrowUp01Icon} size={12} />
            Upgrade
          </button>
        </div>
      </div>

      {/* Plan Comparison */}
      <div className={styles.planComparison}>
        <div className={`${styles.planColumn} ${styles.planColumnActive}`}>
          <div className={styles.planColumnHeader}>
            <span className={styles.planColumnName}>Free</span>
            <span className={styles.planColumnPrice}>$0</span>
          </div>
          <ul className={styles.planFeatures}>
            <li>
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
              <span>3 polls</span>
            </li>
            <li>
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
              <span>Unlimited votes</span>
            </li>
            <li>
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
              <span>15-min auto-close</span>
            </li>
            <li>
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
              <span>Public polls</span>
            </li>
          </ul>
        </div>

        <div className={`${styles.planColumn} ${styles.planColumnPro}`}>
          <div className={styles.planColumnHeader}>
            <span className={styles.planColumnName}>
              <HugeiconsIcon icon={CrownIcon} size={10} />
              Pro
            </span>
            <span className={styles.planColumnPrice}>$0.18<span>/mo</span></span>
          </div>
          <ul className={styles.planFeatures}>
            <li>
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
              <span>Unlimited polls</span>
            </li>
            <li>
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
              <span>Custom timers</span>
            </li>
            <li>
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
              <span>Private polls</span>
            </li>
            <li>
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
              <span>Pro analytics</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
