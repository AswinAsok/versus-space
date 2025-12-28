import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { pollFacade } from '../../core/appServices';
import { DashboardSEO } from '../SEO/SEO';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  BarChartIcon,
  Add01Icon,
  GlobeIcon,
  LockIcon,
  Activity01Icon,
  Calendar01Icon,
  ChartIncreaseIcon,
  ArrowRight01Icon,
  SquareArrowUpRightIcon,
} from '@hugeicons/core-free-icons';
import type { Poll } from '../../types';
import styles from './DashboardHome.module.css';

interface DashboardHomeProps {
  user: User;
}

export function DashboardHome({ user }: DashboardHomeProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const activePolls = polls.filter((p) => p.is_active).length;
  const publicPolls = polls.filter((p) => p.is_public).length;

  // Get display name from user metadata or email
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'there';
  const firstName = displayName.split(' ')[0];

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Get recent polls (last 3)
  const recentPolls = [...polls]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <DashboardSEO />

      {/* Welcome Header */}
      <div className={styles.welcomeHeader}>
        <h1 className={styles.welcomeTitle}>
          {getGreeting()}, <span className={styles.gradientText}>{firstName}</span>
        </h1>
        <p className={styles.welcomeSubtitle}>Here's what's happening with your polls</p>
      </div>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.statsContainer}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <HugeiconsIcon icon={BarChartIcon} size={18} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{polls.length}</div>
                <div className={styles.statLabel}>Total Polls</div>
              </div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <HugeiconsIcon icon={Activity01Icon} size={18} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{activePolls}</div>
                <div className={styles.statLabel}>Active Polls</div>
              </div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <HugeiconsIcon icon={GlobeIcon} size={18} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{publicPolls}</div>
                <div className={styles.statLabel}>Public Polls</div>
              </div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <HugeiconsIcon icon={LockIcon} size={18} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{polls.length - publicPolls}</div>
                <div className={styles.statLabel}>Private Polls</div>
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/create')} className={styles.createButton}>
            <HugeiconsIcon icon={Add01Icon} size={18} />
            Create Poll
          </button>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className={styles.quickActionsSection}>
        <div className={styles.actionsGrid}>
          <button onClick={() => navigate('/create')} className={styles.actionCard}>
            <div className={styles.actionIconWrapper}>
              <HugeiconsIcon icon={Add01Icon} size={24} />
            </div>
            <div className={styles.actionContent}>
              <h3>Create Poll</h3>
              <p>Start a new poll in seconds</p>
            </div>
            <HugeiconsIcon icon={ArrowRight01Icon} size={20} className={styles.actionArrow} />
          </button>
          <button onClick={() => navigate('/explore')} className={styles.actionCard}>
            <div className={styles.actionIconWrapper}>
              <HugeiconsIcon icon={ChartIncreaseIcon} size={24} />
            </div>
            <div className={styles.actionContent}>
              <h3>Explore Polls</h3>
              <p>Discover trending public polls</p>
            </div>
            <HugeiconsIcon icon={ArrowRight01Icon} size={20} className={styles.actionArrow} />
          </button>
        </div>
      </section>

      {/* Recent Polls Section */}
      <section className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Polls</h2>
          {polls.length > 3 && (
            <button
              onClick={() => navigate('/dashboard/polls')}
              className={styles.viewAllButton}
            >
              View All
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            </button>
          )}
        </div>

        {recentPolls.length === 0 ? (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>No polls yet</h3>
            <p className={styles.emptyDescription}>
              Create your first poll and start collecting feedback
            </p>
            <button onClick={() => navigate('/create')} className={styles.emptyButton}>
              <HugeiconsIcon icon={Add01Icon} size={18} />
              Create Your First Poll
            </button>
          </div>
        ) : (
          <div className={styles.recentPollsList}>
            {recentPolls.map((poll) => (
              <div key={poll.id} className={styles.recentPollCard}>
                <div className={styles.pollInfo}>
                  <h3 className={styles.pollTitle}>{poll.title}</h3>
                  <div className={styles.pollMeta}>
                    <span className={styles.pollDate}>
                      <HugeiconsIcon icon={Calendar01Icon} size={14} />
                      {new Date(poll.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span
                      className={`${styles.statusBadge} ${poll.is_active ? styles.active : styles.inactive}`}
                    >
                      {poll.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/poll/${poll.id}`)}
                  className={styles.viewPollButton}
                >
                  <HugeiconsIcon icon={SquareArrowUpRightIcon} size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
