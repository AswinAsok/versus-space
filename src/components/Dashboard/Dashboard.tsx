import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { pollService } from '../../services/pollService';
import { Trash2, ExternalLink, BarChart3, Plus, Globe, Lock } from 'lucide-react';
import type { Poll } from '../../types';
import styles from './Dashboard.module.css';
import sharedStyles from '../../styles/Shared.module.css';

interface DashboardProps {
  user: User;
  onNavigate: (path: string) => void;
}

// Authenticated view listing the creator's polls with lifecycle controls.
export function Dashboard({ user, onNavigate }: DashboardProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPolls = useCallback(async () => {
    try {
      // Pull a fresh copy to keep UI consistent with backend state.
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
      // Flip active flag; UI mirrors the response optimistically.
      await pollService.updatePollStatus(pollId, !isActive);
      setPolls(
        polls.map((p) => (p.id === pollId ? { ...p, is_active: !isActive } : p))
      );
    } catch {
      alert('Failed to update poll status');
    }
  };

  if (loading) {
    return <div className={sharedStyles.loading}>Loading your polls...</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.dashboardTitle}>Your Polls</h1>
          <p className={styles.dashboardSubtitle}>Manage and track your polls</p>
        </div>
        <button onClick={() => onNavigate('/create')} className={sharedStyles.btnPrimary}>
          <Plus size={18} />
          Create Poll
        </button>
      </div>

      {error && <div className={sharedStyles.errorMessage}>{error}</div>}

      {polls.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <BarChart3 size={48} />
          </div>
          <h2 className={styles.emptyTitle}>No polls yet</h2>
          <p className={styles.emptyDescription}>Create your first poll to start collecting votes</p>
          <button onClick={() => onNavigate('/create')} className={sharedStyles.btnPrimary}>
            <Plus size={18} />
            Create Your First Poll
          </button>
        </div>
      ) : (
        <div className={styles.pollsGrid}>
          {polls.map((poll) => (
            <div key={poll.id} className={styles.pollCard}>
              <div className={styles.pollCardHeader}>
                <div className={styles.pollBadges}>
                  <span
                    className={`${styles.statusBadge} ${
                      poll.is_active ? styles.active : styles.inactive
                    }`}
                  >
                    {poll.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`${styles.visibilityBadge} ${poll.is_public ? styles.public : styles.private}`}>
                    {poll.is_public ? <Globe size={12} /> : <Lock size={12} />}
                    {poll.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>

              <h3 className={styles.pollTitle}>{poll.title}</h3>

              <div className={styles.pollMeta}>
                Created {new Date(poll.created_at).toLocaleDateString()}
              </div>

              <div className={styles.pollActions}>
                <button
                  onClick={() => onNavigate(`/poll/${poll.id}`)}
                  className={sharedStyles.btnSecondary}
                  title="View poll"
                >
                  <ExternalLink size={16} />
                  View
                </button>

                <button
                  onClick={() => toggleStatus(poll.id, poll.is_active)}
                  className={sharedStyles.btnIcon}
                  title={poll.is_active ? 'Deactivate' : 'Activate'}
                >
                  {poll.is_active ? 'Deactivate' : 'Activate'}
                </button>

                <button
                  onClick={() => handleDelete(poll.id)}
                  className={sharedStyles.btnIcon}
                  title="Delete poll"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
