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
  Sparkles,
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

  const activePolls = polls.filter((p) => p.is_active).length;
  const publicPolls = polls.filter((p) => p.is_public).length;

  if (loading) {
    return <div className={sharedStyles.loading}>Loading your polls...</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeContent}>
          <span className={styles.welcomeBadge}>
            <Sparkles size={14} />
            Dashboard
          </span>
          <h1 className={styles.welcomeTitle}>Welcome back!</h1>
          <p className={styles.welcomeSubtitle}>Here's what's happening with your polls today.</p>
        </div>
        <button
          onClick={() => onNavigate('/create')}
          className={`${sharedStyles.btnPrimary} ${sharedStyles.btnLarge}`}
        >
          <Plus size={18} />
          Create New Poll
        </button>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: 'linear-gradient(135deg, #196AFF, #0D47A1)' }}
          >
            <BarChart3 size={22} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{polls.length}</div>
            <div className={styles.statLabel}>Total Polls</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            <Activity size={22} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{activePolls}</div>
            <div className={styles.statLabel}>Active Polls</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
          >
            <Globe size={22} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{publicPolls}</div>
            <div className={styles.statLabel}>Public Polls</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            <Lock size={22} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{polls.length - publicPolls}</div>
            <div className={styles.statLabel}>Private Polls</div>
          </div>
        </div>
      </div>

      {error && <div className={sharedStyles.errorMessage}>{error}</div>}

      {/* Polls Section */}
      <div className={styles.pollsSection}>
        <div className={styles.pollsSectionHeader}>
          <h2 className={styles.pollsSectionTitle}>Your Polls</h2>
          <span className={styles.pollsCount}>
            {polls.length} {polls.length === 1 ? 'poll' : 'polls'}
          </span>
        </div>

        {polls.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <BarChart3 size={48} />
            </div>
            <h2 className={styles.emptyTitle}>No polls yet</h2>
            <p className={styles.emptyDescription}>
              Create your first poll and start collecting votes in real-time
            </p>
            <button onClick={() => onNavigate('/create')} className={sharedStyles.btnPrimary}>
              <Plus size={18} />
              Create Your First Poll
            </button>
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
                      className={`${styles.statusBadge} ${
                        poll.is_active ? styles.active : styles.inactive
                      }`}
                    >
                      {poll.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span
                      className={`${styles.visibilityBadge} ${poll.is_public ? styles.public : styles.private}`}
                    >
                      {poll.is_public ? <Globe size={12} /> : <Lock size={12} />}
                      {poll.is_public ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <div className={styles.pollMenu}>
                    <button
                      onClick={() => handleDelete(poll.id)}
                      className={styles.menuButton}
                      title="Delete poll"
                    >
                      <Trash2 size={16} />
                    </button>
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
                  <button
                    onClick={() => onNavigate(`/poll/${poll.id}`)}
                    className={styles.viewButton}
                  >
                    <ExternalLink size={16} />
                    View Poll
                  </button>

                  <button
                    onClick={() => toggleStatus(poll.id, poll.is_active)}
                    className={`${styles.toggleButton} ${poll.is_active ? styles.toggleDeactivate : styles.toggleActivate}`}
                    title={poll.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {poll.is_active ? <PowerOff size={16} /> : <Power size={16} />}
                    {poll.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
