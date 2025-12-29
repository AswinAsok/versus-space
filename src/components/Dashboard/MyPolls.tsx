import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { pollFacade } from '../../core/appServices';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Delete01Icon,
  SquareArrowUpRightIcon,
  Add01Icon,
  GlobeIcon,
  LockIcon,
  Calendar01Icon,
  ToggleOnIcon,
  ToggleOffIcon,
  Copy01Icon,
  Tick01Icon,
  PencilEdit01Icon,
} from '@hugeicons/core-free-icons';
import type { Poll } from '../../types';
import styles from './MyPolls.module.css';
import sharedStyles from '../../styles/Shared.module.css';

interface MyPollsProps {
  user: User;
}

export function MyPolls({ user }: MyPollsProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadPolls = useCallback(async () => {
    try {
      const data = await pollFacade.getUserPolls(user.id);
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
      await pollFacade.deletePoll(pollId);
      setPolls(polls.filter((p) => p.id !== pollId));
    } catch {
      alert('Failed to delete poll');
    }
  };

  const toggleStatus = async (pollId: string, isActive: boolean) => {
    try {
      await pollFacade.updatePollStatus(pollId, !isActive);
      setPolls(polls.map((p) => (p.id === pollId ? { ...p, is_active: !isActive } : p)));
    } catch {
      alert('Failed to update poll status');
    }
  };

  const copyPollLink = async (slug: string, pollId: string) => {
    const url = `${window.location.origin}/poll/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(pollId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading your polls...</p>
      </div>
    );
  }

  return (
    <div className={styles.myPollsContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>My Polls</h1>
          <p className={styles.pageSubtitle}>
            {polls.length} {polls.length === 1 ? 'poll' : 'polls'} in your collection
          </p>
        </div>
        <button onClick={() => navigate('/dashboard/create')} className={styles.createButton}>
          <HugeiconsIcon icon={Add01Icon} size={18} />
          Create Poll
        </button>
      </div>

      {error && <div className={sharedStyles.errorMessage}>{error}</div>}

      {polls.length === 0 ? (
        <div className={styles.emptyState}>
          <h2 className={styles.emptyTitle}>Ready to launch your first poll?</h2>
          <p className={styles.emptyDescription}>
            Create engaging polls and start collecting real-time feedback from your audience in
            seconds.
          </p>
          <div className={styles.emptyActions}>
            <button
              onClick={() => navigate('/dashboard/create')}
              className={styles.emptyButton}
            >
              <HugeiconsIcon icon={Add01Icon} size={18} />
              Create Your First Poll
            </button>
            <button
              onClick={() => navigate('/explore')}
              className={styles.emptyButtonSecondary}
            >
              <HugeiconsIcon icon={GlobeIcon} size={18} />
              Explore Public Polls
            </button>
          </div>
          <div className={styles.emptyFeatures}>
            <span>
              <HugeiconsIcon icon={Tick01Icon} size={16} /> Real-time results
            </span>
            <span>
              <HugeiconsIcon icon={Tick01Icon} size={16} /> Easy sharing
            </span>
            <span>
              <HugeiconsIcon icon={Tick01Icon} size={16} /> Beautiful visuals
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
                    {poll.is_public ? (
                      <HugeiconsIcon icon={GlobeIcon} size={12} />
                    ) : (
                      <HugeiconsIcon icon={LockIcon} size={12} />
                    )}
                    {poll.is_public ? 'Public' : 'Private'}
                  </span>
                  <div className={styles.pollRight}>
                    <div className={styles.pollMenu}>
                      <button
                        onClick={() => copyPollLink(poll.slug, poll.id)}
                        className={styles.menuButton}
                        title="Copy link"
                      >
                        {copiedId === poll.id ? (
                          <HugeiconsIcon icon={Tick01Icon} size={16} />
                        ) : (
                          <HugeiconsIcon icon={Copy01Icon} size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/edit/${poll.id}`)}
                        className={styles.menuButton}
                        title="Edit poll"
                      >
                        <HugeiconsIcon icon={PencilEdit01Icon} size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(poll.id)}
                        className={`${styles.menuButton} ${styles.deleteButton}`}
                        title="Delete poll"
                      >
                        <HugeiconsIcon icon={Delete01Icon} size={16} />
                      </button>
                    </div>
                    {poll.is_active ? (
                      <span className={styles.activeDot} title="Active"></span>
                    ) : (
                      <span className={`${styles.statusBadge} ${styles.inactive}`}>Inactive</span>
                    )}
                  </div>
                </div>
              </div>

              <h3 className={styles.pollTitle}>{poll.title}</h3>

              <div className={styles.pollMeta}>
                <span className={styles.pollDate}>
                  <HugeiconsIcon icon={Calendar01Icon} size={14} />
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
                      onClick={() => navigate(`/poll/${poll.slug}`)}
                      className={styles.viewButton}
                    >
                      <HugeiconsIcon icon={SquareArrowUpRightIcon} size={16} />
                      View Poll
                    </button>
                    <button
                      onClick={() => toggleStatus(poll.id, poll.is_active)}
                      className={`${styles.toggleButton} ${styles.toggleDeactivate}`}
                      title="Deactivate"
                    >
                      <HugeiconsIcon icon={ToggleOffIcon} size={16} />
                      Deactivate
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => toggleStatus(poll.id, poll.is_active)}
                      className={styles.activateButton}
                    >
                      <HugeiconsIcon icon={ToggleOnIcon} size={16} />
                      Activate Poll
                    </button>
                    <button
                      onClick={() => navigate(`/poll/${poll.slug}`)}
                      className={styles.viewButtonSecondary}
                      title="View Poll"
                    >
                      <HugeiconsIcon icon={SquareArrowUpRightIcon} size={16} />
                      View
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
