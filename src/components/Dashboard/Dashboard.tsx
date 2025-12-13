import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { pollService } from '../../services/pollService';
import {
  Trash2,
  ExternalLink,
  BarChart3,
  Plus,
  Globe,
  Lock,
  Activity,
  Calendar,
  Power,
  PowerOff,
  TrendingUp,
  Copy,
  Check,
  Share2,
  ChevronRight,
  Rocket,
  Code2,
} from 'lucide-react';
import type { Poll } from '../../types';
import styles from './Dashboard.module.css';
import sharedStyles from '../../styles/Shared.module.css';

interface DashboardProps {
  user: User;
  onNavigate: (path: string) => void;
}

export function Dashboard({ user, onNavigate }: DashboardProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadPolls = useCallback(async () => {
    try {
      const data = await pollService.getUserPolls(user.id);
      setPolls(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load polls');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadPolls();
  }, [loadPolls]);

  const handleDelete = async (pollId: string) => {
    if (!confirm('Are you sure you want to delete this poll?')) return;

    try {
      await pollService.deletePoll(pollId);
      setPolls(polls.filter((p) => p.id !== pollId));
    } catch {
      alert('Failed to delete poll');
    }
  };

  const toggleStatus = async (pollId: string, isActive: boolean) => {
    try {
      await pollService.updatePollStatus(pollId, !isActive);
      setPolls(polls.map((p) => (p.id === pollId ? { ...p, is_active: !isActive } : p)));
    } catch {
      alert('Failed to update poll status');
    }
  };

  const copyPollLink = async (pollId: string) => {
    const url = `${window.location.origin}/poll/${pollId}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(pollId);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
      <div className={styles.dashboardInner}>
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
                  <BarChart3 size={18} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{polls.length}</div>
                  <div className={styles.statLabel}>Total Polls</div>
                </div>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Activity size={18} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{activePolls}</div>
                  <div className={styles.statLabel}>Active Polls</div>
                </div>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Globe size={18} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{publicPolls}</div>
                  <div className={styles.statLabel}>Public Polls</div>
                </div>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Lock size={18} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{polls.length - publicPolls}</div>
                  <div className={styles.statLabel}>Private Polls</div>
                </div>
              </div>
            </div>
            <button onClick={() => onNavigate('/create')} className={styles.createButton}>
              <Plus size={18} />
              Create Poll
            </button>
          </div>
        </section>

        {error && <div className={sharedStyles.errorMessage}>{error}</div>}

        {/* Quick Actions Section */}
        <section className={styles.quickActionsSection}>
          <div className={styles.actionsGrid}>
            <button onClick={() => onNavigate('/create')} className={styles.actionCard}>
              <div className={styles.actionIconWrapper}>
                <Plus size={24} />
              </div>
              <div className={styles.actionContent}>
                <h3>Create Poll</h3>
                <p>Start a new poll in seconds</p>
              </div>
              <ChevronRight size={20} className={styles.actionArrow} />
            </button>
            <button onClick={() => onNavigate('/explore')} className={styles.actionCard}>
              <div className={styles.actionIconWrapper}>
                <TrendingUp size={24} />
              </div>
              <div className={styles.actionContent}>
                <h3>Explore Polls</h3>
                <p>Discover trending public polls</p>
              </div>
              <ChevronRight size={20} className={styles.actionArrow} />
            </button>
            <button onClick={() => {}} className={styles.actionCard}>
              <div className={styles.actionIconWrapper}>
                <Share2 size={24} />
              </div>
              <div className={styles.actionContent}>
                <h3>Share Results</h3>
                <p>Export and share your data</p>
              </div>
              <ChevronRight size={20} className={styles.actionArrow} />
            </button>
          </div>
        </section>

        {/* Your Polls Section */}
        <section className={styles.pollsSection}>
          <div className={styles.pollsHeaderGroup}>
            <h2 className={styles.pollsHeader}>Your Polls</h2>
            <p className={styles.pollsSubtitle}>
              {polls.length} {polls.length === 1 ? 'poll' : 'polls'} in your collection
            </p>
          </div>
          {polls.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyVisual}>
                <div className={styles.emptyIconOuter}>
                  <div className={styles.emptyIconInner}>
                    <Rocket size={40} />
                  </div>
                </div>
                <div className={styles.emptyOrbit}>
                  <div className={styles.orbitDot}></div>
                </div>
              </div>
              <h2 className={styles.emptyTitle}>Ready to launch your first poll?</h2>
              <p className={styles.emptyDescription}>
                Create engaging polls and start collecting real-time feedback from your audience in
                seconds.
              </p>
              <div className={styles.emptyActions}>
                <button
                  onClick={() => onNavigate('/create')}
                  className={`${sharedStyles.btnPrimary} ${sharedStyles.btnLarge}`}
                >
                  <Plus size={18} />
                  Create Your First Poll
                </button>
                <button
                  onClick={() => onNavigate('/explore')}
                  className={`${sharedStyles.btnSecondary} ${sharedStyles.btnLarge}`}
                >
                  <Globe size={18} />
                  Explore Public Polls
                </button>
              </div>
              <div className={styles.emptyFeatures}>
                <span>
                  <Check size={16} /> Real-time results
                </span>
                <span>
                  <Check size={16} /> Easy sharing
                </span>
                <span>
                  <Check size={16} /> Beautiful visuals
                </span>
              </div>
            </div>
          ) : (
            <div className={styles.pollsGrid}>
              {polls.map((poll, index) => (
                <div
                  key={poll.id}
                  className={styles.pollCard}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={styles.pollCardHeader}>
                    <div className={styles.pollBadges}>
                      <span
                        className={`${styles.visibilityBadge} ${poll.is_public ? styles.public : styles.private}`}
                      >
                        {poll.is_public ? <Globe size={12} /> : <Lock size={12} />}
                        {poll.is_public ? 'Public' : 'Private'}
                      </span>
                      <div className={styles.pollRight}>
                        <div className={styles.pollMenu}>
                          <button
                            onClick={() => copyPollLink(poll.id)}
                            className={styles.menuButton}
                            title="Copy link"
                          >
                            {copiedId === poll.id ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                          <button
                            onClick={() => handleDelete(poll.id)}
                            className={`${styles.menuButton} ${styles.deleteButton}`}
                            title="Delete poll"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        {poll.is_active ? (
                          <span className={styles.activeDot} title="Active"></span>
                        ) : (
                          <span className={`${styles.statusBadge} ${styles.inactive}`}>
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <h3 className={styles.pollTitle}>{poll.title}</h3>

                  <div className={styles.pollMeta}>
                    <span className={styles.pollDate}>
                      <Calendar size={14} />
                      {new Date(poll.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className={styles.pollActions}>
                    {poll.is_active ? (
                      <>
                        <button
                          onClick={() => onNavigate(`/poll/${poll.id}`)}
                          className={styles.viewButton}
                        >
                          <ExternalLink size={16} />
                          View Poll
                        </button>
                        <button
                          onClick={() => toggleStatus(poll.id, poll.is_active)}
                          className={`${styles.toggleButton} ${styles.toggleDeactivate}`}
                          title="Deactivate"
                        >
                          <PowerOff size={16} />
                          Deactivate
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleStatus(poll.id, poll.is_active)}
                          className={styles.activateButton}
                        >
                          <Power size={16} />
                          Activate Poll
                        </button>
                        <button
                          onClick={() => onNavigate(`/poll/${poll.id}`)}
                          className={styles.viewButtonSecondary}
                          title="View Poll"
                        >
                          <ExternalLink size={16} />
                          View
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <span>&copy; 2025 versus.space</span>
          <div className={styles.footerRight}>
            <a
              href="https://neal.fun"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              inspiration from neal<span className={styles.footerDot}>.</span>fun
            </a>
            <span className={styles.footerDivider}>·</span>
            <a
              href="https://github.com/AswinAsok"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              <Code2 size={14} />
              built by aswinasok<span className={styles.footerDot}>.</span>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
