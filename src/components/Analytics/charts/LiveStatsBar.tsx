import { useState, useEffect, useRef, useCallback } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserMultiple02Icon,
  CheckmarkBadge01Icon,
  Activity01Icon,
  FlashIcon,
} from '@hugeicons/core-free-icons';
import { realtimeFacade, voteFacade } from '../../../core/appServices';
import styles from './LiveStatsBar.module.css';

interface LiveStatsBarProps {
  totalVotes: number;
  activePolls: number;
  pollIds: string[];
  showSampleNote?: boolean;
  sampleNoteMessage?: string;
}

export function LiveStatsBar({
  totalVotes: initialTotalVotes,
  activePolls,
  pollIds,
  showSampleNote,
  sampleNoteMessage,
}: LiveStatsBarProps) {
  const [liveViewers, setLiveViewers] = useState(0);
  const [totalVotes, setTotalVotes] = useState(initialTotalVotes);
  const [votesToday, setVotesToday] = useState(0);
  const [votesPerMinute, setVotesPerMinute] = useState(0);
  const [isVotePulse, setIsVotePulse] = useState(false);
  const recentVotesRef = useRef<number[]>([]);
  const pollPresenceRef = useRef<Map<string, number>>(new Map());

  // Update total votes when prop changes
  useEffect(() => {
    setTotalVotes(initialTotalVotes);
  }, [initialTotalVotes]);

  // Track votes per minute
  const trackVote = useCallback(() => {
    const now = Date.now();
    recentVotesRef.current.push(now);
    // Keep only votes from last minute
    recentVotesRef.current = recentVotesRef.current.filter((t) => now - t < 60000);
    setVotesPerMinute(recentVotesRef.current.length);

    // Trigger pulse animation
    setIsVotePulse(true);
    setTimeout(() => setIsVotePulse(false), 300);
  }, []);

  // Subscribe to presence for live viewers across all polls
  useEffect(() => {
    if (pollIds.length === 0 || showSampleNote) {
      setLiveViewers(0);
      return;
    }

    const updateTotalViewers = () => {
      let total = 0;
      pollPresenceRef.current.forEach((count) => {
        total += count;
      });
      setLiveViewers(total);
    };

    const unsubscribe = realtimeFacade.subscribeToPolls(pollIds, {
      role: 'observer',
      viewerId: `stats-${crypto.randomUUID()}`,
      onPresence: (pollId, viewers) => {
        pollPresenceRef.current.set(pollId, viewers.length);
        updateTotalViewers();
      },
      onVote: () => {
        setTotalVotes((prev) => prev + 1);
        setVotesToday((prev) => prev + 1);
        trackVote();
      },
    });

    return () => {
      unsubscribe();
      pollPresenceRef.current.clear();
    };
  }, [pollIds, showSampleNote, trackVote]);

  // Load today's votes count (only for user's polls)
  useEffect(() => {
    const loadTodayVotes = async () => {
      if (pollIds.length === 0 || showSampleNote) {
        setVotesToday(0);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const counts = await voteFacade.getVoteCountsSince(pollIds, today);
      setVotesToday([...counts.values()].reduce((total, count) => total + count, 0));
    };

    loadTodayVotes();
  }, [pollIds, showSampleNote]);

  // Update VPM counter every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      recentVotesRef.current = recentVotesRef.current.filter((t) => now - t < 60000);
      setVotesPerMinute(recentVotesRef.current.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.statsBarWrapper}>
      {showSampleNote && (
        <div className={styles.sampleNote}>
          {sampleNoteMessage ||
            'Showing sample data — create your first poll to see real analytics'}
        </div>
      )}
      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <div className={`${styles.statIcon} ${styles.liveIcon}`}>
            <span className={styles.liveDot} />
            <HugeiconsIcon icon={UserMultiple02Icon} size={18} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{liveViewers}</span>
            <span className={styles.statLabel}>Live Now</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.statItem}>
          <div
            className={`${styles.statIcon} ${styles.votesIcon} ${isVotePulse ? styles.pulse : ''}`}
          >
            <HugeiconsIcon icon={CheckmarkBadge01Icon} size={18} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{totalVotes.toLocaleString()}</span>
            <span className={styles.statLabel}>Total Votes</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.statItem}>
          <div className={`${styles.statIcon} ${styles.todayIcon}`}>
            <HugeiconsIcon icon={Activity01Icon} size={18} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{votesToday.toLocaleString()}</span>
            <span className={styles.statLabel}>Today</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.statItem}>
          <div className={`${styles.statIcon} ${styles.velocityIcon}`}>
            <HugeiconsIcon icon={FlashIcon} size={18} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{votesPerMinute}</span>
            <span className={styles.statLabel}>Votes/min</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.statItem}>
          <div className={`${styles.statIcon} ${styles.activeIcon}`}>
            <span className={styles.activeDot} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{activePolls}</span>
            <span className={styles.statLabel}>Active Polls</span>
          </div>
        </div>
      </div>
    </div>
  );
}
