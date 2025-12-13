import { useEffect, useState } from 'react';
import { Trophy, Users, ChevronRight, Clock, Plus, TrendingUp } from 'lucide-react';
import { pollService } from '../../services/pollService';
import type { LeaderboardPoll } from '../../types';
import styles from './Leaderboard.module.css';

interface LeaderboardProps {
  onNavigate: (path: string) => void;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getWinningInfo(
  options: { title: string; vote_count: number }[]
): { winner: string; lead: number } | null {
  if (!options || options.length < 2) return null;

  const sorted = [...options].sort((a, b) => b.vote_count - a.vote_count);
  const winner = sorted[0];
  const runnerUp = sorted[1];
  const lead = winner.vote_count - runnerUp.vote_count;

  if (winner.vote_count === 0) return null;

  return { winner: winner.title, lead };
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
        <span className={styles.leaderboardBadge}>
          <Trophy size={14} />
          Top Polls
        </span>
        <h2 className={styles.leaderboardTitle}>Live Leaderboard</h2>
        <p className={styles.leaderboardSubtitle}>See what's trending and cast your vote</p>
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
                {poll.options && poll.options.length > 0 && (
                  <span className={styles.optionPreview}>
                    {poll.options.slice(0, 2).map((opt, i) => (
                      <span key={opt.id}>
                        {opt.title}
                        {i === 0 && poll.options.length > 1 && ' vs '}
                      </span>
                    ))}
                  </span>
                )}
                <span className={styles.createdTime}>
                  <Clock size={12} />
                  {formatTimeAgo(poll.created_at)}
                </span>
              </div>
            </div>
            <div className={styles.pollActions}>
              {poll.options &&
                poll.options.length > 0 &&
                (() => {
                  const winningInfo = getWinningInfo(poll.options);
                  if (winningInfo) {
                    return (
                      <span className={styles.winningInfo}>
                        <TrendingUp size={12} />
                        {winningInfo.winner} {winningInfo.lead > 0 ? `+${winningInfo.lead}` : ''}
                      </span>
                    );
                  }
                  return null;
                })()}
              <span className={styles.voteCount}>{poll.total_votes.toLocaleString()} votes</span>
              <ChevronRight size={18} className={styles.chevron} />
            </div>
          </button>
        ))}

        {/* Create Poll Card */}
        <button className={styles.createPollCard} onClick={() => onNavigate('/create')}>
          <div className={styles.createPollIcon}>
            <Plus size={20} />
          </div>
          <div className={styles.createPollInfo}>
            <h3 className={styles.createPollTitle}>Create Your Own Poll</h3>
            <p className={styles.createPollSubtitle}>
              Start a new poll and see it climb the leaderboard
            </p>
          </div>
          <ChevronRight size={18} className={styles.chevron} />
        </button>
      </div>
    </div>
  );
}
