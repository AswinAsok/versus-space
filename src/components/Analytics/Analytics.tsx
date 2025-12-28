import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { pollFacade } from '../../core/appServices';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  BarChartIcon,
  Activity01Icon,
  ViewIcon,
  ChartIncreaseIcon,
} from '@hugeicons/core-free-icons';
import type { Poll } from '../../types';
import styles from './Analytics.module.css';

interface AnalyticsProps {
  user: User;
}

export function Analytics({ user }: AnalyticsProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPolls = useCallback(async () => {
    try {
      const data = await pollFacade.getUserPolls(user.id);
      setPolls(data);
    } catch (err) {
      console.error('Failed to load polls:', err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadPolls();
  }, [loadPolls]);

  const totalPolls = polls.length;
  const activePolls = polls.filter((p) => p.is_active).length;
  const publicPolls = polls.filter((p) => p.is_public).length;

  // Sort polls by created_at to get recent activity
  const recentPolls = [...polls]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.analyticsInner}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Analytics</h1>
          <p className={styles.pageSubtitle}>Overview of your poll performance and activity</p>
        </div>

        {/* Stats Overview */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <HugeiconsIcon icon={BarChartIcon} size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{loading ? '-' : totalPolls}</span>
              <span className={styles.statLabel}>Total Polls</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.activeIcon}`}>
              <HugeiconsIcon icon={Activity01Icon} size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{loading ? '-' : activePolls}</span>
              <span className={styles.statLabel}>Active Polls</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.publicIcon}`}>
              <HugeiconsIcon icon={ViewIcon} size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{loading ? '-' : publicPolls}</span>
              <span className={styles.statLabel}>Public Polls</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.growthIcon}`}>
              <HugeiconsIcon icon={ChartIncreaseIcon} size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>
                {loading ? '-' : Math.round((activePolls / Math.max(totalPolls, 1)) * 100)}%
              </span>
              <span className={styles.statLabel}>Active Rate</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Activity</h2>

          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading activity...</p>
            </div>
          ) : recentPolls.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No polls created yet. Create your first poll to see activity here.</p>
            </div>
          ) : (
            <div className={styles.activityList}>
              {recentPolls.map((poll) => (
                <div key={poll.id} className={styles.activityItem}>
                  <div className={styles.activityDot}></div>
                  <div className={styles.activityContent}>
                    <span className={styles.activityTitle}>{poll.title}</span>
                    <span className={styles.activityMeta}>
                      Created{' '}
                      {new Date(poll.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <span
                    className={`${styles.activityStatus} ${poll.is_active ? styles.active : styles.inactive}`}
                  >
                    {poll.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Coming Soon Notice */}
        <div className={styles.comingSoon}>
          <HugeiconsIcon icon={ChartIncreaseIcon} size={24} className={styles.comingSoonIcon} />
          <div className={styles.comingSoonContent}>
            <h3 className={styles.comingSoonTitle}>More Analytics Coming Soon</h3>
            <p className={styles.comingSoonText}>
              We're working on detailed charts, vote trends, and engagement metrics.
              Stay tuned for updates!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
