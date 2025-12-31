import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Mail01Icon,
  AlertCircleIcon,
  Tick01Icon,
  CrownIcon,
  CheckmarkCircle02Icon,
  ArrowUp01Icon,
  Coffee01Icon,
} from '@hugeicons/core-free-icons';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useProUserCount } from '../../hooks/usePollQueries';
import { getProCheckoutUrl, isDodoPaymentsConfigured } from '../../utils/payment';
import styles from './Settings.module.css';

// Chai meter constants
const DAYS_OF_WORK = 6;
const CHAI_PER_DAY = 5;
const TOTAL_CHAI = DAYS_OF_WORK * CHAI_PER_DAY; // 30 chai total

interface SettingsProps {
  user: User;
}

export function Settings({ user }: SettingsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: profile } = useUserProfile(user);
  const { data: proUserCount = 0 } = useProUserCount();
  const isSuperAdmin = profile?.role === 'superadmin';
  const isPro = isSuperAdmin || profile?.plan === 'pro';
  const planLabel = isSuperAdmin ? 'Admin' : isPro ? 'Pro' : 'Free';
  const chaiFunded = proUserCount * 4; // 1 Pro = 4 chai
  const chaiProgress = Math.min((chaiFunded / TOTAL_CHAI) * 100, 100);

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || '';

  const handleUpgradeClick = () => {
    try {
      const checkoutUrl = getProCheckoutUrl({
        email: userEmail,
        userId: user.id,
        customerName: displayName,
      });
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Payment system is temporarily unavailable. Please try again later.');
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsInner}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSubtitle}>Manage your account and plan</p>
        </div>

        {/* Account Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Account</h2>

          <div className={styles.settingCard}>
            <div className={styles.settingItem}>
              <div className={`${styles.settingIcon} ${styles.activeIcon}`}>
                <HugeiconsIcon icon={Mail01Icon} size={18} />
              </div>
              <div className={styles.settingContent}>
                <h3 className={styles.settingLabel}>Email address</h3>
                <p className={styles.settingValue}>{user.email}</p>
              </div>
              <span className={styles.verifiedBadge}>
                <HugeiconsIcon icon={Tick01Icon} size={10} />
                Verified
              </span>
            </div>
          </div>
        </section>

        {/* Plan Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Your Plan</h2>

          <div className={styles.planCard}>
            <div className={styles.currentPlan}>
              <div className={styles.planHeader}>
                <div className={styles.planInfo}>
                  <span className={`${styles.planBadge} ${isPro ? styles.planBadgePro : styles.planBadgeFree}`}>
                    {isPro && <HugeiconsIcon icon={CrownIcon} size={10} />}
                    {planLabel}
                  </span>
                  <h3 className={styles.planName}>{isPro ? 'Pro + Chai' : 'Free Plan'}</h3>
                  <p className={styles.planDescription}>
                    {isPro
                      ? 'Unlimited polls with all pro features'
                      : '3 polls with basic features'}
                  </p>
                </div>
                {!isPro && (
                  <button
                    type="button"
                    onClick={handleUpgradeClick}
                    className={styles.upgradeButton}
                  >
                    <HugeiconsIcon icon={ArrowUp01Icon} size={12} />
                    Upgrade
                  </button>
                )}
              </div>
            </div>

            {/* Plan Comparison */}
            <div className={styles.planComparison}>
              <div className={`${styles.planColumn} ${!isPro ? styles.planColumnActive : ''}`}>
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

              <div className={`${styles.planColumn} ${styles.planColumnPro} ${isPro ? styles.planColumnActive : ''}`}>
                <div className={styles.planColumnHeader}>
                  <span className={styles.planColumnName}>
                    <HugeiconsIcon icon={CrownIcon} size={10} />
                    Pro
                  </span>
                  <span className={styles.planColumnPrice}>$1<span> lifetime</span></span>
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
        </section>

        {/* Chai Meter Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Chai Meter</h2>

          <div className={styles.chaiCard}>
            <div className={styles.chaiHeader}>
              <div className={styles.chaiIcon}>
                <HugeiconsIcon icon={Coffee01Icon} size={18} />
              </div>
              <div className={styles.chaiInfo}>
                <h3 className={styles.chaiTitle}>Help fund the chai addiction</h3>
                <p className={styles.chaiDescription}>
                  This project took {DAYS_OF_WORK} days to build. At {CHAI_PER_DAY} chai per day, that's {TOTAL_CHAI} cups consumed.
                </p>
              </div>
            </div>
            <div className={styles.chaiProgress}>
              <div className={styles.chaiLabels}>
                <span className={styles.chaiCurrent}>
                  {chaiFunded} chai{chaiFunded !== 1 ? 's' : ''} funded
                </span>
                <span className={styles.chaiGoal}>Goal: {TOTAL_CHAI}</span>
              </div>
              <div className={styles.chaiBar}>
                <div
                  className={styles.chaiFill}
                  style={{ width: `${chaiProgress}%` }}
                />
              </div>
              <p className={styles.chaiNote}>
                Every Pro upgrade = 4 chai paid back
              </p>
              {isPro && (
                <a
                  href="https://buymeacoffee.com/aswinasok"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.buyMeCoffeeButton}
                >
                  <HugeiconsIcon icon={Coffee01Icon} size={14} />
                  Buy me a coffee
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className={styles.section}>
          <h2 className={`${styles.sectionTitle} ${styles.dangerTitle}`}>Danger Zone</h2>

          <div className={`${styles.settingCard} ${styles.dangerCard}`}>
            <div className={styles.settingItem}>
              <div className={`${styles.settingIcon} ${styles.dangerIcon}`}>
                <HugeiconsIcon icon={AlertCircleIcon} size={18} />
              </div>
              <div className={styles.settingContent}>
                <h3 className={styles.settingLabel}>Delete Account</h3>
                <p className={styles.settingDescription}>
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <button
                className={styles.dangerButton}
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </button>
            </div>
          </div>
        </section>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className={styles.modalOverlay} onClick={() => setShowDeleteConfirm(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalIcon}>
                <HugeiconsIcon icon={AlertCircleIcon} size={24} />
              </div>
              <h3 className={styles.modalTitle}>Delete Account?</h3>
              <p className={styles.modalText}>
                This will permanently delete your account, all your polls, and associated data.
                This action cannot be undone.
              </p>
              <div className={styles.modalActions}>
                <button
                  className={styles.modalCancelButton}
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button className={styles.modalDeleteButton}>
                  Yes, delete my account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
