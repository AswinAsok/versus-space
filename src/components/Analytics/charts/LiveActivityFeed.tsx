import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import styles from './LiveActivityFeed.module.css';

interface VoteActivity {
  id: string;
  pollTitle: string;
  optionTitle: string;
  timestamp: Date;
  isSimulated: boolean;
}

interface LiveActivityFeedProps {
  pollIds: string[];
  pollTitles: Map<string, string>;
}

export function LiveActivityFeed({ pollIds, pollTitles }: LiveActivityFeedProps) {
  const [activities, setActivities] = useState<VoteActivity[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent votes on mount
  useEffect(() => {
    const loadRecentVotes = async () => {
      if (pollIds.length === 0) return;

      const { data } = await supabase
        .from('votes')
        .select(`
          id,
          poll_id,
          option_id,
          created_at,
          is_simulated,
          poll_options!inner(title)
        `)
        .in('poll_id', pollIds)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        const newActivities: VoteActivity[] = data.map((vote: any) => ({
          id: vote.id,
          pollTitle: pollTitles.get(vote.poll_id) || 'Unknown Poll',
          optionTitle: vote.poll_options?.title || 'Unknown Option',
          timestamp: new Date(vote.created_at),
          isSimulated: vote.is_simulated || false,
        }));
        setActivities(newActivities);
      }
    };

    loadRecentVotes();
  }, [pollIds, pollTitles]);

  // Subscribe to real-time votes
  useEffect(() => {
    if (pollIds.length === 0) return;

    const channel = supabase
      .channel('live-activity-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        async (payload) => {
          const vote = payload.new as any;

          if (!pollIds.includes(vote.poll_id)) return;

          // Get option title
          const { data: optionData } = await supabase
            .from('poll_options')
            .select('title')
            .eq('id', vote.option_id)
            .single();

          const newActivity: VoteActivity = {
            id: vote.id,
            pollTitle: pollTitles.get(vote.poll_id) || 'Unknown Poll',
            optionTitle: optionData?.title || 'Unknown Option',
            timestamp: new Date(vote.created_at),
            isSimulated: vote.is_simulated || false,
          };

          if (!isPaused) {
            setActivities(prev => [newActivity, ...prev].slice(0, 50));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pollIds, pollTitles, isPaused]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={styles.feedCard}>
      <div className={styles.feedHeader}>
        <div className={styles.feedTitleRow}>
          <span className={styles.liveBadge}>
            <span className={styles.liveDot} />
            LIVE
          </span>
          <h3 className={styles.feedTitle}>Activity Feed</h3>
        </div>
        <button
          className={`${styles.pauseButton} ${isPaused ? styles.paused : ''}`}
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>

      <div className={styles.feedContainer} ref={containerRef}>
        {activities.length === 0 ? (
          <div className={styles.emptyFeed}>
            <p>Waiting for votes...</p>
          </div>
        ) : (
          <div className={styles.feedList}>
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className={`${styles.feedItem} ${index === 0 ? styles.newItem : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={styles.feedDot}>
                  <span className={activity.isSimulated ? styles.simulatedDot : styles.realDot} />
                </div>
                <div className={styles.feedContent}>
                  <span className={styles.feedOption}>{activity.optionTitle}</span>
                  <span className={styles.feedPoll}>{activity.pollTitle}</span>
                </div>
                <span className={styles.feedTime}>{formatTime(activity.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className={styles.feedFootnote}>
        <span className={styles.legendDot} style={{ background: 'var(--color-primary)' }} /> Real votes
        <span className={styles.legendDot} style={{ background: '#6366f1', marginLeft: '1rem' }} /> Simulated
      </p>
    </div>
  );
}
