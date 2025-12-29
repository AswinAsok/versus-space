import { useState, useEffect, useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserMultiple02Icon,
  CheckmarkBadge01Icon,
  Activity01Icon,
  FlashIcon,
} from '@hugeicons/core-free-icons';
import { supabase } from '../../../lib/supabaseClient';
import styles from './LiveStatsBar.module.css';

interface LiveStatsBarProps {
  userId: string;
  totalVotes: number;
  activePolls: number;
  pollIds: string[];
}

export function LiveStatsBar({ userId, totalVotes: initialTotalVotes, activePolls, pollIds }: LiveStatsBarProps) {
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
  const trackVote = () => {
    const now = Date.now();
    recentVotesRef.current.push(now);
    // Keep only votes from last minute
    recentVotesRef.current = recentVotesRef.current.filter(t => now - t < 60000);
    setVotesPerMinute(recentVotesRef.current.length);

    // Trigger pulse animation
    setIsVotePulse(true);
    setTimeout(() => setIsVotePulse(false), 300);
  };

  // Subscribe to presence for live viewers across all polls
  useEffect(() => {
    if (pollIds.length === 0) {
      setLiveViewers(0);
      return;
    }

    const channels: ReturnType<typeof supabase.channel>[] = [];
    const adminId = `stats-${crypto.randomUUID()}`;

    const updateTotalViewers = () => {
      let total = 0;
      pollPresenceRef.current.forEach((count) => {
        total += count;
      });
      setLiveViewers(total);
    };

    pollIds.forEach((pollId) => {
      const channel = supabase.channel(`poll-presence:${pollId}`, {
        config: { presence: { key: 'viewers' } },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const allPresences = Object.values(state).flat() as Array<{ viewerId?: string }>;
          // Filter out admin/stats trackers
          const viewerCount = allPresences.filter(
            (p) => !p.viewerId?.startsWith('admin-') && !p.viewerId?.startsWith('stats-')
          ).length;
          pollPresenceRef.current.set(pollId, viewerCount);
          updateTotalViewers();
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              viewerId: adminId,
              isStats: true,
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
      pollPresenceRef.current.clear();
    };
  }, [pollIds]);

  // Subscribe to real-time votes
  useEffect(() => {
    const channel = supabase
      .channel('analytics-votes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        () => {
          setTotalVotes(prev => prev + 1);
          setVotesToday(prev => prev + 1);
          trackVote();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Load today's votes count
  useEffect(() => {
    const loadTodayVotes = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      setVotesToday(count || 0);
    };

    loadTodayVotes();
  }, []);

  // Update VPM counter every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      recentVotesRef.current = recentVotesRef.current.filter(t => now - t < 60000);
      setVotesPerMinute(recentVotesRef.current.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
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
        <div className={`${styles.statIcon} ${styles.votesIcon} ${isVotePulse ? styles.pulse : ''}`}>
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
  );
}
