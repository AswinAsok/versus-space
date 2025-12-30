import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { pollFacade } from '../../core/appServices';
import { useUserProfile } from '../../hooks/useUserProfile';
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
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';
import { FREE_PLAN_POLL_LIMIT } from '../../config/plans';
import { MouseLoader } from '../Loading/MouseLoader';
import { UpgradePlan } from './UpgradePlan';
import type { Poll } from '../../types';
import styles from './DashboardHome.module.css';

interface DashboardHomeProps {
  user: User;
}

export function DashboardHome({ user }: DashboardHomeProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false);
  const [isCheckingUpgrade, setIsCheckingUpgrade] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useUserProfile(user);

  // Handle upgrade success/cancel from DodoPayments redirect
  useEffect(() => {
    const upgradeStatus = searchParams.get('upgrade');

    if (!upgradeStatus) return;

    const updatedParams = new URLSearchParams(searchParams);
    updatedParams.delete('upgrade');
    setSearchParams(updatedParams, { replace: true });

    if (upgradeStatus === 'success') {
      setShowUpgradeSuccess(true);
      setIsCheckingUpgrade(true);
      refetchProfile();
    } else if (upgradeStatus === 'cancelled') {
      setShowUpgradeSuccess(false);
      setIsCheckingUpgrade(false);
    }
  }, [searchParams, setSearchParams, refetchProfile]);

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
  const pollCount = polls.length;
  const isSuperAdmin = profile?.role === 'superadmin';
  const isPro = isSuperAdmin || profile?.plan === 'pro';
  const isAtFreeLimit = !isPro && pollCount >= FREE_PLAN_POLL_LIMIT;

  // After a successful payment redirect, poll for the plan update for a short window
  useEffect(() => {
    if (!isCheckingUpgrade) return;

    if (isPro) {
      setIsCheckingUpgrade(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 10; // ~30s total at 3s intervals

    const intervalId = setInterval(async () => {
      attempts += 1;
      const { data, error } = await refetchProfile();

      if (error) {
        console.error('Failed to refresh profile after upgrade:', error);
      }

      if (data?.plan === 'pro') {
        setShowUpgradeSuccess(true);
        setIsCheckingUpgrade(false);
        return;
      }

      if (attempts >= maxAttempts) {
        setIsCheckingUpgrade(false);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [isCheckingUpgrade, isPro, refetchProfile]);

  // Auto-hide the banner after a short time, but only once it's been shown
  useEffect(() => {
    if (!showUpgradeSuccess) return;

    const timeout = setTimeout(() => setShowUpgradeSuccess(false), isPro ? 4000 : 8000);
    return () => clearTimeout(timeout);
  }, [showUpgradeSuccess, isPro]);

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

  if (loading || profileLoading) {
    return <MouseLoader message="Loading your dashboard..." />;
  }

  return (
    <div className={styles.dashboardContainer}>
      <DashboardSEO />

      {/* Upgrade Success Message */}
      {showUpgradeSuccess && (
        <div className={styles.successBanner}>
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} />
          <span>
            {isPro
              ? 'You are now on Pro. Enjoy unlimited polls.'
              : 'Welcome to Pro! Your upgrade is being processed.'}
          </span>
          <button onClick={() => setShowUpgradeSuccess(false)} className={styles.dismissButton}>
            Dismiss
          </button>
        </div>
      )}

      {/* Upgrade Banner - shown at top when at free limit */}
      {isAtFreeLimit && (
        <div className={styles.upgradeBanner}>
          <div className={styles.upgradeBannerContent}>
            <span className={styles.upgradeBannerText}>
              Congratulations! You are eligible for an upgrade
            </span>
            <button
              onClick={() => navigate('/dashboard/settings')}
              className={styles.upgradeBannerButton}
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      )}

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
          <button
            onClick={() => navigate(isAtFreeLimit ? '/dashboard/settings' : '/dashboard/create')}
            className={styles.createButton}
          >
            <HugeiconsIcon icon={Add01Icon} size={18} />
            {isAtFreeLimit ? 'Upgrade to Pro' : 'Create Poll'}
          </button>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className={styles.quickActionsSection}>
        <div className={styles.actionsGrid}>
          <button
            onClick={() => navigate('/dashboard/create')}
            className={styles.actionCard}
            disabled={isAtFreeLimit}
          >
            <div className={styles.actionIconWrapper}>
              <HugeiconsIcon icon={Add01Icon} size={24} />
            </div>
            <div className={styles.actionContent}>
              <h3>Create Poll</h3>
              <p>{isAtFreeLimit ? 'Upgrade to add more polls' : 'Start a new poll in seconds'}</p>
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
            <button
              onClick={() => navigate(isAtFreeLimit ? '/dashboard/settings' : '/dashboard/create')}
              className={styles.emptyButton}
            >
              <HugeiconsIcon icon={Add01Icon} size={18} />
              {isAtFreeLimit ? 'Upgrade to Pro' : 'Create Your First Poll'}
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
                  onClick={() => navigate(`/poll/${poll.slug}`)}
                  className={styles.viewPollButton}
                >
                  <HugeiconsIcon icon={SquareArrowUpRightIcon} size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upgrade Plan Section - Only show for free users */}
      {!isPro && (
        <section className={styles.upgradeSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Upgrade Your Plan</h2>
          </div>
          <UpgradePlan user={user} currentPollCount={pollCount} />
        </section>
      )}
    </div>
  );
}
