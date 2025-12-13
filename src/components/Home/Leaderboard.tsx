import { useEffect, useState } from 'react';
import { Trophy, TrendingUp, Users, ChevronRight } from 'lucide-react';
import { pollService } from '../../services/pollService';
import type { LeaderboardPoll } from '../../types';
import styles from './Leaderboard.module.css';

interface LeaderboardProps {
  onNavigate: (path: string) => void;
}

export function Leaderboard({ onNavigate }: LeaderboardProps) {
  const [polls, setPolls] = useState<LeaderboardPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await pollService.getLeaderboard(5);
        setPolls(data);
      } catch (err) {
        setError('Failed to load leaderboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className={styles.leaderboardContainer}>
        <div className={styles.leaderboardHeader}>
          <div className={styles.leaderboardTitleRow}>
            <Trophy className={styles.trophyIcon} size={28} />
            <h2 className={styles.leaderboardTitle}>Live Leaderboard</h2>
          </div>
          <p className={styles.leaderboardSubtitle}>Top public polls by votes</p>
        </div>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <span>Loading leaderboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.leaderboardContainer}>
        <div className={styles.leaderboardHeader}>
          <div className={styles.leaderboardTitleRow}>
            <Trophy className={styles.trophyIcon} size={28} />
            <h2 className={styles.leaderboardTitle}>Live Leaderboard</h2>
          </div>
        </div>
        <div className={styles.errorState}>{error}</div>
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div className={styles.leaderboardContainer}>
        <div className={styles.leaderboardHeader}>
          <div className={styles.leaderboardTitleRow}>
            <Trophy className={styles.trophyIcon} size={28} />
            <h2 className={styles.leaderboardTitle}>Live Leaderboard</h2>
          </div>
          <p className={styles.leaderboardSubtitle}>Top public polls by votes</p>
        </div>
        <div className={styles.emptyState}>
          <Users size={48} className={styles.emptyIcon} />
          <p>No public polls yet</p>
          <span>Be the first to create one!</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.leaderboardContainer}>
      <div className={styles.leaderboardHeader}>
        <div className={styles.leaderboardTitleRow}>
          <Trophy className={styles.trophyIcon} size={28} />
          <h2 className={styles.leaderboardTitle}>Live Leaderboard</h2>
        </div>
        <p className={styles.leaderboardSubtitle}>Top public polls by votes</p>
      </div>

      <div className={styles.leaderboardList}>
        {polls.map((poll, index) => (
          <button
            key={poll.id}
            className={styles.leaderboardItem}
            onClick={() => onNavigate(`/poll/${poll.id}`)}
          >
            <div className={styles.rankBadge} data-rank={index + 1}>
              {index + 1}
            </div>
            <div className={styles.pollInfo}>
              <h3 className={styles.pollTitle}>{poll.title}</h3>
              <div className={styles.pollMeta}>
                <span className={styles.voteCount}>
                  <TrendingUp size={14} />
                  {poll.total_votes.toLocaleString()} votes
                </span>
                <span className={styles.optionCount}>
                  {poll.options?.length || 0} options
                </span>
              </div>
              {poll.options && poll.options.length > 0 && (
                <div className={styles.optionPreview}>
                  {poll.options.slice(0, 2).map((opt, i) => (
                    <span key={opt.id} className={styles.optionTag}>
                      {opt.title}
                      {i === 0 && poll.options.length > 1 && ' vs '}
                    </span>
                  ))}
                  {poll.options.length > 2 && (
                    <span className={styles.moreOptions}>
                      +{poll.options.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </div>
            <ChevronRight size={20} className={styles.chevron} />
          </button>
        ))}
      </div>
    </div>
  );
}
