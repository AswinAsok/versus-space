import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { pollFacade } from '../../core/appServices';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Calendar01Icon,
  BarChartIcon,
  UserIcon,
  Mail01Icon,
} from '@hugeicons/core-free-icons';
import styles from './Profile.module.css';

interface ProfileProps {
  user: User;
}

export function Profile({ user }: ProfileProps) {
  const [pollCount, setPollCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const polls = await pollFacade.getUserPolls(user.id);
      setPollCount(polls.length);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || '';
  const userInitial = displayName.charAt(0).toUpperCase();
  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileInner}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Profile</h1>
          <p className={styles.pageSubtitle}>Your personal information and statistics</p>
        </div>

        {/* Profile Card */}
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarLarge}>{userInitial}</div>
            <div className={styles.profileInfo}>
              <h2 className={styles.displayName}>{displayName}</h2>
              <p className={styles.memberBadge}>
                <HugeiconsIcon icon={Calendar01Icon} size={14} />
                Member since {memberSince}
              </p>
            </div>
          </div>

          <div className={styles.profileDetails}>
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}>
                <HugeiconsIcon icon={UserIcon} size={18} />
              </div>
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Display Name</span>
                <span className={styles.detailValue}>{displayName}</span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}>
                <HugeiconsIcon icon={Mail01Icon} size={18} />
              </div>
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Email</span>
                <span className={styles.detailValue}>{userEmail}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Statistics</h2>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <HugeiconsIcon icon={BarChartIcon} size={24} />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>
                  {loading ? '-' : pollCount}
                </span>
                <span className={styles.statLabel}>Total Polls Created</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
