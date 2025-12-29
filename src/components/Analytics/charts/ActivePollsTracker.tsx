import { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserMultiple02Icon, ViewIcon } from '@hugeicons/core-free-icons';
import { supabase } from '../../../lib/supabaseClient';
import type { Poll } from '../../../types';
import styles from './ActivePollsTracker.module.css';

interface PollPresence {
  pollId: string;
  pollTitle: string;
  viewerCount: number;
  isActive: boolean;
}

interface ActivePollsTrackerProps {
  polls: Poll[];
}

export function ActivePollsTracker({ polls }: ActivePollsTrackerProps) {
  const [pollPresence, setPollPresence] = useState<Map<string, number>>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (polls.length === 0) return;

    // Subscribe to presence for each poll
    const channels: ReturnType<typeof supabase.channel>[] = [];
    const adminId = `admin-${crypto.randomUUID()}`;

    polls.forEach((poll) => {
      const channel = supabase.channel(`poll-presence:${poll.id}`, {
        config: { presence: { key: 'viewers' } },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          // Count all presence entries, excluding the admin tracker
          const allPresences = Object.values(state).flat() as Array<{ viewerId?: string }>;
          const viewerCount = allPresences.filter(
            (p) => !p.viewerId?.startsWith('admin-') && !p.viewerId?.startsWith('stats-')
          ).length;
          setPollPresence((prev) => {
            const next = new Map(prev);
            next.set(poll.id, viewerCount);
            return next;
          });
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            // Track admin presence to establish channel connection
            await channel.track({
              viewerId: adminId,
              isAdmin: true,
              joinedAt: new Date().toISOString(),
            });
          }
        });

      channels.push(channel);
    });

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [polls]);

  // Build sorted list of polls with presence data
  const pollsWithPresence: PollPresence[] = polls
    .map((poll) => ({
      pollId: poll.id,
      pollTitle: poll.title,
      viewerCount: pollPresence.get(poll.id) || 0,
      isActive: poll.is_active,
    }))
    .sort((a, b) => b.viewerCount - a.viewerCount);

  const totalViewers = pollsWithPresence.reduce((sum, p) => sum + p.viewerCount, 0);
  const activeViewerPolls = pollsWithPresence.filter((p) => p.viewerCount > 0);

  return (
    <div className={styles.trackerCard}>
      <div className={styles.trackerHeader}>
        <div className={styles.headerLeft}>
          <span className={`${styles.statusDot} ${isConnected ? styles.connected : ''}`} />
          <h3 className={styles.trackerTitle}>Live Poll Activity</h3>
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
            <span className={styles.emptyHint}>Viewers will appear here when someone opens a poll</span>
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
                    <span className={`${styles.activityDot} ${poll.viewerCount > 0 ? styles.hasViewers : ''}`} />
                  </div>
                  <div className={styles.pollDetails}>
                    <span className={styles.pollTitle}>{poll.pollTitle}</span>
                    <span className={styles.pollMeta}>
                      {poll.isActive ? 'Active' : 'Ended'}
                    </span>
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

      <p className={styles.trackerFootnote}>
        Real-time viewer count across all your polls
      </p>
    </div>
  );
}
