import { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserMultiple02Icon, ViewIcon } from '@hugeicons/core-free-icons';
import { realtimeFacade } from '../../../core/appServices';
import type { Poll } from '../../../types';
import chartStyles from './Charts.module.css';
import styles from './ActivePollsTracker.module.css';

interface PollPresence {
  pollId: string;
  pollTitle: string;
  viewerCount: number;
  isActive: boolean;
}

interface ActivePollsTrackerProps {
  polls: Poll[];
  showProBadge?: boolean;
  proDescription?: string;
  useDummyData?: boolean;
}

export function ActivePollsTracker({
  polls,
  showProBadge,
  proDescription,
  useDummyData = false,
}: ActivePollsTrackerProps) {
  const [pollPresence, setPollPresence] = useState<Map<string, number>>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (polls.length === 0 || useDummyData) return;

    const unsubscribe = realtimeFacade.subscribeToPolls(
      polls.map((poll) => poll.id),
      {
        role: 'observer',
        viewerId: `admin-${crypto.randomUUID()}`,
        onConnected: setIsConnected,
        onPresence: (pollId, viewers) => {
          setPollPresence((prev) => {
            const next = new Map(prev);
            next.set(pollId, viewers.length);
            return next;
          });
        },
      }
    );

    return () => {
      unsubscribe();
      setIsConnected(false);
      setPollPresence(new Map());
    };
  }, [polls, useDummyData]);

  // Helper to check if poll is truly active (not expired by timer)
  const isPollActive = (poll: Poll): boolean => {
    if (!poll.is_active) return false;
    if (poll.ends_at) {
      return new Date(poll.ends_at) > new Date();
    }
    return true;
  };

  // Build sorted list of polls with presence data
  const pollsWithPresence: PollPresence[] = polls
    .map((poll) => ({
      pollId: poll.id,
      pollTitle: poll.title,
      viewerCount: pollPresence.get(poll.id) || 0,
      isActive: isPollActive(poll),
    }))
    .sort((a, b) => b.viewerCount - a.viewerCount);

  const totalViewers = pollsWithPresence.reduce((sum, p) => sum + p.viewerCount, 0);
  const activeViewerPolls = pollsWithPresence.filter((p) => p.viewerCount > 0);

  return (
    <div className={styles.trackerCard}>
      {proDescription && <p className={styles.proDescription}>{proDescription}</p>}
      <div className={styles.trackerHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.titleRow}>
            <span className={`${styles.statusDot} ${isConnected ? styles.connected : ''}`} />
            <h3 className={styles.trackerTitle}>Live Poll Activity</h3>
            {showProBadge && <span className={chartStyles.proBadge}>Pro</span>}
          </div>
        </div>
        <div className={styles.totalViewers}>
          <HugeiconsIcon icon={UserMultiple02Icon} size={16} />
          <span>{totalViewers} viewing</span>
        </div>
      </div>

      <div className={styles.pollsList}>
        {pollsWithPresence.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No polls available</p>
          </div>
        ) : activeViewerPolls.length === 0 ? (
          <div className={styles.emptyState}>
            <HugeiconsIcon icon={ViewIcon} size={24} />
            <p>No active viewers right now</p>
            <span className={styles.emptyHint}>
              Viewers will appear here when someone opens a poll
            </span>
          </div>
        ) : (
          <>
            {activeViewerPolls.map((poll, index) => (
              <div
                key={poll.pollId}
                className={styles.pollItem}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={styles.pollInfo}>
                  <div className={styles.pollStatus}>
                    <span
                      className={`${styles.activityDot} ${poll.viewerCount > 0 ? styles.hasViewers : ''}`}
                    />
                  </div>
                  <div className={styles.pollDetails}>
                    <span className={styles.pollTitle}>{poll.pollTitle}</span>
                    <span className={styles.pollMeta}>{poll.isActive ? 'Active' : 'Ended'}</span>
                  </div>
                </div>
                <div className={styles.viewerBadge}>
                  <HugeiconsIcon icon={UserMultiple02Icon} size={14} />
                  <span>{poll.viewerCount}</span>
                </div>
              </div>
            ))}

            {/* Show inactive polls summary */}
            {pollsWithPresence.length > activeViewerPolls.length && (
              <div className={styles.inactiveSummary}>
                {pollsWithPresence.length - activeViewerPolls.length} polls with no viewers
              </div>
            )}
          </>
        )}
      </div>

      <p className={styles.trackerFootnote}>Real-time viewer count across all your polls</p>
    </div>
  );
}
